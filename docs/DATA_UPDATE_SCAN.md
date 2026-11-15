# 公式原典の更新チェック

第1段階は`9f3a96d`で確定しmainへ統合した。第2段階では原典取込、正規化、差分分類、レポート生成を追加した。本番更新、採用変更、apply、自動PR、定期実行は含まない。

## CLIと入力

基準と今回原典を別ディレクトリに置き、それぞれinventory.jsonで比較範囲を宣言する。

```json
{ "complete": true, "characters": [{ "id": "ryu", "file": "ryu.json" }] }
```

```sh
npm run data:update:scan -- --baseline tests/fixtures/source-scan --incoming tests/fixtures/source-scan
npm run data:update:report -- --run staging/verification/update-scans/RUN_ID
```

実データには既存のstaging/official-verification/sourcesの保存JSONを別ディレクトリへコピーし、inventoryを添える。fileの代わりにurlを指定すると公式HTTPSへの取得を試行する。タイムアウト30秒、リダイレクト拒否。今回の実サイト取得は403で失敗し、自動取得の成功は確認できていない。失敗応答も保存する。

対応形式は既存公式照合のCLASSIC保存JSON。rowsにはname、section、commandImages、startup、active、recovery、hit、block、notesが必要となる。HTML抽出器やログイン回避は実装しておらず、HTML・不正JSONも解析失敗となる。取得できない場合はこのJSON形式を手動保存して取り込む。版不明はnullとし、取得日からゲームバージョンを推測しない。

completeは全対象キャラの取得が完了した場合だけtrueにする。両側が完全な場合だけキャラの追加・削除を確定候補にする。不完全な範囲では成功した共通キャラだけ比較し、source_errorを必ず残す。成功は終了コード0、取得・解析・範囲の問題は1、引数不足は2。

## 実行成果物

既定の出力はstaging/verification/update-scans/日時-UUID。ワークスペース内のCLI出力もこの配下に限定する。

| ファイル        | 内容                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| manifest.json   | 取得元、取得日時、原典とinventoryのSHA-256、版と根拠、取得状態、検証コンテキストのハッシュ |
| raw/            | 元のバイト列、取得失敗の応答本文、入力inventory                                            |
| normalized.json | 両側の正規化結果と範囲の完全性                                                             |
| context.json    | 分類に用いたproductionと採用判断                                                           |
| diff.json       | 変更前後、フィールド差分、状態、対応本番技ID、保存済みの判断理由                           |
| report.md       | manifestとdiffから再生成できる確認用レポート                                               |

同じ入力・採用判断ならdiff.jsonは同じとなる。実行日時とIDは毎回変わり、過去結果を上書きしない。変更なしの場合も比較元のハッシュを残す。レポート生成は本番データや既存原典を変更しない。

## 再利用と分類

本番の正本は引き続きdata/characters、metadata、adoption-decisions。build-snapshot.tsはstaging/adoption-inputsと保存原典に判断を適用する従来の生成入口であり、scanから呼び出さない。archiveと過去の精査結果も保持する。

既存公式照合compare.mjsのcommands、candidates、totalを再利用した。原典値はrawを保持し、numeric、range、conditional、special、unknown、not_applicableに区別する。KD/HKDを数値化しない。空振り全体Fの導出は根拠付きの別フィールドとし、原典recoveryを上書きしない。ODの解釈も既存コマンド処理を継承し、採用入力は生成しない。

officialId、技名と入力、一意な技名、一意な入力の順に対応付ける。行番号・配列順は識別に使わない。同名・同入力の多重候補はunmatched。IDがなく技名と入力が同時に変わる場合は追跡を確定できない。対応付けた技の比較には薄い変換層を介してsnapshot-diffを再利用する。

状態はunchanged、candidate、needs_review、unmatched、source_error。candidateは採用可能という判断ではない。既存の補正・保留・除外の記録を参照し、該当変更をneeds_reviewとする。理由はretainedDecisionsとheldに保持する。複数の本番技に対応する場合もunmatchedに残す。

## 検証と次段階

第1段階のtest:update（dailyを含む）とtest:historyは確定前に成功した。第2段階では変更なし、フレーム・入力・技名・条件の変更、技・キャラ追加削除、並び替え、曖昧な対応、不明値・特殊表記、手動補正との競合、失敗・部分範囲、冪等性、出力隔離を保存Fixtureで検査する。外部通信は通常テストに含めない。

第1段階はVitest165件、Node65件22.44秒、archive29件。第2段階のNode72件は23.05秒、追加Fixture検証は約0.1秒。既存テストは削除していない。本番と既存原典のGit差分も最終確認する。

mainへのpushで自動デプロイしないよう、既存workflowの公開を明示的な手動実行に限定した。push時の検証・ビルドは継続する。対象外の未追跡ファイルは変更・コミットしない。

第3段階では技対応の確定、版と根拠の確認、レビュー・承認ファイル、FrameValue変換と既存補正の優先順位、承認差分のみの適用、適用前再検証・ロールバックが必要となる。公式HTML抽出が必要なら、アクセス可能な実ページを根拠に別アダプターを追加する。
