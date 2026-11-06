# 第11段階：プロジェクト整理

2026-11-06実施。復元基準は`3841f72aaf235a1156ec28d3090529110506064c`。開始時のmain・origin/main・GitHub HEADは一致し、未コミット・未追跡ファイルはなかった。第9・第10段階は既にこのcommitで保存されていたため、重複するcheckpointは作成していない。整理分だけを別commitに保存する。

ゲーム仕様・UI・63技の値・採用状態・出典・ライセンス・datasetIdは変更していない。採用済みJSONとmetadataはバイト単位で一致。移動した証拠等を含む357ファイルについても整理前のGitオブジェクトと一致し、32体860候補を保持した。削除した重要資料はない。

## 構成

整理前はdocsに22ファイル、scriptsに27スクリプト、testsに9ファイル、stagingに353ファイルがあり、現行運用と段階別調査が混在していた。

```text
src/                         ゲーム・機能テスト
data/                        固定スナップショット、採用判断、NOTICE
scripts/                     検証、採用案・スナップショット生成、ブラウザー確認
tests/snapshot.test.mjs       現行の固定データ保護
docs/                        現在の仕様と運用手順
staging/candidates/          32体860候補
staging/adoption-inputs/     現在の採用入力2体
staging/dev-review-policy.json 開発試遊のスコープ
staging/verification/        再生成可能な検証出力（Git対象外）
archive/docs/                第2～第10段階等の報告書・旧手順
archive/staging/             原典、証拠、段階別スナップショット
archive/scripts/、tests/     過去の変換・調査・再現テスト
```

棚卸しのファイル数・バイト数・A/B/C分類は[cleanup-inventory.json](cleanup-inventory.json)、全移動対応は[cleanup-moves.json](cleanup-moves.json)に保存した。容量はGit対象と今回の管理ファイルを集計し、node_modules・dist・.git・再生成用verificationは除外する。索引や整理報告の追加による増加はあるが、資料を捨てて容量を削減する作業ではない。

| ディレクトリ | 整理前のファイル数／容量 | 整理後のファイル数／容量 |
| --- | --- | --- |
| src | 25／181 KiB | 25／181 KiB |
| data | 5／138 KiB | 6／139 KiB |
| docs | 22／188 KiB | 9／約103 KiB |
| staging | 353／26.10 MiB | 35／1.63 MiB |
| scripts | 27／143 KiB | 5／16 KiB |
| tests | 9／23 KiB | 1／1 KiB |
| archive | 0 | 369／24.87 MiB |

容量は概数。整理後のdocsは棚卸しJSON自身を除く。全管理ファイルの個別容量と正確な集計値は棚卸しJSONに保存した。

## 分類と判断

| 分類         | 対象・根拠                                                          | 処理                                                                                                      |
| ------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A 現行ゲーム | srcのimport、Viteのdata glob、本番JSON・metadata・NOTICE            | 本番データを維持。開発用importだけ現在のstaging入力へ修正                                                 |
| B 今後の運用 | 候補32JSON、採用入力、採用判断、検証・生成CLI、現行仕様・機能テスト | 正本を一意にし、stage番号のない入口へ整理                                                                 |
| C 過去の記録 | 段階報告・保存HTTP応答・原典・過去の生成器とテスト                  | archiveへ移動。原典・証拠JSONは内容を保持                                                                 |
| D 役割が重複 | release/candidatesと他の段階別候補、stage10の判断と生成器           | 現在の候補はstaging/candidates、判断はdata/adoption-decisionsに統一。古い異なる時点の候補は履歴として保持 |
| E 再生成可能 | node_modules、dist、今後の検証画像・検証レポート                    | 削除せずGit対象外。過去の画像・取得証拠はCとして残す                                                      |

分類はファイル名だけでなく、TS/JSのimport、package scripts、CI、再生成スクリプトの読書き、JSON内の採用入力パス、Markdownリンク、実際のテスト実行を用いて行った。調査証拠を単に「再取得できそう」という理由で削除していない。

採用入力2ファイルは過去の第7段階スナップショットを複製した。現在の編集入力と変更しない履歴という役割を分けるための複製であり、同じ目的の正本を2つ作ったわけではない。860候補も元ディレクトリを移動した1組が正本。

第10段階の採用判断JSONも当時の内容をarchiveへ保存した。現行のdata/adoption-decisions.jsonはそこから参照パスだけを新構成へ変更した運用用ファイル。

## 移動・コード整理

403ファイルの移動から開始し、機能テスト3ファイルもstage番号からadoption・coverage・frame-policyへ改名した。個別の旧新パスは対応表を参照する。削除のみの処理は行っていない。

`build-stage10.ts`は`build-snapshot.ts`、`verify-stage10-browser.mjs`は`verify-gameplay.mjs`へ改名。生成器の採用判断の読込先をdata/adoption-decisions.json、作業出力をstaging/verificationへ変更した。新しいキャラ追加でstage専用の生成器を追加する必要はない。現在の入力と判断からの生成、型・スキーマ検証、未知値、固定スナップショットの更新保護は従来の処理を維持し、--checkを追加して書き込みなしで差を検出できるようにした。

過去のスクリプトは全面共通化せず、再現用として残した。archiveからもルートを作業ディレクトリとして実行できるよう、importと入出力先を修正した。履歴識別用のevidenceReused等は元表記を維持し、旧パスは移動対応表から解決する。過去報告書はリンク・実行パスのみ更新し、当時の判定を現行仕様へ書き換えていない。

## 正本と今後の操作

現在の正本は[DATA_WORKFLOW.md](DATA_WORKFLOW.md)に整理した。採用済みdataを直接編集せず、明示的な依頼を受けて採用入力とdata/adoption-decisions.jsonを更新する。新datasetId・既存キャラの維持・明示的--updateが必要な制約を維持する。自動取得・自動更新は追加していない。

```sh
npm run data:plan
npm run data:check
npm test
npm run test:data
npm run validate:data
npm run build
npm run test:archive
node scripts/check-references.mjs
```

現行テスト31件＋スナップショット保護1件と、過去の再現29件を分離した。検査範囲は減らしておらず、CIもビルド後に両系統と参照検査を実行する。アーカイブテストは保存JSONを再生成するため直列実行する。単なる通常テストで過去の生成物を再出力しない構成にした。

## 検証

- 型検査、Vitest31件、現行node:test1件、アーカイブnode:test29件が成功。
- 本番Zod2体・対象2体・入力37種類、Fixture3体の検証とビルドが成功。
- snapshot --checkで採用済みデータと判断・入力の一致を確認。
- import参照切れ0。現行・過去Markdownの相対リンクも検査。
- PC1280px・モバイル390px、通常／発生のみの4通りで、5問→正解／不正解→再プレイを確認。Fixture・開発試遊は使用していない。不明値の非消費、D、適用対象外、OD・奮迅脚、技なし・出典表示も維持。
- 移動後の本番JSファイル名・容量は整理前と同じ。開発専用データは本番へ混入していない。

アーカイブ移動後の参照不備は再現テストで検出して修正した。初期のimport失敗とevidenceReusedの再生成差分は解消し、最後の29件はすべて成功している。過去の証拠JSONは元の内容に保っている。

検証画像と結果はstaging/verification/browserへ出力し、Git対象外とした。従来のZod PURE注釈・500kBチャンク警告は残るがビルド成功。元からあるnode_modules・distや用途不明のユーザーファイルを勝手に削除していない。

## 残る候補

archive内の生成器は当時の再現性を優先しているため、一部に似た処理が残る。現在の運用では使わず、再調査時に必要な部分だけ参照する。過去の手動証拠チェックもarchiveに保持した。将来のUI調整はsrcと現行仕様、キャラ追加はDATA_WORKFLOWから着手できる。UI・ゲーム仕様・キャラ追加・数値の再調査は今回行っていない。
