# データの正本と更新手順

最新datasetIdは`automatic-no-input-startup-2026-11-14-r1`。parentStartupDecisionsの百鬼襲5欄は無入力自動攻撃の53Fを使用し、旧判断はpreviousDecisionに保持する。以下のdatasetIdは各段階の履歴。

現行datasetIdは`nonattacking-parent-startup-2026-11-14-r1`。非攻撃の派生親技21元・48欄を`parentStartupDecisions`で発生「なし」にし、生成の最終フレーム適用段階と既存履歴投影で保護する。原典・旧値と全体/hit/blockは保持。次段落のdatasetIdは除外時点の履歴、件数は現行も同じ。

現行datasetIdは`dark-ingrid-exclusion-2026-11-14-r1`。32キャラ・1298レコードのうち1278レコードを採用している。保存公式との照合5112フィールドは一致4459・不一致61・条件違い42・確認不能550で、公式資料の対象パッチはUNVERIFIED。全体Fは原則として通常条件の空振り時を採用する。[照合結果](OFFICIAL_VERIFICATION_REEVALUATION.md)と[個別監査](../staging/official-reevaluation/unverifiable-play-risk-report.md)を参照。

通常の生成入口は`build-snapshot.ts`。空振り全体Fの18件は`whiffTotalCorrections.unverifiableDecisions`、特殊状態限定技の除外は`specialStateExclusions`で再生成し、旧値と原典を検証する。エド弱・中サイコフリッカーの空振り全体45F・49Fはユーザーのゲーム内確認に基づき維持し、確認条件の未報告部分は[監査記録](../staging/official-reevaluation/remaining-screen.json)に残す。

Dark Ingrid限定の`ingrid__special_214214_K_none`とL/M/H展開先は、同じ除外判断の`afterStrengthExpansion`指定で展開後に非採用化する。展開前に共通元を除外すると既存3レコードが消えるため、ID・原典・値を保持してから除外する。履歴投影では各`before`へ復元する。

## 過去の段階別更新履歴

以下の段階別datasetId・集計は各時点の履歴であり、上記の現行データを置き換えない。

持続当ての範囲化を撤回した時点のdatasetIdは`arrival-startup-only-2026-11-09-r1`。採用4・保留108・対象外625原典項目、範囲値は9技レコード・9発生フィールドとなった。通常の生成入口は`build-snapshot.ts`で、旧`distanceRanges.decisions`から`contactTimingRollback.revoked`を除いた判断だけを適用し、共通強度展開へ渡す。旧判断の`before`が単一代表値の復元元である。撤回正本と保留台帳の分類上書きは`prepare-contact-timing-rollback.mjs`で準備し、候補台帳は段階別判断の最後に撤回を適用する。報告は`report-distance-ranges.mjs`から方針を出力する。

第3段階は追加資料の調査と実測条件の設計のみで、採用81・保留155・対象外501を維持。本番値が変わらないためdatasetIdは第2段階のまま。prepare-held-range-stage3.mjsは取得済み独立資料候補と公開データを照合してheld-range-review.jsonのstage3と候補reevaluation.stage3へ記録し、通常の段階別再生成でも保持する。ダウンロードしたJavaScriptは実行せずJSON部分だけを読む。report-held-range-stage3.mjsで最新結論を報告冒頭へ出力し、過去の調査は履歴として保存する。

第2段階のdatasetIdは`distance-held-stage2-2026-11-09-r1`。当時は81原典項目・98フィールドを距離範囲へ採用した。held-range-review.jsonのstage2は第1段階C134件の追加判断で、prepare-held-range-stage2.mjsから再現できる。通常の生成入口は引き続きbuild-snapshot.ts。追加公開資料はstaging/held-range-stage2へ保存し、新規採用では原典行・変更前値に加えて本文の必要記載も生成時に検査する。第1段階の判断と既存D46件は保持する。以下の段階別datasetId・集計は履歴である。

保留再評価第1段階のdatasetIdは`distance-held-review-2026-11-09-r1`。当時の距離範囲は80原典項目・95フィールド。`distanceRanges.heldReviewPath`が指す調査判断をreview-distance-ranges.mjsが候補台帳へ適用し、解決済みの分類を再生成で戻さない。prepare-held-range-review.mjsは元保留300項目の再評価準備、通常スナップショット生成は従来どおりbuild-snapshot.tsだけで行う。以下のr4は再評価前の履歴である。

距離範囲更新後のdatasetIdは`distance-ranges-2026-11-09-r4`。`distanceRanges.decisions`を個別代表条件適用後・共通強度展開前に適用し、原典レコードと変更前値を照合する。下記の旧datasetIdは以前の更新時点の説明。通常の再生成入口は引き続きbuild-snapshot.ts。review-distance-ranges.mjsは保存原典・既存対応情報に基づく今回の候補分類と判断の再現用、report-distance-ranges.mjsは報告表の生成用。prepare-distance-ranges.mjsは最初のJP一次調査専用で、追加判断後には使用しない。

第17段階のdatasetIdは`frame-research-2026-11-09-r1`。32キャラ1298レコードを維持し、Focus Force発生の限定判断をconditionalSpecials.startupDecisionsから再生成した。第17段階の補完はframeResearch.fieldDecisionsとstaging/stage17/frame-ledger.jsonで原典を照合し、個別条件の適用後・共通強度展開前に適用する。通常の更新入口はdata:plan→新datasetId→build-snapshot.ts --write --update→data:check。prepare-conditional-specials.tsは初期対応表の準備用であり、通常の再生成では不要。後続の採用判断を保持する。

## 現在の生成処理

1298件は従来908件＋SA288件＋共通必殺技の強度展開102件。採用条件はconditionalSpecialsを正本とし、scripts/conditional-specials.tsを通常の採用判定後・共通強度展開前に適用する。原典やadoption-inputsは変更しない。

data:planと--write --updateの更新保護を維持する。scripts/audit-conditional-specials.tsは開始HEADの全1292件と比較し、許可された21件と新規6件以外が不変であることを検査する。既存のSA/共通強度保護検査にも今回の明示的な採用差分だけを適用し、それ以外を引き続き比較する。以下の第15段階の件数はその完了時点の記録。

## SAと共通強度展開

SA96枠、原典基本101行、個別強度質問288レコードは別の集計単位である。第15段階Cの9項目はdata/adoption-decisions.jsonのsuperArts.frameDecisionsから再生成する。段階別の件数・旧datasetIdは各レポートに保存する。

共通必殺技の展開はsrc/lib/frame-data/strength-expansion.tsで行う。生成元adoption-inputsや原典noneを変更せず、既存build-snapshotの採用処理・SA追加後に追記する。`npx tsx scripts/audit-strength-expansion.ts --check`で全32キャラの分類、明示強度との重複、OD非生成、元1196件とcoverageの不変、再生成の同一性を検査する。件数は監査から算出する。data:plan→新datasetId→--write --update→data:checkの保護を継続する。

調査成果物は固定し、`scripts/super-arts.ts`で保存raw/Cargoとの一致を検査して変換する。`npx tsx scripts/audit-super-arts.ts --pilot`で6キャラを確認し、全体は同コマンドのオプションなしで計画を生成する。`data:plan`→`npx tsx scripts/build-snapshot.ts --write --update`の従来の更新保護を通す。datasetIdの変更が必要。更新後は`npx tsx scripts/audit-super-arts.ts --check`で原典199行分類・96枠・288入力と開始時908レコードを検査する。

従来normal/specialの監査・adoption-inputsは維持し、SAの分類はstaging/sa-integration/coverage.jsonに分離する。build-snapshotは従来の採用処理の後でSAを追加するため、再生成でSAが消えたりheldになったりしない。`test:data`でもこの再現と保護を検査する。SA-D1〜D5の正本はADOPTION_RULESの追補。調査validate.pyは908件だった第15段階A終了時用の固定検証であり、統合後は実行せず、SA監査で原典の不変性を確認する。

## 正本と更新手順

ゲームが読む正本は`data/metadata.json`と`data/characters/*.json`。全32体が採用範囲でcompleteとなり抽選可能です。信頼性と採用可否の分離はDATA_SPEC.md、判断の再利用はADOPTION_RULES.mdを参照してください。

| 場所                            | 役割・編集方針                                                     |
| ------------------------------- | ------------------------------------------------------------------ |
| data/characters/、metadata.json | 固定済みの実行スナップショット。通常は編集しない                   |
| data/adoption-decisions.json    | 採用・保留と入力候補の参照先の正本。今後の追加判断をここへまとめる |
| staging/candidates/             | 32体860技の未採用候補。過去の収集結果を引き継ぐ出発点              |
| staging/adoption-inputs/        | 採用判断で参照する、標準条件と保留を整理した現在の32体の入力       |
| staging/dev-review-policy.json  | 既存の開発専用試遊で使う入力スコープ。ゲーム本番では読まない       |
| staging/verification/           | 現在の検査レポート・ブラウザー画像。次回検証で再生成可能           |
| archive/staging/                | 過去段階の原典・証拠・判断・スナップショット。現行生成も一部を参照 |

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

現行データ回帰は`a34d9b8`、`f51c4e2`、`d11bb6d`、`571cea0`、`1ec74b4`の履歴も参照するため、shallow cloneではなく全履歴を用意する。CIのfetch-depth: 0を維持する。

```sh
npm run typecheck
npm test
npm run test:data
npm run data:audit-coverage
npx tsx scripts/audit-super-arts.ts --check
npx tsx scripts/audit-strength-expansion.ts --check
npx tsx scripts/audit-conditional-specials.ts
npx tsx scripts/research-missing-frames.ts --check
npm run data:check
npm run validate:data
npm run format:check
npm run build
npm run test:archive
node scripts/check-references.mjs
```

通常のスナップショット再生成はbuild-snapshot.tsだけを入口にする。prepare-adoption、apply-adoption-policy、repair-source-coverage、prepare-conditional-specialsは、入力や採用方針自体を明示的に変更するときの準備用。report-adoptionは過去専用としてarchive/scriptsに保存し、現在のデータ生成・監査には使わない。create-fixturesは架空テストデータの保守用であり本番値を作らない。verify-*は領域別ブラウザー確認、audit-*は候補・原典・採用値の検査に使う。

調査用staging/sa-researchのPython群・validation.jsonは第15段階Aの再現資料。inventory.jsonとsa-levels.snapshot.json等は現在のSA生成入力でもあるため、まとめて移動・削除しない。stagingの各監査JSONや過去画像も根拠資料として維持し、新しい一時検証はstaging/verificationへ出す。一般のブラウザー通し操作はnpm run verify:browser、Focus Force等はnode scripts/verify-conditional-specials.mjsで確認できる。旧SAレベル選択UI用のverify-super-arts/verify-sa-reviewはarchive/scriptsに保存し、現在の操作検証には使わない。

過去の取得スクリプトはネット取得を伴うものがある。アーカイブ索引から個別に確認し、明示的な調査・更新依頼なしに実行しない。

第17段階の棚卸し・再確認はresearch-missing-frames.ts。開始スナップショットと判断はstaging/stage17/baseline.jsonへ固定保存し、元commitの内容とも照合する。通常実行は台帳を再生成し、--checkは原典・許可フィールド・全1298レコード・既存採用判断を検証する。--write-decisionsは第17段階の補完判断を準備する明示的操作で、日常の再生成に不要。通常の生成はbuild-snapshot.tsだけで再現できる。旧保護基準は更新せず、既存監査に今回の明示フィールド判断だけを適用して比較する。PC/モバイルの補完値・不明・重複・回答・再プレイはnode scripts/verify-frame-research.mjsで確認できる。

## 収録漏れ監査と保存済み原典の修復

`npm run data:audit-coverage`は32体の保存済みraw全行とCargoの追加行を独立に照合し、`staging/coverage-audit/review.json`へ分類・入力・対応先・出典を出力します。過去の汎用除外理由をそのまま対象外にはしません。新しい原典を使う場合も、対象外・未対応・保留の根拠をこの一覧で確認します。

`scripts/repair-source-coverage.ts`は保存原典から明示的な変換だけで今回の追加20行を再現します。通常実行は計画表示のみ。`--write`で採用入力へ追記し、`--coverage`を併用した場合だけ監査結果からpartialとdatasetIdを更新します。原候補860件は編集しません。初回の明示的実行順は修復計画→`--write`→監査→`--write --coverage`→監査確認→`data:plan`→`build-snapshot.ts --write --update`です。既に記録した行は重複追加しません。

現在の`data:check`は原典行の対応・coverageと、スナップショットの再生成を両方検査します。入力不足が残るキャラをcompleteにして検査を通してはいけません。未対応入力へのモデル拡張は原典を確認して別途行い、今回の修復スクリプトを別キャラに無条件で適用しないでください。

今回の補修行だけを明示的に再生成し直す場合は`--write --refresh-added`を指定します。既存884件を対象にせず、coverage用のIDだけを書き換えます。本番スナップショットへの反映には、従来どおり異なるdatasetIdと`--write --update`が必要です。

追加指定の対象外・遠距離方針は`source-scope.ts`と`apply-adoption-policy.ts`で再現します。原典監査→`npx tsx scripts/apply-adoption-policy.ts`で計画確認→明示的な`--write`→監査確認→`data:plan`→`build-snapshot.ts --write --update`の順です。前の補修スクリプトで最新datasetIdを戻さないよう、通常の追加入力は現在の採用入力と判断を出発点にしてください。過去レポート・verification.jsonは保存時点の結果で、現在の追加指定結果はpolicy-changes.jsonとpolicy-verification.jsonを参照します。
