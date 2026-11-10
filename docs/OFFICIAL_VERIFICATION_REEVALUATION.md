# 公式フレームデータ再照合・KD/HKD修正

## KD/HKD追加21フィールドの本番反映

datasetId `additional-kd-corrections-2026-11-11-r1` で追加15元技・hit 21フィールドをDへ反映した。既存 `kdHkdCorrections.decisions` の66件を保持し、同じ補正処理に `additionalDecisions` 15元技を統合した。アルジュンの2共通元技からL/M/Hへ計6件を継承する。旧値・Cargo・raw・公式行・OD組合せ・対象条件は採用判断に保持し、生成時に入力、旧値、Cargo行を検査する。

保存済み公式資料の再照合では対象21件が一致へ移り、不一致90→69、一致4430→4451、条件違い42、確認不能570。残69件はtotal 39・hit 4・block 19・startup 7で未修正。比較結果は [results-after-additional-kd.json](../staging/official-reevaluation/results-after-additional-kd.json)。公式資料の対象パッチはUNVERIFIED。以下の未適用・準備段階の記述は過去の履歴。

## KD追加21フィールドの反映準備（未適用）

追加A判定21フィールド・元技15件について、現行旧値、CargoのKD表記、rawのonHit、公式のD、展開先の包含関係、既存66件との非重複を確認した。生成元へ統合する判断案を [additional-kd-proposed-decisions.json](../staging/official-reevaluation/additional-kd-proposed-decisions.json) に保存した。このファイルは未適用で、本番のhitとdatasetIdは未変更。既存補正処理は66件固定の検証があるため、15元技の追加と監査の期待件数・投影方法を合わせて更新する必要がある。スナップショット再生成、回帰テスト、ブラウザ確認、公式再照合は未実施。

## hit・block・startup 51フィールドの最終判定（未適用）

基準commit `9b34299a3f4146e189fe53137021bb4ef678b59d`、datasetId `whiff-total-corrections-2026-11-11-r1`。不一致90件からtotal保留39件を除き、hit 25・block 19・startup 7の全51件を保存raw、Cargo、公式基本行、入力画像、強度・OD、代表条件と照合した。重複・欠落・未処理0。本番値と採用判断は変更していない。

| フィールド | A：修正対象 | B：保留 | C：修正不要 | 合計 |
| ---------- | ----------: | ------: | ----------: | ---: |
| hit        |          21 |       4 |           0 |   25 |
| block      |           0 |      19 |           0 |   19 |
| startup    |           0 |       7 |           0 |    7 |
| 合計       |          21 |      30 |           0 |   51 |

全51件の個別判断は [hit-block-startup-audit.json](../staging/official-reevaluation/hit-block-startup-audit.json)。各レコードに現行値・候補、raw/Cargoの配列index・表記・備考、公式行・画像からのコマンド、展開元・SA原典、判定と不足根拠を保持する。公式資料は2026-11-10取得、対象パッチはUNVERIFIED。現行パッチの独立検証とは扱わない。

### A：KD情報の欠落21フィールド（元技15）

保存Cargoが通常hitをKDとし、後続の数値がrawのonHitと本番hitへ保存され、公式の対応基本行もDとなっている。アルジュンの一部は原典備考の文言差、OD4技は入力表記の正規化により以前の完全一致抽出から漏れていた。同入力だけでなく技名・備考・状態を照合した。OD組合せのLP+MP/LK+MKと別組合せは区別し、以下だけをD候補とする。

| 対象技ID                                       | 現在→候補 | 本番影響数 |
| ---------------------------------------------- | --------- | ---------: |
| `arjun__normal_2_P_M`                          | +27→D     |          1 |
| `arjun__normal_5_K_H`                          | +43→D     |          1 |
| `arjun__special_214_K_none`（L/M/H展開を含む） | +42→D     |          4 |
| `arjun__special_214_K_OD`                      | +42→D     |          1 |
| `arjun__special_236_K_none`（L/M/H展開を含む） | +42→D     |          4 |
| `arjun__special_236_P_H`                       | +43→D     |          1 |
| `arjun__special_236_P_OD`                      | +43→D     |          1 |
| `arjun__special_623_P_L`                       | +60→D     |          1 |
| `arjun__special_623_P_M`                       | +64→D     |          1 |
| `arjun__special_623_P_H`                       | +42→D     |          1 |
| `arjun__special_623_P_OD`                      | +42→D     |          1 |
| `ingrid__special_236_P_OD`                     | +52→D     |          1 |
| `juri__special_236_K_OD`                       | +39→D     |          1 |
| `sagat__special_236_P_OD`                      | +52→D     |          1 |
| `terry__special_214_P_OD`                      | +33→D     |          1 |

実装時は元技15件への明示判断と旧値・原典照合を追加し、アルジュンの2元技から計6展開へDを継承する。OD・ホールド・別状態へ自動波及させない。強度ごとの公式基本行もDと確認した。過去の66件を含む監査基準は保持する。

### B：30フィールドの不足根拠

- hit 4件：ブランカのバック‌ステップローリング3強度は通常版の数値がraw/Cargoと一致し、操舵・接触高度・計数や版差による1F差を特定できない。ヤスミン中214Pは原典+2がヒット時自動派生のどの時点か、公式Dの全段条件と対応させる証拠が必要。
- block 19件：ブランカ3強度の操舵・接触条件、リュウSA3の相手体格と多段（3強度）、舞強623Kの二段目空振りと高身長相手、キンバリーSA2の空中・接続条件（3強度）、ジュリSA3の対象版（3強度）、ジェイミーLv.2代表条件、ラシード通常ODと気流強化の区別を確認した。豪鬼OD昇龍、ダルシム強ヨガブラスト、リュウ強昇龍、テリー弱ライジングタックルも原典と本番の値は一致し、公式差を説明する接続条件・対象版が不足する。符号変換の誤りは確認できない。
- startup 7件：リリーSA3 `5+2` とマノンSA3 `6+1`（各3強度）はCAと分離し、同じ通常SA原典から生成されている。公式7は合計と一致するが、暗転前後・投げ成立の定義と既存のSA発動値採用方針を確認する必要がある。ザンギエフ22HKは原典が当身受付6–55Fと明記する一方、公式発生5の定義・対象版が未確認。

Cは0件。現在値が原典と一致するだけでは、公式との条件差を確定したことにはならないためCにしていない。手動判断が必要な論点は、SA発生に暗転後をどこまで含めるか、ガードの相手体格・接続段を何で固定するか、ヤスミンの自動派生完走を代表ヒットにするか。これらは追加根拠を得てから採用判断とする。total保留39件は今回の精査対象外のまま維持した。

## 全体F 53フィールドの本番反映

datasetId `whiff-total-corrections-2026-11-11-r1` でA判定53フィールドを反映した。保存済み公式資料で再照合した結果、53件が不一致から一致に移り、不一致143→90、一致4377→4430、条件違い42、確認不能570。残る90件はtotal保留39件とhit・block・startupの未精査51件。比較結果は [results-after-whiff-total.json](../staging/official-reevaluation/results-after-whiff-total.json)。対象パッチは引き続きUNVERIFIED。下記の判定・集計は反映前の履歴である。

採用判断 `whiffTotalCorrections` はCargo行、公式行、旧値、条件と新値を保持し、共通強度展開後に53件を個別検証して適用する。ベガの中・強はそれぞれ58・63、元技・弱53とOD54は維持。マノン強・ODは46。括弧内数値の一般採用や硬直の一括加算は行わない。

## 全体F 92件の最終検証（反映前の判断）

未処理47件の保存raw・Cargo・公式行と現行入力・強度・状態を確認した。既存A 45件は維持し、47件をA 8件・B 39件・C 0件と判定。**全92件ではA 53、B 39、C 0、未処理0**。修正確定は元技52・本番53フィールドで、ベガの共通元1技から中・強の2件を別々に修正する。候補の全技ID・入力・旧値・修正候補・原典行・公式計算・理由は [total-audit.json](../staging/official-reevaluation/total-audit.json) に保存した。

追加でAとした8フィールドは以下のとおり。いずれも保存原典に対する変換または代表条件の誤りであり、公式資料の対象パッチはUNVERIFIED。

| 技ID                                       | 現在→候補 | 保存原典・公式根拠                                                                   |
| ------------------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| `aki__normal_5_P_M`                        | 24→26     | Cargo 45: `24(26)`、空振り時2F追加。公式4行。                                        |
| `akuma__normal_5_K_H`                      | 42→43     | Cargo 49: `42(43)`、2段目空振り時1F追加。全段空振りでも成立。公式7行。               |
| `kimberly__normal_2_P_M`                   | 21→23     | Cargo 40: `21(23)`、空振り時2F追加。公式10行。                                       |
| `sagat__normal_5_K_H`                      | 36→40     | Cargo 38: `36(40)`、両段空振り時4F追加。公式7行。                                    |
| `m_bison__special_[2]8_K_none__strength_M` | 53→58     | Cargo 58: `53/58/63` は弱・中・強の全体F。公式50行は中58。                           |
| `m_bison__special_[2]8_K_none__strength_H` | 53→63     | 同じCargo 58。公式51行は強63。                                                       |
| `manon__special_236_K_H`                   | 44→46     | Cargo 8: `44(46)`、ヒット時最後2Fでキャンセル可能。公式35行の持続終22＋硬直24＝46。  |
| `manon__special_236_K_OD`                  | 41→46     | Cargo 10: `41(46)`、ヒット時最後5Fでキャンセル可能。公式36行の持続終16＋硬直30＝46。 |

共通原因は、空振り追加硬直を括弧外のヒット時代表値から欠落させたもの、ヒット時キャンセル可能な早い時点を動作終了としたもの、強度別 `53/58/63` の先頭53だけを共通強度に展開したもの。ベガの元レコード・弱53とODは変更対象に含めず、中・強の展開先に個別の判断を適用する。空振り時の明示値がない候補に一律加算はしない。

保留39件は、空中・着地15、SA・暗転や多段6、強度展開6、括弧・空振り条件3、原典値・公式値や版差9。ブランカの電撃は25と38の差を空振り追加2Fだけで説明できず、非ホールド時の多段終了条件が必要。春麗の行雲流水はCargoの `-` と公式89の構え終了条件を確認する。リリー・ケン等の1F差は着地境界や版差を、ルークSA3は距離と空振りの終了条件を確認する。各Bの不足根拠は台帳の `reason` に記載した。Cは0件で、修正不要と断定できるものはなかった。

この調査段階では本番値と採用判断を変更せず、後に上記「本番反映」のとおり実装・検証した。対象パッチの独立確認やB項目の資料追加は今後の判断事項。

以下の「残る143フィールドの調査（未完了）」は検証途中の履歴であり、total 92件については上記の最終判定が優先する。total以外の51件は引き続き詳細未調査。

## 残る143フィールドの調査（未完了）

現行本番と保存済み再照合を技ID・フィールド・現在値で突合し、不一致143件はtotal 92、hit 25、block 19、startup 7と確認した。対象IDの重複・欠落はない。全143件の原典候補・公式行と暫定原因は [total-audit.json](../staging/official-reevaluation/total-audit.json) に保存した。total以外の51件は詳細検証していない。

total 92件のうち、原典が空振り追加硬直を明記し、空振り値・raw・公式計算を突合できた45件を修正対象Aとした。元技45・本番45フィールド。残り47件は**未処理**で、BやCとして数えていない。内訳の暫定候補は空中・着地19、SA・暗転や多段6、強度展開6、括弧・空振り条件5、原典値・公式値または版差11。分類は追加確認で変わり得る。A/B/C/未処理は45/0/0/47であり、全件の精査は未完了。

確定した共通原因は、空振り時に追加される硬直がCargoの括弧・備考に残る一方、rawの数値には括弧外の値だけが保存されていること。ゲーム仕様の全体Fは空振り時であるため、同じ条件の追加Fを含む値を個別に採用する候補となる。公式値は公式行の持続最終F＋硬直＋明示された空振り追加Fで照合した。ただし公式データの対象パッチはUNVERIFIEDで、現行パッチを検証したものではない。括弧や足し算の一般適用は既存方針で禁止されている。

代表例：A.K.I.立ち中KはCargo `25(27)`、備考に空振り硬直2F追加、raw 25、公式は持続最終10＋硬直15＋空振り2＝27。リュウしゃがみ中Pは `22(24)`、空振り2F追加、公式9＋13＋2＝24。45件それぞれの入力、現在値・候補値、Cargo・rawの配列index、公式行・計算式、原典備考、分類理由は台帳に記載した。生成時には原典表記と非ホールド空振り条件を保持した個別判断を追加し、共通処理の変更を検討する場合も明示根拠のある技だけを対象とする。今回は実装しない。

未処理の例：ブランカのバーチカルローリングは着地後硬直を含む公式計算とCargo 74の差があり、着地までを含む条件と数え方を確認する。ベガのシャドウライズ中・強は共通強度展開とCargo `53/58/63`の対応を検証する。ルークSA3は複数の持続・技終了条件と公式計算の対応を確認する。いずれも単純な差分だけで変更しない。ユーザーによる個別判断が必要かは、残り47件を精査してから整理する。

## KD/HKD 66件の本番反映

datasetId `kd-hkd-corrections-2026-11-11-r1` で66技のhitをDへ反映した。保存済み公式資料での再照合では66件がD一致となり、不一致は209→143、一致4311→4377、条件違い42、確認不能570。採用済み1283レコードを比較し、非採用15件は既存の比較対象外。公式資料の取得日は2026-11-10、対象パッチはUNVERIFIEDのまま。以下の過去集計は反映前の履歴である。

## KD/HKD候補66件の最終判定（反映前の判断）

保存資料で残る63件を一括照合し、既存の豪鬼3件と合わせて **A 66、B 0、C 0、未処理0**。修正対象は元技66・本番hitフィールド66。対象はいずれも強度展開レコードではなく、各対象を展開元とする本番レコードもない。ODや他強度は個別の原典・公式行に対応させた。個々の一覧は後掲の「修正候補」66行、判定・照合情報は [kd-hkd-decisions.json](../staging/official-reevaluation/kd-hkd-decisions.json) に保存した。

各行で、本番の原典入力・英語技名・備考が一致するraw行が一意、同入力・同備考のCargo行が一意であること、Cargoの通常ヒット欄がKD/HKDと明記し数値部分がrawのonHitおよび本番値と一致することを確認した。さらに公式側は技名候補とコマンド画像・方向・強度・ODが対応する基本行が一意で、ヒット欄がDであることを検査した。比較項目と原典・公式の行番号、備考、公式コマンドはJSONの各レコードに保存している。

ホールド版・派生・特殊状態とは区別し、原典の括弧内や備考に記された空中ヒット・カウンター・パニッシュカウンター・二段目の条件は通常ヒットの値に混ぜない。通常のKDとHKDは本ゲームではDに統一する。テリーODパワーチャージは原典が壁バウンドを明示し、採用規則の壁バウンドをDとする扱いに従う。距離によりダウン後有利時間が変化しても通常ヒット硬直差ではない。

保存原典に対する変換誤りの確認と、現行パッチでの性能確認は別である。公式資料の取得日は2026-11-10、対象パッチはUNVERIFIEDで、実機による現行パッチ確認は行っていない。この段階では本番への変更を対象外としており、後に上記のとおり反映した。個別の追加承認を要する条件上の分岐は見つからなかった。

以下の「途中」および「個別判定は未完了」は当時の履歴であり、66件に関してはこの最終判定が優先する。別件143フィールドの個別精査は未実施。

## KD/HKD候補の追加検証（途中）

66件中、次の3件を公式保存行・Cargo行・本番レコードに照らして個別確認した。残り63件は今回の個別検証が未実施で、A/B/Cに分類していない。前節の66件は機械抽出の候補であり、全件を最終確定と解釈しない。現行パッチの性能は全件未確認。

| キャラ・技ID                   | 入力・条件            | 現在→候補 | Cargo行・表記                                                                                 | 公式行                                                    | 判定と理由                                                                                                                |
| ------------------------------ | --------------------- | --------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 豪鬼 `akuma__normal_2_K_H`     | しゃがみ強K、通常地上 | +40→D     | [index 37](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) `KD +40(+37)` | [13](../staging/official-verification/sources/akuma.json) | A。通常値KD +40、括弧内+37は追撃時。公式Dで、公式備考のパニッシュカウンター時ハードダウンは通常結果と区別。強度展開なし。 |
| 豪鬼 `akuma__special_214_K_M`  | 214MK、中、立ち相手   | +41→D     | [index 9](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) `KD +41(38)`   | [51](../staging/official-verification/sources/akuma.json) | A。原典は2段目でダウン後有利が3F悪化と説明。通常結果KDと公式Dが対応。しゃがみ相手には当たらない条件を区別。強度展開なし。 |
| 豪鬼 `akuma__special_236_P_OD` | 236PP、OD、非ホールド | +55→D     | [index 33](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) `KD +55`      | [40](../staging/official-verification/sources/akuma.json) | A。Cargoは通常版を2ヒットOD弾とし、長押し強化版を区別。公式非ホールドOD行はD。強度展開なし。                              |

3件とも、保存原典上のKD後有利Fが数値で通常ヒット欄に保存された変換誤りであり、修正候補はD。公式資料の対象パッチはUNVERIFIEDで、現行パッチの独立確認ではない。現時点の集計はA 3、B 0、C 0、未処理63（計66）。本番修正は未実施。残りの技・状態・強度の対応を確認してから修正範囲を決める。

保存済み公式CLASSIC資料の取得日は2026-11-10、対象パッチはUNVERIFIED。2026.10.13の変更リストは公式FRAME DATAの対象版を証明しない。再取得はしていない。元のレポート・資料・テストは保持。現行1298レコードのうち採用済み1283レコード・5132フィールドを既存compare.mjsで再照合、非採用15レコードは比較対象外。

非採用15件は、対象外9件（aki 2PP、alex 2PP、blanka 2PP、dee_jay 22PP、ed 4KK、guile PP、ken KK、rashid 6KK、zangief PP）と保留6件（zangief `zangief__coverage_36`〜`zangief__coverage_41`）。既存照合プログラムはこれらをフィルターするため、公式との対応確認は未実施である。1298レコードすべての照合完了を意味しない。

対応行が一意に確定していない採用レコードは5件で、既存プログラムが出力した [pending-mappings.json](../staging/official-reevaluation/pending-mappings.json) に残す。条件違い42件は既存比較上の区分であり、42件すべての条件の妥当性を再判定したものではない。

一致4311、不一致209、条件違い42、確認不能570。元の219不一致のうちラシード4件とエド3件が一致し、JP3件は距離によるopenRangeと公式単一値の条件違いに移行：219−7−3＝209。JP単一値との完全一致と主張しない。修正10件の詳細は changes.json。

## 不一致の処理状況

209件中、独立した原典表記から誤りを確認できた66フィールドを下記に記載。残り143件は詳細条件・定義・版の確認が未了で、暫定「根拠不足で判定不能」とする。これは個別精査の完了やパッチ差であるとの判断を意味しない。パッチ差の可能性だけを根拠に件数を推定しない。

- 優先度高：KD/HKDを通常ヒット有利Fとして表示している項目。既存採用ルールはダウンDを指定。下表は同入力かつ備考が完全一致するCargo行が一意で、現在値がKD/HKD後の数値と一致し、対応する公式値もDの場合だけ抽出した。共通強度展開は別レコードとして計数し、元技IDも残す。現行パッチの一致は未確認だが、保存原典の意味に対する変換誤りは確認できる。
- 要手動判断：各技の原典行・強度・状態の最終承認、対象版の確認、修正実施の指示。ここではデータを変更しない。
- 残りは空振り硬直の加算、ダウン・着地、派生や暗転、強度差、パッチ差の可能性を個別に検証する必要がある。未検証の候補を誤りと断定しない。

## 修正候補（現在値→D）

| キャラ   | 技ID・技名                                          | 入力    | 現在→候補 | 公式行 | 保存Cargo行・表記                                                                                              |
| -------- | --------------------------------------------------- | ------- | --------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| akuma    | akuma__normal_2_K_H しゃがみ強K                     | HK      | +40 → D   | 13     | [Cargo index 37](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) KD +40(+37)              |
| akuma    | akuma__special_214_K_M Tatsumaki Zanku-Kyaku        | 214MK   | +41 → D   | 51     | [Cargo index 9](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) KD +41(38)                |
| akuma    | akuma__special_236_P_OD Gou Hadoken                 | 236ODP  | +55 → D   | 40     | [Cargo index 33](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json) KD +55                   |
| cammy    | cammy__special_236_K_H Spiral Arrow                 | 236HK   | +29 → D   | 29     | [Cargo index 8](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json) KD +29(+48)               |
| cammy    | cammy__special_236_K_L Spiral Arrow                 | 236LK   | +26 → D   | 27     | [Cargo index 10](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json) KD +26(+48)              |
| cammy    | cammy__special_236_K_M Spiral Arrow                 | 236MK   | +26 → D   | 28     | [Cargo index 11](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json) KD +26(+48)              |
| chunli   | chunli__special_[2]8_K_OD OD Spinning Bird Kick     | [2]8ODK | +55 → D   | 55     | [Cargo index 72](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json) KD +55(+41)             |
| cviper   | cviper__special_214_P_H HP Thunder Dash             | 214HP   | +21 → D   | 29     | [Cargo index 3](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json) KD +21<br>(KD +18~35)    |
| dee_jay  | dee_jay__normal_2_K_H しゃがみ強K                   | HK      | +33 → D   | 13     | [Cargo index 28](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json) HKD +33(+42)           |
| dee_jay  | dee_jay__special_[2]8_K_H Jackknife Maximum         | [2]8HK  | +42 → D   | 41     | [Cargo index 68](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json) KD +42(+37)            |
| dhalsim  | dhalsim__normal_2_K_H しゃがみ強K                   | HK      | +22 → D   | 13     | [Cargo index 17](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json) HKD +22(+37)           |
| dhalsim  | dhalsim__special_63214_P_H HP Yoga Flame            | 63214HP | +45 → D   | 52     | [Cargo index 41](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json) KD +45(+47)            |
| e_honda  | e_honda__normal_2_K_H しゃがみ強K                   | HK      | +30 → D   | 13     | [Cargo index 21](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) KD +30(+39)            |
| e_honda  | e_honda__special_[2]8_K_H Sumo Smash                | [2]8HK  | +23 → D   | 42     | [Cargo index 60](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) HKD +23[+27]           |
| e_honda  | e_honda__special_[2]8_K_L Sumo Smash                | [2]8LK  | +23 → D   | 40     | [Cargo index 62](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) HKD +23[+27]           |
| e_honda  | e_honda__special_[2]8_K_M Sumo Smash                | [2]8MK  | +23 → D   | 41     | [Cargo index 63](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) HKD +23[+27]           |
| e_honda  | e_honda__special_[2]8_K_OD Sumo Smash               | [2]8ODK | +23 → D   | 43     | [Cargo index 61](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) HKD +23[+27]           |
| e_honda  | e_honda__special_[4]6_P_OD Sumo Headbutt            | [4]6ODP | +36 → D   | 39     | [Cargo index 68](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json) KD +36(+37)            |
| elena    | elena__special_236_K_H HK Rhino Horn                | 236HK   | +40 → D   | 37     | [Cargo index 15](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json) KD +40~45                |
| elena    | elena__special_236_K_L LK Rhino Horn                | 236LK   | +39 → D   | 35     | [Cargo index 18](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json) KD +39~44                |
| elena    | elena__special_236_K_M MK Rhino Horn                | 236MK   | +39 → D   | 36     | [Cargo index 20](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json) KD +39~44                |
| elena    | elena__special_236_K_OD OD Rhino Horn               | 236ODK  | +43 → D   | 38     | [Cargo index 17](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json) KD +43~49                |
| jp       | jp__special_22_P_OD Triglav                         | 22ODP   | +57 → D   | 33     | [Cargo index 13](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json) KD +57(+50)                 |
| jp       | jp__special_236_K_L Torbalan                        | 236LK   | +42 → D   | 50     | [Cargo index 20](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json) KD +42~                     |
| jp       | jp__special_236_K_OD Torbalan                       | 236ODK  | +66 → D   | 53     | [Cargo index 19](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json) KD +66~                     |
| jp       | jp__special_236_P_H Stribog                         | 236HP   | +67 → D   | 38     | [Cargo index 18](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json) KD +67(+87)                 |
| jp       | jp__special_236_P_OD Stribog                        | 236ODP  | +56 → D   | 39     | [Cargo index 24](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json) KD +56(+72)                 |
| kimberly | kimberly__special_236_P_M Vagabond Edge             | 236MP   | +37 → D   | 57     | [Cargo index 33](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json) KD +37<br>(KD +26)    |
| lily     | lily__special_236_K_H Condor Spire                  | 236HK   | +37 → D   | 35     | [Cargo index 11](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +37(+49)               |
| lily     | lily__special_236_K_L Condor Spire                  | 236LK   | +33 → D   | 33     | [Cargo index 13](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +33(+45)               |
| lily     | lily__special_236_K_M Condor Spire                  | 236MK   | +37 → D   | 34     | [Cargo index 14](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +37(+49)               |
| lily     | lily__special_236_K_OD Condor Spire                 | 236ODK  | +43 → D   | 36     | [Cargo index 12](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +43(+55)               |
| lily     | lily__special_623_P_H Tomahawk Buster               | 623HP   | +36 → D   | 45     | [Cargo index 36](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +36(+41)               |
| lily     | lily__special_623_P_L Tomahawk Buster               | 623LP   | +36 → D   | 43     | [Cargo index 37](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +36(+41)               |
| lily     | lily__special_623_P_M Tomahawk Buster               | 623MP   | +36 → D   | 44     | [Cargo index 38](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +36(+42)               |
| lily     | lily__special_623_P_OD Tomahawk Buster              | 623ODP  | +32 → D   | 46     | [Cargo index 39](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json) KD +32(+37)               |
| luke     | luke__special_214_P_H HP Flash Knuckle              | 214HP   | +42 → D   | 44     | [Cargo index 1](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json) KD +42(+31)                |
| m_bison  | m_bison__special_[4]6_P_H HP Psycho Crusher Attack  | [4]6HP  | +14 → D   | 32     | [Cargo index 67](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json) KD +14(+39)            |
| m_bison  | m_bison__special_[4]6_P_L LP Psycho Crusher Attack  | [4]6LP  | +24 → D   | 28     | [Cargo index 69](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json) KD +24(+39)            |
| m_bison  | m_bison__special_[4]6_P_M MP Psycho Crusher Attack  | [4]6MP  | +24 → D   | 30     | [Cargo index 71](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json) KD +24(+39)            |
| m_bison  | m_bison__special_[4]6_P_OD OD Psycho Crusher Attack | [4]6ODP | +35 → D   | 34     | [Cargo index 73](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json) KD +35(+37)            |
| mai      | mai__special_214_P_H HP Ryuuenbu                    | 214HP   | +43 → D   | 57     | [Cargo index 3](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json) KD +43                      |
| mai      | mai__special_214_P_M MP Ryuuenbu                    | 214MP   | +35 → D   | 55     | [Cargo index 6](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json) KD +35                      |
| mai      | mai__special_236_K_H HK Hissatsu Shinobi Bachi      | 236HK   | +22 → D   | 65     | [Cargo index 14](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json) KD +22(+38)                |
| mai      | mai__special_236_K_L LK Hissatsu Shinobi Bachi      | 236LK   | +27 → D   | 61     | [Cargo index 20](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json) KD +27(+43)                |
| mai      | mai__special_236_K_M MK Hissatsu Shinobi Bachi      | 236MK   | +23 → D   | 63     | [Cargo index 24](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json) KD +23(+39)                |
| rashid   | rashid__special_214_K_H Eagle Spike                 | 214HK   | +56 → D   | 46     | [Cargo index 2](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json) KD +56(+68)              |
| rashid   | rashid__special_214_K_L Eagle Spike                 | 214LK   | +30 → D   | 42     | [Cargo index 7](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json) KD +30(+42)              |
| rashid   | rashid__special_214_K_M Eagle Spike                 | 214MK   | +52 → D   | 44     | [Cargo index 10](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json) KD +52(+64)             |
| rashid   | rashid__special_214_K_OD Eagle Spike                | 214ODK  | +53 → D   | 48     | [Cargo index 5](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json) KD +53(+65)              |
| ryu      | ryu__special_214_K_H Tatsumaki Senpu-kyaku          | 214HK   | +20 → D   | 42     | [Cargo index 6](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +20(+35)(+50)            |
| ryu      | ryu__special_214_K_M Tatsumaki Senpu-kyaku          | 214MK   | +23 → D   | 41     | [Cargo index 11](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +23(+38)                |
| ryu      | ryu__special_236_K_H High Blade Kick                | 236HK   | +45 → D   | 48     | [Cargo index 19](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +45~51                  |
| ryu      | ryu__special_236_K_L High Blade Kick                | 236LK   | +42 → D   | 46     | [Cargo index 22](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +42~46                  |
| ryu      | ryu__special_236_K_M High Blade Kick                | 236MK   | +40 → D   | 47     | [Cargo index 24](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +40~46                  |
| ryu      | ryu__special_623_P_H Shoryuken                      | 623HP   | +37 → D   | 38     | [Cargo index 48](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json) KD +37(+29)                |
| sagat    | sagat__special_236_K_H HK Tiger Knee Crush          | 236HK   | +40 → D   | 42     | [Cargo index 18](../archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json) KD +40~41<br>(KD +37~47) |
| sagat    | sagat__special_236_K_L LK Tiger Knee Crush          | 236LK   | +36 → D   | 40     | [Cargo index 21](../archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json) KD +36(+46)              |
| sagat    | sagat__special_236_K_M MK Tiger Knee Crush          | 236MK   | +39 → D   | 41     | [Cargo index 24](../archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json) KD +39(+49)              |
| terry    | terry__special_214_K_H HK Crack Shoot               | 214HK   | +43 → D   | 45     | [Cargo index 3](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +43~45                 |
| terry    | terry__special_214_K_OD OD Crack Shoot              | 214ODK  | +29 → D   | 46     | [Cargo index 5](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +29                    |
| terry    | terry__special_214_P_H HP Burning Knuckle           | 214HP   | +28 → D   | 37     | [Cargo index 4](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +28~41                 |
| terry    | terry__special_214_P_M MP Burning Knuckle           | 214MP   | +30 → D   | 36     | [Cargo index 10](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +30~42                |
| terry    | terry__special_236_K_H HK Power Charge              | 236HK   | +37 → D   | 41     | [Cargo index 15](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +37~45                |
| terry    | terry__special_236_K_M MK Power Charge              | 236MK   | +42 → D   | 40     | [Cargo index 20](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +42~47                |
| terry    | terry__special_236_K_OD OD Power Charge             | 236ODK  | +55 → D   | 42     | [Cargo index 17](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json) KD +55~76 Wall Bounce    |

## 未確定不一致

以下の値は公式照合上の候補であり、採用すべきと確定した値ではない。入力・条件は機械的対応を含み、個別確認が必要。

| キャラ   | 技ID・技名                                              | 項目    | 現在→公式 | 公式行   | 照合根拠                                             |
| -------- | ------------------------------------------------------- | ------- | --------- | -------- | ---------------------------------------------------- |
| aki      | aki__normal_5_K_M 立ち中K                               | total   | 25 → 27   | 5        | 持続 8-10 の最終F 10 + 硬直 15 + 空振り時硬直2F増加  |
| aki      | aki__normal_5_P_M 立ち中P                               | total   | 24 → 26   | 4        | 持続 6-10 の最終F 10 + 硬直 14 + 空振り時硬直2F増加  |
| aki      | aki__special_236_P_L Serpent Lash                       | total   | 36 → 42   | 36       | 持続 14-16 の最終F 16 + 硬直 26                      |
| akuma    | akuma__normal_2_P_M しゃがみ中P                         | total   | 22 → 24   | 10       | 持続 6-8 の最終F 8 + 硬直 14 + 空振り時硬直2F増加    |
| akuma    | akuma__normal_5_K_H 立ち強K                             | total   | 42 → 43   | 7        | 持続 13-27 の最終F 27 + 硬直 15 + 空振り時硬直1F増加 |
| akuma    | akuma__normal_5_P_M 立ち中P                             | total   | 20 → 22   | 4        | 持続 6-9 の最終F 9 + 硬直 11 + 空振り時硬直2F増加    |
| akuma    | akuma__special_214_K_L Tatsumaki Zanku-Kyaku            | total   | 34 → 40   | 50       | 持続 12-13 の最終F 13 + 硬直 21 + 空振り時硬直6F増加 |
| akuma    | akuma__special_214_P_H Adamant Flame                    | total   | 44 → 46   | 60       | 持続 23-25 の最終F 25 + 硬直 19 + 空振り時硬直2F増加 |
| akuma    | akuma__special_214_P_M Adamant Flame                    | total   | 41 → 44   | 58       | 持続 19-21 の最終F 21 + 硬直 20 + 空振り時硬直3F増加 |
| akuma    | akuma__special_623_P_OD Gou Shoryuken                   | block   | -41 → -39 | 49       | 公式表の対応欄                                       |
| alex     | alex__normal_2_P_M しゃがみ中P                          | total   | 25 → 29   | 12       | 持続 8-9 の最終F 9 + 硬直 16 + 空振り時硬直4F増加    |
| alex     | alex__normal_5_P_M 立ち中P                              | total   | 24 → 27   | 4        | 持続 7-10 の最終F 10 + 硬直 14 + 空振り時硬直3F増加  |
| arjun    | arjun__normal_2_P_M しゃがみ中P                         | hit     | +27 → D   | 10       | 公式表の対応欄                                       |
| arjun    | arjun__normal_5_K_H 立ち強K                             | hit     | +43 → D   | 7        | 公式表の対応欄                                       |
| arjun    | arjun__special_214_K_none Divine Pillar                 | hit     | +42 → D   | 52,53,54 | 公式表の対応欄                                       |
| arjun    | arjun__special_214_K_OD OD Divine Pillar                | hit     | +42 → D   | 56       | 公式表の対応欄                                       |
| arjun    | arjun__special_22_K_H Indomitable Defense               | total   | 60 → 58   | 62       | 持続 3-28 の最終F 28 + 硬直 30                       |
| arjun    | arjun__special_236_K_none Breathing Ring                | hit     | +42 → D   | 42       | 公式表の対応欄                                       |
| arjun    | arjun__special_236_P_H HP Arm of Justice                | total   | 50 → 56   | 32       | 持続 28-33 の最終F 33 + 硬直 20 + 空振り時硬直3F増加 |
| arjun    | arjun__special_236_P_H HP Arm of Justice                | hit     | +43 → D   | 32       | 公式表の対応欄                                       |
| arjun    | arjun__special_236_P_OD OD Arm of Justice               | total   | 45 → 51   | 34       | 持続 23-28 の最終F 28 + 硬直 20 + 空振り時硬直3F増加 |
| arjun    | arjun__special_236_P_OD OD Arm of Justice               | hit     | +43 → D   | 34       | 公式表の対応欄                                       |
| arjun    | arjun__special_623_P_H HP Cruel Shoulder                | hit     | +42 → D   | 38       | 公式表の対応欄                                       |
| arjun    | arjun__special_623_P_L LP Cruel Shoulder                | hit     | +60 → D   | 36       | 公式表の対応欄                                       |
| arjun    | arjun__special_623_P_M MP Cruel Shoulder                | hit     | +64 → D   | 37       | 公式表の対応欄                                       |
| arjun    | arjun__special_623_P_OD OD Cruel Shoulder               | hit     | +42 → D   | 40       | 公式表の対応欄                                       |
| arjun    | arjun__special_214_K_none__strength_L Divine Pillar     | hit     | +42 → D   | 52       | 公式表の対応欄                                       |
| arjun    | arjun__special_214_K_none__strength_M Divine Pillar     | hit     | +42 → D   | 53       | 公式表の対応欄                                       |
| arjun    | arjun__special_214_K_none__strength_H Divine Pillar     | hit     | +42 → D   | 54       | 公式表の対応欄                                       |
| arjun    | arjun__special_236_K_none__strength_L Breathing Ring    | hit     | +42 → D   | 42       | 公式表の対応欄                                       |
| arjun    | arjun__special_236_K_none__strength_M Breathing Ring    | hit     | +42 → D   | 42       | 公式表の対応欄                                       |
| arjun    | arjun__special_236_K_none__strength_H Breathing Ring    | hit     | +42 → D   | 42       | 公式表の対応欄                                       |
| blanka   | blanka__normal_5_K_M 立ち中K                            | total   | 27 → 30   | 5        | 持続 8-10 の最終F 10 + 硬直 17 + 空振り時硬直3F増加  |
| blanka   | blanka__normal_5_P_H 立ち強P                            | total   | 33 → 38   | 6        | 持続 10-16 の最終F 16 + 硬直 22                      |
| blanka   | blanka__special_[2]8_K_H Vertical Rolling Attack        | total   | 74 → 75   | 49       | 持続 8-27 の最終F 27 + 硬直 31+着地後17              |
| blanka   | blanka__special_[2]8_K_L Vertical Rolling Attack        | total   | 74 → 75   | 45       | 持続 8-27 の最終F 27 + 硬直 31+着地後17              |
| blanka   | blanka__special_[2]8_K_M Vertical Rolling Attack        | total   | 74 → 75   | 47       | 持続 8-27 の最終F 27 + 硬直 31+着地後17              |
| blanka   | blanka__special_[4]6_P_H Rolling Attack                 | total   | 66 → 67   | 41       | 持続 22-41 の最終F 41 + 硬直 26                      |
| blanka   | blanka__special_214_P_none Electric Thunder             | total   | 25 → 38   | 33       | 持続 10-21 の最終F 21 + 硬直 17                      |
| blanka   | blanka__special_214_P_OD Electric Thunder               | total   | 25 → 38   | 35       | 持続 10-21 の最終F 21 + 硬直 17                      |
| blanka   | blanka__special_63214_K_H Backstep Rolling Attack       | hit     | +7 → 8    | 57       | 公式表の対応欄                                       |
| blanka   | blanka__special_63214_K_H Backstep Rolling Attack       | block   | +3 → 4    | 57       | 公式表の対応欄                                       |
| blanka   | blanka__special_63214_K_L Backstep Rolling Attack       | hit     | +8 → 9    | 53       | 公式表の対応欄                                       |
| blanka   | blanka__special_63214_K_L Backstep Rolling Attack       | block   | +2 → 3    | 53       | 公式表の対応欄                                       |
| blanka   | blanka__special_63214_K_M Backstep Rolling Attack       | hit     | +7 → 8    | 55       | 公式表の対応欄                                       |
| blanka   | blanka__special_63214_K_M Backstep Rolling Attack       | block   | +1 → 2    | 55       | 公式表の対応欄                                       |
| blanka   | blanka__special_214_P_none__strength_L Electric Thunder | total   | 25 → 38   | 33       | 持続 10-21 の最終F 21 + 硬直 17                      |
| blanka   | blanka__special_214_P_none__strength_M Electric Thunder | total   | 25 → 38   | 33       | 持続 10-21 の最終F 21 + 硬直 17                      |
| blanka   | blanka__special_214_P_none__strength_H Electric Thunder | total   | 25 → 38   | 33       | 持続 10-21 の最終F 21 + 硬直 17                      |
| cammy    | cammy__normal_2_P_M しゃがみ中P                         | total   | 23 → 26   | 10       | 持続 7-9 の最終F 9 + 硬直 14 + 空振り時硬直3F増加    |
| chunli   | chunli__normal_2_P_M しゃがみ中P                        | total   | 22 → 23   | 10       | 持続 6-9 の最終F 9 + 硬直 13 + 空振り時硬直1F増加    |
| chunli   | chunli__special_214_K_H HK Hazanshu                     | total   | 50 → 52   | 58       | 持続 32-34 の最終F 34 + 硬直 18                      |
| chunli   | chunli__special_214_P_none Serenity Stream              | total   | - → 89    | 31       | 全体 89                                              |
| chunli   | chunli__special_214_P_none__strength_L Serenity Stream  | total   | - → 89    | 31       | 全体 89                                              |
| chunli   | chunli__special_214_P_none__strength_M Serenity Stream  | total   | - → 89    | 31       | 全体 89                                              |
| chunli   | chunli__special_214_P_none__strength_H Serenity Stream  | total   | - → 89    | 31       | 全体 89                                              |
| cviper   | cviper__normal_5_K_M 立ち中K                            | total   | 28 → 30   | 5        | 持続 8-10 の最終F 10 + 硬直 18 + 空振り時硬直2F増加  |
| dee_jay  | dee_jay__special_[4]6_P_OD Air Slasher                  | total   | 45 → 46   | 37       | 全体 46                                              |
| dhalsim  | dhalsim__normal_2_P_H しゃがみ強P                       | total   | 42 → 46   | 12       | 持続 19-22 の最終F 22 + 硬直 20 + 空振り時硬直4F増加 |
| dhalsim  | dhalsim__special_63214_K_H HK Yoga Blast                | block   | -1 → -3   | 56       | 公式表の対応欄                                       |
| dhalsim  | dhalsim__special_63214_P_OD OD Yoga Flame               | total   | 61 → 66   | 53       | 全体 66                                              |
| e_honda  | e_honda__normal_5_P_M 立ち中P                           | total   | 26 → 30   | 4        | 持続 10-13 の最終F 13 + 硬直 13 + 空振り時硬直4F増加 |
| e_honda  | e_honda__special_[4]6_P_H Sumo Headbutt                 | total   | 34 → 56   | 38       | 持続 14-36 の最終F 36 + 硬直 20                      |
| e_honda  | e_honda__special_[4]6_P_L Sumo Headbutt                 | total   | 29 → 51   | 36       | 持続 10-31 の最終F 31 + 硬直 20                      |
| e_honda  | e_honda__special_[4]6_P_M Sumo Headbutt                 | total   | 30 → 53   | 37       | 持続 10-33 の最終F 33 + 硬直 20                      |
| e_honda  | e_honda__special_[4]6_P_OD Sumo Headbutt                | total   | 44 → 76   | 39       | 持続 9-56 の最終F 56 + 硬直 20                       |
| ed       | ed__normal_2_K_H しゃがみ強K                            | total   | 32 → 34   | 13       | 持続 12-13 の最終F 13 + 硬直 19 + 空振り時硬直2F増加 |
| ed       | ed__normal_2_K_M しゃがみ中K                            | total   | 26 → 29   | 11       | 持続 9-10 の最終F 10 + 硬直 16 + 空振り時硬直3F増加  |
| ed       | ed__normal_5_K_M 立ち中K                                | total   | 27 → 31   | 5        | 持続 10-11 の最終F 11 + 硬直 16 + 空振り時硬直4F増加 |
| elena    | elena__normal_5_K_M 立ち中K                             | total   | 22 → 24   | 5        | 持続 6-9 の最終F 9 + 硬直 13 + 空振り時硬直2F増加    |
| guile    | guile__normal_2_P_M しゃがみ中P                         | total   | 21 → 24   | 10       | 持続 6-8 の最終F 8 + 硬直 13 + 空振り時硬直3F増加    |
| ingrid   | ingrid__normal_2_P_M しゃがみ中P                        | total   | 22 → 25   | 10       | 持続 7-10 の最終F 10 + 硬直 12 + 空振り時硬直3F増加  |
| ingrid   | ingrid__special_236_P_OD Sun Shot (L/M)                 | hit     | +52 → D   | 33       | 公式表の対応欄                                       |
| jamie    | jamie__normal_2_P_M しゃがみ中P                         | total   | 21 → 23   | 10       | 持続 6-8 の最終F 8 + 硬直 13 + 空振り時硬直2F増加    |
| jamie    | jamie__normal_5_K_M 立ち中K                             | total   | 28 → 29   | 5        | 持続 9-11 の最終F 11 + 硬直 17 + 空振り時硬直1F増加  |
| jamie    | jamie__held_special_623_K_L Arrow Kick (DL2)            | block   | -44 → -45 | 75       | 公式表の対応欄                                       |
| juri     | juri__normal_2_P_M しゃがみ中P                          | total   | 23 → 24   | 18       | 持続 6-9 の最終F 9 + 硬直 14 + 空振り時硬直1F増加    |
| juri     | juri__special_236_K_OD Saihasho                         | hit     | +39 → D   | 58       | 公式表の対応欄                                       |
| juri     | juri__super_art_3_L Kaisen Dankai Raku                  | block   | -36 → -31 | 77       | 公式表の対応欄                                       |
| juri     | juri__super_art_3_M Kaisen Dankai Raku                  | block   | -36 → -31 | 77       | 公式表の対応欄                                       |
| juri     | juri__super_art_3_H Kaisen Dankai Raku                  | block   | -36 → -31 | 77       | 公式表の対応欄                                       |
| ken      | ken__special_623_K_L Dragonlash Kick                    | total   | 45 → 44   | 46       | 持続 18-23 の最終F 23 + 硬直 21                      |
| ken      | ken__special_623_K_OD Dragonlash Kick                   | total   | 47 → 48   | 49       | 持続 9-24 の最終F 24 + 硬直 24                       |
| kimberly | kimberly__normal_2_P_M しゃがみ中P                      | total   | 21 → 23   | 10       | 持続 6-8 の最終F 8 + 硬直 13 + 空振り時硬直2F増加    |
| kimberly | kimberly__super_art_1_L Bushin Beats                    | total   | 66 → 64   | 73       | 持続 10-24 の最終F 24 + 硬直 40                      |
| kimberly | kimberly__super_art_1_M Bushin Beats                    | total   | 66 → 64   | 73       | 持続 10-24 の最終F 24 + 硬直 40                      |
| kimberly | kimberly__super_art_1_H Bushin Beats                    | total   | 66 → 64   | 73       | 持続 10-24 の最終F 24 + 硬直 40                      |
| kimberly | kimberly__super_art_2_L Bushin Scramble                 | block   | -26 → -25 | 75       | 公式表の対応欄                                       |
| kimberly | kimberly__super_art_2_M Bushin Scramble                 | block   | -26 → -25 | 75       | 公式表の対応欄                                       |
| kimberly | kimberly__super_art_2_H Bushin Scramble                 | block   | -26 → -25 | 75       | 公式表の対応欄                                       |
| lily     | lily__special_623_P_H Tomahawk Buster                   | total   | 61 → 60   | 45       | 持続 10-23 の最終F 23 + 硬直 25+着地後12             |
| lily     | lily__special_623_P_L Tomahawk Buster                   | total   | 49 → 48   | 43       | 持続 6-16 の最終F 16 + 硬直 20+着地後12              |
| lily     | lily__special_623_P_M Tomahawk Buster                   | total   | 56 → 55   | 44       | 持続 8-19 の最終F 19 + 硬直 24+着地後12              |
| lily     | lily__special_623_P_OD Tomahawk Buster                  | total   | 60 → 59   | 46       | 持続 6-17 の最終F 17 + 硬直 27+着地後15              |
| lily     | lily__super_art_3_L Raging Typhoon                      | startup | 5 → 7     | 65       | 公式表の対応欄                                       |
| lily     | lily__super_art_3_M Raging Typhoon                      | startup | 5 → 7     | 65       | 公式表の対応欄                                       |
| lily     | lily__super_art_3_H Raging Typhoon                      | startup | 5 → 7     | 65       | 公式表の対応欄                                       |
| luke     | luke__super_art_3_L Pale Rider                          | total   | 122 → 105 | 67       | 持続 10-13 の最終F 13 + 硬直 92                      |
| luke     | luke__super_art_3_M Pale Rider                          | total   | 122 → 105 | 67       | 持続 10-13 の最終F 13 + 硬直 92                      |
| luke     | luke__super_art_3_H Pale Rider                          | total   | 122 → 105 | 67       | 持続 10-13 の最終F 13 + 硬直 92                      |
| m_bison  | m_bison__normal_2_P_M しゃがみ中P                       | total   | 22 → 25   | 10       | 持続 6-8 の最終F 8 + 硬直 14 + 空振り時硬直3F増加    |
| m_bison  | m_bison__special_[2]8_K_OD OD Shadow Rise               | total   | 54 → 55   | 52       | 全体 55                                              |
| m_bison  | m_bison__special_[2]8_K_none__strength_M Shadow Rise    | total   | 53 → 58   | 50       | 全体 58                                              |
| m_bison  | m_bison__special_[2]8_K_none__strength_H Shadow Rise    | total   | 53 → 63   | 51       | 全体 63                                              |
| mai      | mai__normal_2_K_H しゃがみ強K                           | total   | 33 → 36   | 13       | 持続 9-11 の最終F 11 + 硬直 22 + 空振り時硬直3F増加  |
| mai      | mai__normal_2_P_M しゃがみ中P                           | total   | 24 → 26   | 10       | 持続 6-9 の最終F 9 + 硬直 15 + 空振り時硬直2F増加    |
| mai      | mai__normal_5_K_H 立ち強K                               | total   | 35 → 38   | 7        | 持続 14-16 の最終F 16 + 硬直 19 + 空振り時硬直3F増加 |
| mai      | mai__normal_5_P_M 立ち中P                               | total   | 26 → 28   | 4        | 持続 8-11 の最終F 11 + 硬直 15 + 空振り時硬直2F増加  |
| mai      | mai__special_623_K_H HK Hishou Ryuuenjin                | block   | -28 → -31 | 49       | 公式表の対応欄                                       |
| manon    | manon__normal_2_P_M しゃがみ中P                         | total   | 20 → 24   | 10       | 持続 7-9 の最終F 9 + 硬直 11 + 空振り時硬直4F増加    |
| manon    | manon__normal_5_K_H 立ち強K                             | total   | 40 → 43   | 7        | 持続 15-17 の最終F 17 + 硬直 26                      |
| manon    | manon__special_236_K_H HK Rond-point                    | total   | 44 → 46   | 35       | 持続 14-22 の最終F 22 + 硬直 24                      |
| manon    | manon__special_236_K_OD OD Rond-point                   | total   | 41 → 46   | 36       | 持続 8-16 の最終F 16 + 硬直 30                       |
| manon    | manon__super_art_3_L Pas de Deux                        | startup | 6 → 7     | 50       | 公式表の対応欄                                       |
| manon    | manon__super_art_3_M Pas de Deux                        | startup | 6 → 7     | 50       | 公式表の対応欄                                       |
| manon    | manon__super_art_3_H Pas de Deux                        | startup | 6 → 7     | 50       | 公式表の対応欄                                       |
| marisa   | marisa__special_214_P_M Dimachaerus                     | total   | 49 → 50   | 55       | 持続 16-20 の最終F 20 + 硬直 30                      |
| rashid   | rashid__normal_2_P_H しゃがみ強P                        | total   | 35 → 37   | 12       | 持続 12-14 の最終F 14 + 硬直 21 + 空振り時硬直2F増加 |
| rashid   | rashid__normal_5_K_M 立ち中K                            | total   | 27 → 29   | 5        | 持続 8-10 の最終F 10 + 硬直 17 + 空振り時硬直2F増加  |
| rashid   | rashid__special_214_P_OD Arabian Cyclone                | total   | 49 → 53   | 64       | 全体 53                                              |
| rashid   | rashid__special_236_P_L Spinning Mixer                  | total   | 42 → 47   | 34       | 持続 8-23 の最終F 23 + 硬直 19 + 空振り時硬直5F増加  |
| rashid   | rashid__special_236_P_OD Spinning Mixer                 | block   | -53 → -42 | 40       | 公式表の対応欄                                       |
| ryu      | ryu__normal_2_P_H しゃがみ強P                           | total   | 35 → 36   | 12       | 持続 9-14 の最終F 14 + 硬直 22                       |
| ryu      | ryu__normal_2_P_M しゃがみ中P                           | total   | 22 → 24   | 10       | 持続 6-9 の最終F 9 + 硬直 13 + 空振り時硬直2F増加    |
| ryu      | ryu__normal_5_P_M 立ち中P                               | total   | 20 → 22   | 4        | 持続 6-9 の最終F 9 + 硬直 11 + 空振り時硬直2F増加    |
| ryu      | ryu__special_214_P_OD Hashogeki                         | total   | 43 → 42   | 54       | 持続 18-22 の最終F 22 + 硬直 20                      |
| ryu      | ryu__special_623_P_H Shoryuken                          | block   | -39 → -36 | 38       | 公式表の対応欄                                       |
| ryu      | ryu__super_art_3_L Shin Shoryuken                       | block   | -50 → -52 | 66       | 公式表の対応欄                                       |
| ryu      | ryu__super_art_3_M Shin Shoryuken                       | block   | -50 → -52 | 66       | 公式表の対応欄                                       |
| ryu      | ryu__super_art_3_H Shin Shoryuken                       | block   | -50 → -52 | 66       | 公式表の対応欄                                       |
| sagat    | sagat__normal_2_P_M しゃがみ中P                         | total   | 25 → 28   | 10       | 持続 7-9 の最終F 9 + 硬直 16 + 空振り時硬直3F増加    |
| sagat    | sagat__normal_5_K_H 立ち強K                             | total   | 36 → 40   | 7        | 持続 10-15 の最終F 15 + 硬直 21 + 空振り時硬直4F増加 |
| sagat    | sagat__normal_5_K_L 立ち弱K                             | total   | 23 → 25   | 3        | 持続 7-8 の最終F 8 + 硬直 15 + 空振り時硬直2F増加    |
| sagat    | sagat__normal_5_P_H 立ち強P                             | total   | 40 → 43   | 6        | 持続 15-18 の最終F 18 + 硬直 22 + 空振り時硬直3F増加 |
| sagat    | sagat__special_236_P_OD OD Low Tiger Shot               | hit     | +52 → D   | 34       | 公式表の対応欄                                       |
| terry    | terry__normal_2_P_M しゃがみ中P                         | total   | 22 → 24   | 10       | 持続 6-9 の最終F 9 + 硬直 13 + 空振り時硬直2F増加    |
| terry    | terry__special_623_P_L LP Rising Tackle                 | block   | -23 → -25 | 47       | 公式表の対応欄                                       |
| terry    | terry__special_214_P_OD OD Quick Burn                   | hit     | +33 → D   | 35       | 公式表の対応欄                                       |
| yasmine  | yasmine__normal_2_P_M しゃがみ中P                       | total   | 24 → 26   | 10       | 持続 6-8 の最終F 8 + 硬直 16 + 空振り時硬直2F増加    |
| yasmine  | yasmine__normal_5_P_L 立ち弱P                           | total   | 14 → 15   | 2        | 持続 5-7 の最終F 7 + 硬直 7 + 空振り時硬直1F増加     |
| yasmine  | yasmine__special_214_P_M MP Talim ng Hangin             | hit     | +2 → D    | 47       | 公式表の対応欄                                       |
| zangief  | zangief__normal_5_P_H 立ち強P                           | total   | 40 → 42   | 7        | 持続 16-18 の最終F 18 + 硬直 22 + 空振り時硬直2F増加 |
| zangief  | zangief__special_22_K_H Tundra Storm                    | startup | 6 → 5     | 53       | 公式表の対応欄                                       |

全フィールドの照合結果と公式行・条件は [results.json](../staging/official-reevaluation/results.json)、不一致と分類は [discrepancies.json](../staging/official-reevaluation/discrepancies.json)、修正前後は [changes.json](../staging/official-reevaluation/changes.json) を参照。
