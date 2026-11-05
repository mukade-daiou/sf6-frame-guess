# SF6 Frame Data Guessing Game

共通コマンドのフレームデータからキャラクターを推理する、バックエンド不要のReactアプリです。
**ケン・マリーザの2体を通常ゲームで遊べます。原典対応を基準に採用した個人用データで、公式検証・対象パッチは未確認です。** 付属の3体のFixtureは別の架空データです。

Node.js 24とnpmを使用します。

```sh
npm ci
npm run dev
```

起動後、そのまま「ゲーム開始」を押すとケン・マリーザで遊べます。架空Fixtureの選択は不要です。

`npm run dev`には過去の候補を調べる開発専用モードも残しています。通常ゲームは`data/characters/`の採用データを使います。[第10段階報告](docs/FRAME_DATA_STAGE10_REPORT.md)を参照してください。不明値は質問を消費せず、根拠のある確定範囲は1回消費します。初期データは明示的な更新指示まで固定します。

```sh
npm run typecheck
npm test
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
現在の引き継ぎ状態と再開手順は [HANDOFF.md](docs/HANDOFF.md) を参照してください。GitHub Pagesへの公開は実施していません。

```sh
VITE_BASE_PATH=/your-repository/ npm run build
VITE_BASE_PATH=/your-repository/ npm run preview
```

ユーザーサイト（`owner.github.io`）やカスタムドメインではWorkflowの `VITE_BASE_PATH` を `/` に変更します。
ルーターは使わず、画面をReactの状態で切り替えるため、追加パスへのフォールバックは不要です。
ユーザー提供の [DESIGN.md](DESIGN.md) に従い、暖色の面・Ink・選択状態のTeal・400/500の文字ウェイトを使用しています。pplxSansは同梱されていないため指定のsystem-ui代替です。

主要画面の操作・表示確認については [検証記録](docs/VERIFICATION.md) を参照してください。
