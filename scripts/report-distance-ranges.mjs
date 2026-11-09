import { readFileSync, writeFileSync } from "node:fs";
import { appendHeldReviewReport } from "./report-held-range-review.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const ledger = read("staging/distance-range-candidates.json"),
  ds = read("data/adoption-decisions.json").distanceRanges.decisions.slice(
    0,
    75,
  );
// Keep the original report as a dated baseline; the appended stage has current counts.
for (const c of ledger.candidates)
  if (c.reevaluation) c.classification = c.reevaluation.previousClassification;
const summary = (rows) =>
  ["accepted", "held", "excluded"]
    .map((s) => rows.filter((r) => r.classification === s).length)
    .join(" / ");
const lines = [
  "# 距離範囲対応・保存原典調査報告",
  "",
  "保存済みCargoの全32キャラ2445行を走査し、原典入力・raw対応行・既存coverageのmoveIds・SAのcargoRef・採用基本技・共通強度生成元を照合した。各行の照合結果と各候補の注記全体・分類理由を台帳へ記録した。未調査として残した候補はない。保留は保存資料から適用条件・端点を一意に確定できないもの。公式・現行パッチの検証を意味しない。",
  "",
  "## 集計",
  "",
  "前回の190項目に、括弧付き値と距離・接触タイミングを説明する注記の候補を加えた。過剰抽出を含む原典候補は2211項目。本番採用基本技に対応する候補は737項目。候補は技数ではなく、原典行×フレーム項目で数える。単に範囲が存在しない項目も、注記との条件照合対象として含める。",
  "",
  `- 全原典候補の採用 / 保留 / 対象外：${summary(ledger.candidates)}。`,
  `- 本番対象候補の採用 / 保留 / 対象外：${summary(ledger.candidates.filter((r) => r.moveIds.length))}。`,
  "- 採用75原典項目、51元技レコード。共通強度展開後は60技レコード・90フレーム項目を変更。",
  "- 前回JPの8原典項目・9技レコード・11フィールドを維持。今回追加は67原典項目・51技レコード・79フィールド。",
  "- 32キャラ、1298技レコード、SA288独立入力を維持。全体F・D・verification・UNVERIFIEDは変更しない。",
  "",
  "## 採用した項目",
  "",
  "表の基準値と括弧または注記に明示された接触時の端点を採用。差分加算から端点を算出していない。根拠レコード全体・原典表記・理由はdata/adoption-decisions.jsonのdistanceRanges.decisionsを参照。個別代表条件適用後、共通強度展開前に適用し、変更前値と原典行を照合する。",
  "",
  "| キャラ / 技ID | 項目 | 変更前 | 採用 | Cargo行 |",
  "| --- | --- | --- | --- | --- |",
];
for (const d of ds)
  lines.push(
    `| ${d.characterId} / ${d.moveId} | ${d.field} | ${d.before.display} | ${d.value.display} | ${d.sourceIndex} |`,
  );
lines.push(
  "",
  "## 優先候補の結論",
  "",
  "- A.K.I. SA2 / エドSA2：調査済み保留。共通行に-19~ / +65~はあるが、注記は強度による配置・弾速差を含む。保存資料だけでは各強度内の距離依存との分離を明示できず、3強度とも既存代表値を維持。SAの入力・生成・出典は変更しない。",
  "- ベガ通常[2]8K：調査済み保留。18~46はL/M/Hの軌道差を含むため各強度へ一律展開しない。ODは自動追尾と距離による横移動速度変化が明記され、単一OD入力の16~47を採用。40Fの溜め成立条件を可変ホールド時間として混ぜない。",
  "- A.K.I.236HK/236KK：調査済み保留。43(50~54) / 42(48~57)は同じ側と裏回りの条件を区別する。43Fの特殊な裏回り間合いも記載され、括弧端点だけを連続範囲へ変換できない。発生欄に置かれた全体値も発生範囲にしない。",
  "- アージュナ623P各強度/OD：調査済み対象外。括弧51~71等は接触で持続が終了し固定23F回復へ移る条件。空振り全体75/69等を維持。",
  "- 豪鬼236P、ザンギエフ5HP、Focus Force、ジェイミーの指定酔い条件、豪鬼百鬼襲の追加入力なし条件を維持。ホールド・強化・派生入力の数値は取り込まない。",
  "",
  "## キャラ別の確認結果",
  "",
  "全行の対応を確認済み。以下は広めに抽出した候補の件数で、保留は追加範囲の根拠不足を示す。全候補の具体的な入力・項目・理由・原典注記はstaging/distance-range-candidates.jsonに保存。",
  "",
  "| キャラ | Cargo行数 | 採用 / 保留 / 対象外 |",
  "| --- | --- | --- |",
);
for (const c of ledger.characters)
  lines.push(
    `| ${c.characterId} | ${c.sourceRows} | ${summary(ledger.candidates.filter((r) => r.characterId === c.characterId))} |`,
  );
lines.push(
  "",
  "## 検証",
  "",
  "typecheck、アプリ143テスト、データ14テスト、data:plan、data:check、validate:data、data:audit-coverage、SA・共通強度・個別代表条件の監査、format:check、buildを実施。履歴依存テストは省略せず、許可された範囲差分だけを厳密に戻して既存基準を比較する。再生成の固定性と90フィールド以外の不変、原典行と採用候補の一致をテストする。",
  "",
  "実ブラウザー1280px/320pxでJPの26~、+6~、-8~を技一覧と質問履歴で確認。技一覧は既存の表内横スクロールを維持し、ページ全体の横はみ出しがないことを検査。Normal/Hardの履歴表示も維持。画像はstaging/verification/distance-ranges。ビルドの既存chunkサイズ警告あり。commit・push・デプロイは実施していない。",
  "",
  "残る保留は、保存原典から条件または端点を確定できないという判断であり、未調査ではない。新たな原典・実機検証なしに推測で補完しない。",
  "",
);
writeFileSync("docs/DISTANCE_RANGE_REPORT.md", lines.join("\n"));
if (read("data/adoption-decisions.json").distanceRanges.heldReviewPath)
  appendHeldReviewReport();
