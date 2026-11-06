import { readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { validateDataset } from "../src/lib/frame-data/loader";
import { isQuestionInput } from "../src/lib/frame-data/input";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const files = Object.fromEntries(
  await Promise.all(
    (await readdir("data/characters"))
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => [f, await read(`data/characters/${f}`)]),
  ),
);
const d = validateDataset(await read("data/metadata.json"), files);
if (d.errors.length || d.eligible.length !== 32)
  throw new Error(JSON.stringify(d.errors));
for (const id of ["ken", "marisa"])
  if (
    execFileSync("git", [
      "show",
      `876101d:data/characters/${id}.json`,
    ]).toString() !== (await readFile(`data/characters/${id}.json`, "utf8"))
  )
    throw new Error(`Protected character changed: ${id}`);
for (const f of await readdir("staging/candidates"))
  if (
    execFileSync("git", [
      "show",
      `876101d:staging/candidates/${f}`,
    ]).toString() !== (await readFile(`staging/candidates/${f}`, "utf8"))
  )
    throw new Error(`Candidate changed: ${f}`);
const characters = d.characters.map((c) => ({
  id: c.id,
  name: c.nameJa,
  moves: c.moves.length,
  adopted: c.moves.filter((m) => m.adoption?.status === "accepted").length,
  held: c.moves
    .filter((m) => m.adoption?.status === "held")
    .map((m) => ({
      moveId: m.id,
      input: m.input,
      name: m.name,
      rule: "held-source-input",
    })),
  uiInputs: c.moves.filter(
    (m) => m.adoption?.status === "accepted" && isQuestionInput(m.input),
  ).length,
  unsupported: c.moves
    .filter((m) => !isQuestionInput(m.input))
    .map((m) => ({ moveId: m.id, input: m.input })),
  unknown: c.moves.flatMap((m) =>
    Object.entries(m.frames)
      .filter(([, v]) => v.status === "unknown")
      .map(([field]) => ({
        moveId: m.id,
        input: m.input,
        name: m.name,
        field,
        group:
          m.adoption?.status === "held"
            ? "通常状態・入力対応の保留"
            : field === "block"
              ? "ガード値が原典に未記載"
              : "複合値・原典値の不足",
        source: m.source.url,
      })),
  ),
  coverage: c.coverage,
}));
const report = {
  datasetId: d.metadata.datasetId,
  characters,
  eligible: d.eligible.length,
  moves: characters.reduce((n, c) => n + c.moves, 0),
  inputs: d.inputs.length,
  candidatesPreserved: 860,
  protectedCharacters: ["ken", "marisa"],
  userDecision: "held-source-input",
  pilots: ["ryu", "guile", "terry", "aki"],
  sourceInventory: "staging/integration/inventory.json",
  verification: "unverified",
};
await writeFile(
  "staging/integration/review.json",
  JSON.stringify(report, null, 2) + "\n",
);
const table = characters
  .map(
    (c) =>
      `| ${c.name} (${c.id}) | ${c.moves} | ${c.adopted} | ${c.held.length} | ${c.uiInputs} | ${c.unknown.length} |`,
  )
  .join("\n");
await writeFile(
  "docs/CHARACTER_INTEGRATION_REPORT.md",
  `# 第13段階：32キャラ統合\n\n整理前2体63技から、32体${report.moves}レコードへ統合。共通質問入力は${report.inputs}種類。datasetIdは${report.datasetId}。ゲーム版と出典の検証状態はUNVERIFIED／unverifiedを維持。\n\n| キャラ | レコード | 採用 | 保留 | UI対応の採用入力 | 不明フィールド |\n| --- | --- | --- | --- | --- | --- |\n${table}\n\n## 原典と採用範囲\n\n保存済みraw全行を候補、過去の除外・状態分類へ対応付けた。段階4のOD表記変更4件はstage4OriginalInputから対応。12通常技だけを理由にcompleteにしていない。候補860技のスキーマ・重複入力を検査し、全32体で入力衝突なし。原典行別対応、元coverage、ライセンス、UI未対応、保留根拠はstaging/integration/inventory.jsonに保存。\n\nリュウ・ガイル・テリー・A.K.I.の4体で試験し、スキーマ・原典対応・通常技12種・OD・溜め・不明値・採用とcoverageを検査してから一括処理した。\n\n## ユーザー判断と再利用\n\n通常状態・性能が未確定な原典入力を保留として残してキャラを採用する案を確認し、承認を得た。同種の欠落入力にも適用。held-source-input規則と適用外はADOPTION_RULES.mdに記録。保留は条件付きレコード・unknownとして残すため、技なしへ変換しない。追加の個別判断待ちはない。\n\n出典対応、通常状態の既存監査、OD弱＋中、未検証出典の採用、D・適用対象外・unknownの保持は既存ルールで処理した。括弧外値の方針は継承するが、原典が値なし・複合式・条件矛盾の場合は数値を作らない。\n\n## 後日まとめて判断する不明事項\n\nreview.jsonのcharacters[].unknownを「通常状態・入力対応の保留」「ガード値が原典に未記載」「複合値・原典値の不足」に分類した。例はジェイミーのDL別入力、ヴァイパーのFocus Force、ディージェイ22PP、投げのガード値、ザンギエフ5HPの(6~22)+10、リュウOD上段足刀蹴りの壁条件。現在は承認済み規則で保留／unknownのまま採用し、後日の判断を同分類へ再利用できる。出典に値がない項目とUI未対応は別一覧。\n\n## 保護と運用\n\nケン33技・マリーザ30技のJSONは整理前HEAD 876101dとバイト一致。OD龍尾脚9Fと採用判断を維持。元候補32ファイル860技もバイト一致。残した過去資料を変更せず、新規依存・ネット取得・自動更新は追加していない。\n\n入口はscripts/audit-candidates.ts、scripts/prepare-adoption.ts（既定は4体試験、--allで残り全体）、既存build-snapshot.ts。原典や規則が変わった場合は再監査し、--all --decisionsは明示的な採用・更新指示がある場合だけ使う。data:plan確認後に既存の--write --update保護を通す。\n\n32体の回答一覧はPC4列・モバイル2列にした。アケコンと攻撃アイコンのデザインは変更していない。抽選は従来どおりeligible全体から等確率で、UI入力も対象全体の和集合。\n\n## 検証\n\n型検査、既存＋回帰テスト、test:data、data:check、Zod、ビルド、format:checkを実行。回帰テストは32体すべての抽選位置、同一の共通入力一覧、保留入力のunknown、各キャラの5問到達を検査。ブラウザーは1280・768・390・320pxで質問・途中回答・質問復帰・結果・再プレイ、回答候補32体を確認する。最終結果は作業完了時に追記する。\n\n既存のPROJECT_CLEANUP_REPORT.mdはformat:checkで検出された表の空白だけ整形した。ビルドのチャンク容量警告は残る。データ件数増加によるバンドル肥大は今後の改善候補。\n`,
);
console.log({
  characters: report.eligible,
  moves: report.moves,
  held: characters.reduce((n, c) => n + c.held.length, 0),
  unknown: characters.reduce((n, c) => n + c.unknown.length, 0),
});
