# 過去資料の索引

ここは第2～第10段階の保存記録です。現在の採用条件は[DATA_SPEC.md](../docs/DATA_SPEC.md)、作業手順は[DATA_WORKFLOW.md](../docs/DATA_WORKFLOW.md)を優先してください。古い報告書の「本番化0体」等は当時の判定です。

- [第2段階の収集報告](docs/FRAME_DATA_COLLECTION_REPORT.md)
- [第3段階の品質報告](docs/FRAME_DATA_QUALITY_REPORT.md)
- [第4段階](docs/FRAME_DATA_RELEASE_READINESS.md)
- [第5段階](docs/FRAME_DATA_STAGE5_REPORT.md)
- [第6段階](docs/FRAME_DATA_STAGE6_REPORT.md)
- [第7段階](docs/FRAME_DATA_STAGE7_REPORT.md)
- [第8段階](docs/FRAME_DATA_STAGE8_REPORT.md)
- [第9段階・手動チェック準備](docs/FRAME_DATA_STAGE9_REPORT.md)
- [第10段階・通常ゲームへの採用](docs/FRAME_DATA_STAGE10_REPORT.md)

`staging/`に原典・証拠・当時の判断とスナップショット、`scripts/`と`tests/`に過去の再現用コードを保持しています。実行時の作業ディレクトリは今までどおりリポジトリルートです。通常の開発でこれらを再生成する必要はありません。

旧パスと新パスの全対応は[cleanup-moves.json](../docs/cleanup-moves.json)。過去JSON内の履歴識別用パス（例：evidenceReused）は元の表記を維持しています。ファイルを探す場合はこの対応表を参照してください。
