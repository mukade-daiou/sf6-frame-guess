# 過去資料の索引

ここは過去段階の保存記録です。現在の採用条件は[DATA_SPEC.md](../docs/DATA_SPEC.md)、作業手順は[DATA_WORKFLOW.md](../docs/DATA_WORKFLOW.md)を優先してください。古い報告書の件数・UI・採用方針は当時の判定です。

- [第2段階の収集報告](docs/FRAME_DATA_COLLECTION_REPORT.md)
- [第3段階の品質報告](docs/FRAME_DATA_QUALITY_REPORT.md)
- [第4段階](docs/FRAME_DATA_RELEASE_READINESS.md)
- [第5段階](docs/FRAME_DATA_STAGE5_REPORT.md)
- [第6段階](docs/FRAME_DATA_STAGE6_REPORT.md)
- [第7段階](docs/FRAME_DATA_STAGE7_REPORT.md)
- [第8段階](docs/FRAME_DATA_STAGE8_REPORT.md)
- [第9段階・手動チェック準備](docs/FRAME_DATA_STAGE9_REPORT.md)
- [第10段階・通常ゲームへの採用](docs/FRAME_DATA_STAGE10_REPORT.md)
- [第11段階・プロジェクト整理](docs/PROJECT_CLEANUP_REPORT.md)
- [第12段階・UI検証](docs/UI_STAGE12_REPORT.md)
- [第13段階・32キャラ統合](docs/CHARACTER_INTEGRATION_REPORT.md)
- [第14段階・回転入力と収録監査](docs/ROTATION_AND_COVERAGE_AUDIT.md)

`staging/`に原典・証拠・当時の判断とスナップショット、`scripts/`と`tests/`に過去の再現用コードを保持しています。実行時の作業ディレクトリは今までどおりリポジトリルートです。通常の開発でこれらを再生成する必要はありません。

第11段階の旧パスと新パスの対応は[cleanup-moves.json](docs/cleanup-moves.json)、当時の棚卸しは[cleanup-inventory.json](docs/cleanup-inventory.json)。これら自身は2026-11-09にdocsからarchive/docsへ移しました。過去JSON内の履歴識別用パス（例：evidenceReused）は元の表記を維持しています。

第15～16段階のSA・共通強度・条件付き必殺技レポートは、現行採用の根拠として引き続きdocsに保持しています。原典や検証画像は取得時点の証拠であり、再生成可能という理由だけでは削除しません。現在の監査で更新する出力はstaging、過去の再現入力・出力はarchive/staging、保存不要の新しい検証出力はGit対象外のstaging/verificationです。

`scripts/verify-super-arts.mjs`と`scripts/verify-sa-review.mjs`は旧SAレベル選択UI用の手順です。2026-11-09にルートscriptsからarchive/scriptsへ移動しました。現行UIで実行するものではなく、当時の検証の再現資料として保持しています。現在の通し操作はルートの`npm run verify:browser`を使います。
