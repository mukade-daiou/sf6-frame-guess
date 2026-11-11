import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { format } from "prettier";

const root = "staging/official-reevaluation/";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const key = (r) => `${r.characterId}/${r.moveId}/${r.field}`;
const results = read(root + "results-after-additional-kd.json");
const pending = ["total-audit", "hit-block-startup-audit"].flatMap((p) =>
  read(root + p + ".json")
    .records.filter((r) => r.classification === "B")
    .map((r) => ({ ...r, previousLedger: root + p + ".json" })),
);
assert.equal(pending.length, 69);
assert.equal(new Set(pending.map(key)).size, 69);
const mismatches = results.flatMap((r) =>
  Object.entries(r.fields)
    .filter(([, v]) => v.status === "不一致")
    .map(([field]) => key({ ...r, field })),
);
assert.deepEqual(pending.map(key).sort(), mismatches.sort());
const count = (items) =>
  items.reduce((a, k) => ((a[k] = (a[k] || 0) + 1), a), {});
const sources = new Map();
const records = pending.map((r) => {
  const character = read(`data/characters/${r.characterId}.json`);
  const move = character.moves.find((m) => m.id === r.moveId);
  assert(move);
  assert.equal(move.frames[r.field].display, r.current);
  const comparison = results.find(
    (x) => x.moveId === r.moveId && x.characterId === r.characterId,
  );
  assert.equal(comparison.fields[r.field].local, r.current);
  const cargo = read(r.cargoPath);
  const raw = read(r.rawPath);
  const official = read(r.officialPath);
  sources.set(r.officialPath, {
    path: r.officialPath,
    retrievedOn: official.retrievedOn,
    gameVersion: official.gameVersion,
    versionEvidence: official.versionEvidence,
  });
  const cargoRows = r.cargo.map((c) => {
    const row = cargo.data.cargoquery[c.index].title;
    assert.equal(row.input, c.input);
    return { ref: `${r.cargoPath}#/data/cargoquery/${c.index}/title`, ...row };
  });
  const rawRows = r.raw.map((x) => {
    const row = raw.moves[x.index];
    assert.equal(row.id, x.id);
    return { ref: `${r.rawPath}#/moves/${x.index}`, ...row };
  });
  const officialRows = r.official.map((x) => {
    const row = official.rows.find((y) => y.row === x.row);
    assert(row);
    assert.equal(row.name, x.name);
    return { ref: `${r.officialPath}#row=${x.row}`, ...row };
  });
  let finding =
    "保存行を再読し、raw ID・Cargo入力・公式行名と現行値を照合。新しい版・条件を裏付ける独立証拠は得られなかった。";
  let missing =
    r.missingEvidence ||
    "同一対象版と同一終了条件による空振り全体Fの独立証拠。";
  if (r.group.includes("空中") || r.group.includes("着地")) {
    finding +=
      " 公式の空中判定区間は攻撃の終了時刻や着地境界の包含規則を直接定義しない。最終持続＋硬直の計算だけでは1F差を訂正できない。";
    missing =
      "着地したフレームを空中硬直と着地後硬直のどちらに含めるか、同一版での最初の行動可能F。";
  }
  if (r.moveId.includes("super_art")) {
    finding +=
      " L/M/HはSA共通原典の代表値展開であり、3件の独立測定ではない。CA・強度差と暗転の定義を共通値の算術だけで確定できない。";
  }
  if (r.field === "startup" && r.moveId.includes("super_art")) {
    finding +=
      " ADOPTION_RULES.mdは暗転前後の厳密な定義を未検証と明記。ラシード等の個別承認はSA投げの加算許可に一般化できない。";
    missing =
      "5+2／6+1の各項の計測開始・終了点、暗転時間の除外方法と投げ成立Fを結び付ける一次資料。";
  }
  if (r.moveId.includes("63214_K") && r.characterId === "blanka") {
    finding +=
      " hit/blockの両欄に同方向の1F差があるが、操舵・接触高さ・相手体格を固定した測定証拠ではない。持続当ての範囲化は現行採用規則で対象外。";
  }
  if (r.characterId === "yasmine")
    finding +=
      " 自動派生の存在は双方の備考で確認できるが、原典+2を全段完走時のDと同じ測定とする根拠はない。過去のKD数値脱落と同一原因とは確認できない。";
  if (r.characterId === "luke")
    finding +=
      " 距離による発生差17Fと全体差17Fの一致は相関にとどまり、硬直開始時点の移動を証明しない。";
  if (r.characterId === "chunli")
    finding +=
      " 構え中にガード・派生・中断・保持が可能との公式備考があり、全体89Fと操作不能期間を同一視できない。";
  return {
    characterId: r.characterId,
    moveId: r.moveId,
    field: r.field,
    input: move.input,
    current: r.current,
    officialValue: r.officialValue,
    previousClassification: "B",
    classification: "B",
    group: r.group,
    previousLedger: r.previousLedger,
    previousReason: r.reason,
    expansionSource:
      r.expansionSource ||
      r.sourceMoveId ||
      r.saSource?.researchRecordId ||
      r.moveId.split("__strength_")[0],
    additionalSources: [
      r.rawPath,
      r.cargoPath,
      r.officialPath,
      "docs/ADOPTION_RULES.md",
      "docs/DATA_SPEC.md",
      root + "patch-review.json",
    ],
    rawRows,
    cargoRows,
    officialRows,
    additionalFinding: finding,
    proposal: null,
    comparisonOnlyCandidate: r.officialValue,
    reason: "新しい独立証拠で既存の不確実性を解消できずBを維持。" + r.reason,
    unresolved: missing,
    patch: "UNVERIFIED",
    currentPatchVerified: false,
  };
});
const statuses = count(
  results.flatMap((r) => Object.values(r.fields).map((v) => v.status)),
);
assert.deepEqual(statuses, {
  一致: 4451,
  確認不能: 570,
  不一致: 69,
  条件違い: 42,
});
const unknown = [];
const different = [];
for (const r of results)
  for (const [field, v] of Object.entries(r.fields)) {
    if (v.status === "確認不能") {
      const rows = (r.sourceRows || [])
        .map((n) =>
          read(
            `staging/official-verification/sources/${r.characterId}.json`,
          ).rows.find((x) => x.row === n),
        )
        .filter(Boolean);
      const category = !rows.length
        ? "公式行未確定"
        : field === "total"
          ? "全体F算出根拠不足（空中・複合持続等を含む）"
          : rows.every((x) => !x[field] || /^[-―–ー]$/.test(x[field].trim()))
            ? "公式欄が空欄またはダッシュ"
            : "公式欄が複合・非単一表記";
      unknown.push({ moveId: r.moveId, field, category, reason: v.reason });
    }
    if (v.status === "条件違い")
      different.push({ moveId: r.moveId, field, reason: v.reason });
  }
const allMoves = fs
  .readdirSync("data/characters")
  .filter((p) => p.endsWith(".json"))
  .flatMap((p) => read("data/characters/" + p).moves);
assert.equal(allMoves.length, 1298);
const excluded = allMoves
  .filter((m) => m.adoption.status !== "accepted")
  .map((m) => ({ moveId: m.id, adoption: m.adoption }));
assert.equal(excluded.length, 15);
const output = {
  baseline: "1e36836adab07b17f5462cf0f5dd35b8b4cd86a6",
  datasetId: read("data/metadata.json").datasetId,
  scope:
    "保存行と規則の追加点検。外部一次資料はアクセス制限。独立した現行版測定なし。",
  classes: { A: 0, B: 69, C: 0, unprocessed: 0 },
  fields: count(records.map((r) => r.field)),
  groups: count(records.map((r) => r.group)),
  statuses,
  unknownCategories: count(unknown.map((r) => r.category)),
  unknownByField: count(unknown.map((r) => r.field)),
  conditionReasons: count(different.map((r) => r.reason)),
  unknown,
  conditionDifferences: different,
  excluded,
  officialSources: [...sources.values()],
  records,
};
fs.writeFileSync(
  root + "pending-reevaluation.json",
  await format(JSON.stringify(output), { parser: "json" }),
);
// Protect production and its existing generators/audits without updating a baseline.
execFileSync(
  "git",
  ["diff", "--exit-code", "HEAD", "--", "data", "scripts", "tests", "archive"],
  { stdio: "inherit" },
);
console.log(
  JSON.stringify(
    {
      classes: output.classes,
      statuses,
      unknownCategories: output.unknownCategories,
      unknownByField: output.unknownByField,
      excluded: excluded.length,
      records: records.length,
    },
    null,
    2,
  ),
);
