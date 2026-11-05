# SF6 Frame Data Guessing Game

共通コマンドのフレームデータからキャラクターを推理する、バックエンド不要のReactアプリです。
**本番データは未収録です。付属の3体は架空のFixtureで、SF6の実データではありません。**

Node.js 24とnpmを使用します。

```sh
npm ci
npm run dev
```

起動後「テスト用の架空Fixtureを使う」を選択してゲームを開始します。

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
