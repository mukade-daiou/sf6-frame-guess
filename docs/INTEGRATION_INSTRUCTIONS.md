# Codex CLI指示：SF6フレームデータ収集の全キャラ化（第2段階）

モデル: GPT-6.1 Sol / Medium（曖昧な技分類の設計が必要ならHigh）

## 前提
- 対象のWebアプリは既存の `/home/mukade/codex/`。
- 既存の `docs/DATA_SPEC.md` と `src/lib/frame-data/schema.ts` が正本。アプリのゲームロジック・DESIGN.md・既存Fixtureを勝手に書き換えない。
- 添付ZIPの `scripts/collect-supercombo.mjs` を使用する。GitHubに公開されているコミュニティデータをステージングに収集する。
- **今は本番 `data/characters` と `data/metadata.json` を変更しない。**

## 実行
1. スクリプト・テストをリポジトリにコピーし、既存ファイルとの衝突を確認する。
2. `node --test tests/collect-supercombo.test.mjs` を実行する。
3. `node scripts/collect-supercombo.mjs --all` で公開データの候補を全キャラ分取得する。
4. 各 `.audit.json`、`collection-report.json` を集計し、通常技12種類の有無、基本必殺技候補、スキップ理由、同入力衝突、null、パッチの参照日を表にする。
5. 取得したデータを既存Zodスキーマに通し、型違反をレポートする。全件を手動で修正しない。
6. `gameVersion: UNVERIFIED`、`coverage: partial/unverified`、`source.verification: unverified` を保持する。検証を省略してcompleteに変えない。
7. 差分・例外の報告書 `docs/FRAME_DATA_COLLECTION_REPORT.md` を作成する。特にグラディウス(ホールド)、電刃強化、構え、タメ、派生、ダウン後有利を確認する。
8. データの数値を推測で補完せず、何を調べれば本番に移せるか、必要な確認を優先順で整理する。
9. commit/push/デプロイはしない。

## 成果物
- `staging/sf6-frame-data/characters/*.json`（実体）
- `staging/sf6-frame-data/*.audit.json`（除外・衝突）
- `staging/sf6-frame-data/collection-report.json`
- `docs/FRAME_DATA_COLLECTION_REPORT.md`（集計と本番化の阻害要因）

データのライセンスCC BY-SA 4.0の表示と原典へのリンクを維持する。
最新の公式フレームデータを取得できる場合はそちらを優先し、取得方法と取得日時を報告する。公式の転載条件が不明なら安易に本番再配布しない。
