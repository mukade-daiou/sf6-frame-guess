import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  characterSchema,
  moveSchema,
  type Character,
  type Direction,
  type FrameValue,
} from "../src/lib/frame-data/schema";
import { displayInput, inputKey } from "../src/lib/frame-data/input";
import { digest } from "./reviewed-updates";
// @ts-ignore shared official normalization
import { frame, normalize } from "./lib/source-scan.mjs";
// @ts-ignore shared official whiff-total calculation
import { total } from "../staging/official-verification/compare.mjs";

const sources = "staging/official-verification/sources";
const slugs: Record<string, string> = {
  akuma: "gouki_akuma",
  dee_jay: "deejay",
  e_honda: "ehonda",
  m_bison: "vega_mbison",
};
const directions: Record<string, Direction> = {
  dl: "1",
  d: "2",
  dr: "3",
  l: "4",
  r: "6",
  ul: "7",
  u: "8",
  ur: "9",
};

function officialValue(raw: string, signed = false): FrameValue {
  const v = frame(raw);
  if (v.status === "numeric")
    return {
      status: "confirmed",
      display: signed && v.value > 0 ? `+${v.value}` : v.raw,
      numeric: v.value,
    };
  if (v.status === "special")
    return { status: "confirmed", display: v.raw.trim() };
  if (v.status === "not_applicable")
    return { status: "not_applicable", display: "-" };
  return { status: "unknown", display: null };
}

type OfficialFrames = {
  notes: string;
  recovery: string;
  active: string;
  startup: string;
  hit: string;
  block: string;
};
type OfficialRow = {
  section: string;
  name: string;
  sourceRow: number;
  commandText: string;
  notes: string;
  raw: OfficialFrames & { commandImages: string[] };
};

function whiffTotal(row: OfficialFrames) {
  const explicit = /(?:^|\n)空振り時硬直\d+F\/全体(\d+)F(?:\n|$)/.exec(
    row.notes,
  );
  if (explicit)
    return {
      value: Number(explicit[1]),
      direct: true,
      evidence: explicit[0].trim(),
    };
  const recovery = row.recovery.replace(/^※(?=\d+$)/, "");
  const notes = row.notes
    .split("\n")
    // These lines describe hit/block adjustments or hit level, not whiff timing.
    .filter(
      (line) =>
        !/^※?(?:初段が空振り時のみ2段目が中段判定|(?:ヒット、ガード時|ヒット時|ガード時)(?:硬直|全体)\d+F減少|\d+F目で必殺技、SAで空振りキャンセル可能)$/.test(
          line.trim(),
        ),
    )
    .join("\n")
    .replace(/空振り\/アーマーヒット時硬直(\d+)F増加/g, "空振り時硬直$1F増加");
  const calculated = total({ ...row, recovery, notes });
  return calculated && { ...calculated, direct: /^全体\s*\d+$/.test(recovery) };
}

export function commandNormalCandidates(
  bytes: Buffer,
  id: string,
  version: string,
) {
  const source = JSON.parse(bytes.toString());
  if (
    source.url !==
      `https://www.streetfighter.com/6/ja-jp/character/${slugs[id] ?? id}/frame` ||
    !/^\d{4}-\d{2}-\d{2}$/.test(source.retrievedOn) ||
    (source.gameVersion !== "UNVERIFIED" && source.gameVersion !== version) ||
    source.complete === false
  )
    throw new Error(`Invalid official frame table: ${id}`);
  const normalized: { moves: OfficialRow[] } = normalize(source, id);
  const official = normalized.moves.filter((row) => row.section === "特殊技");
  if (!official.length)
    throw new Error(`Missing official command normal section: ${id}`);
  const rows = official.flatMap((row) => {
    const icons = row.raw.commandImages.map((url) => url.split("/").at(-1));
    const input =
      /^(key-(?:dl|d|dr|l|r|ul|u|ur)\.png(?: key-or\.png key-(?:dl|d|dr|l|r|ul|u|ur)\.png)*)(?: key-plus\.png)? icon_(punch|kick)_([lmh])\.png$/.exec(
        icons.join(" "),
      );
    if (!input || !/^[弱中強]$/.test(row.commandText.trim())) return [];
    const opener = /[（(]1段目[）)]/.test(row.name);
    if (
      row.name.startsWith("[チェーンコンボ]") ||
      (id === "jamie" && row.name === "円月脚（1段目）")
    )
      return [];
    return input[1].split(" key-or.png ").flatMap((arrow) => {
      const direction = directions[arrow.slice(4, -4)];
      // Dhalsim's down+HK is already represented by the crouching normal.
      if (
        id === "dhalsim" &&
        direction === "2" &&
        row.name === "ロングスライディング"
      )
        return [];
      if (direction === "2")
        throw new Error(`Check crouching input collision: ${id}/${row.name}`);
      const button = input[2] === "punch" ? "P" : "K";
      const strength = input[3].toUpperCase();
      const whole = whiffTotal(row.raw);
      const move = moveSchema.parse({
        id: `${id}__normal_${direction}_${button}_${strength}`,
        name: row.name,
        category: "normal",
        input: { type: "normal", direction, button, strength },
        variant: { kind: "base", condition: null },
        frames: {
          startup: officialValue(row.raw.startup),
          total: whole
            ? {
                status: "confirmed",
                display: String(whole.value),
                numeric: whole.value,
                provenance: whole.direct ? "source" : "verified_calculation",
                calculation: whole.direct ? null : whole.evidence,
              }
            : {
                status: "unknown",
                display: null,
                provenance: null,
                calculation: null,
              },
          hit: officialValue(row.raw.hit, true),
          block: officialValue(row.raw.block, true),
        },
        notes: [`CAPCOM CLASSIC 特殊技 行 ${row.sourceRow}`, row.notes].filter(
          Boolean,
        ),
        source: {
          url: source.url,
          retrievedAt: `${source.retrievedOn}T00:00:00Z`,
          gameVersion: version,
          kind: "official",
          attribution: "CAPCOM",
          license: "Official frame data; rights retained by CAPCOM",
          verification: "unverified",
        },
        adoption: {
          status: "held",
          basis: "CAPCOM公式表の方向＋単一ボタン入力。採用承認待ち。",
        },
      });
      return [{ move, row: row.sourceRow, opener }];
    });
  });
  if (
    new Set(rows.map(({ move }) => inputKey(move.input))).size !== rows.length
  )
    throw new Error(`Ambiguous official command normal(s): ${id}`);
  return {
    rows,
    url: source.url as string,
    retrievedOn: source.retrievedOn as string,
  };
}

type Approval = {
  sourceHash: string;
  candidateHash: string;
  approvedMoveIds: string[];
};

export function applyCommandNormals(
  character: Character,
  approval: Approval,
): Character {
  const bytes = readFileSync(`${sources}/${character.id}.json`);
  const { rows } = commandNormalCandidates(
    bytes,
    character.id,
    character.gameVersion,
  );
  const ids = new Set(approval.approvedMoveIds);
  const approved = rows.filter(({ move }) => ids.has(move.id));
  if (
    digest(bytes) !== approval.sourceHash ||
    digest(JSON.stringify(rows)) !== approval.candidateHash ||
    ids.size !== approval.approvedMoveIds.length ||
    approved.length !== ids.size ||
    approved.some(({ move }) =>
      character.moves.some(
        (existing) =>
          existing.id === move.id ||
          inputKey(existing.input) === inputKey(move.input),
      ),
    )
  )
    throw new Error(`Invalid command normal approval: ${character.id}`);
  return characterSchema.parse({
    ...character,
    coverage: {
      ...character.coverage,
      command_normal: {
        status: approved.length === rows.length ? "complete" : "partial",
        verification: "unverified",
      },
    },
    moves: [
      ...character.moves,
      ...approved.map(({ move }) => ({
        ...move,
        adoption: {
          status: "accepted",
          basis: "CAPCOM公式表に基づく方向付き特殊技の承認済み入力。",
        },
      })),
    ],
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
  const version = read("data/metadata.json").gameVersion;
  const candidates = readdirSync("data/characters")
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const character = read(`data/characters/${file}`);
      const bytes = readFileSync(`${sources}/${file}`);
      const proposal = commandNormalCandidates(bytes, character.id, version);
      return {
        characterId: character.id as string,
        character: character.nameJa as string,
        sourceHash: digest(bytes),
        candidateHash: digest(JSON.stringify(proposal.rows)),
        ...proposal,
      };
    });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(candidates, null, 2));
  } else {
    console.log("# 方向入力で出す特殊技の承認候補\n");
    console.log(
      `CAPCOM日本語公式フレーム表（CLASSIC、${candidates[0].retrievedOn}保存、対象パッチ未確認）。${candidates.length}キャラ分を確認し、${candidates.reduce((n, c) => n + c.rows.length, 0)}入力を候補にした。候補値は発生・空振り全体F・通常ヒット・ガードの順。Dはダウン。\n`,
    );
    console.log(
      "地上で方向と攻撃ボタン1つから直接出せる技を対象とし、ターゲットコンボは単独入力で出せる初段のみ収録候補とした。初段には「†」を付けた。後続入力、連続方向入力、ジャンプ中・構え中・強化状態限定、同時押し、ホールド版を除外する。\n",
    );
    console.log(
      "ダルシムのロングスライディング（2HK）は既存のしゃがみ強Kと同一。ジェイミーの円月脚1段目（6MK）は同値の落星脚にまとめた。春麗の追突拳は公式表で4MPと6MPの両方が入力として示されている。\n",
    );
    console.log(
      "全体Fは公式表の空振り値、または持続最終F＋硬直に空振り時の明記補正を加えた値。各キャラのリンク先が出典。「行」は保存した公式表の行番号。",
    );
    for (const { character, rows, url } of candidates) {
      console.log(`\n## ${character}\n\n[CAPCOM公式フレーム表](${url})\n`);
      if (!rows.length) {
        console.log("該当する追加候補なし。");
        continue;
      }
      console.log(
        "| 行 | 技 | 入力 | 発生 | 全体 | ヒット | ガード |\n| ---: | --- | --- | ---: | ---: | ---: | ---: |",
      );
      for (const { move, row, opener } of rows) {
        const { startup, total, hit, block } = move.frames;
        const values = [startup, total, hit, block].map(
          (v) => v.display ?? "不明",
        );
        console.log(
          `| ${row} | ${move.name}${opener ? " †" : ""} | ${displayInput(move.input)} | ${values.join(" | ")} |`,
        );
      }
    }
  }
}
