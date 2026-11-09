import { readFileSync, writeFileSync } from "node:fs";
import { appendStage3Report } from "./report-held-range-stage3.mjs";
export function appendStage2Report() {
  const review = JSON.parse(
    readFileSync("staging/held-range-review.json", "utf8"),
  );
  if (!review.stage2) return;
  const s = review.stage2,
    path = "docs/DISTANCE_RANGE_REPORT.md";
  const history = readFileSync(path, "utf8")
    .replace(/^# .*\n/, "")
    .split("\n## 第2段階：C134項目の追加調査")[0];
  const counts = Object.fromEntries(
    [1, 2, 3, 4, 5].map((p) => [
      p,
      s.items.filter((r) => r.priority === p).length,
    ]),
  );
  const out = [
    "# 距離範囲対応・保存原典調査報告",
    "",
    "## 現在の結論（第2段階終了）",
    "",
    "C134項目すべての技ID・フィールド・保存原典・不足証拠を再確認して優先順位を付けた。公開本文を追加取得できた主要候補と、保存raw・SA inventory・原典参照の再照合だけを進めた候補を区別して記録した。各項目のcheckedSourcesに列挙していない公開資料は未確認であり、全134項目をWebで独立検証した意味ではない。検索結果の断片から数値を採用していない。",
    "",
    "| 状態 | 作業前 | 今回の増減 | 作業後 |",
    "| --- | ---: | ---: | ---: |",
    "| 採用 | 80 | +1 | 81 |",
    "| 保留 | 180 | -25 | 155 |",
    "| 対象外 | 477 | +24 | 501 |",
    "| 合計 | 737 | 0 | 737 |",
    "",
    "C134の結果は採用1・対象外24・保留継続109。保留継続のうちC108、C→D1。既存D46は再調査・変更していないため、残る補助分類はC108・D47。",
    "",
    "ルーク通常SA3の発生を10から10~27へ変更した。1原典項目をL/M/Hの独立3技レコード・3フィールドへ適用し、累計81原典項目・68技レコード・98フィールド。既存80原典項目・95フィールドの判断を維持。全32体出題可能、1298技、SA288独立入力を維持。対象外24項目の本番値を訂正したのではなく、距離範囲化の候補状態だけを変更した。",
    "",
    "### 調査優先順位",
    "",
    "順に、1点照合・入力/派生対応・括弧定義・複数資料・実測候補という区分。134件の各priority/priorityBasisと結論はheld-range-review.jsonのstage2.itemsおよび候補台帳のreevaluation.stage2に保存。",
    "",
    "| 優先区分 | 件数 |",
    "| --- | ---: |",
    ...Object.entries(counts).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "### 新規採用の根拠",
    "",
    "[ShoryuのLuke本文](https://shoryu.site/character/luke)の通常Pale Rider行を取得し、保存Cargo row9の10(27)と、相手到達または27Fで攻撃が発生するという条件を照合。距離による到達時間の両端10/27をそのまま使い、計算していない。CAのrow10はSA生成原典refと異なる別条件行として除外。追加本文は同じWiki由来の再掲載であり独立検証・最新パッチ保証ではない。パッチはUNVERIFIEDを維持する。保存原典と当該発生・条件の矛盾は検出していない。",
    "",
    "| 技ID | 項目 | 変更前 | 変更後 |",
    "| --- | --- | --- | --- |",
    ...["L", "M", "H"].map(
      (x) => `| luke__super_art_3_${x} | startup | 10 | 10~27 |`,
    ),
    "",
    "### 対象外24項目",
    "",
    "SA別条件行の照合は生成済みsaEvidence.cargoRefと保存inventoryに基づく。入力文字列が共通でもCA等を通常SAへ取り込まない。以下の判断は資料不足による除外ではなく、具体的な測定条件・出典対応に基づく。",
    "",
    "| 技ID（元台帳の対応） | 項目 / 原典行 | 理由 |",
    "| --- | --- | --- |",
    ...s.items
      .filter((r) => r.resolution === "excluded")
      .map(
        (r) =>
          `| ${r.moveIds.join(", ")} | ${r.field} / ${r.key} | ${r.reason} |`,
      ),
    "",
    "### 追加資料と取得結果",
    "",
    "確認日2026-11-09。以下は本文HTMLを通常の公開URLから取得してstaging/held-range-stage2に保存した。由来が共通のため独立資料数としては数えない。更新時期・適用パッチは不明。公式表からの最新値上書きは行っていない。",
    "",
    ...s.sources.map(
      (x) => `- [${x.id}](${x.url})：HTTP200、本文取得済み。保存先 ${x.path}。`,
    ),
    "",
    ...s.unavailable.map((x) => `- [未確認資料](${x.url})：${x.status}。`),
    "",
    "SuperCombo本体は前回の403/Anubis失敗を引き継ぎ、今回は同一URLへの再試行・回避処理を行っていない。公式ルーク表はWeb取得不可の後、通常curlでも403となり、それ以上の再試行はしていない。その他の公式候補もWeb取得不可で本文未確認。誤ったShoryuのBison/mbison候補URLは404、検索で判明したvegaの公開本文を取得した。",
    "",
    "### 主要な保留と次回必要な証拠",
    "",
    "- A.K.I./Ed SA2：公開本文も共通強度表と配置/弾速差のみ。各強度内の距離別ガード値がない。各強度を別に測った近・中・遠距離表が必要。",
    "- ベガ通常[2]8K：公開Shadow Rise行にも軌道の強度差と共通18~46しかなく、各強度の端点を分離できない。OD16~47は維持。",
    "- A.K.I.236HK/KK：公開記載にも表裏と43F例外が残る。同じ表裏条件の空振り全体表と、発生欄が何を測定するかの定義が必要。",
    "- Arjun236P、Blanka63214K、Honda5HP、Zangief Far：追加本文に括弧の新しい条件定義がない。相手の姿勢、接触段、走行距離・アーマー接触を分離した表・動画が必要。範囲端点を推測しない。",
    "- Dhalsim236PPガードはCからDへ。追加公開本文も距離で硬直差が増すと記載するが端点がない。OD LP+MPと立ち相手に固定した近/中/遠の実測資料を求める。-3から片側~を新作しない。",
    "- その他Cは各項目のnextEvidenceを参照。保存資料だけを再照合したものはその事実をsourceComparisonへ明示し、公開本文取得済みとは区別する。",
    "",
    "### 検証",
    "",
    "typecheck、アプリテスト、データテスト、data:plan/data:check、validate:data、coverage、SA・共通強度・代表条件監査、format:check、buildを実施。履歴依存検査は維持し、第1段階基準へ戻す比較では今回の明示許可フィールドを厳密に照合して投影する。追加検査で134件、80判断と既存D46の不変、3強度の新範囲と独立入力、端点の公開本文、再生成の安定性を確認する。PC/320pxのゲーム画面・技一覧で10~27を確認。commit・push・デプロイは行っていない。",
    "",
    "## 過去段階の履歴",
    history,
  ];
  writeFileSync(path, out.join("\n"));
  if (review.stage3) appendStage3Report();
}
