# 距離範囲対応・保存原典調査報告

## 現在の仕様：持続当て範囲の撤回

飛び道具の到達時間・移動技の移動距離で発生が変わる範囲のみを採用する。持続の何F目でヒット/ガードしたかによる硬直差は、距離で後半持続が当たる場合も範囲化しない。到達時間と接触の根拠が混在する硬直差も元の代表値へ戻す。新規調査・実測は行っていない。

| 状態   | 変更前 | 増減 | 変更後 |
| ------ | -----: | ---: | -----: |
| 採用   |     81 |  -77 |      4 |
| 保留   |    155 |  -47 |    108 |
| 対象外 |    501 | +124 |    625 |
| 合計   |    737 |    0 |    737 |

77原典項目の範囲採用を撤回し、共通強度展開を含む59技レコード・89フィールドを元の代表値へ戻した。残る範囲は4原典項目・9技レコード・9発生フィールド：JP214K/214KKの26~、ベガOD[2]8KKの16~47、通常ルークSA3の10~27（SAは3強度の独立入力）。全体Fを変更していない。Moveの採用状態・質問候補、D、unknown、verification、固定代表条件、32体・1298技・SA288独立入力を維持する。datasetIdはarrival-startup-only-2026-11-09-r1。

保留のD47件は以前から持続・距離接触の硬直差端点待ちとして記録されていたため、範囲化対象外へ移した。本番値は維持。C108件は条件未分離のまま保留を維持し、範囲化対象外を技そのものの除外に使わない。

正本distanceRanges.decisionsは過去の採用記録として保持し、contactTimingRollback.revokedに撤回前後の値・原典参照・理由を保存する。生成時は撤回された判断を適用しない。候補台帳への状態変更はcontactTimingRollback.candidatesに保存し、既存の調査段階の結論は書き換えず現在の上書き判断として適用する。過去基準比較も撤回値/復元値を厳密に検証してから比較する。

### 単一値へ戻したフィールド（生成レコードを含む）

| キャラ / 技ID                                    | 項目  | 撤回前  | 代表値へ復元 |
| ------------------------------------------------ | ----- | ------- | ------------ |
| jp / jp__special_236_K_H                         | hit   | +6~     | +6           |
| jp / jp__special_236_K_H                         | block | -8~     | -8           |
| jp / jp__special_236_K_L                         | block | -6~     | -6           |
| jp / jp__special_236_K_M                         | hit   | +6~     | +6           |
| jp / jp__special_236_K_M                         | block | -8~     | -8           |
| jp / jp__special_236_K_OD                        | block | +25~    | +25          |
| aki / aki__normal_5_P_M                          | hit   | +3~+7   | +3           |
| aki / aki__normal_5_P_M                          | block | -3~+1   | -3           |
| aki / aki__special_214_P_H                       | block | -4~+4   | -4           |
| aki / aki__special_236_P_L                       | block | -8~-6   | -8           |
| aki / aki__special_236_P_L                       | hit   | +1~+3   | +1           |
| aki / aki__special_236_P_OD                      | block | -14~-11 | -14          |
| alex / alex__normal_5_P_H                        | hit   | +4~+8   | +4           |
| alex / alex__normal_5_P_H                        | block | -3~+1   | -3           |
| alex / alex__normal_5_P_M                        | hit   | +4~+7   | +4           |
| alex / alex__normal_5_P_M                        | block | 0~+3    | 0            |
| chunli / chunli__normal_2_K_H                    | block | -9~-4   | -9           |
| cviper / cviper__special_214_P_L                 | hit   | +2~+5   | +2           |
| cviper / cviper__special_214_P_L                 | block | -4~-1   | -4           |
| cviper / cviper__special_214_P_M                 | hit   | +1~+4   | +1           |
| cviper / cviper__special_214_P_M                 | block | -3~0    | -3           |
| cviper / cviper__special_236_K_H                 | block | -2~+2   | -2           |
| cviper / cviper__special_236_K_OD                | block | -4~-1   | -4           |
| dee_jay / dee_jay__normal_5_P_H                  | hit   | +3~+8   | +3           |
| dee_jay / dee_jay__normal_5_P_H                  | block | -4~+1   | -4           |
| dee_jay / dee_jay__special_236_K_M               | block | -6~-4   | -6           |
| dhalsim / dhalsim__special_63214_P_H             | block | -4~-2   | -4           |
| e_honda / e_honda__normal_2_P_H                  | hit   | +3~+5   | +3           |
| e_honda / e_honda__normal_2_P_H                  | block | -3~-1   | -3           |
| e_honda / e_honda__special_22_P_none             | hit   | +3~+7   | +3           |
| e_honda / e_honda__special_22_P_none             | block | -3~+1   | -3           |
| e_honda / e_honda__special_22_P_none__strength_L | hit   | +3~+7   | +3           |
| e_honda / e_honda__special_22_P_none__strength_L | block | -3~+1   | -3           |
| e_honda / e_honda__special_22_P_none__strength_M | hit   | +3~+7   | +3           |
| e_honda / e_honda__special_22_P_none__strength_M | block | -3~+1   | -3           |
| e_honda / e_honda__special_22_P_none__strength_H | hit   | +3~+7   | +3           |
| e_honda / e_honda__special_22_P_none__strength_H | block | -3~+1   | -3           |
| ed / ed__special_236_P_none                      | hit   | +3~+14  | +3           |
| ed / ed__special_236_P_none                      | block | -5~+6   | -5           |
| ed / ed__special_236_P_OD                        | block | -2~+10  | -2           |
| ed / ed__special_236_P_none__strength_L          | hit   | +3~+14  | +3           |
| ed / ed__special_236_P_none__strength_L          | block | -5~+6   | -5           |
| ed / ed__special_236_P_none__strength_M          | hit   | +3~+14  | +3           |
| ed / ed__special_236_P_none__strength_M          | block | -5~+6   | -5           |
| ed / ed__special_236_P_none__strength_H          | hit   | +3~+14  | +3           |
| ed / ed__special_236_P_none__strength_H          | block | -5~+6   | -5           |
| ingrid / ingrid__normal_2_P_M                    | hit   | +6~+9   | +6           |
| ingrid / ingrid__normal_2_P_M                    | block | -1~+2   | -1           |
| ingrid / ingrid__normal_5_P_M                    | hit   | +1~+5   | +1           |
| ingrid / ingrid__normal_5_P_M                    | block | 0~+4    | 0            |
| juri / juri__normal_5_K_H                        | hit   | +2~+5   | +2           |
| juri / juri__normal_5_K_H                        | block | -3~0    | -3           |
| juri / juri__normal_5_P_L                        | hit   | +5~+8   | +5           |
| juri / juri__normal_5_P_L                        | block | -2~+1   | -2           |
| juri / juri__normal_5_P_M                        | hit   | +7~+10  | +7           |
| juri / juri__normal_5_P_M                        | block | +2~+5   | +2           |
| kimberly / kimberly__normal_2_P_H                | hit   | +3~+8   | +3           |
| kimberly / kimberly__normal_2_P_H                | block | -2~+3   | -2           |
| lily / lily__special_236_K_H                     | block | -8~+4   | -8           |
| lily / lily__special_236_K_L                     | block | -8~+4   | -8           |
| lily / lily__special_236_K_M                     | block | -8~+4   | -8           |
| lily / lily__special_236_K_OD                    | block | -8~+4   | -8           |
| luke / luke__normal_2_P_M                        | hit   | +5~+7   | +5           |
| luke / luke__normal_2_P_M                        | block | +1~+3   | +1           |
| luke / luke__normal_5_K_H                        | hit   | +2~+8   | +2           |
| luke / luke__normal_5_K_H                        | block | -5~+1   | -5           |
| m_bison / m_bison__normal_5_P_H                  | hit   | +5~+7   | +5           |
| m_bison / m_bison__normal_5_P_H                  | block | +1~+3   | +1           |
| ryu / ryu__special_236_K_H                       | block | -3~+5   | -3           |
| ryu / ryu__special_236_K_L                       | block | -11~-7  | -11          |
| ryu / ryu__special_236_K_M                       | block | -8~-2   | -8           |
| sagat / sagat__special_236_K_H                   | block | -5~+5   | -5           |
| sagat / sagat__special_236_K_L                   | block | -8~+2   | -8           |
| sagat / sagat__special_236_K_M                   | block | -7~+3   | -7           |
| terry / terry__normal_2_P_M                      | block | -1~+3   | -1           |
| terry / terry__special_214_P_H                   | block | -8~+5   | -8           |
| terry / terry__special_214_P_M                   | block | -6~+2   | -6           |
| yasmine / yasmine__normal_2_P_L                  | hit   | +4~+6   | +4           |
| yasmine / yasmine__normal_2_P_L                  | block | -1~+1   | -1           |
| jamie / jamie__normal_5_P_H                      | hit   | +1~+3   | +1           |
| jamie / jamie__normal_5_P_H                      | block | -3~-1   | -3           |
| jamie / jamie__held_special_214_P_H              | block | -3~+5   | -3           |
| jamie / jamie__held_special_214_P_L              | block | -6~+2   | -6           |
| jamie / jamie__held_special_214_P_M              | block | -6~+2   | -6           |
| jamie / jamie__held_special_214_P_OD             | block | -1~+7   | -1           |
| mai / mai__special_214_P_L                       | hit   | +3~+9   | +3           |
| mai / mai__special_214_P_L                       | block | -4~+2   | -4           |
| cammy / cammy__special_236_K_L                   | block | -12~0   | -12          |
| cammy / cammy__special_236_K_M                   | block | -14~0   | -14          |

### 検証

typecheck、アプリ144テスト・データ21テスト・archive29テスト、data:plan/data:check、validate:data、coverage、SA・共通強度・個別代表条件監査（--check）、format:check、build、参照整合性検査が成功。履歴依存テストを省略せず、新規回帰検査で公開前commit0e86060からの差分が89フィールドだけであること、撤回対象以外の完全一致と残る9範囲フィールドを検査した。PC1280px/320pxの実ブラウザーで持続範囲を戻したゲーム・技一覧表示、維持する発生範囲、Normal/Hard切替後の履歴とページ横はみ出しがないことを確認。スクリーンショットは従来どおりローカル保持のstaging/verification/distance-ranges。既存のchunkサイズ警告あり。

## 撤回前の履歴

## 現在の結論（第3段階終了）

今回、新規採用・新規対象外はともに0件。C108・D47の155項目は保留を維持する。独自の攻略解説・判定観察記事の本文や公開GitHubデータを取得したが、同一入力・強度・状態・相手姿勢で距離/接触だけを変えた端点を保証する独立検証結果は得られなかった。検索断片や転載だけで範囲を追加していない。実機測定は未実施。

| 状態   | 作業前 | 今回の増減 | 作業後 |
| ------ | -----: | ---------: | -----: |
| 採用   |     81 |          0 |     81 |
| 保留   |    155 |          0 |    155 |
| 対象外 |    501 |          0 |    501 |
| 合計   |    737 |          0 |    737 |

既存81原典項目・68技レコード・98フィールドの範囲採用を維持。32キャラ・1298技・SA288独立入力も維持。質問候補、Move.adoption、D、unknown、空振り全体Fを変更していない。本番JSON・採用判断・metadataの内容を変更せず、datasetIdもdistance-held-stage2-2026-11-09-r1を維持。新規範囲によるUI変更がないため今回のブラウザー再検証は不要と判断した。前段階のPC/320px画像は保存したまま。

### 調査範囲と原因別内訳

C108全件について次の不足情報グループへ割り当て、新規情報源の取得可能性をグループ単位で探索した。さらに公開GitHubデータの各入力対応候補を全155項目で照合し、技名・強度・状態が分離されていない候補もそのまま記録した。各技を個別の検索語で調べた、または全155件の測定動画を見たという意味ではない。D47も公開検証候補を探したが、合格する結果は取得できなかった。

| 保留原因                     | 件数 | 補助分類 |
| ---------------------------- | ---: | -------- |
| 強度別距離範囲の未分離       |    3 | C        |
| 表裏・別条件の未分離         |    7 | C        |
| 括弧・打撃段・姿勢の定義不足 |   51 | C        |
| 距離・持続依存の端点不足     |   47 | D        |
| 入力・代表状態の対応証拠不足 |   47 | C        |

追加結果はheld-range-review.jsonのstage3へ保存。各候補のreevaluation.stage3にも原因・照合候補・取得資料ID・必要な証拠・実測手順を記録。resolutionはheldのままで、既存のaccepted/excludedを更新していない。

### 新しく得た情報と採用に使えなかった理由

- A.K.I.研究室は独自の技解説とフレームメーター画像リンクがある。SA2は単一-19と強度別の距離差を記載するが、強度内の距離別端点表はない。蛇軽功も非攻撃の移動・表裏という条件の説明で、全体Fの端点を確定できない。派生の猛毒牙に書かれた範囲は別入力なので本番基本技へ転用しない。
- あめあられの判定観察記事はWeb抽出で5HK持続後半の判定に関する定性的説明を確認した。記載日2024-03-17。通常curlは404で、判定画像は確認できていない。ヒット/ガード硬直差の実測端点を得たとは扱わない。
- ACQUAの講座本文はJPの前投げ後Triglav持続重ねでガード+1を説明するが、2026-03-17調整後にはその連携をそのまま使えない旨の注意がある。特定連携の一点であり、同一姿勢の成立全距離・全接触タイミングを走査した端点表ではない。元動画でのメーター確認も未実施なので範囲へ転用しない。
- 本田の攻略記事には別通常技のDR持続連携の値があるが、5HPの端点ではない。DRの付与フレームを計算で除去して5HPの値に流用しない。公式由来のFrame Data SearchはVer.2.0401.010表記だが、5HPの基本値は単一で、括弧内外の距離条件を解決しない。
- SF6-Companion-Appの公開データをJSONとして読み、実行せず照合した。24キャラで未収録キャラもあり、測定条件・パッチ・データ原作者が不明。例えば本田5HPのonHit=-1は本番+1と異なる。この差を距離変動と解釈せず、由来/パッチ不明の矛盾として記録。本番値は維持する。total欠損をrecoveryから補完していない。
- SF6Frameの一次READMEは起き攻め計算式を説明し、データ更新はスクレイパー経由。独立した端点測定ログではない。持続数から端点を計算する用途には使わない。異なるサイトやリポジトリに載っていることだけを独立検証と認定しない。

### 参照URLと取得結果

確認日は2026-11-09。本文を取得した資料と、本文/映像を確認できなかった候補を分ける。Shoryuや既存Cargoの再取得はしていない。既知のSuperCombo/公式403 URLにも再アクセスしていない。

| 資料                                                                                                   | 取得結果・資料の種類                                                                    | 判断                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [aki-guide](https://st6-aki-laboratory.com/spcial.html)                                                | HTTP200 本文取得 / 独自攻略解説・フレームメーター画像へのリンク                         | SA2は単一-19と強度別距離の説明。強度内の距離別端点・測定相手は示されない。派生技の範囲は別入力なので転用しない。                                                           |
| [aki-specials](https://kamigame.jp/streetfighter6/page/347497164038996719.html)                        | HTTP200 本文取得 / 攻略編集記事・2025-09-15更新                                         | 蛇軽功は発生-・全体43/42の単一値。表裏別端点を含む実測表ではない。                                                                                                         |
| [honda-guide](https://kamigame.jp/streetfighter6/page/345071339649895161.html)                         | HTTP200 本文取得 / 攻略編集記事                                                         | 基本値やDR持続連携の説明。DR付与分を含む値や別通常技の数値を5HPの端点に流用しない。                                                                                        |
| [acqua-combo](https://acqua-souken.com/book/combo/)                                                    | HTTP200 本文取得 / 動画講座の書き起こし・解説                                           | JP前投げ後のTriglav持続+1は特定連携の一点。2026-03-17調整に関する旧連携への注意あり。入力強度/相手姿勢を固定した全域の端点表ではなく、リンク動画のフレームメーター未確認。 |
| [honda-table](https://frame-search.com/?character_name=E.Honda&lang=en-us)                             | HTTP200 本文取得 / 公式由来データ検索・Ver.2.0401.010表記                               | 本田5HPは8/ヒット+1/ガード-6の単一値。距離別端点は未取得。独立実測資料ではない。                                                                                           |
| [companion-data](https://raw.githubusercontent.com/mtgr18977/SF6-Companion-App/main/sf6-frame-data.js) | HTTP200 本文取得 / 公開GitHubデータ・24キャラ                                           | 別リポジトリだが原データ由来・測定条件・対象パッチ不明。単一値や別状態を収録し、独立検証とは認定しない。差分は全体更新へ使わない。                                         |
| [sf6frame-readme](https://raw.githubusercontent.com/prophetw/SF6Frame/main/README.md)                  | HTTP200 本文取得 / 公開GitHub起き攻め計算器の一次ドキュメント                           | 持続と発生からの計算式。データ更新はscraper-puppeteer.tsによる収集。実測端点ログではなく計算結果から端点を生成しない。                                                     |
| [blanka-hitboxes](https://www.ame-arare.com/sf6-blanka-hitboxes/)                                      | Web抽出本文は閲覧可（2024-03-17表記）、通常curlは404。判定画像未確認 / 独自判定観察記事 | 5HKの後半判定についての定性的説明。ヒット/ガード硬直差の端点はない。現在の画像検証結果を確認したとは扱わない。                                                             |
| [video-year2](https://www.youtube.com/watch?v=w0CAWO76kEA)                                             | Web取得エラー、動画本編未確認 / 検証動画候補                                            | 検索断片は採用根拠にしない。                                                                                                                                               |
| [video-year3](https://www.youtube.com/watch?v=mSyhLPwy9QA)                                             | Web Cache miss、動画本編未確認 / 持続当て検証動画候補                                   | 検索断片は採用根拠にしない。                                                                                                                                               |
| [reddit-ken](https://www.reddit.com/r/StreetFighter/comments/1f6irmb/)                                 | Web Cache miss、本文未取得 / 個人測定報告候補                                           | 検索断片の+7を採用しない。                                                                                                                                                 |
| [ryu-reference](https://github.com/zach-king-analytics/sf6-training/blob/main/ryu_reference.md)        | Web HTTP404 / GitHub資料候補                                                            | 本文未確認。                                                                                                                                                               |

取得HTML・データ・READMEはstaging/held-range-stage3。404のHTMLは証拠本文として保存しない。YouTubeの検索見出し、Redditの検索断片、404のGitHubページを確定根拠に使っていない。動画は候補URLのみで、視聴やフレーム単位の数値確認をしたとは主張しない。調査グループの実際の検索語はstage3.groups.queriesに保存。新しい証拠が増えなくなった時点で同じ検索の反復を停止した。

### 実測の共通手順と技ごとの差分

これは手順設計であり測定結果ではない。SF6実機は接続されていない。各技の入力強度・現在値・代表条件はstage3.items[].measurement.casesへ実レコードから記録した。共通強度展開はL/M/Hを別試行にし、ODボタン組み合わせも固定する。

1. 対戦相手はまず通常状態のリュウ。通常ヒットは立ち、ガードは原典で成立する同一姿勢（下段はしゃがみ）に固定。相手を変更した試行は別記録にする。カウンター/パニカン/DR/バーンアウトをOFFにし、ストック・酔い・ホールド・派生などは既存代表条件へ固定。
2. 画面中央で近/中/遠と成立境界の間合いを記録する。フレームメーターと入力履歴を録画し、コマ送りで赤い持続区間の先頭・末尾と接触位置を対応付ける。弾の飛翔時間と本体持続を同一視しない。メーターで区別できなければ測定不能と記録する。
3. 最初/最後だけでなく途中の持続も走査する。通常ヒットとガードは別試行。KDはDとして別記録し、全体Fは空振り試行のみ。撮影したサンプルの最小最大を、全条件の端点と断定しない。採用には条件を固定した明示端点・その成立録画が必要。
4. 技ごとの注意：A.K.I./Ed SA2は強度別、ベガ通常は軌道別、A.K.I.蛇軽功は表側/裏回り/43F例外別、Blankaは上昇/下降/接触段別、本田は姿勢と接触位置別、Zangief Farは移動距離とアーマー接触を分離。Ken5HP・Blanka5HK・Cammy2HP/5MPは通常持続接触の端点、JP22P/22PPとDhalsim236PPは固定強度/OD組み合わせの飛翔・設置接触を測る。
5. 未確定値はstage3各項目のunknown/nextEvidenceを参照。公開の同条件測定表やフレームメーター動画が得られれば代用できる。測定条件の設計だけを採用根拠にはしない。

### 検証

typecheck、アプリテスト、データテスト、data:plan/data:check、validate:data、coverage、SA・共通強度・個別代表条件監査、format:check、buildを実施。履歴依存テストは維持し、追加テストはC108/D47の全件記録・実測未実施の区別、今回開始時の全1298レコードの入力/採用状態/フレームと採用判断の不変、段階別再生成で調査記録が失われないことを確認する。ビルドの既存chunk警告あり。commit・push・デプロイは実施していない。

## 第2段階までの履歴

## 現在の結論（第2段階終了）

C134項目すべての技ID・フィールド・保存原典・不足証拠を再確認して優先順位を付けた。公開本文を追加取得できた主要候補と、保存raw・SA inventory・原典参照の再照合だけを進めた候補を区別して記録した。各項目のcheckedSourcesに列挙していない公開資料は未確認であり、全134項目をWebで独立検証した意味ではない。検索結果の断片から数値を採用していない。

| 状態   | 作業前 | 今回の増減 | 作業後 |
| ------ | -----: | ---------: | -----: |
| 採用   |     80 |         +1 |     81 |
| 保留   |    180 |        -25 |    155 |
| 対象外 |    477 |        +24 |    501 |
| 合計   |    737 |          0 |    737 |

C134の結果は採用1・対象外24・保留継続109。保留継続のうちC108、C→D1。既存D46は再調査・変更していないため、残る補助分類はC108・D47。

ルーク通常SA3の発生を10から10~27へ変更した。1原典項目をL/M/Hの独立3技レコード・3フィールドへ適用し、累計81原典項目・68技レコード・98フィールド。既存80原典項目・95フィールドの判断を維持。全32体出題可能、1298技、SA288独立入力を維持。対象外24項目の本番値を訂正したのではなく、距離範囲化の候補状態だけを変更した。

### 調査優先順位

順に、1点照合・入力/派生対応・括弧定義・複数資料・実測候補という区分。134件の各priority/priorityBasisと結論はheld-range-review.jsonのstage2.itemsおよび候補台帳のreevaluation.stage2に保存。

| 優先区分 | 件数 |
| -------- | ---: |
| 1        |    1 |
| 2        |   24 |
| 3        |   36 |
| 4        |   72 |
| 5        |    1 |

### 新規採用の根拠

[ShoryuのLuke本文](https://shoryu.site/character/luke)の通常Pale Rider行を取得し、保存Cargo row9の10(27)と、相手到達または27Fで攻撃が発生するという条件を照合。距離による到達時間の両端10/27をそのまま使い、計算していない。CAのrow10はSA生成原典refと異なる別条件行として除外。追加本文は同じWiki由来の再掲載であり独立検証・最新パッチ保証ではない。パッチはUNVERIFIEDを維持する。保存原典と当該発生・条件の矛盾は検出していない。

| 技ID                | 項目    | 変更前 | 変更後 |
| ------------------- | ------- | ------ | ------ |
| luke__super_art_3_L | startup | 10     | 10~27  |
| luke__super_art_3_M | startup | 10     | 10~27  |
| luke__super_art_3_H | startup | 10     | 10~27  |

### 対象外24項目

SA別条件行の照合は生成済みsaEvidence.cargoRefと保存inventoryに基づく。入力文字列が共通でもCA等を通常SAへ取り込まない。以下の判断は資料不足による除外ではなく、具体的な測定条件・出典対応に基づく。

| 技ID（元台帳の対応）                                                | 項目 / 原典行               | 理由                                                                                                                                                |
| ------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| aki__special_214_K_L                                                | hit / aki/4/hit             | 括弧はKD +38~45のダウン後有利値。通常ヒット+2の距離範囲ではない。                                                                                   |
| aki__special_214_K_M                                                | hit / aki/8/hit             | 括弧はKD +38~45のダウン後有利値。通常ヒット+3と混ぜない。                                                                                           |
| blanka__special_63214_K_OD                                          | startup / blanka/38/startup | 原典が括弧の41を下降打撃の発生と明示。上昇1段目8Fと別の打撃段を連続範囲へ混ぜない。                                                                 |
| juri__special_236_K_M                                               | hit / juri/16/hit           | 通常ヒット+5と持続2〜4FのKD/空中KDの混在。KD端点を通常硬直差へ転用しない。                                                                          |
| ken__special_623_K_H                                                | startup / ken/43/startup    | 最初2持続は空中の相手だけに当たり、括弧は地上相手の成立時点。地上/空中条件を混ぜない。                                                              |
| ken__special_623_K_H                                                | hit / ken/43/hit            | 注記がしゃがみ相手に1F良いと明示。姿勢差であり同一代表条件の範囲ではない。                                                                          |
| ken__special_623_K_OD                                               | startup / ken/45/startup    | 初期持続は空中のみ、次は立ち相手のみ。既存のユーザー指定9F代表条件を維持。                                                                          |
| ken__special_623_K_OD                                               | hit / ken/45/hit            | 注記がしゃがみ相手に3F良いと明示。立ち/しゃがみの別条件。                                                                                           |
| ken__special_623_K_L                                                | startup / ken/46/startup    | 最初3持続は空中のみ。地上/空中の成立時点を範囲として結合しない。                                                                                    |
| ken__special_623_K_M                                                | startup / ken/48/startup    | 最初2持続は空中のみ。地上/空中の成立時点を範囲として結合しない。                                                                                    |
| ken__special_623_K_M                                                | hit / ken/48/hit            | 注記がしゃがみ相手に1F良いと明示。立ち/しゃがみの別条件。                                                                                           |
| luke__super_art_3_L, luke__super_art_3_M, luke__super_art_3_H       | startup / luke/10/startup   | SA生成のsaEvidence.cargoRefと保存SA inventoryを照合。この共通入力行は採用SAの原典行ではなくCA等の別条件行。対象入力文字列の一致だけでは採用しない。 |
| manon__super_art_2_L, manon__super_art_2_M, manon__super_art_2_H    | block / manon/0/block       | ガード時の最終打撃がしゃがみ相手に空振りする条件。姿勢と接触段数の差。                                                                              |
| manon__special_214_K_H                                              | startup / manon/1/startup   | 最初持続は空中の相手のみ。地上/空中の成立時点を混ぜない。                                                                                           |
| manon__special_214_K_OD                                             | startup / manon/2/startup   | 最初持続はしゃがみ相手に当たらない。立ち/しゃがみ・中段成立時点の別条件。                                                                           |
| manon__special_214_K_OD                                             | hit / manon/2/hit           | しゃがみ相手で1F良いという明示条件。通常の立ち相手との差を範囲化しない。                                                                            |
| marisa__super_art_3_L, marisa__super_art_3_M, marisa__super_art_3_H | block / marisa/18/block     | SA生成のsaEvidence.cargoRefと保存SA inventoryを照合。この共通入力行は採用SAの原典行ではなくCA等の別条件行。対象入力文字列の一致だけでは採用しない。 |
| ryu__special_214_K_H                                                | block / ryu/6/block         | しゃがみ相手には初段しか当たらない別条件。立ち相手の代表値と混ぜない。                                                                              |
| ryu__special_214_K_M                                                | block / ryu/11/block        | しゃがみ相手には初段しか当たらない別条件。立ち相手の代表値と混ぜない。                                                                              |
| ryu__special_236_K_OD                                               | hit / ryu/21/hit            | 壁バウンド後の有利値。通常ヒット硬直差への数値変換は対象外でDを維持。                                                                               |
| terry__special_214_K_H                                              | startup / terry/3/startup   | 最初7持続が空中のみ。地上成立30Fと空中成立23Fを混ぜない。                                                                                           |
| terry__special_214_K_OD                                             | startup / terry/5/startup   | 最初持続が地上相手に当たらない。地上/空中の成立時点差。                                                                                             |
| terry__special_214_P_L                                              | startup / terry/7/startup   | 2段技の括弧22Fは中段となる打撃段の発生。1段目10Fと測定対象が違う。                                                                                  |
| terry__special_214_P_OD                                             | startup / terry/8/startup   | 追加打撃のある別入力。括弧22Fは中段打撃の成立時点で初段10Fの距離変動ではない。                                                                      |

### 追加資料と取得結果

確認日2026-11-09。以下は本文HTMLを通常の公開URLから取得してstaging/held-range-stage2に保存した。由来が共通のため独立資料数としては数えない。更新時期・適用パッチは不明。公式表からの最新値上書きは行っていない。

- [dhalsim](https://shoryu.site/character/dhalsim)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/dhalsim.html。
- [luke](https://shoryu.site/character/luke)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/luke.html。
- [e_honda](https://shoryu.site/character/honda)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/honda.html。
- [blanka](https://shoryu.site/character/blanka)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/blanka.html。
- [arjun](https://shoryu.site/character/arjun)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/arjun.html。
- [aki](https://shoryu.site/character/aki)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/aki.html。
- [ed](https://shoryu.site/character/ed)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/ed.html。
- [m_bison](https://shoryu.site/character/vega)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/vega.html。
- [zangief](https://shoryu.site/character/zangief)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/zangief.html。
- [mai](https://shoryu.site/character/mai)：HTTP200、本文取得済み。保存先 staging/held-range-stage2/mai.html。

- [未確認資料](https://www.streetfighter.com/6/buckler/ja-JP/characters/luke/frame)：Web tool inaccessible; ordinary curl HTTP403。
- [未確認資料](https://www.streetfighter.com/6/buckler/ja-JP/characters/mai/frame)：Web tool inaccessible。
- [未確認資料](https://www.streetfighter.com/6/buckler/ja-JP/characters/ehonda/frame)：Web tool inaccessible。
- [未確認資料](https://shoryu.site/character/bison)：HTTP404。
- [未確認資料](https://shoryu.site/character/mbison)：HTTP404; correct slug vega discovered by search。

SuperCombo本体は前回の403/Anubis失敗を引き継ぎ、今回は同一URLへの再試行・回避処理を行っていない。公式ルーク表はWeb取得不可の後、通常curlでも403となり、それ以上の再試行はしていない。その他の公式候補もWeb取得不可で本文未確認。誤ったShoryuのBison/mbison候補URLは404、検索で判明したvegaの公開本文を取得した。

### 主要な保留と次回必要な証拠

- A.K.I./Ed SA2：公開本文も共通強度表と配置/弾速差のみ。各強度内の距離別ガード値がない。各強度を別に測った近・中・遠距離表が必要。
- ベガ通常[2]8K：公開Shadow Rise行にも軌道の強度差と共通18~46しかなく、各強度の端点を分離できない。OD16~47は維持。
- A.K.I.236HK/KK：公開記載にも表裏と43F例外が残る。同じ表裏条件の空振り全体表と、発生欄が何を測定するかの定義が必要。
- Arjun236P、Blanka63214K、Honda5HP、Zangief Far：追加本文に括弧の新しい条件定義がない。相手の姿勢、接触段、走行距離・アーマー接触を分離した表・動画が必要。範囲端点を推測しない。
- Dhalsim236PPガードはCからDへ。追加公開本文も距離で硬直差が増すと記載するが端点がない。OD LP+MPと立ち相手に固定した近/中/遠の実測資料を求める。-3から片側~を新作しない。
- その他Cは各項目のnextEvidenceを参照。保存資料だけを再照合したものはその事実をsourceComparisonへ明示し、公開本文取得済みとは区別する。

### 検証

typecheck、アプリテスト、データテスト、data:plan/data:check、validate:data、coverage、SA・共通強度・代表条件監査、format:check、buildを実施。履歴依存検査は維持し、第1段階基準へ戻す比較では今回の明示許可フィールドを厳密に照合して投影する。追加検査で134件、80判断と既存D46の不変、3強度の新範囲と独立入力、端点の公開本文、再生成の安定性を確認する。PC/320pxのゲーム画面・技一覧で10~27を確認。commit・push・デプロイは行っていない。

## 過去段階の履歴

保存済みCargoの全32キャラ2445行を走査し、原典入力・raw対応行・既存coverageのmoveIds・SAのcargoRef・採用基本技・共通強度生成元を照合した。各行の照合結果と各候補の注記全体・分類理由を台帳へ記録した。未調査として残した候補はない。保留は保存資料から適用条件・端点を一意に確定できないもの。公式・現行パッチの検証を意味しない。

## 集計

前回の190項目に、括弧付き値と距離・接触タイミングを説明する注記の候補を加えた。過剰抽出を含む原典候補は2211項目。本番採用基本技に対応する候補は737項目。候補は技数ではなく、原典行×フレーム項目で数える。単に範囲が存在しない項目も、注記との条件照合対象として含める。

- 全原典候補の採用 / 保留 / 対象外：3 / 300 / 1836。
- 本番対象候補の採用 / 保留 / 対象外：3 / 300 / 362。
- 採用75原典項目、51元技レコード。共通強度展開後は60技レコード・90フレーム項目を変更。
- 前回JPの8原典項目・9技レコード・11フィールドを維持。今回追加は67原典項目・51技レコード・79フィールド。
- 32キャラ、1298技レコード、SA288独立入力を維持。全体F・D・verification・UNVERIFIEDは変更しない。

## 採用した項目

表の基準値と括弧または注記に明示された接触時の端点を採用。差分加算から端点を算出していない。根拠レコード全体・原典表記・理由はdata/adoption-decisions.jsonのdistanceRanges.decisionsを参照。個別代表条件適用後、共通強度展開前に適用し、変更前値と原典行を照合する。

| キャラ / 技ID                        | 項目    | 変更前 | 採用    | Cargo行 |
| ------------------------------------ | ------- | ------ | ------- | ------- |
| jp / jp__special_214_K_none          | startup | 26     | 26~     | 1       |
| jp / jp__special_214_K_OD            | startup | 26     | 26~     | 2       |
| jp / jp__special_236_K_H             | hit     | +6     | +6~     | 17      |
| jp / jp__special_236_K_H             | block   | -8     | -8~     | 17      |
| jp / jp__special_236_K_OD            | block   | +25    | +25~    | 19      |
| jp / jp__special_236_K_L             | block   | -6     | -6~     | 20      |
| jp / jp__special_236_K_M             | hit     | +6     | +6~     | 22      |
| jp / jp__special_236_K_M             | block   | -8     | -8~     | 22      |
| aki / aki__special_214_P_H           | block   | -4     | -4~+4   | 2       |
| aki / aki__special_236_P_L           | block   | -8     | -8~-6   | 20      |
| aki / aki__special_236_P_OD          | block   | -14    | -14~-11 | 23      |
| alex / alex__normal_5_P_H            | hit     | +4     | +4~+8   | 37      |
| alex / alex__normal_5_P_H            | block   | -3     | -3~+1   | 37      |
| alex / alex__normal_5_P_M            | hit     | +4     | +4~+7   | 41      |
| alex / alex__normal_5_P_M            | block   | 0      | 0~+3    | 41      |
| chunli / chunli__normal_2_K_H        | block   | -9     | -9~-4   | 25      |
| cviper / cviper__special_214_P_L     | hit     | +2     | +2~+5   | 7       |
| cviper / cviper__special_214_P_L     | block   | -4     | -4~-1   | 7       |
| cviper / cviper__special_214_P_M     | hit     | +1     | +1~+4   | 9       |
| cviper / cviper__special_214_P_M     | block   | -3     | -3~0    | 9       |
| cviper / cviper__special_236_K_H     | block   | -2     | -2~+2   | 18      |
| cviper / cviper__special_236_K_OD    | block   | -4     | -4~-1   | 19      |
| dee_jay / dee_jay__normal_5_P_H      | hit     | +3     | +3~+8   | 38      |
| dee_jay / dee_jay__normal_5_P_H      | block   | -4     | -4~+1   | 38      |
| dhalsim / dhalsim__special_63214_P_H | block   | -4     | -4~-2   | 41      |
| e_honda / e_honda__special_22_P_none | hit     | +3     | +3~+7   | 11      |
| e_honda / e_honda__special_22_P_none | block   | -3     | -3~+1   | 11      |
| e_honda / e_honda__normal_2_P_H      | hit     | +3     | +3~+5   | 22      |
| e_honda / e_honda__normal_2_P_H      | block   | -3     | -3~-1   | 22      |
| ed / ed__special_236_P_none          | hit     | +3     | +3~+14  | 12      |
| ed / ed__special_236_P_none          | block   | -5     | -5~+6   | 12      |
| ed / ed__special_236_P_OD            | block   | -2     | -2~+10  | 13      |
| ingrid / ingrid__normal_2_P_M        | hit     | +6     | +6~+9   | 35      |
| ingrid / ingrid__normal_2_P_M        | block   | -1     | -1~+2   | 35      |
| ingrid / ingrid__normal_5_P_M        | hit     | +1     | +1~+5   | 50      |
| ingrid / ingrid__normal_5_P_M        | block   | 0      | 0~+4    | 50      |
| juri / juri__normal_5_K_H            | hit     | +2     | +2~+5   | 35      |
| juri / juri__normal_5_K_H            | block   | -3     | -3~0    | 35      |
| juri / juri__normal_5_P_L            | hit     | +5     | +5~+8   | 41      |
| juri / juri__normal_5_P_L            | block   | -2     | -2~+1   | 41      |
| kimberly / kimberly__normal_2_P_H    | hit     | +3     | +3~+8   | 36      |
| kimberly / kimberly__normal_2_P_H    | block   | -2     | -2~+3   | 36      |
| lily / lily__special_236_K_H         | block   | -8     | -8~+4   | 11      |
| lily / lily__special_236_K_OD        | block   | -8     | -8~+4   | 12      |
| lily / lily__special_236_K_L         | block   | -8     | -8~+4   | 13      |
| lily / lily__special_236_K_M         | block   | -8     | -8~+4   | 14      |
| luke / luke__normal_2_P_M            | hit     | +5     | +5~+7   | 29      |
| luke / luke__normal_2_P_M            | block   | +1     | +1~+3   | 29      |
| luke / luke__normal_5_K_H            | hit     | +2     | +2~+8   | 34      |
| luke / luke__normal_5_K_H            | block   | -5     | -5~+1   | 34      |
| m_bison / m_bison__normal_5_P_H      | hit     | +5     | +5~+7   | 29      |
| m_bison / m_bison__normal_5_P_H      | block   | +1     | +1~+3   | 29      |
| m_bison / m_bison__special_[2]8_K_OD | startup | 16     | 16~47   | 59      |
| ryu / ryu__special_236_K_H           | block   | -3     | -3~+5   | 19      |
| ryu / ryu__special_236_K_L           | block   | -11    | -11~-7  | 22      |
| ryu / ryu__special_236_K_M           | block   | -8     | -8~-2   | 24      |
| sagat / sagat__special_236_K_H       | block   | -5     | -5~+5   | 18      |
| sagat / sagat__special_236_K_L       | block   | -8     | -8~+2   | 21      |
| sagat / sagat__special_236_K_M       | block   | -7     | -7~+3   | 24      |
| terry / terry__normal_2_P_M          | block   | -1     | -1~+3   | 29      |
| yasmine / yasmine__normal_2_P_L      | hit     | +4     | +4~+6   | 32      |
| yasmine / yasmine__normal_2_P_L      | block   | -1     | -1~+1   | 32      |
| aki / aki__normal_5_P_M              | hit     | +3     | +3~+7   | 45      |
| aki / aki__normal_5_P_M              | block   | -3     | -3~+1   | 45      |
| jamie / jamie__held_special_214_P_H  | block   | -3     | -3~+5   | 1       |
| jamie / jamie__held_special_214_P_L  | block   | -6     | -6~+2   | 2       |
| jamie / jamie__held_special_214_P_M  | block   | -6     | -6~+2   | 3       |
| jamie / jamie__held_special_214_P_OD | block   | -1     | -1~+7   | 4       |
| jamie / jamie__normal_5_P_H          | hit     | +1     | +1~+3   | 68      |
| jamie / jamie__normal_5_P_H          | block   | -3     | -3~-1   | 68      |
| juri / juri__normal_5_P_M            | hit     | +7     | +7~+10  | 45      |
| juri / juri__normal_5_P_M            | block   | +2     | +2~+5   | 45      |
| aki / aki__special_236_P_L           | hit     | +1     | +1~+3   | 20      |
| mai / mai__special_214_P_L           | hit     | +3     | +3~+9   | 4       |
| mai / mai__special_214_P_L           | block   | -4     | -4~+2   | 4       |

## 優先候補の結論

- A.K.I. SA2 / エドSA2：調査済み保留。共通行に-19~ / +65~はあるが、注記は強度による配置・弾速差を含む。保存資料だけでは各強度内の距離依存との分離を明示できず、3強度とも既存代表値を維持。SAの入力・生成・出典は変更しない。
- ベガ通常[2]8K：調査済み保留。18~46はL/M/Hの軌道差を含むため各強度へ一律展開しない。ODは自動追尾と距離による横移動速度変化が明記され、単一OD入力の16~47を採用。40Fの溜め成立条件を可変ホールド時間として混ぜない。
- A.K.I.236HK/236KK：調査済み保留。43(50~54) / 42(48~57)は同じ側と裏回りの条件を区別する。43Fの特殊な裏回り間合いも記載され、括弧端点だけを連続範囲へ変換できない。発生欄に置かれた全体値も発生範囲にしない。
- アージュナ623P各強度/OD：調査済み対象外。括弧51~71等は接触で持続が終了し固定23F回復へ移る条件。空振り全体75/69等を維持。
- 豪鬼236P、ザンギエフ5HP、Focus Force、ジェイミーの指定酔い条件、豪鬼百鬼襲の追加入力なし条件を維持。ホールド・強化・派生入力の数値は取り込まない。

## キャラ別の確認結果

全行の対応を確認済み。以下は広めに抽出した候補の件数で、保留は追加範囲の根拠不足を示す。全候補の具体的な入力・項目・理由・原典注記はstaging/distance-range-candidates.jsonに保存。

| キャラ   | Cargo行数 | 採用 / 保留 / 対象外 |
| -------- | --------- | -------------------- |
| aki      | 64        | 0 / 10 / 47          |
| akuma    | 91        | 0 / 19 / 97          |
| alex     | 76        | 0 / 6 / 37           |
| arjun    | 62        | 0 / 16 / 43          |
| blanka   | 85        | 0 / 17 / 72          |
| cammy    | 74        | 0 / 13 / 76          |
| chunli   | 79        | 0 / 2 / 48           |
| cviper   | 64        | 0 / 6 / 49           |
| dee_jay  | 98        | 0 / 6 / 55           |
| dhalsim  | 69        | 0 / 8 / 61           |
| e_honda  | 69        | 0 / 6 / 58           |
| ed       | 65        | 0 / 10 / 46          |
| elena    | 82        | 0 / 5 / 91           |
| guile    | 67        | 0 / 2 / 38           |
| ingrid   | 83        | 0 / 4 / 49           |
| jamie    | 115       | 0 / 5 / 75           |
| jp       | 64        | 2 / 7 / 43           |
| juri     | 87        | 0 / 3 / 50           |
| ken      | 75        | 0 / 21 / 48          |
| kimberly | 84        | 0 / 2 / 69           |
| lily     | 76        | 0 / 1 / 75           |
| luke     | 74        | 0 / 7 / 54           |
| m_bison  | 75        | 1 / 16 / 61          |
| mai      | 87        | 0 / 20 / 88          |
| manon    | 60        | 0 / 7 / 40           |
| marisa   | 90        | 0 / 9 / 65           |
| rashid   | 79        | 0 / 8 / 57           |
| ryu      | 77        | 0 / 14 / 50          |
| sagat    | 69        | 0 / 13 / 48          |
| terry    | 66        | 0 / 23 / 53          |
| yasmine  | 71        | 0 / 8 / 51           |
| zangief  | 68        | 0 / 6 / 42           |

## 検証

typecheck、アプリ143テスト、データ14テスト、data:plan、data:check、validate:data、data:audit-coverage、SA・共通強度・個別代表条件の監査、format:check、buildを実施。履歴依存テストは省略せず、許可された範囲差分だけを厳密に戻して既存基準を比較する。再生成の固定性と90フィールド以外の不変、原典行と採用候補の一致をテストする。

実ブラウザー1280px/320pxでJPの26~、+6~、-8~を技一覧と質問履歴で確認。技一覧は既存の表内横スクロールを維持し、ページ全体の横はみ出しがないことを検査。Normal/Hardの履歴表示も維持。画像はstaging/verification/distance-ranges。ビルドの既存chunkサイズ警告あり。commit・push・デプロイは実施していない。

残る保留は、保存原典から条件または端点を確定できないという判断であり、未調査ではない。新たな原典・実機検証なしに推測で補完しない。

## 第1段階：保留300項目の再評価

2026-11-09。上記は第1段階開始前の結果。この節が現在の採用状態である。737原典項目の集計対象は変更していない。再分類は正式状態と別の補助情報として全300項目へ付け、具体的技ID・変更前値・原典行・引用・次に必要な証拠をstaging/held-range-review.jsonと候補台帳のreevaluationへ保存した。未コミットの既存作業を維持した。

| 分類   | 作業前 | 今回の増減 | 作業後 |
| ------ | -----: | ---------: | -----: |
| 採用   |     75 |         +5 |     80 |
| 保留   |    300 |       -120 |    180 |
| 対象外 |    362 |       +115 |    477 |
| 合計   |    737 |          0 |    737 |

### 補助分類と解決結果

| 補助分類 | 件数 | 結果・例                                                                                   |
| -------- | ---: | ------------------------------------------------------------------------------------------ |
| A        |    5 | 5件採用。Cammy236LK/MK、Dee Jay236MK、Terry214HP/MPのガード                                |
| B        |  115 | 115件対象外。AKI5MK全体の空振り差、豪鬼SA3のキャンセル発生差、Ken623HPのしゃがみガード差等 |
| C        |  134 | 継続保留。共通強度と距離差、括弧の意味・条件が未分離                                       |
| D        |   46 | 継続保留。持続・遠距離の説明があっても当該項目の端点は未記載                               |

5原典項目・5技レコード・5フィールドを追加採用。累計80原典項目・65技レコード・95フィールド。以前の75採用判断と90フィールドは変更していない。対象外115件は本番値を変更しない。datasetIdはdistance-held-review-2026-11-09-r1。32キャラ出題可能、1298技・SA288独立入力、D、空振り全体の条件、verification/UNVERIFIEDを維持。

### 解消項目の一覧

原典行番号は保存Cargoの0始まり。URLは原典への参照であり、現行パッチでの追認ではない。全体の対象外判断は測定条件の混在を防ぐもので、現在値の訂正を意味しない。

| キャラ / 技ID                                                                    | 項目    | 変更前          | 変更後・判断         | 原典行 / 根拠                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | ------- | --------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| aki / aki__normal_5_K_M                                                          | total   | 25              | 対象外（現在値維持） | [44](https://wiki.supercombo.gg/w/Street_Fighter_6/A.K.I./Frame_data)：2 extra recovery frames on whiff                                                                                                                                             |
| aki / aki__normal_5_P_M                                                          | total   | 24              | 対象外（現在値維持） | [45](https://wiki.supercombo.gg/w/Street_Fighter_6/A.K.I./Frame_data)：2 extra recovery frames on whiff/block                                                                                                                                       |
| akuma / akuma__special_214_K_H                                                   | total   | 86              | 対象外（現在値維持） | [2](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：6f extra recovery on block/whiff                                                                                                                                               |
| akuma / akuma__special_214_K_OD                                                  | block   | -17             | 対象外（現在値維持） | [5](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：() refers to disadvantage when crouching on Block or Perfect Parry                                                                                                             |
| akuma / akuma__special_214_K_L                                                   | total   | 34              | 対象外（現在値維持） | [6](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：6f extra recovery on block/whiff                                                                                                                                               |
| akuma / akuma__special_214_P_OD                                                  | startup | 18              | 対象外（現在値維持） | [12](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：2f slower startup when canceled from 2MK to prevent it from comboing naturally                                                                                                |
| akuma / akuma__super_art_3_L, akuma__super_art_3_M, akuma__super_art_3_H         | startup | 8 / 8 / 8       | 対象外（現在値維持） | [15](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：only 2f startup when canceled from 623P/214P/214P~6P                                                                                                                          |
| akuma / akuma__super_art_3_L, akuma__super_art_3_M, akuma__super_art_3_H         | startup | 8 / 8 / 8       | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：only 2f startup when canceled from 623P/214P/214P~6P                                                                                                                          |
| akuma / akuma__normal_2_K_H                                                      | total   | 34              | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：6f extra recovery on block                                                                                                                                                    |
| akuma / akuma__normal_2_K_H                                                      | block   | -12             | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：on block, always plays out a fixed 29f recovery (cannot be made safer with meaty timing)                                                                                      |
| akuma / akuma__normal_2_P_M                                                      | total   | 22              | 対象外（現在値維持） | [42](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| akuma / akuma__normal_5_K_H                                                      | total   | 42              | 対象外（現在値維持） | [49](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：1f extra recovery when 2nd hit whiffs                                                                                                                                         |
| akuma / akuma__normal_5_P_M                                                      | total   | 20              | 対象外（現在値維持） | [55](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| akuma / akuma__special_623_P_H                                                   | block   | -36             | 対象外（現在値維持） | [58](https://wiki.supercombo.gg/w/Street_Fighter_6/Akuma/Frame_data)：3f worse on block and 100 less chip damage vs. crouching                                                                                                                      |
| alex / alex__normal_2_P_M                                                        | total   | 25              | 対象外（現在値維持） | [15](https://wiki.supercombo.gg/w/Street_Fighter_6/Alex/Frame_data)：4f extra recovery on whiff                                                                                                                                                     |
| alex / alex__normal_5_P_M                                                        | total   | 24              | 対象外（現在値維持） | [41](https://wiki.supercombo.gg/w/Street_Fighter_6/Alex/Frame_data)：1f extra recovery on block                                                                                                                                                     |
| arjun / arjun__special_236_P_H                                                   | total   | 50              | 対象外（現在値維持） | [9](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)：3f extra recovery on whiff                                                                                                                                                     |
| arjun / arjun__special_236_P_OD                                                  | total   | 45              | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)：3f extra recovery on whiff                                                                                                                                                    |
| arjun / arjun__normal_5_K_M                                                      | total   | 28              | 対象外（現在値維持） | [36](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)：2f less recovery on block                                                                                                                                                     |
| arjun / arjun__special_623_P_H                                                   | block   | +1              | 対象外（現在値維持） | [40](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)：the active frames end immediately on block/parry or when absorbed by armor followed by a fixed 23f recovery (cannot gain extra block advantage with meaty timing)             |
| arjun / arjun__special_623_P_OD                                                  | block   | +1              | 対象外（現在値維持） | [43](https://wiki.supercombo.gg/w/Street_Fighter_6/Arjun/Frame_data)：the active frames end immediately on block/parry or when absorbed by armor followed by a fixed 23f recovery (cannot gain extra block advantage with meaty timing)             |
| blanka / blanka__normal_2_K_M                                                    | total   | 26              | 対象外（現在値維持） | [19](https://wiki.supercombo.gg/w/Street_Fighter_6/Blanka/Frame_data)：2f extra recovery on block/whiff                                                                                                                                             |
| blanka / blanka__normal_5_K_H                                                    | total   | 33              | 対象外（現在値維持） | [29](https://wiki.supercombo.gg/w/Street_Fighter_6/Blanka/Frame_data)：3f less recovery on block                                                                                                                                                    |
| blanka / blanka__normal_5_K_M                                                    | total   | 27              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Blanka/Frame_data)：3f extra recovery on whiff                                                                                                                                                   |
| cammy / cammy__special_236_K_L                                                   | block   | -12             | -12~0                | [10](https://wiki.supercombo.gg/w/Street_Fighter_6/Cammy/Frame_data)：Can be spaced safely                                                                                                                                                          |
| cammy / cammy__special_236_K_M                                                   | block   | -14             | -14~0                | [11](https://wiki.supercombo.gg/w/Street_Fighter_6/Cammy/Frame_data)：Can be spaced safely                                                                                                                                                          |
| cammy / cammy__normal_2_P_M                                                      | total   | 23              | 対象外（現在値維持） | [36](https://wiki.supercombo.gg/w/Street_Fighter_6/Cammy/Frame_data)：3f extra recovery on whiff                                                                                                                                                    |
| cammy / cammy__normal_5_K_H                                                      | total   | 32              | 対象外（現在値維持） | [42](https://wiki.supercombo.gg/w/Street_Fighter_6/Cammy/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| chunli / chunli__special_214_K_H                                                 | total   | 50              | 対象外（現在値維持） | [2](https://wiki.supercombo.gg/w/Street_Fighter_6/Chun-Li/Frame_data)：2f extra recovery on whiff                                                                                                                                                   |
| cviper / cviper__normal_2_K_H                                                    | total   | 37              | 対象外（現在値維持） | [24](https://wiki.supercombo.gg/w/Street_Fighter_6/C.Viper/Frame_data)：4f extra recovery on block                                                                                                                                                  |
| cviper / cviper__normal_5_K_M                                                    | total   | 28              | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/C.Viper/Frame_data)：2f extra recovery on whiff                                                                                                                                                  |
| dee_jay / dee_jay__special_236_K_M                                               | block   | -6              | -6~-4                | [27](https://wiki.supercombo.gg/w/Street_Fighter_6/Dee_Jay/Frame_data)：can be spaced to be safe on block                                                                                                                                           |
| dee_jay / dee_jay__normal_2_P_M                                                  | total   | 23              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Dee_Jay/Frame_data)：1f extra recovery on whiff                                                                                                                                                  |
| dee_jay / dee_jay__normal_5_K_H                                                  | total   | 36              | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/Dee_Jay/Frame_data)：4f extra recovery on whiff                                                                                                                                                  |
| dhalsim / dhalsim__normal_2_P_H                                                  | total   | 42              | 対象外（現在値維持） | [18](https://wiki.supercombo.gg/w/Street_Fighter_6/Dhalsim/Frame_data)：4f extra recovery on whiff and Perfect Parry                                                                                                                                |
| dhalsim / dhalsim__special_63214_P_OD                                            | total   | 61              | 対象外（現在値維持） | [47](https://wiki.supercombo.gg/w/Street_Fighter_6/Dhalsim/Frame_data)：5f extra recovery on whiff/block                                                                                                                                            |
| e_honda / e_honda__normal_2_P_H                                                  | total   | 31              | 対象外（現在値維持） | [22](https://wiki.supercombo.gg/w/Street_Fighter_6/E.Honda/Frame_data)：2f extra recovery on whiff or if armor absorbed                                                                                                                             |
| e_honda / e_honda__normal_5_K_H                                                  | block   | -5              | 対象外（現在値維持） | [30](https://wiki.supercombo.gg/w/Street_Fighter_6/E.Honda/Frame_data)：2nd hit whiffs vs. crouching opponents unless they extend a vertical hurtbox                                                                                                |
| ed / ed__special_214_P_H                                                         | total   | 60              | 対象外（現在値維持） | [1](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)：3f extra recovery on block                                                                                                                                                        |
| ed / ed__special_214_P_M                                                         | total   | 52              | 対象外（現在値維持） | [3](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)：8f extra recovery on block                                                                                                                                                        |
| ed / ed__normal_2_K_M                                                            | total   | 26              | 対象外（現在値維持） | [24](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)：3f extra recovery on whiff and extends a wide hurtbox until the end of recovery                                                                                                  |
| ed / ed__normal_5_K_M                                                            | total   | 27              | 対象外（現在値維持） | [38](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)：4f extra recovery on whiff                                                                                                                                                       |
| elena / elena__normal_2_K_M                                                      | total   | 27              | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/Elena/Frame_data)：2f extra recovery on whiff/block                                                                                                                                              |
| elena / elena__normal_5_K_M                                                      | total   | 22              | 対象外（現在値維持） | [52](https://wiki.supercombo.gg/w/Street_Fighter_6/Elena/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| guile / guile__normal_2_P_M                                                      | total   | 21              | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Guile/Frame_data)：3f extra recovery on whiff                                                                                                                                                    |
| ingrid / ingrid__normal_2_P_M                                                    | total   | 22              | 対象外（現在値維持） | [35](https://wiki.supercombo.gg/w/Street_Fighter_6/Ingrid/Frame_data)：3f extra recovery on whiff                                                                                                                                                   |
| ingrid / ingrid__normal_5_P_H                                                    | total   | 34              | 対象外（現在値維持） | [46](https://wiki.supercombo.gg/w/Street_Fighter_6/Ingrid/Frame_data)：1f extra recovery on whiff and block                                                                                                                                         |
| jamie / jamie__normal_2_P_M                                                      | total   | 21              | 対象外（現在値維持） | [60](https://wiki.supercombo.gg/w/Street_Fighter_6/Jamie/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| jamie / jamie__normal_5_K_M                                                      | total   | 28              | 対象外（現在値維持） | [74](https://wiki.supercombo.gg/w/Street_Fighter_6/Jamie/Frame_data)：1f extra recovery on whiff                                                                                                                                                    |
| juri / juri__normal_2_P_M                                                        | total   | 23              | 対象外（現在値維持） | [29](https://wiki.supercombo.gg/w/Street_Fighter_6/Juri/Frame_data)：1f extra recovery on whiff and extends a wider hurtbox until the end of recovery                                                                                               |
| juri / juri__special_623_P_H                                                     | block   | -37             | 対象外（現在値維持） | [50](https://wiki.supercombo.gg/w/Street_Fighter_6/Juri/Frame_data)：Only 1 hit connects vs. crouch block (4f worse oB, less chip damage)                                                                                                           |
| ken / ken__special_214_K_H                                                       | block   | -12             | 対象外（現在値維持） | [1](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：2nd and 3rd hits whiff on crouching opponents (unsafe on crouching hit or block)                                                                                                 |
| ken / ken__normal_2_K_H                                                          | block   | -10             | 対象外（現在値維持） | [25](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：on block, always plays out a fixed 27f recovery (cannot be made safer with meaty timing)                                                                                        |
| ken / ken__normal_2_P_M                                                          | total   | 24              | 対象外（現在値維持） | [30](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：2f extra recovery on whiff and extends a wider hurtbox until the end of recovery                                                                                                |
| ken / ken__normal_5_K_H                                                          | total   | 38              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：2 extra recovery frames on whiff                                                                                                                                                |
| ken / ken__special_623_K_H                                                       | block   | 1               | 対象外（現在値維持） | [43](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：1f better hit/block advantage vs. crouching opponents                                                                                                                           |
| ken / ken__special_623_P_H                                                       | block   | -36             | 対象外（現在値維持） | [44](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：3rd hit whiffs vs. crouch block (2f worse advantage, 75 less chip dmg)                                                                                                          |
| ken / ken__special_623_K_OD                                                      | block   | -9              | 対象外（現在値維持） | [45](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：3f better hit/block advantage vs. crouching opponents (allows link into 2LP)                                                                                                    |
| ken / ken__special_623_K_M                                                       | block   | -8              | 対象外（現在値維持） | [48](https://wiki.supercombo.gg/w/Street_Fighter_6/Ken/Frame_data)：1f better hit/block advantage vs. crouching opponents                                                                                                                           |
| kimberly / kimberly__normal_2_P_M                                                | total   | 21              | 対象外（現在値維持） | [40](https://wiki.supercombo.gg/w/Street_Fighter_6/Kimberly/Frame_data)：2f extra recovery on whiff                                                                                                                                                 |
| luke / luke__normal_2_P_M                                                        | total   | 21              | 対象外（現在値維持） | [29](https://wiki.supercombo.gg/w/Street_Fighter_6/Luke/Frame_data)：3f extra recovery on whiff                                                                                                                                                     |
| luke / luke__normal_5_P_L                                                        | total   | 19              | 対象外（現在値維持） | [37](https://wiki.supercombo.gg/w/Street_Fighter_6/Luke/Frame_data)：3f extra recovery on whiff                                                                                                                                                     |
| luke / luke__normal_5_K_M                                                        | total   | 26              | 対象外（現在値維持） | [40](https://wiki.supercombo.gg/w/Street_Fighter_6/Luke/Frame_data)：3f extra recovery on whiff                                                                                                                                                     |
| m_bison / m_bison__special_214_P_L                                               | total   | 54              | 対象外（現在値維持） | [5](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：3f extra recovery on hit                                                                                                                                                     |
| m_bison / m_bison__special_214_P_M                                               | total   | 59              | 対象外（現在値維持） | [7](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：3f extra recovery on hit                                                                                                                                                     |
| m_bison / m_bison__super_art_3_L, m_bison__super_art_3_M, m_bison__super_art_3_H | startup | 10 / 10 / 10    | 対象外（現在値維持） | [12](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：only 5f startup when canceled from special moves                                                                                                                            |
| m_bison / m_bison__super_art_3_L, m_bison__super_art_3_M, m_bison__super_art_3_H | startup | 10 / 10 / 10    | 対象外（現在値維持） | [13](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：only 5f startup when canceled from special moves                                                                                                                            |
| m_bison / m_bison__special_236_K_H                                               | total   | 46              | 対象外（現在値維持） | [14](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：5f extra recovery on whiff                                                                                                                                                  |
| m_bison / m_bison__special_236_K_L                                               | total   | 37              | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：5f extra recovery on whiff                                                                                                                                                  |
| m_bison / m_bison__special_236_K_M                                               | total   | 41              | 対象外（現在値維持） | [17](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：5f extra recovery on whiff                                                                                                                                                  |
| m_bison / m_bison__normal_2_P_M                                                  | total   | 22              | 対象外（現在値維持） | [23](https://wiki.supercombo.gg/w/Street_Fighter_6/M.Bison/Frame_data)：3f extra recovery on whiff                                                                                                                                                  |
| mai / mai__super_art_3_L, mai__super_art_3_M, mai__super_art_3_H                 | startup | 10 / 10 / 10    | 対象外（現在値維持） | [0](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：3f startup when canceled from 236K/KK only                                                                                                                                       |
| mai / mai__super_art_3_L, mai__super_art_3_M, mai__super_art_3_H                 | startup | 10 / 10 / 10    | 対象外（現在値維持） | [1](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：3f startup when canceled from 236K/KK only                                                                                                                                       |
| mai / mai__super_art_2_L, mai__super_art_2_M, mai__super_art_2_H                 | total   | 68 / 68 / 68    | 対象外（現在値維持） | [10](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：11f extra recovery on block                                                                                                                                                     |
| mai / mai__normal_2_K_H                                                          | total   | 33              | 対象外（現在値維持） | [36](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：1f extra recovery on block                                                                                                                                                      |
| mai / mai__normal_2_P_M                                                          | total   | 24              | 対象外（現在値維持） | [41](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：2f extra recovery on whiff                                                                                                                                                      |
| mai / mai__normal_5_P_M                                                          | total   | 26              | 対象外（現在値維持） | [54](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：2f extra recovery on whiff                                                                                                                                                      |
| mai / mai__special_623_K_OD                                                      | total   | 57              | 対象外（現在値維持） | [59](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：7f extra landing recovery on block                                                                                                                                              |
| mai / mai__special_623_K_OD                                                      | block   | -40             | 対象外（現在値維持） | [59](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：second hit whiffs on crouch block resulting in worse block advantage and reduced chip/drive damage                                                                              |
| mai / mai__special_623_K_L                                                       | block   | -29             | 対象外（現在値維持） | [61](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：second hit whiffs on crouch block (except vs. Dee Jay/JP/Marisa/Sagat/Zangief) resulting in worse block advantage and reduced chip/drive damage                                 |
| mai / mai__special_623_K_M                                                       | block   | -28             | 対象外（現在値維持） | [63](https://wiki.supercombo.gg/w/Street_Fighter_6/Mai/Frame_data)：second hit whiffs on crouch block resulting in worse block advantage and reduced chip/drive damage                                                                              |
| manon / manon__normal_2_P_M                                                      | total   | 20              | 対象外（現在値維持） | [26](https://wiki.supercombo.gg/w/Street_Fighter_6/Manon/Frame_data)：4f extra recovery on whiff                                                                                                                                                    |
| manon / manon__normal_5_K_H                                                      | total   | 40              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Manon/Frame_data)：3f extra recovery on block/whiff                                                                                                                                              |
| marisa / marisa__normal_5_P_M                                                    | total   | 27              | 対象外（現在値維持） | [56](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)：2f extra recovery on whiff                                                                                                                                                   |
| marisa / marisa__special_623_P_H                                                 | block   | 3               | 対象外（現在値維持） | [61](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)：hits 1f later vs. crouching opponents                                                                                                                                        |
| marisa / marisa__special_623_P_L                                                 | block   | 3               | 対象外（現在値維持） | [62](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)：hits 1f later vs. crouching opponents                                                                                                                                        |
| marisa / marisa__special_623_P_M                                                 | block   | 3               | 対象外（現在値維持） | [63](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)：hits 1f later vs. crouching opponents                                                                                                                                        |
| marisa / marisa__special_623_P_OD                                                | block   | 4               | 対象外（現在値維持） | [64](https://wiki.supercombo.gg/w/Street_Fighter_6/Marisa/Frame_data)：hits 1f later vs. crouching opponents                                                                                                                                        |
| rashid / rashid__special_214_P_OD                                                | total   | 49              | 対象外（現在値維持） | [12](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：4f extra recovery on block                                                                                                                                                   |
| rashid / rashid__special_236_P_M                                                 | block   | -45             | 対象外（現在値維持） | [26](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：4f worse advantage and 1 less hit when crouch blocked                                                                                                                        |
| rashid / rashid__special_236_P_OD                                                | total   | 110             | 対象外（現在値維持） | [28](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：Shorter animation with less landing recovery on block only                                                                                                                   |
| rashid / rashid__normal_2_K_H                                                    | total   | 35              | 対象外（現在値維持） | [32](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：4f extra recovery on block                                                                                                                                                   |
| rashid / rashid__normal_2_K_H                                                    | block   | -11             | 対象外（現在値維持） | [32](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：disadvantage on block is fixed regardless of which active frame connects (cannot make it safer when meaty)                                                                   |
| rashid / rashid__normal_2_P_H                                                    | total   | 35              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：2 extra recovery frames on whiff                                                                                                                                             |
| rashid / rashid__normal_5_K_M                                                    | total   | 27              | 対象外（現在値維持） | [44](https://wiki.supercombo.gg/w/Street_Fighter_6/Rashid/Frame_data)：2 extra recovery frames on whiff                                                                                                                                             |
| ryu / ryu__super_art_3_L, ryu__super_art_3_M, ryu__super_art_3_H                 | startup | 5 / 5 / 5       | 対象外（現在値維持） | [15](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：starts up faster only when canceled from HP Shoryuken                                                                                                                           |
| ryu / ryu__super_art_3_L, ryu__super_art_3_M, ryu__super_art_3_H                 | block   | -50 / -50 / -50 | 対象外（現在値維持） | [15](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：More hits connect on block vs. tall standing characters (these extra hits do not deal any additional Drive Damage on block)                                                     |
| ryu / ryu__super_art_3_L, ryu__super_art_3_M, ryu__super_art_3_H                 | startup | 5 / 5 / 5       | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：starts up faster only when canceled from HP Shoryuken                                                                                                                           |
| ryu / ryu__super_art_3_L, ryu__super_art_3_M, ryu__super_art_3_H                 | block   | -50 / -50 / -50 | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：More hits connect on block vs. tall standing characters (these extra hits do not deal any additional Drive Damage on block)                                                     |
| ryu / ryu__special_236_K_M                                                       | total   | 45              | 対象外（現在値維持） | [24](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：3 extra recovery frames on whiff                                                                                                                                                |
| ryu / ryu__normal_2_K_H                                                          | block   | -12             | 対象外（現在値維持） | [27](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：on block, always plays out a fixed 29f recovery (cannot be made safer with meaty timing)                                                                                        |
| ryu / ryu__normal_2_P_M                                                          | total   | 22              | 対象外（現在値維持） | [32](https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data)：2f extra recovery on whiff                                                                                                                                                      |
| sagat / sagat__super_art_3_L, sagat__super_art_3_M, sagat__super_art_3_H         | startup | 12 / 12 / 12    | 対象外（現在値維持） | [15](https://wiki.supercombo.gg/w/Street_Fighter_6/Sagat/Frame_data)：only 2f startup when canceled from Tiger Uppercut                                                                                                                             |
| sagat / sagat__super_art_3_L, sagat__super_art_3_M, sagat__super_art_3_H         | startup | 12 / 12 / 12    | 対象外（現在値維持） | [16](https://wiki.supercombo.gg/w/Street_Fighter_6/Sagat/Frame_data)：only 2f startup when canceled from Tiger Uppercut                                                                                                                             |
| sagat / sagat__normal_5_K_H                                                      | total   | 36              | 対象外（現在値維持） | [38](https://wiki.supercombo.gg/w/Street_Fighter_6/Sagat/Frame_data)：4f extra recovery if both hits whiff                                                                                                                                          |
| sagat / sagat__normal_5_K_H                                                      | block   | -5              | 対象外（現在値維持） | [38](https://wiki.supercombo.gg/w/Street_Fighter_6/Sagat/Frame_data)：2nd hit whiffs on crouching opponents (2f worse on block)                                                                                                                     |
| sagat / sagat__normal_5_K_L                                                      | total   | 23              | 対象外（現在値維持） | [41](https://wiki.supercombo.gg/w/Street_Fighter_6/Sagat/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| terry / terry__special_214_P_H                                                   | block   | -8              | -8~+5                | [4](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：can be spaced to be plus on block from farther ranges (causing a screen shake)                                                                                                 |
| terry / terry__special_214_P_M                                                   | block   | -6              | -6~+2                | [10](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：can be spaced to be plus on block from farther ranges (causing a screen shake)                                                                                                |
| terry / terry__super_art_3_L, terry__super_art_3_M, terry__super_art_3_H         | startup | 8 / 8 / 8       | 対象外（現在値維持） | [13](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：faster 2f startup when canceled from Rising Tackle, Quick Burn, or Burning Knuckle                                                                                            |
| terry / terry__super_art_3_L, terry__super_art_3_M, terry__super_art_3_H         | block   | -50 / -50 / -50 | 対象外（現在値維持） | [13](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：final hit whiffs on crouch block (reduced chip and Drive damage)                                                                                                              |
| terry / terry__super_art_3_L, terry__super_art_3_M, terry__super_art_3_H         | startup | 8 / 8 / 8       | 対象外（現在値維持） | [14](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：faster 2f startup when canceled from Rising Tackle, Quick Burn, or Burning Knuckle                                                                                            |
| terry / terry__super_art_3_L, terry__super_art_3_M, terry__super_art_3_H         | block   | -50 / -50 / -50 | 対象外（現在値維持） | [14](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：final hit whiffs on crouch block (reduced chip and Drive damage)                                                                                                              |
| terry / terry__normal_2_P_H                                                      | total   | 35              | 対象外（現在値維持） | [24](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：if the attack connects on the first 2 active frames, it has 2 fewer active and recovery frames (meaty timing can be up to 2f worse on hit/block if 3rd active frame connects) |
| terry / terry__normal_2_P_M                                                      | total   | 22              | 対象外（現在値維持） | [29](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：2f extra recovery on whiff                                                                                                                                                    |
| terry / terry__normal_5_P_H                                                      | total   | 30              | 対象外（現在値維持） | [33](https://wiki.supercombo.gg/w/Street_Fighter_6/Terry/Frame_data)：2f less recovery on block                                                                                                                                                     |
| yasmine / yasmine__normal_2_P_M                                                  | total   | 24              | 対象外（現在値維持） | [35](https://wiki.supercombo.gg/w/Street_Fighter_6/Yasmine/Frame_data)：2f less recovery on block compared to on hit                                                                                                                                |
| yasmine / yasmine__normal_5_P_L                                                  | total   | 14              | 対象外（現在値維持） | [42](https://wiki.supercombo.gg/w/Street_Fighter_6/Yasmine/Frame_data)：1f extra recovery on whiff                                                                                                                                                  |
| zangief / zangief__normal_2_P_L                                                  | startup | 6               | 対象外（現在値維持） | [11](https://wiki.supercombo.gg/w/Street_Fighter_6/Zangief/Frame_data)：3f startup when chained into                                                                                                                                                |
| zangief / zangief__normal_5_P_L                                                  | startup | 7               | 対象外（現在値維持） | [28](https://wiki.supercombo.gg/w/Street_Fighter_6/Zangief/Frame_data)：4f startup when chained into                                                                                                                                                |

### 追加Web確認と制約

SuperComboのEdページは403 Forbidden、Cammy/Frame_dataはAnubis Access Denied（確認日2026-11-09）。現行値・注記・対象パッチを読めず、保存値との数値比較は未実施。検索に出た二次資料は採用根拠に使わなかった。今回の5採用と115対象外は既存保存Cargoだけで判断した。外部確認URLと結果は台帳のexternalChecksへ保存。

### 残る保留と次回方針

- 優先1（C）：A.K.I./Ed SA2ガード。L/M/Hそれぞれを固定した距離別表・動画測定が必要。共通の-19~ / +65~を各強度内の変動とする証拠は未取得。
- 優先1（C）：ベガ通常[2]8K発生。軌道が異なる各強度を別々に測定した近/中/遠距離表が必要。18~46の強度横断範囲を転用しない。
- 優先2（C）：A.K.I.236HK/KK発生・全体。表側/裏回り、43F裏回りの例外を区別した空振り全体と移動発生欄の定義が必要。
- 優先2（C）：Arjun236Pの括弧硬直差、Blanka63214Kの接触ヒット、Honda5HPの発生と硬直差、Zangief63214K(Far)の括弧。既存代表条件内の端点か、姿勢・接触段数・別条件かを明示する技解説を先に確認する。
- D：Ken5HP、Blanka5HK、Cammy2HP/5MP、JP22P/22PP等。現在の強度・状態と立ち相手を固定し、最初/最後の接触フレームで通常ヒット/ガードを測る。弾は近/中/遠距離別。公開の同条件測定表が得られれば実機測定に代用できる。差分から端点は計算しない。
- 各180項目の具体的な不足条件と次の確認事項はreevaluation.nextEvidenceおよびheld-range-review.jsonに保存。Cは技別の条件資料、Dは同条件の端点測定を優先する。

### 今回の検証

typecheck、アプリ143テスト、データ16テスト、data:plan/data:check、validate:data、coverage、SA・共通強度・代表条件監査、format:check、buildを実施。履歴依存テストは維持。追加テストで全300件の分類・出典・状態、本番737件の集計、既存75判断の不変、採用以外の値の不変、調査台帳再生成の安定性を検査。既存の全件差分検査でも95フィールド以外を保護する。

PC/320pxの技一覧で今回のCammy/Terryの符号付き範囲を確認。入力UI・ゲームルールは変更していない。commit・push・デプロイは行わない。
