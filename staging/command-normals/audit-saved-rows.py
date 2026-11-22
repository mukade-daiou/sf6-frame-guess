"""Audit saved CLASSIC rows from the repository root. Writes only the audit TSV."""
import csv
import io
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path("staging/command-normals")
SOURCES = Path("staging/official-verification/sources")
DIR = dict(zip(("dl", "d", "dr", "l", "r", "ul", "u", "ur"), "12346789"))


def frames(row):
    active, recovery, notes = (row[k].strip() for k in ("active", "recovery", "notes"))
    direct = re.search(r"空振り時硬直\d+F/全体(\d+)F", notes)
    explicit = re.fullmatch(r"全体\s*(\d+)", recovery)
    add = sum(map(int, re.findall(r"空振り(?:/アーマーヒット)?時硬直(\d+)F増加", notes)))
    active_parts = re.fullmatch(r"\d+(?:-\d+)?(?:[.,]\d+(?:-\d+)?)*", active)
    recovery_parts = re.fullmatch(r"※?(\d+)(?:\+着地後(\d+))?", recovery)
    if direct or explicit:
        total = (direct or explicit)[1]
        evidence = "公式に全体Fを明記"
    elif active_parts and recovery_parts:
        last = int(re.findall(r"\d+", active)[-1])
        end = sum(int(part or 0) for part in recovery_parts.groups())
        total = str(last + end + add)
        evidence = f"持続末尾{last} + 硬直{end} + 空振り補正{add}"
    else:
        total, evidence = "不明", "公式セルから空振り全体を確定できない"
    return [row["startup"].strip(), total, row["hit"].strip(), row["block"].strip()], evidence


def classify(cid, row, tokens):
    text = row["commandText"].strip()
    name = row["name"]
    args = [x for x in tokens if x not in ("key-plus", "key-or")]
    attacks = [x for x in args if x.startswith(("icon_punch", "icon_kick"))]
    arrows = [x[4:] for x in args if x.startswith("key-") and x[4:] in DIR]
    if cid == "dhalsim" and row["row"] == 33:
        return "既存通常技と重複", "通常技13行と同じ2HK", ["2HK"]
    if cid == "jamie" and row["row"] == 30:
        return "仕様上対象外", "落星脚24行と同一入力・同値の初段。別技としては追加しない", ["6MK"]
    if "ジャンプ" in text:
        return "仕様上対象外", "ジャンプ中限定", []
    if re.search(r"中に|後に|酔いLv|ランから", text):
        return "仕様上対象外", "構え・強化状態・先行動作が必要", []
    if "ホールド" in text or "ホールド" in name:
        return "仕様上対象外", "ホールド版", []
    if "arrow_3" in tokens or name.startswith("[チェーンコンボ]"):
        return "仕様上対象外", "連続技の後続入力・チェーン版", []
    if len(attacks) > 1:
        return "仕様上対象外", "攻撃ボタン同時押し", []
    if not attacks:
        return "仕様上対象外", "攻撃ボタンなし", []
    if len(arrows) > 1 and tokens.count("key-or") != len(arrows) - 1:
        return "仕様上対象外", "方向の連続入力", []
    button = re.fullmatch(r"icon_(punch|kick)_([lmh])", attacks[0])
    if not arrows or not button or len(args) != len(arrows) + 1:
        return "判断保留", "方向・単独攻撃の原典表記の要確認", []
    suffix = button[2].upper() + button[1][0].upper()
    if text != dict(L="弱", M="中", H="強")[suffix[0]]:
        return "判断保留", "画像とコマンド欄の強度・発動条件の要確認", []
    return "収録対象", "方向の選択肢と単独ボタン" if len(arrows) > 1 else "方向1つ＋単独ボタン", [DIR[a] + suffix for a in arrows]


def canonical(values):
    return [str(int(v)) if re.fullmatch(r"[+-]?\d+", v or "") else v for v in values]


def main():
    report = (ROOT / "approval-candidates.md").read_text()
    generated = subprocess.check_output(["node_modules/.bin/tsx", "scripts/command-normals.ts"])
    assert generated.decode() == report, "候補Markdownが現行実装から再現しない"
    candidates = json.loads(subprocess.check_output(["node_modules/.bin/tsx", "scripts/command-normals.ts", "--json"]))
    policy = json.loads(Path("data/adoption-decisions.json").read_text())
    local = {p.stem: json.loads(p.read_text()) for p in Path("data/characters").glob("*.json")}
    assert set(local) == {c["characterId"] for c in candidates} == {p.stem for p in SOURCES.glob("*.json")}
    print("承認判断:", len(policy.get("commandNormals", {})))
    print("本番方向付き特殊技:", sum(m["input"]["type"] == "normal" and m["input"]["direction"] not in "25" for c in local.values() for m in c["moves"]))
    out = io.StringIO()
    writer = csv.writer(out, delimiter="\t", lineterminator="\n")
    writer.writerow("キャラ 公式行 技名 判定 根拠 原典入力 現行候補_入力と4値 公式発生 公式持続 公式硬直 公式ヒット 公式ガード 照合値_発生全体ヒットガード 全体根拠 照合結果 公式URL 画像トークン 条件 備考".split())
    problems = []
    sums = Counter()
    for c in candidates:
        cid = c["characterId"]
        source = json.loads((SOURCES / f"{cid}.json").read_text())
        assert (source["control"], source["retrievedOn"], source["gameVersion"]) == ("CLASSIC", "2026-11-10", "UNVERIFIED")
        counts = Counter()
        seen = set()
        visited = set()
        existing = {m["id"]: m for m in local[cid]["moves"]}
        for row in (r for r in source["rows"] if r["section"] == "特殊技"):
            n = row["row"]
            assert n not in visited
            visited.add(n)
            tokens = [Path(url).stem for url in row["commandImages"]]
            status, reason, inputs = classify(cid, row, tokens)
            counts[status] += 1
            expected, evidence = frames(row) if status in ("収録対象", "既存通常技と重複") or (cid, n) == ("jamie", 30) else ([], "")
            moves = [x["move"] for x in c["rows"] if x["row"] == n]
            actual, errors = [], []
            for m in moves:
                i = m["input"]
                command = i["direction"] + i["strength"] + i["button"]
                values = [m["frames"][key]["display"] for key in ("startup", "total", "hit", "block")]
                actual.append(f'{command} {m["id"]} {"/".join(v or "不明" for v in values)}')
                if m["name"] != row["name"] or m["source"]["url"] != source["url"] or m["id"] != f'{cid}__normal_{i["direction"]}_{i["button"]}_{i["strength"]}':
                    errors.append("技名・出典・技ID不一致")
                if command in seen or any(x["input"] == i and x["id"] != m["id"] for x in existing.values()):
                    errors.append("入力重複または既存技との衝突")
                seen.add(command)
                if canonical(values) != canonical(expected):
                    errors.append("フレーム不一致")
            if sorted(a.split()[0] for a in actual) != sorted(inputs if status == "収録対象" else []):
                errors.append("入力不一致・技漏れ・誤収録")
            if expected and "不明" in expected:
                errors.append("根拠不足")
            if status == "既存通常技と重複":
                m = existing["dhalsim__normal_2_K_H"]
                other = next(r for r in source["rows"] if r["row"] == 13)
                assert frames(other)[0] == expected
                assert canonical([m["frames"][k]["display"] for k in ("startup", "total", "hit", "block")]) == canonical(expected)
            if (cid, n) == ("jamie", 30):
                other = next(r for r in source["rows"] if r["row"] == 24)
                assert frames(other)[0] == expected and other["commandImages"] == row["commandImages"]
            if errors:
                problems.append((cid, n, errors))
            writer.writerow([cid, n, row["name"], status, reason, "/".join(inputs), "; ".join(actual), *(row[k] for k in ("startup", "active", "recovery", "hit", "block")), "/".join(expected), evidence, "/".join(errors) or "一致・判定済み", source["url"], " ".join(tokens), row["commandText"].replace("\n", " / "), row["notes"].replace("\n", " / ").strip() or "（記載なし）"])
        assert {x["row"] for x in c["rows"]} <= visited
        sums.update(counts)
        print(f"| {c['character']} | {len(visited)} | {counts['収録対象']} | {len(seen)} | {counts['既存通常技と重複']} | {counts['仕様上対象外']} | {counts['判断保留']} |")
    (ROOT / "audit-rows.tsv").write_text(out.getvalue())
    print(dict(sums))
    print("問題:", problems)
    if problems:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
