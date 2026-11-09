# 第17段階：採用ルール統合・未確定フレーム調査・保守改善

後続の[第17.5段階](STAGE17_5_KNOCKDOWN_REPORT.md)で、記録した17既知値のKD/HKD不一致を訂正した。以下は第17段階完了時点の調査記録として保持する。

2026-11-09実施。開始HEADは`49c067d2ee7deca275e8a928fa282547098d30a2`でmain/origin/mainが一致し、未コミット・未追跡変更はなかった。開始時は32キャラ1298レコード、SA288入力、datasetId `focus-startup-2026-11-09-r1`。比較用の全キャラ・metadata・採用判断を[baseline.json](../staging/stage17/baseline.json)へ固定保存し、元commitの内容とも照合した。

## 採用ルールと保守修正

[ADOPTION_RULES.md](ADOPTION_RULES.md)を現行ルールの主な参照先として再構成した。原則、収録範囲、カテゴリ、強度/OD、標準条件、正規化、採用状態と検索、個別例外、出典、更新履歴の10節とした。廃止済みの「SA対象外」「必殺技noneを展開しない」「Focusを合算しない」や、その後に解決した保留例を現行規則から外した。追記形式だった旧版は[第16段階までの記録](../archive/docs/ADOPTION_RULES_THROUGH_STAGE16.md)へ保存し、過去レポートの値は変更していない。

承認済み例外を判断JSONと保存レポートから確認した。Focus Force通常23/OD20、Jamie DL2/DL3、A.K.I./Ed SA2ガード、Sagat SA2中立派生D、共通強度展開、SA地上基本96枠、Zangief遠距離63214K系、Ken OD龍尾脚9F、Maracas・特殊同時押し等の除外を維持した。優先関係は次のとおり。

- 対象を限定した承認済み例外が一般則に優先する。既知値を一般計算式へ置換しない。
- 明示強度を共通値より優先する。明示行がheld/conditional/excludedでも共通展開で置き換えない。
- 検索では採用済み基本版を扱い、条件版だけならunknown。基本候補の競合はambiguous。
- OD原典と、入力候補としてのODを区別する。共通値からODを生成しない。
- 原典未記載はunknown、明示的対象外はnot_applicable、採用範囲内の不存在はnot_found。
- 採用可否と原典検証状態、原典表記とゲーム用代表値は別々に保存する。

作業Aでは本番1298件と採用判断の不変を機械的に確認した。ルール統合は仕様変更ではない。生成順序・resolverの優先順位・UIは変更していない。

report-adoption.tsはpackage.json、CI、現行生成器から参照されていない。876101dの旧Ken/Marisa保護を要求し、第13段階の歴史的レポートへ書く処理なので、[archive/scripts](../archive/scripts/report-adoption.ts)へ移動した。importの相対パスと用途説明を修正し、現行データから過去レポートを再生成する処理は追加していない。

CIにはnpm ci直後にdata:check、format:checkを追加した。これらは入力・採用判断と固定スナップショットの整合、現行管理対象の整形を先に確認する。既存のテスト、ビルド、アーカイブ再現、参照検査、artifact uploadは維持。fetch-depth: 0、Node.js 24、手動実行かつdeploy: trueの場合だけ公開する条件も変更していない。今回はpushせず、GitHub上での新ワークフロー実行も行っていない。

## 不明項目の定義と集計

acceptedかつbaseのレコードで、既存resolverのisDisplayableがfalseとなるフレームを対象とした。生成元noneやL/M/H複製もレコード数には含める。調査対象はsourceMoveId＋フィールドで重複除去する。質問入力数はisQuestionInputを満たすキャラ別の採用済み基本入力で数え、noneの生成元は除く。Normalは4項目、Hardは発生だけの成立状態を比較する。開始・終了で同じ定義を使った。

| 項目                               | 調査開始時 | 調査終了時 |
| ---------------------------------- | ---------: | ---------: |
| 未確定レコード数                   |         47 |          8 |
| 未確定フィールド数                 |         56 |          8 |
| 重複除去後の調査対象（元ID＋項目） |         32 |          5 |
| 重複除去後の元技レコード           |         29 |          5 |
| Normalで質問できない入力数         |         41 |          7 |
| Hardで質問できない入力数           |          1 |          1 |
| SA未確定入力数                     |          0 |          0 |

27調査項目を補完し、展開先を含む48フィールド・39レコードが変更された。23項目は原典の明示的`-`、2項目はKDのD表示、2項目は明示全体F。Normalで新たに34入力が成立する。その他の既知フレーム・全レコードID/入力/順序・採用状態・出典・coverageは不変。総数1298、SA288入力、全32キャラの抽選候補を維持した。

## 調査した技と採用結果

詳細は[frame-ledger.json](../staging/stage17/frame-ledger.json)。29元技・32対象項目をすべて記録し、生成先ID、個別入力の変更前後Normal/Hard、原典行全体・行番号、原典URL、取得日時、条件、原典表記、採用値、理由を追跡できる。raw/Cargoを変更せず、保存原典から判断した。

| キャラ・技                               | 対象項目       | 結果・根拠                                                                                                                           |
| ---------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 豪鬼 Demon Raid 通常/OD                  | 全体           | unknown維持。Cargoが未展開テンプレート。41Fの自動派生から全体を計算しない                                                            |
| アレックス Power Bomb L/M/H/OD           | ガード         | Cargoが各強度で明示する`-`を採用                                                                                                     |
| アルジュン Indomitable Defense HK        | ガード         | 原典の明示的`-`を採用                                                                                                                |
| アルジュン Ghastly Interrogation 通常/OD | ガード         | 原典の明示的`-`。通常共通値はL/M/Hへ反映                                                                                             |
| ブランカ Wild Hunt L/M/H/OD              | ガード         | 原典の明示的`-`を採用                                                                                                                |
| 本田 Sumo Dash 通常/OD                   | ヒット・ガード | 各原典行の明示的`-`。通常L/M/Hへ反映、ODは独自原典                                                                                   |
| 本田 Oicho Throw L/M/H/OD                | ガード         | 原典の明示的`-`を採用                                                                                                                |
| ジェイミー The Devil Inside              | ヒット・ガード | 原典の明示的`-`を通常L/M/Hへ反映                                                                                                     |
| JP Embrace 通常/OD                       | ガード         | 各原典行の明示的`-`を採用                                                                                                            |
| JP Departure 通常/OD                     | ヒット         | CargoのKD ~を既存ルールでD表示。硬直差の数値を作らない。後続弾の時刻・原典発生・全体は変更しない                                     |
| ケン しゃがみ強K                         | 全体           | Cargo 34(37)とraw totalFrames 34が対応。ガード時専用硬直の注記を保持し、既存括弧外代表値ルールで34F。構成フレームからの計算ではない  |
| マリーザ しゃがみ中K                     | 全体           | Cargoの明示29とraw totalFrames 29が一致。空振り/ガード追加硬直の注記を保持し、書かれた全体29Fを採用。追加の+1計算はしない            |
| マリーザ OD Quadriga                     | ヒット         | unknown維持。KD +50(68) Wall Splatは壁結果・距離条件を含み、通常の中央ヒット結果を確認できない                                       |
| リュウ OD上段足刀蹴り                    | ヒット         | unknown維持。Wall Bounce +49(65)を通常硬直差やDへ推測変換しない                                                                      |
| ザンギエフ 立ち強P                       | 発生           | unknown維持。(6~22)+10と16–32Fの注記はホールド時間を含む。非ホールドの確かな原典を取得できず、式や検索抜粋だけで16F/範囲を確定しない |

保存原典はSuperCombo Wiki由来のrawとCargo。対象は[Akuma](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)、[Alex](https://wiki.supercombo.gg/w/Street_Fighter_6/Alex/Frame_data)、[Arjun](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)、[Blanka](https://wiki.supercombo.gg/w/Street_Fighter_6/Blanka/Frame_data)、[E. Honda](https://wiki.supercombo.gg/w/Street_Fighter_6/E._Honda/Frame_data)、[Jamie](https://wiki.supercombo.gg/w/Street_Fighter_6/Jamie/Frame_data)、[JP](https://wiki.supercombo.gg/w/Street_Fighter_6/JP/Frame_data)、[Ken](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)、[Marisa](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)、[Ryu](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)、[Zangief](https://wiki.supercombo.gg/w/Street_Fighter_6/Zangief/Frame_data)。正確なURL・Cargo API URLと保存時刻は各sourceと保存ファイルを参照。同じWikiの別取得であり、独立した公式検証ではない。gameVersionはUNVERIFIED、community/unverifiedを維持する。

追加Web確認は[live-source-checks.json](../staging/stage17/live-source-checks.json)に記録した。公式Zangief/Ken/Marisa、Wiki Zangief/Akuma/Marisa/Ryuは403。アクセス制限の回避は行っていない。補助資料の検索抜粋にはZangief HP 16Fがあるが、ページ全体・対象パッチ・非ホールド条件の照合が不足するため採用根拠にしていない。パッチ違いの値を今回のデータへ無条件に取り込んでいない。

## 確定済み値との矛盾と未解決事項

調査対象技の既知ヒット値17件について、数値の現行表示に対しCargoがKD/HKDを示す意味上の矛盾を検出した。内訳はアレックス4、アルジュン3、ブランカ4、本田4、JP2。例えばPower Bombの現行+15に対しCargoはHKD +15。通常の硬直差とダウン後有利Fを混同している可能性がある。

これらは元から確定済みのフィールドであり、今回の「unknownのみ補完、既知値は無断修正しない」という範囲に従って変更していない。新たに補完したガード項目と既知ヒット項目を分離した。各ID・現行値・原典表記は台帳のknownValueConflictsに保存する。共通強度の生成先へも影響し得るため、次回は適用先を含めてKD/HKD→Dへの修正を別の採用判断として検討する必要がある。今回修正済みとは扱わない。

残る5調査項目も、どの原典が足りないか・採用しなかった理由を台帳に保存した。今後必要になる判断は、(1)上記17既知値の意味の修正、(2)中央での壁効果をD等へ代表化するか、(3)Zangief非ホールド16Fを裏付ける同条件資料の取得。現在の値を保持し、ユーザーの新しい代表条件を推測していない。未解決値の100%解消や最新パッチ全条件の検証は行っていない。

## 生成・回帰保護

通常採用→SA追加→固定代表条件→今回のフィールド補完→共通強度展開の順を維持する。補完は新しい小さなframe-research.tsへ分離し、build-snapshotから適用する。正本はadoption-decisions.jsonのframeResearch.fieldDecisions、原典行と判断の対応は台帳へ保存した。原典行全体・入力・元のunknown・変更後FrameValueを照合し、異なる既知値を上書きしようとすると失敗する。二重適用では値を増殖させない。

datasetIdを`frame-research-2026-11-09-r1`へ変更し、既存の`--write --update`で生成した。再生成チェックとdata回帰で同一結果を確認。旧監査のa34d9b8/f51c4e2/d11bb6d/571cea0/1ec74b4は変更せず、明示された今回のフィールドだけを投影して比較する。SAレビュー・Focus保護のNodeテストでも、許可したbefore/afterと一致するフィールドだけを戻して従来の比較を実施する。ID単位の一括skipや保護基準の更新は行っていない。

新しい第17段階監査は開始commitと保存baselineの全内容を比較し、調査判断の一覧も原典から再生成した許可一覧と完全一致させる。1298件全体、レコード順序、ID/入力、採用状態、出典、元の確定フレーム、SA288入力、coverage、既存の判断を保護する。表示可能性が改善したため旧unknownに依存していた機能テストは、明示的な欠損Fixtureまたは現在も不明な豪鬼の入力へ変更し、不明・非消費・履歴モード切替の検査を維持した。

## 検証とGit

- 型チェック、Vitest 129件、現行データ回帰8件、アーカイブ再現29件が成功。
- coverage、SA、共通強度、第16段階、第17段階の監査、data:check、Zod、format:check、ビルド、参照整合性検査が成功。archiveテストは共有証跡を書き換える処理と並列実行せず、既存保存資料の変更が残っていないことを確認した。
- ブラウザー1280px/390pxで、Ken 34F、Marisa 29F、Alexの明示的`-`、Jamie L/M/Hの独立消費、Normal/Hard、重複、Ryuの不明非消費とHard成立、Zangiefの両モード不明、最終回答・正解・直接再プレイを確認。結果と画像はGit対象外のstaging/verification/stage17へ保存した。新しいUIは追加していない。
- 原典の追加取得・実機パッチ検証は成功していないため、その検証済みとは主張しない。既存の500kB超チャンク警告は残る。

作業Aは`81c17bf`（採用ルール統合・旧報告器移動・CI追加・比較用保存）。作業Bは別のローカルcommitに分離する。最終commit SHAとGit状態は完了報告を参照。push・デプロイは行わない。
