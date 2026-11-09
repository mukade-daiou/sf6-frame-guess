# SF6フレーム探偵

開発・データ確認用の読み取り一覧は`#/moves`へ直接アクセスできます（Pagesでは`/sf6-frame-guess/#/moves`）。通常ゲームにはリンクを設けていません。認証による非公開ページではありません。全キャラ共通の150入力と保存済み採用状態を表示し、複数レコードは追加行で確認できます。ブラウザー検証はpreview起動後に`node scripts/verify-moves.mjs`を実行します。

共通コマンドのフレームデータからキャラクターを推理する、バックエンド不要のReactアプリです。
**32キャラを通常ゲームで遊べます。原典対応を基準に採用した個人用データで、公式検証・対象パッチは未確認です。** 付属の3体のFixtureは別の架空データです。

Node.js 24とnpmを使用します。

```sh
npm ci
npm run dev
```

起動後、そのまま「ゲーム開始」を押すと32キャラから抽選します。架空Fixtureの選択は不要です。

`npm run dev`には過去の候補を調べる開発専用モードも残しています。通常ゲームは`data/characters/`の採用データを使います。[第10段階報告](archive/docs/FRAME_DATA_STAGE10_REPORT.md)を参照してください。不明値は質問を消費せず、根拠のある確定範囲は1回消費します。初期データは明示的な更新指示まで固定します。

```sh
npm run typecheck
npm test
npm run test:data
npm run validate:data
npm run format:check
npm run build
npm run preview
```

本番データは `data/metadata.json` と `data/characters/*.json` に配置します。
追加は次回ビルドで自動反映されます。実行時の取得バッチはありません。
[ゲーム仕様](docs/GAME_SPEC.md)、[データ仕様](docs/DATA_SPEC.md)、[出典方針](docs/DATA_SOURCES.md)を参照してください。

GitHub PagesではSettings → PagesのSourceをGitHub Actionsに設定します。
Workflowはmainへのpush・PR・手動実行で検証とビルドを行います。公開は手動実行で `deploy: true` を明示した場合のみです（既定false）。
公開前にリポジトリのPages環境の保護設定を確認してください。
現在の開発・追加手順は[DATA_WORKFLOW.md](docs/DATA_WORKFLOW.md)を参照してください。古い引き継ぎ資料は過去記録です。GitHub Pagesへの公開は実施していません。

```sh
VITE_BASE_PATH=/your-repository/ npm run build
VITE_BASE_PATH=/your-repository/ npm run preview
```

ユーザーサイト（`owner.github.io`）やカスタムドメインではWorkflowの `VITE_BASE_PATH` を `/` に変更します。
ルーターは使わず、画面をReactの状態で切り替えるため、追加パスへのフォールバックは不要です。
ユーザー提供の [DESIGN.md](DESIGN.md) に従い、暖色の面・Ink・選択状態のTeal・400/500の文字ウェイトを使用しています。pplxSansは同梱されていないため指定のsystem-ui代替です。

主要画面の操作・表示確認については [検証記録](archive/docs/VERIFICATION.md) を参照してください。

## 構成とデータ管理

`src/`はゲーム本体、`data/`は固定スナップショットと採用判断、`staging/candidates/`は元の32体860候補、`staging/adoption-inputs/`は現在の採用入力です。本番は32キャラ1298レコードで、SA96枠・強度別288入力を含みます。datasetIdは`focus-startup-2026-11-09-r1`、ゲーム版はUNVERIFIEDです。[採用ルール](docs/ADOPTION_RULES.md)と[条件付き必殺技の採用記録](docs/CONDITIONAL_SPECIAL_ADOPTION_REPORT.md)を参照してください。

[データ追加・更新手順](docs/DATA_WORKFLOW.md)、[今回の整理・検証結果](docs/PROJECT_MAINTENANCE_REPORT.md)、[過去資料の索引](archive/README.md)を参照してください。過去の段階別コード・証拠はarchiveに保存しています。

`npm run data:plan`で採用案を検証し、`npm run data:check`で現在のスナップショットとの差を検出します。明示的な更新依頼があるときだけ`build-snapshot.ts --write --update`を使います。キャラ追加のためのstage専用スクリプトは不要です。

過去の再現テストは`npm run test:archive`、import参照検査は`node scripts/check-references.mjs`。ブラウザーの通しプレイはpreviewを127.0.0.1:4173で起動して`npm run verify:browser`を実行します。

## 必殺技・SAの操作

「必殺技・SA」タブでコマンドと弱・中・強（またはOD）を指定します。SAレベルの選択は不要です。同じフレーム値でも各強度は独立した質問です。CAとSA派生は対象外。溜めSAは左→右→左→右、720は2回転または候補クリックで入力できます。Normal/Hardの表示切替と質問済み判定は独立しています。

現在のデータ監査には`npm run data:audit-coverage`、`npx tsx scripts/audit-super-arts.ts --check`、`npx tsx scripts/audit-strength-expansion.ts --check`、`npx tsx scripts/audit-conditional-specials.ts`を使います。現行の`npm run test:data`はこれらの回帰検査と過去コミットとの比較を含み、Git全履歴が必要です。過去の段階別再現テストは`npm run test:archive`に分けています。
