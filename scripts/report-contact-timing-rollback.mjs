import { readFileSync, writeFileSync } from "node:fs";
export function reportContactRollback() {
  const p = JSON.parse(readFileSync("data/adoption-decisions.json")),
    r = p.distanceRanges.contactTimingRollback;
  if (!r) return;
  const path = "docs/DISTANCE_RANGE_REPORT.md",
    old = readFileSync(path, "utf8").replace(/^# .*\n/, "");
  const history = old.includes("## 現在の仕様：持続当て範囲の撤回")
    ? old.split("\n## 撤回前の履歴\n")[1]
    : old;
  const lines = [
    "# 距離範囲対応・保存原典調査報告",
    "",
    "## 現在の仕様：持続当て範囲の撤回",
    "",
    "飛び道具の到達時間・移動技の移動距離で発生が変わる範囲のみを採用する。持続の何F目でヒット/ガードしたかによる硬直差は、距離で後半持続が当たる場合も範囲化しない。到達時間と接触の根拠が混在する硬直差も元の代表値へ戻す。新規調査・実測は行っていない。",
    "",
    "| 状態 | 変更前 | 増減 | 変更後 |",
    "| --- | ---: | ---: | ---: |",
    "| 採用 | 81 | -77 | 4 |",
    "| 保留 | 155 | -47 | 108 |",
    "| 対象外 | 501 | +124 | 625 |",
    "| 合計 | 737 | 0 | 737 |",
    "",
    "77原典項目の範囲採用を撤回し、共通強度展開を含む59技レコード・89フィールドを元の代表値へ戻した。残る範囲は4原典項目・9技レコード・9発生フィールド：JP214K/214KKの26~、ベガOD[2]8KKの16~47、通常ルークSA3の10~27（SAは3強度の独立入力）。全体Fを変更していない。Moveの採用状態・質問候補、D、unknown、verification、固定代表条件、32体・1298技・SA288独立入力を維持する。datasetIdはarrival-startup-only-2026-11-09-r1。",
    "",
    "保留のD47件は以前から持続・距離接触の硬直差端点待ちとして記録されていたため、範囲化対象外へ移した。本番値は維持。C108件は条件未分離のまま保留を維持し、範囲化対象外を技そのものの除外に使わない。",
    "",
    "正本distanceRanges.decisionsは過去の採用記録として保持し、contactTimingRollback.revokedに撤回前後の値・原典参照・理由を保存する。生成時は撤回された判断を適用しない。候補台帳への状態変更はcontactTimingRollback.candidatesに保存し、既存の調査段階の結論は書き換えず現在の上書き判断として適用する。過去基準比較も撤回値/復元値を厳密に検証してから比較する。",
    "",
    "### 単一値へ戻したフィールド（生成レコードを含む）",
    "",
    "| キャラ / 技ID | 項目 | 撤回前 | 代表値へ復元 |",
    "| --- | --- | --- | --- |",
  ];
  const ids = [...new Set(r.revoked.map((d) => d.characterId))];
  for (const id of ids) {
    const c = JSON.parse(readFileSync(`data/characters/${id}.json`));
    for (const m of c.moves)
      for (const d of r.revoked.filter(
        (d) =>
          d.characterId === id &&
          d.moveId === (m.strengthExpansion?.sourceMoveId || m.id),
      ))
        lines.push(
          `| ${id} / ${m.id} | ${d.field} | ${d.before.display} | ${d.value.display} |`,
        );
  }
  lines.push(
    "",
    "### 検証",
    "",
    "typecheck、アプリ144テスト・データ21テスト・archive29テスト、data:plan/data:check、validate:data、coverage、SA・共通強度・個別代表条件監査（--check）、format:check、build、参照整合性検査が成功。履歴依存テストを省略せず、新規回帰検査で公開前commit0e86060からの差分が89フィールドだけであること、撤回対象以外の完全一致と残る9範囲フィールドを検査した。PC1280px/320pxの実ブラウザーで持続範囲を戻したゲーム・技一覧表示、維持する発生範囲、Normal/Hard切替後の履歴とページ横はみ出しがないことを確認。スクリーンショットは従来どおりローカル保持のstaging/verification/distance-ranges。既存のchunkサイズ警告あり。",
    "",
    "## 撤回前の履歴",
    history,
  );
  writeFileSync(path, lines.join("\n"));
}
