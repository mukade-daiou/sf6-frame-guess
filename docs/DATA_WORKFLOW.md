# データの正本と更新手順

## SA統合後の更新（第15段階B）

現在は32キャラ1196レコード（従来908＋SA288）、datasetId `super-arts-2026-11-07-r1`。SA96枠、原典基本101行、個別強度質問288レコードは別の集計単位である。

調査成果物は固定し、`scripts/super-arts.ts`で保存raw/Cargoとの一致を検査して変換する。`npx tsx scripts/audit-super-arts.ts --pilot`で6キャラを確認し、全体は同コマンドのオプションなしで計画を生成する。`data:plan`→`npx tsx scripts/build-snapshot.ts --write --update`の従来の更新保護を通す。datasetIdの変更が必要。更新後は`npx tsx scripts/audit-super-arts.ts --check`で原典199行分類・96枠・288入力と開始時908レコードを検査する。

従来normal/specialの監査・adoption-inputsは維持し、SAの分類はstaging/sa-integration/coverage.jsonに分離する。build-snapshotは従来の採用処理の後でSAを追加するため、再生成でSAが消えたりheldになったりしない。`test:data`でもこの再現と保護を検査する。SA-D1〜D5の正本はADOPTION_RULESの追補。調査validate.pyは908件だった第15段階A終了時用の固定検証であり、統合後は実行せず、SA監査で原典の不変性を確認する。

現在のゲームが読む正本は`data/metadata.json`と`data/characters/*.json`。32体908レコード（採用873・保留27・明示的対象外8）、datasetIdは`scope-policy-2026-11-07-r1`。全32体が採用範囲でcompleteとなり抽選可能です。ケン・マリーザの63技のフレーム値とOD龍尾脚9Fは維持し、奮迅脚はユーザー指定で対象外へ変更しました。信頼性と採用可否の分離はDATA_SPEC.md、判断の再利用はADOPTION_RULES.mdを参照してください。

| 場所                            | 役割・編集方針                                                      |
| ------------------------------- | ------------------------------------------------------------------- |
| data/characters/、metadata.json | 固定済みの実行スナップショット。通常は編集しない                    |
| data/adoption-decisions.json    | 採用・保留と入力候補の参照先の正本。今後の追加判断をここへまとめる  |
| staging/candidates/             | 32体860技の未採用候補。過去の収集結果を引き継ぐ出発点               |
| staging/adoption-inputs/        | 採用判断で参照する、標準条件と保留を整理した現在の32体の入力        |
| staging/dev-review-policy.json  | 既存の開発専用試遊で使う入力スコープ。ゲーム本番では読まない        |
| staging/verification/           | 現在の検査レポート・ブラウザー画像。次回検証で再生成可能            |
| archive/staging/                | 第2～第10段階の原典・証拠・判断・スナップショット。現行正本ではない |

採用入力2ファイルと過去の第7段階の2ファイルは同じ内容から開始しているが、目的が異なる。過去のスナップショットは変更せず、今後の明示的な更新では現在の入力を編集する。

1. 明示的な追加・更新依頼を確認する。自動取得・自動更新しない。
2. `staging/candidates/`を出発点に対象キャラの原典対応・状態・矛盾を確認し、`staging/adoption-inputs/`へ対象の採用入力を用意する。不明はunknown、判断保留はheldとして扱う。
3. `data/adoption-decisions.json`に対象を追加する。既存キャラは残し、更新時は新しいdatasetIdにする。
4. `npm run data:plan`で検証・採用案を確認する。通常の本番データは変更しない。
5. 初回出力は`npx tsx scripts/build-snapshot.ts --write`。既存と違う更新は、明示的な依頼がある場合だけ`--write --update`を使う。新datasetIdと既存キャラの維持が必須。
6. `npm run data:check`、`npm run validate:data`、`npm test`、`npm run test:data`、`npm run build`で確認する。previewで`npm run verify:browser`を実行する場合は127.0.0.1:4173を起動しておく。

同じ手順で30体をまとめて判断一覧へ追加でき、stage番号付きのスクリプトやフロント側のキャラID追加は不要。CLIはリポジトリルートから実行する。原典やライセンスの根拠は保持し、出典を検証済みと偽って採用しない。

## 現行検証と過去の再現

`npm test`はアプリの機能テスト、`npm run test:data`は現行スナップショットの再生成・固定性検査。過去の変換・収集・段階別再現は`npm run test:archive`で別途実行する。検査範囲を削除していない。共有JSONを再生成するためarchive側は直列実行し、進行中の手動編集と同時に実行しない。

過去の取得スクリプトはネット取得を伴うものがある。アーカイブ索引から個別に確認し、明示的な調査・更新依頼なしに実行しない。

## 収録漏れ監査と保存済み原典の修復

`npm run data:audit-coverage`は32体の保存済みraw全行とCargoの追加行を独立に照合し、`staging/coverage-audit/review.json`へ分類・入力・対応先・出典を出力します。過去の汎用除外理由をそのまま対象外にはしません。新しい原典を使う場合も、対象外・未対応・保留の根拠をこの一覧で確認します。

`scripts/repair-source-coverage.ts`は保存原典から明示的な変換だけで今回の追加20行を再現します。通常実行は計画表示のみ。`--write`で採用入力へ追記し、`--coverage`を併用した場合だけ監査結果からpartialとdatasetIdを更新します。原候補860件は編集しません。初回の明示的実行順は修復計画→`--write`→監査→`--write --coverage`→監査確認→`data:plan`→`build-snapshot.ts --write --update`です。既に記録した行は重複追加しません。

現在の`data:check`は原典行の対応・coverageと、スナップショットの再生成を両方検査します。入力不足が残るキャラをcompleteにして検査を通してはいけません。未対応入力へのモデル拡張は原典を確認して別途行い、今回の修復スクリプトを別キャラに無条件で適用しないでください。

今回の補修行だけを明示的に再生成し直す場合は`--write --refresh-added`を指定します。既存884件を対象にせず、coverage用のIDだけを書き換えます。本番スナップショットへの反映には、従来どおり異なるdatasetIdと`--write --update`が必要です。

追加指定の対象外・遠距離方針は`source-scope.ts`と`apply-adoption-policy.ts`で再現します。原典監査→`npx tsx scripts/apply-adoption-policy.ts`で計画確認→明示的な`--write`→監査確認→`data:plan`→`build-snapshot.ts --write --update`の順です。前の補修スクリプトで最新datasetIdを戻さないよう、通常の追加入力は現在の採用入力と判断を出発点にしてください。過去レポート・verification.jsonは保存時点の結果で、現在の追加指定結果はpolicy-changes.jsonとpolicy-verification.jsonを参照します。
