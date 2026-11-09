import { readFileSync, writeFileSync } from "node:fs";
import { appendStage2Report } from "./report-held-range-stage2.mjs";
export function appendHeldReviewReport() {
  const r = JSON.parse(readFileSync("staging/held-range-review.json", "utf8"));
  const path = "docs/DISTANCE_RANGE_REPORT.md";
  const base = readFileSync(path, "utf8").split(
    "\n## 第1段階：保留300項目の再評価",
  )[0];
  const out = [
    base,
    "## 第1段階：保留300項目の再評価",
    "",
    "2026-11-09。上記は第1段階開始前の結果。この節が現在の採用状態である。737原典項目の集計対象は変更していない。再分類は正式状態と別の補助情報として全300項目へ付け、具体的技ID・変更前値・原典行・引用・次に必要な証拠をstaging/held-range-review.jsonと候補台帳のreevaluationへ保存した。未コミットの既存作業を維持した。",
    "",
    "| 分類 | 作業前 | 今回の増減 | 作業後 |",
    "| --- | ---: | ---: | ---: |",
    "| 採用 | 75 | +5 | 80 |",
    "| 保留 | 300 | -120 | 180 |",
    "| 対象外 | 362 | +115 | 477 |",
    "| 合計 | 737 | 0 | 737 |",
    "",
    "### 補助分類と解決結果",
    "",
    "| 補助分類 | 件数 | 結果・例 |",
    "| --- | ---: | --- |",
    "| A | 5 | 5件採用。Cammy236LK/MK、Dee Jay236MK、Terry214HP/MPのガード |",
    "| B | 115 | 115件対象外。AKI5MK全体の空振り差、豪鬼SA3のキャンセル発生差、Ken623HPのしゃがみガード差等 |",
    "| C | 134 | 継続保留。共通強度と距離差、括弧の意味・条件が未分離 |",
    "| D | 46 | 継続保留。持続・遠距離の説明があっても当該項目の端点は未記載 |",
    "",
    "5原典項目・5技レコード・5フィールドを追加採用。累計80原典項目・65技レコード・95フィールド。以前の75採用判断と90フィールドは変更していない。対象外115件は本番値を変更しない。datasetIdはdistance-held-review-2026-11-09-r1。32キャラ出題可能、1298技・SA288独立入力、D、空振り全体の条件、verification/UNVERIFIEDを維持。",
    "",
    "### 解消項目の一覧",
    "",
    "原典行番号は保存Cargoの0始まり。URLは原典への参照であり、現行パッチでの追認ではない。全体の対象外判断は測定条件の混在を防ぐもので、現在値の訂正を意味しない。",
    "",
    "| キャラ / 技ID | 項目 | 変更前 | 変更後・判断 | 原典行 / 根拠 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const i of r.items.filter((i) => i.resolution !== "held")) {
    const values = i.currentValues.map((v) => v.value.display).join(" / ");
    const ds = JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .distanceRanges.decisions;
    const display =
      i.resolution === "accepted"
        ? ds.find(
            (d) =>
              d.moveId === i.currentValues[0].moveId &&
              d.field === i.before.field,
          ).value.display
        : "対象外（現在値維持）";
    out.push(
      `| ${i.before.characterId} / ${i.before.moveIds.join(", ")} | ${i.before.field} | ${values} | ${display} | [${i.before.sourceIndex}](${i.checkedSources[0].url})：${i.evidenceQuote.replaceAll("|", "/")} |`,
    );
  }
  out.push(
    "",
    "### 追加Web確認と制約",
    "",
    "SuperComboのEdページは403 Forbidden、Cammy/Frame_dataはAnubis Access Denied（確認日2026-11-09）。現行値・注記・対象パッチを読めず、保存値との数値比較は未実施。検索に出た二次資料は採用根拠に使わなかった。今回の5採用と115対象外は既存保存Cargoだけで判断した。外部確認URLと結果は台帳のexternalChecksへ保存。",
    "",
    "### 残る保留と次回方針",
    "",
    "- 優先1（C）：A.K.I./Ed SA2ガード。L/M/Hそれぞれを固定した距離別表・動画測定が必要。共通の-19~ / +65~を各強度内の変動とする証拠は未取得。",
    "- 優先1（C）：ベガ通常[2]8K発生。軌道が異なる各強度を別々に測定した近/中/遠距離表が必要。18~46の強度横断範囲を転用しない。",
    "- 優先2（C）：A.K.I.236HK/KK発生・全体。表側/裏回り、43F裏回りの例外を区別した空振り全体と移動発生欄の定義が必要。",
    "- 優先2（C）：Arjun236Pの括弧硬直差、Blanka63214Kの接触ヒット、Honda5HPの発生と硬直差、Zangief63214K(Far)の括弧。既存代表条件内の端点か、姿勢・接触段数・別条件かを明示する技解説を先に確認する。",
    "- D：Ken5HP、Blanka5HK、Cammy2HP/5MP、JP22P/22PP等。現在の強度・状態と立ち相手を固定し、最初/最後の接触フレームで通常ヒット/ガードを測る。弾は近/中/遠距離別。公開の同条件測定表が得られれば実機測定に代用できる。差分から端点は計算しない。",
    "- 各180項目の具体的な不足条件と次の確認事項はreevaluation.nextEvidenceおよびheld-range-review.jsonに保存。Cは技別の条件資料、Dは同条件の端点測定を優先する。",
    "",
    "### 今回の検証",
    "",
    "typecheck、アプリ143テスト、データ16テスト、data:plan/data:check、validate:data、coverage、SA・共通強度・代表条件監査、format:check、buildを実施。履歴依存テストは維持。追加テストで全300件の分類・出典・状態、本番737件の集計、既存75判断の不変、採用以外の値の不変、調査台帳再生成の安定性を検査。既存の全件差分検査でも95フィールド以外を保護する。",
    "",
    "PC/320pxの技一覧で今回のCammy/Terryの符号付き範囲を確認。入力UI・ゲームルールは変更していない。commit・push・デプロイは行わない。",
    "",
  );
  writeFileSync(path, out.join("\n"));
  if (r.stage2) appendStage2Report();
}
