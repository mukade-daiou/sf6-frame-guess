# 公式フレームデータ再照合・検証状況

現行datasetIdは`hooligan-no-input-startup-2026-11-14-r1`。フーリガン発生4欄を50Fへ変更後、保存公式の比較器で再計算し、1278技・5112欄、一致4459／不一致61／条件違い42／確認不能550は不変。対象パッチUNVERIFIED。以下のdatasetIdは過去の段階。

最新datasetIdは`automatic-no-input-startup-2026-11-14-r1`。百鬼襲の発生5欄を53Fへ復元後、保存公式の比較器を現行データで再実行した。1278技・5112欄、一致4459／不一致61／条件違い42／確認不能550で件数不変。対象パッチUNVERIFIEDも維持。以下のdatasetIdは各段階の履歴。

現行datasetIdは`nonattacking-parent-startup-2026-11-14-r1`。非攻撃の派生親技の発生48欄を「なし」に変更したが、いずれも保存公式の発生数値が空欄の確認不能欄で、採用1278・比較5112欄と各分類件数は不変。現行値と旧分類の対応は[台帳のparentStartupRule.currentComparison](../staging/official-reevaluation/remaining-screen.json)に記録する。以下のdatasetIdと判断は除外時点の履歴。

現行datasetIdは `dark-ingrid-exclusion-2026-11-14-r1`。32キャラ・1298レコードのうち採用1278レコード、比較5112フィールド、一致4459・不一致61・条件違い42・確認不能550。公式資料の対象パッチはUNVERIFIED。全体Fは原則として通常条件の空振り時を採用する。

Dark Ingrid限定の214214Kは共通元とL/M/Hの4レコードを非採用化した。[除外前の保存照合](../staging/official-reevaluation/results-after-risk-fixes.json)を履歴として保持し、現行の採用IDと全値を照合して除外16欄（すべて確認不能）だけを比較母数から除いた。ほかの分類は変更せず、再取得や数値の再解釈はしていない。現行集計・根拠・対象IDは[既存台帳のdarkIngridExclusion](../staging/official-reevaluation/remaining-screen.json)に記録する。

確認不能の出題リスク監査後、空振り全体Fの18フィールドを修正し、特殊状態限定のベガPsycho Burstを採用対象外とした。エド弱・中サイコフリッカーの空振り全体は、ユーザーのゲーム内確認により現行45F・49Fを維持する。測定時のゲーム版・相手・距離・ホールド条件は未報告であり、原典の括弧内43F・48Fとの差の原因は未確定。[監査記録](../staging/official-reevaluation/remaining-screen.json)

以下は各段階の判断・比較結果の履歴であり、当時のdatasetId・件数・現行値は上記の最新結果と区別する。

## 過去のユーザーによるゲーム内確認の反映

ユーザー確認によりリュウ通常強昇龍拳block `-39→-36`、アレックス立ち中Pの空振りtotal `24→27`を個別判断として適用した。アレックスのCargo `24(25/27)` と備考の空振り追加2Fは内部矛盾が残り、27Fの採用根拠はユーザー確認である。ヤスミン中タリムhit `+2`、ラシードODスピニング・ミキサーblock `-53`はユーザー確認により維持する。確認時のゲーム版・相手・距離・接触段は未報告で、保存公式との版差や誤記を推定しない。公式資料の対象パッチはUNVERIFIED。

アルジュン強・ODの空振りtotal `50→53`・`45→48`と合わせ、基準commit `148d6dabf0792b4477051a3f9034a6007b075ed3` の1298レコードから本番の差分はこの4フィールドのみ。新datasetIdは `user-verified-frames-2026-11-11-r1`。各旧値・入力・根拠は `data/adoption-decisions.json` に保存し、生成・履歴投影で検証する。

保存済み公式比較処理を一時コピーで再実行した [結果](../staging/official-reevaluation/results-after-user-verification.json) は、一致4459・不一致61・条件違い42・確認不能570（1283技・5132フィールド、公式対応未確定5技）。基準の保存結果とフィールドごとに照合すると、アレックスtotalとリュウblockの2件だけが不一致から一致へ移行した。アルジュンの2件、ヤスミン、ラシードは公式不一致のままで、公式が誤り・旧版であるとは断定しない。ユーザー確認を追記した [出題リスク台帳](../staging/official-reevaluation/play-risk-audit.json) は旧63件を歴史的対象として保持する。

当時の優先事項は、測定条件・版を明示したうえで残る不一致61件から通常技・ガード値を確認すること。以下も過去の集計・判断履歴。

## 出題リスクに基づく63フィールドの優先調査

基準commit `148d6dabf0792b4477051a3f9034a6007b075ed3` からの不一致63件を現行技ID・フィールド・値と照合し、重複なしを確認した。優先度は高17・中25・低21。1F差を一律に低くせず、頻用技や通常条件のヒット・ガード・発生を優先した。全63件の入力・現行値・公式値・優先理由・旧根拠は [出題リスク台帳](../staging/official-reevaluation/play-risk-audit.json) に保存する。

高17フィールドについてraw・Cargo・公式対応行と現在の入力・状態を再照合し、修正確定2・現状維持確定0・保留15。中低46件は前回の保留を引き継ぎ、今回の詳細検証対象外である。各結果の区別は台帳の `detailed` に残す。

アルジュンの強・OD大義の巨腕は保存Cargo `50(53)`・`45(48)`、各備考に空振り時3F追加と明記。rawの括弧外50・45をそのまま空振り全体にした現行採用が空振り全体F規則に反するため、保存原典に対して50→53F、45→48Fを採用した。原典の修正と、公式値56・51の現行パッチでの正確性は独立であり、後者は未検証。修正後も公式値との差は各3Fで残る。`whiffTotalCorrections.additionalDecisions` に旧値・原典・公式行・条件を保存し、既存53件の基準を保持する。

比較結果は保存済み結果に変更2件を反映した差分集計で、一致4457・不一致63・条件違い42・確認不能570。不一致2件は修正後も公式値と異なる。比較処理の全件再実行や現行パッチでの検証ではない。

特に違和感が出やすい例はアレックス立ち中Pの空振り全体24対公式27（原典表24(25/27)と備考+2が矛盾し、26か27か未確定）、リュウ強昇龍拳のガード-39対-36、ラシードODスピニング・ミキサーのガード-53対-42、ヤスミン中タリム・ン・ハンギンのhit +2対D。後者は自動派生完走と初段の定義が未確定。ザンギエフのツンドラストームは発生6対公式5で、当身受付と公式定義・版の対応が不明。公式欄の数値をそのまま置換しない。

外部確認では公式FRAME DATA・変更履歴・SuperComboは403で取得できなかった。公開二次資料の [リュウ623HPを-39とする表](https://robkof.com/sf6-frame-data/?character=ryu) と [-36とする表](https://dood.gg/ko/%EC%8A%A4%ED%8A%B8%EB%A6%AC%ED%8A%B8%20%ED%8C%8C%EC%9D%B4%ED%84%B0%206/ryu/frames/) は、いずれも取得時点の表示であり、保存公式の対象版や相互の出典独立性を確認できない。[アレックスの表](https://shoryu.site/character/alex) は保存原典と同じ24(25/27)・空振り+2の矛盾を再掲し、独立測定とは扱えない。取得日時と対象パッチは区別し、UNVERIFIEDを維持する。

条件違い42件は既存分類を軽く確認した。百鬼襲開始からの53Fと派生単体8F、JPヴィーハトの設置と自動攻撃、当身後反撃などは比較指標が異なり、表示上は元動作・派生・成立条件を利用者が区別しにくい可能性がある。今回42件を個別再調査していない。Normalでは全体・hit・blockも表示し、Hardでは発生のみを表示するため、ツンドラストームの発生は両方に影響する。

追加調査は、ゲーム内フレームメーターで版・通常体格・距離・接触段・ホールド条件を固定し、アレックス5MP空振り、リュウ強昇龍拳ガード、ヤスミン中タリム完走を優先する価値がある。未詳細46件と公式空欄の判断不能55件には今回新しい結論を付けていない。以下は過去の集計履歴。

## 空中KD・アーマー受付の採用と55件の確認

ユーザー指定によりエド強サイコフリッカーの通常空中hitを `+51`→`D` とした。Cargo行8 `KD +51(+63)` と空中専用の備考、公式row 51の地上に当たらない注記を照合。公式ヒット欄は空欄。マリーザのスクトゥムは、Cargoの構え本体行3・5と自動反撃の別行4・6を区別し、公式row 69・71のアーマー受付開始を採用した。通常元技とL/M/Hは `-`→3F、ODは `-`→1F。アーマー受付を攻撃発生や無敵開始と混ぜない。採用判断、生成、履歴投影に統合しdatasetIdは `airborne-kd-scutum-2026-11-11-r1`。公式対象パッチはUNVERIFIED。

前回の「比較処理の問題」6件はサンフレア1件・スクトゥム5件。いずれも公式の通常発生欄が空で、備考に成立時点がある。通常欄の比較を確認不能にする処理は意図どおりであり、実装上の誤りは確定していない。今回は公式未掲載に分類し、数値一致扱いへ変更せず、比較処理も修正していない。エドhitも公式欄空欄として公式未掲載に分類する。

空欄408件の最新分類は該当なし253・指標の違い79・公式未掲載21・比較処理の問題0・判断不能55。残55件については既存台帳の技群別の根拠と不足情報を再確認したが、実験や新しい版情報は得られていない。追加で確定できる誤変換は見つからず、残件は保留する。値が異なる可能性のあるものは空中・多段接触、当身後派生、設置後の攻撃、主要機能の成立時点を個別に確認する必要がある。[個別台帳](../staging/official-reevaluation/blank-fields-audit.json)の分類は公式との比較結果と独立し、以前の比較集計を上書きしない。以下は各時点の履歴。

## 空欄・Cargo対応の追加確認

ジェイミーCargo[66]の `4PPPKKK` と保存raw[66]の `5PPPKKK` は入力が食い違うが、raw技名 `Back Taunt`、発言全文、全体608Fが一致する。入力矛盾は未解決として残し、挑発は本番収録対象外と分類した。Cargo `total` 115行の分類は採用済み3・非採用1・対象外111・対応不明0。採用済みは蛇軽功3件で、発生欄の誤流用は修正済み。[台帳](../staging/official-reevaluation/cargo-total-startup-audit.json)に同じ根拠と入力差を保存した。

空欄408件の最新分類は該当なし253・指標の違い80・公式未掲載14・比較処理の問題6・判断不能55。前回の判断不能69件から14件が分類された。**残55件の詳細調査は未完了。** 公式の対象パッチはUNVERIFIED。

未適用の追加修正候補は次のとおり。

- エド強サイコフリッカーhit `+51`：Cargo `KD +51(+63)` のKD後有利Fが数値化されている。候補はD。ただし空中専用技の代表条件は要確認。1本番フィールド。
- マリーザのスクトゥムstartup `-`：公式備考は通常3–28Fの上半身アーマー受付とOD1–28Fの全身アーマー受付、成立時の自動反撃を記載。主要機能の成立時点として通常3F（元技・L/M/H計4フィールド）とOD1F（1フィールド）が候補。アーマーを無敵と混同せず、一般的な当身受付との扱いを個別確認する。

サンフレア47F、蛇軽功4強度、SA3六件は変更せず保持する。次は残55件を原典の通常条件・派生条件に沿って照合し、エド空中専用技のヒット表現とマリーザのアーマー成立を代表発生とするか判断する。以下は過去の集計履歴。

## 空欄75件の追加照合（継続）

前回の指示を引き継ぎ、保存Cargo・raw・公式行を元技単位で追加点検した。408件の分類は該当なし253・指標の違い80・公式未掲載14・比較処理の問題1・判断不能60。前回の判断不能69件から9件が進んだ。**残60件の詳細調査は未完了。**

エド強サイコフリッカー `ed__special_236_K_H` はCargo行8のhit `KD +51(+63)` に対し本番hit `+51`。KD後の有利Fを通常ヒット硬直差として保存した疑いがあり、`D`への修正候補1フィールド。ただし地上の相手には当たらず、空中の相手の接触高さで値が変動する。通常地上相手を原則とするゲームの代表条件で空中専用技をどう表示するかの確認が必要。blockは地上ガードできないため該当なしに分類した。今回値は変更していない。

ダルシム通常SA2のL/M/Hは共通Cargo原典のKDとガード-4を本番に保持し、公式の対応行は両欄が空欄のため公式未掲載6フィールド。ガイル強SA1も原典KDをDとして保持する一方、公式ヒット欄は空欄のため公式未掲載1フィールド。これらは現在値が現行パッチで検証済みという意味ではない。残りについては、技群ごとの通常ヒット・多段接触・当身と派生・主要機能の成立時点を区別し、不足根拠を [台帳](../staging/official-reevaluation/blank-fields-audit.json) に追記した。

Cargo `total` 115行の状態は前節の分類を維持。今後は残る60フィールドの条件照合と、ジェイミー `4PPPKKK` の保存raw行との対応、エド空中専用技のD表現を優先する。公式対象パッチは引き続きUNVERIFIED。以下の調査結果は各時点の履歴。

## サンフレア47FとCargo未対応行の再調査（進行中）

弱サンフレア `ingrid__coverage_6` の発生を `-`→47Fに変更した。保存Cargo `214LP (HOLD OK)` の非ホールドLv1と公式row 36備考は、いずれも47F目のストック増加と全体48Fを示す。ストック最大時はゲージ増加へ変わる。公式発生欄は空欄のまま、備考が47Fを示すことを区別する。保存済み比較の一致件数を増やしていない。採用判断・生成・履歴投影に統合しdatasetIdを `sun-flare-effect-2026-11-11-r1` とした。公式パッチはUNVERIFIED。

Cargo発生欄にtotalを含む115行を再分類した。採用済み技と対応3（蛇軽功弱・中・強、修正済み）、非採用技と対応1（ラシード6KK）、収録対象外110、対応不明1。対象外の内訳は保存rawの同じ入力がtauntの106行と、raw技名・入力を確認したブランカ3ボタンホップ2行、JPホールドフェイント、ラシード派生の計4行。これら4行は採用規則§2の3ボタン・ホールド・派生を原則対象外とする条件と照合した。対応不明はジェイミー `4PPPKKK` で、rawに同じ入力がなく同一行を確定できていない。詳細と候補のraw参照は [Cargo台帳](../staging/official-reevaluation/cargo-total-startup-audit.json)。本番の入力文字列の一致だけを根拠に新たな数値を変更していない。

公式欄空白408件は、最新で該当なし252・指標の違い79・公式未掲載7・比較処理の問題1・判断不能69。前回判断不能75件のうち6件は、通常ガード不能の毒溜まり1件と通常コマンド投げのヒットを公式欄に掲載していないJPの5件として分類した。**残69件の詳細照合は未完了**。[個別台帳](../staging/official-reevaluation/blank-fields-audit.json)に元技、展開先、現行値、保存行を保持する。

サンフレア以外で新たに確定した修正値はない。優先順位は、Cargoの対応不明1行の原典対応を確認し、空欄69件について原典の通常ヒット・多段・当身・SA派生を元技単位で照合すること。非攻撃の入力受付開始は主要機能の場合のみ採用可能、当身受付開始は採用可能、無敵開始は原則採用しないというユーザー指定を適用する。どの入力受付が主要機能かは個別証拠が必要。以下の集計は過去時点の履歴。

## 蛇軽功の中・強・OD追加修正と空欄101件の調査（進行中）

蛇軽功の中39→`-`、強43→`-`、OD42→`-`を採用判断から再生成した。中・強はCargo発生欄に `39 total`・`43(50~54) total` と明記。ODの `42(48~57)` には `total` の語がないが、同じCargo行の備考に「同じ側に移動する版の動作全体42F」と明記され、公式row 47も全体42F。いずれも別の効果成立時点は確認できなかった。全体Fは弱37・中39・強43・OD42を維持し、弱の以前の修正とSA3六件も維持する。新datasetIdは `snake-step-all-strengths-2026-11-11-r1`。公式対象パッチはUNVERIFIED。

保存Cargoの発生欄に `total` を含む115行を [台帳](../staging/official-reevaluation/cargo-total-startup-audit.json) に抽出した。本番 `upstreamInput` と完全一致した4行は蛇軽功3行とラシード6KKの非採用1行。残111行は入力注記の完全一致がなく、挑発・派生・状態等の存在を含め**未採用と断定できない**。個別対応付けは未完了。OD蛇軽功はstartup文字列自体に `total` を含まないため別途備考で検証した。

弱サンフレア `ingrid__coverage_6` のCargoは `214LP (HOLD OK)`、備考にLv.1非ホールド時は全体48F・47F目ストック増加、ホールド継続時は42F目と明記。公式row 36も47F目に1ストック増加、全体48F、ホールド時の延長を記載。通常の非ホールド・ストック未満条件では47Fを効果成立時点として採用可能な候補1フィールド。ストック最大時はゲージ増加に変わる。公式の対象版は未確認であり、今回は本番値を変えていない。

前回の判断不能101フィールドのうち、人形設置と消失・再出現、投げのガード不能、通常KDの公式欄空欄を確認した26件の分類を進めた。408件の最新分類は該当なし251、指標の違い79、公式未掲載2、比較処理の問題1、判断不能75。前回分類済みの蛇軽功3件は、修正に伴い指標の違いから該当なしへ更新した。**残75件の詳細調査は未完了**。[408件の台帳](../staging/official-reevaluation/blank-fields-audit.json)に個別の公式行と値を保持する。

優先事項は残75件の原典・通常条件の個別照合、Cargo `total` 未対応111行の採用状態と同一技の対応付け、サンフレア47Fの候補判断。入力受付開始を状態成立として出題するか、当身や無敵の成立時点を発生とするかは、代表指標について手動判断が必要。前の調査は以下に履歴として残す。

## 弱蛇軽功の修正と空欄247件の追加調査（途中）

ユーザー確認と保存Cargo `236LK: startup 37 total / total 37`、raw `aki__236lk` startup 37、公式row 44 発生空欄・硬直欄「全体 37」を照合。rawの数値37が生成へ引き継がれたが、Cargoからrawへ変換したコード・時点は未特定。効果成立時点を示す独立根拠がないため発生37→`-`、全体37は維持した。`compoundStartup.indicatorDecisions` に原典・旧値・新値を保存し、生成と履歴投影で検査する。非攻撃一般を出題対象外にする判断ではない。

中・強蛇軽功もCargo発生欄が `39 total`・`43(50~54) total` で本番発生39・43。OD本番42も全体42と一致し、公式発生欄は空欄。中・強は全体時間の流用が疑われ、ODも原典と成立時点を追加精査する必要がある。**候補3フィールドは変更していない。** A.K.I.以外については全Cargoの `total` を含む発生欄を検索したが、挑発など対象外条件も混在するため一律に修正候補としない。該当技・入力・採用状態の個別対応付けは未完了。

前回判断不能247件から、保存rawの投げ・移動・派生の記述と公式欄を用い146件の分類を進めた。408件の最新分類は該当なし224・指標の違い82・公式未掲載0・比較処理の問題1・判断不能101。弱蛇軽功1件は修正に伴い指標の違いから該当なしへ移した。**残101件の詳細確認は未完了**であり、0件の分類は存在しないとの証明ではない。イングリッド弱サンフレアは公式欄が空でも備考に47F目のストック増加が明記され、比較処理が備考中の成立時刻を拾えない候補1件として記録する。値の採用は別途判断する。個別結果と従前の比較値は [台帳](../staging/official-reevaluation/blank-fields-audit.json) に保持する。

入力受付時点を非攻撃技の効果・状態成立時点として採用できるか、蛇軽功中・強・ODの代表発生をどう表現するかは追加根拠またはユーザー判断が必要。残101件を元技単位で照合し、発生欄の `total` 検索結果を採用済み技へ対応付けることを優先する。ディージェイしゃがみ中KのDとSA3六件は保持する。以下の数値は各時点の履歴。

## SA3の指定修正と空欄308件の追加調査（進行中）

ユーザー指定に基づき、リリー通常SA3 L/M/Hを5→7F、マノン通常SA3 L/M/Hを6→7Fへ修正した。各共通原典行と公式7Fを確認し、`compoundStartup.saDecisions` に6個別IDを保持する。公式対象パッチはUNVERIFIED。固定基準commitとの1298レコード比較で承認された6 startup以外の本番差分がないことを検査した。

保存済み比較結果に対して対象6件の旧不一致・公式7F・現行値を検証し一致へ更新した [結果](../staging/official-reevaluation/results-after-sa3.json) は、一致4457、不一致63、条件違い42、確認不能570。全キャラの原典再取得や比較処理の再実行は行っていない。

空欄408件は現時点で該当なし120、指標の違い41、公式未掲載0、比較処理の問題0、判断不能247。前回判断不能308件から61件を投げ・構え・非攻撃成立などとして分類した。**残る247件の詳細調査は未完了**。0件の分類は不在の証明ではない。非攻撃でも効果・状態変化の成立時点は採用可能という指定により、非攻撃そのものを削除理由にはしない。分類と原典欄は [台帳](../staging/official-reevaluation/blank-fields-audit.json) に保持する。

ディージェイしゃがみ中Kはユーザー指定により通常KD、PC時HKDとして `D` を維持する。前回の通常KD疑いは撤回する。A.K.I.蛇軽功の弱37Fは公式全体37Fと同じで、成立時点ではなく全体F流用の疑いが残る。ブランカちゃん爆弾39Fは出現指標と攻撃成立の違いを分ける必要があるが、SA3以外の本番値は今回修正していない。残りの優先順位は、通常値の意味と出題条件の点検、未処理247件の元技別の原典照合、公式行対応と非掲載の分離である。

以下の集計・疑いは各時点の履歴。

## 公式欄の空欄・ダッシュ408件の調査（暫定）

照合結果の408フィールドすべてについて、技ID・現行値・対応公式行の空欄を機械照合し、[個別台帳](../staging/official-reevaluation/blank-fields-audit.json)に保存した。分類は該当なし68、指標の違い32、公式未掲載0、比較処理の問題0、判断不能308。合計408、重複なし。**308件は行照合のみで元技ごとの意味の詳細調査が未完了**であり、公式未掲載・比較処理の問題が存在しないと結論した数ではない。

例として、A.K.I.蛇軽功の弱37Fは公式の全体37Fと対応し、攻撃発生ではない。ディージェイ弱ジャックナイフマキシマム23Fは保存rawに空中通常技を最速で出せる時刻とある。春麗の行雲流水14F、リュウの電刃錬気50F、ブランカちゃん爆弾39F、非攻撃発動SAの1Fも攻撃発生とは指標が異なり、ゲームの発生F出題上の扱いを点検する必要がある。強度展開先の各件を台帳に記録している。これらは現行仕様・採用判断を変更する結論ではない。

該当なしの例は非攻撃の構え・移動技のhit/block、および投げ技のblock。ディージェイしゃがみ中Kのhitは本番Dだが原典備考に「PC時のみHKD」とあり、通常ヒットの原典欄と採用判断の再照合を最優先する。ザンギエフSA2の空欄はホールド・別行との対応を調べる必要があり、比較処理の不具合とは未確定。

次は(1) 通常hitとPCの区別、(2) 数値を攻撃発生として出題している非攻撃動作の代表指標、(3) 判断不能308件を元技単位に整理し投げ・派生・公式未掲載・行対応の確認、の順に調査する。公式の空欄だけでは値の削除や該当なしを確定しない。本番値・採用判断・比較処理は変更していない。

## 保留69フィールドの再評価と完了基準（2026-11-11）

基準はcommit `1e36836adab07b17f5462cf0f5dd35b8b4cd86a6`、datasetId `additional-kd-corrections-2026-11-11-r1`。今回の追加点検では **A 0・B 69・C 0、未処理0**。total 39・hit 4・block 19・startup 7を既存台帳と照合結果から集合比較し、重複・欠落なしを確認した。全件で実保存raw ID、Cargo入力、公式行名、現行値を再照合した。新しい数値を確定する独立証拠は得られず、追加修正対象は0フィールド。Bは「調査で正確性を確認した値」ではない。

個別の対応行、入力、強度展開元、原典全文、追加点検結果、不足根拠は [再評価台帳](../staging/official-reevaluation/pending-reevaluation.json) に保存した。以前の台帳は上書きしていない。[整合性検査・台帳生成](../staging/official-reevaluation/review-pending.mjs) は保存資料だけを読み、対象集合69件、現行旧値、5132フィールド、非採用15件、本番・生成・監査の無変更を検査する。GUI・原典再取得・現行ゲームでの実測は実施していない。

### 対象版の調査

公式取得日は2026-11-10。保存sourcesの版はUNVERIFIED、既存version-evidenceの「2026.10.13 update」は更新履歴の選択日付であり保存FRAME DATAの対象版を特定しない。今回 [公式FRAME DATA](https://www.streetfighter.com/6/ja-jp/character/ryu/frame)、[公式変更履歴](https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261013)、[更新告知](https://www.streetfighter.com/6/buckler/ja-jp/information/detail/update20261013) は403。SuperCombo GlossaryはAnubisにより拒否された。具体的なSA表記・電撃・暗転定義の検索も利用可能な一次資料を得られなかった。アクセス制限は回避していない。[取得結果](../staging/official-reevaluation/patch-review.json) に記録した。

公式対象版、現行ゲーム版、SuperCombo対象版はいずれもUNVERIFIEDを維持する。CargoのretrievedAt、本番source.retrievedAtは取得時刻でありWiki編集時刻でも対象ゲーム版でもない。Wikiページ履歴の更新時刻と、版明示の過去表との独立比較は未確認。検索に現れた二次情報や数値の一致を版の証明には使っていない。

### 採用条件と追加点検の結論

現行規則は通常状態・原則立ち相手・中央・非ホールド・派生なし、totalは空振り動作全体。距離依存は遠距離を基準とするが明示値がなければ推定しない。飛び道具出現と到達時間は区別する。KD/HKD後の有利時間は通常ヒット硬直差ではなくD。持続当てのhit/blockを範囲化しない。SA暗転前後は規則自体が厳密な定義を未検証と明記している。これらの仕様は変更していない。

| 原因候補             | フィールド数 | 今回確認した制約・不足根拠                                                                                                                             |
| -------------------- | -----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| total 空中・着地     |           15 | 空中判定の最終Fは動作終了Fの定義ではない。着地境界の包含規則と最初の行動可能Fが必要                                                                    |
| total SA・暗転・多段 |            6 | ルークの発生差17Fと全体差17Fは相関のみ。キンバリーも暗転・最終段・移動終了の計数証拠なし                                                               |
| total 強度展開       |            6 | ブランカ電撃L/M/Hと春麗構えL/M/H。元技と同じ値を継承し、独立強度値を今回発見していない                                                                 |
| total 括弧・空振り   |            3 | アレックスは括弧値と備考の追加Fが矛盾。電撃は通常・ODともホールドや多段終了を2F加算だけで説明不能                                                      |
| total 原典・公式・版 |            9 | アルジュン、ホンダ、ラシード等で終了条件・原典内差・版を分離できず、公式値への置換を確定できない                                                       |
| ブランカ接触条件     |            6 | hit3・block3を同時点検。操舵・接触高さ・体格を固定した証拠なし。共通の+1差だけでは原因を確定しない                                                     |
| ヤスミン自動派生     |            1 | 双方にヒット時派生の記載あり。原典+2が初段か完走かを確定できず、KD脱落と同一視しない                                                                   |
| block その他         |           16 | 通常ガード値4、ジェイミー代表Lv1、ジュリSA3三強度3、キンバリーSA2三強度3、舞体格1、ラシード気流1、リュウSA3三強度3。接続段・体格・版を固定する資料不足 |
| SA投げ発生           |            6 | リリー5+2、マノン6+1。暗転・投げ成立の定義が未確認で単純加算しない。通常飛び道具の個別修正とは区別                                                     |
| ザンギエフ当身       |            1 | Cargo受付6–55と公式5の開始点・版が未確定                                                                                                               |

春麗は構え中のガード・派生・中断・保持が可能であり、公式全体89Fを操作不能期間と解釈できない。電撃はホールド延長・追加攻撃への移行を含み、括弧38を一律採用しない。舞やリュウSA3の相手体格による接続差は確認できるが、公式が同じ相手条件で測定した証拠がなくCにも確定できない。今回、新たに確定した共通変換原因はない。

比較不能と確定した項目は「条件違い」として区別するのが適切。69件は条件不一致の可能性と値の誤りを分離できないため、今回比較結果を都合よく条件違いへ移していない。将来の比較処理変更には明示的な条件証拠と回帰検査が必要。

### 全体の検証範囲と重複のない集計

32キャラ1298レコード中、採用1283レコード×4項目＝5132フィールド。非採用15件はこの母数の外であり、今回も採用状態を変えていない。

| 比較処理の区分 | 件数 | 解釈                                                           |
| -------------- | ---: | -------------------------------------------------------------- |
| 一致           | 4451 | 保存公式表との比較一致。現行パッチでの独立測定済みを意味しない |
| 条件違い       |   42 | 下記の既知の条件・指標差。誤りとも一致とも数えない             |
| 確認不能       |  570 | 下記の理由分類。全件の意味を手作業検証した数ではない           |
| 不一致         |   69 | 今回のB69。追加調査後も判断不能                                |
| 合計           | 5132 | 上記4区分は排他的                                              |

条件違い42件は、百鬼襲と派生単体の発生・全体10、当身後反撃2、条件付き・距離範囲11、設置発動と自動攻撃5、発動と攻撃発生3、空中判定と地上接触3、初段と自動派生後1、共通元技と強度別値1、遠距離の最短と代表距離6。個別ID・理由は再評価台帳のconditionDifferencesに保持した。

確認不能570件を公式行と欄の形式から機械分類すると、**公式行未確定20、全体F算出根拠不足132、公式欄空欄・ダッシュ408、複合・非単一表記10**。これは掲載形式に基づく分類であり、408件すべてが公式のデータ欠落や本番の欠陥という意味ではない。非攻撃発動の適用対象外や非単一指標も含み、細かい意味の監査は別作業。フィールド別はtotal137・hit135・block187・startup111。

公式行未確定5レコードは、イングリッド214214K共通元技とL/M/Hの4件、ベガ623P ODの1件。その20フィールドは570件に**内包**され、追加計上しない。独立元技では2件であり5技とは数えない。非採用15件のIDと採用理由も再評価台帳のexcludedに保持した。

### 検証完了の4段階と現在の達成状況

| 段階           | 完了条件                                                                 | 現在の評価                                                                                                        |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| A データ整合性 | スキーマ・ID一意性・採用判断からの再生成・履歴監査・未承認変更検出が成功 | 基準commitで達成した検証を継承。今回data/scripts/tests/archiveに追跡差分なしを検査。全テストの再実行は省略        |
| B 保存原典     | 対象・強度・状態・指標が対応し、既知変換誤りを解消。残る解釈は明記       | 既承認の複合発生10、KD66+21、total53は生成・監査で保護。全5132項目についての意味の完全検証は未達、B69の解釈が残る |
| C 保存公式     | 行の一意対応、比較条件、値・例外の根拠、対象版が明確                     | 部分達成。一致4451、条件差42、確認不能570、不一致69。版未確認と未対応5レコードが残る                              |
| D 現行パッチ   | 独立した版対応、更新差分検出、新キャラ・調整の取り込み手順が確認済み     | 未達。取得日の一致で代替しない。現行ゲーム測定なし                                                                |

個人利用では、Aを維持し、保存原典に対して確定した誤変換を反映し、B/C/Dの限界を明示して利用を続ける区切りは妥当。現時点で新たな確定修正はないため、**「保存資料に基づく既知誤変換の修正作業」はいったん完了としてよい**。ただし「全データの正確性検証完了」「現行パッチ対応完了」とは表現しない。完全一致を完了条件にする必要はない。

次の優先順位は、(1) アクセス可能になった時点で版識別に必要な公式情報のみ確認、(2) SA投げ暗転の共通定義を一次資料または固定版のフレームメーター測定で確認、(3) 未対応2元技・5レコードの公式掲載／入力対応を確認、(4) 着地境界を代表技で固定版測定、(5) 408件の空欄・ダッシュを適用対象外／未掲載／欠落へ意味分類。ホンダや電撃は終了条件を固定してから個別に進める。根拠の追加がなければ同じ資料を反復調査しない。

手動判断が必要なのは、測定対象版と相手・距離の固定、構えの「終了」を何として測るか、SA投げの暗転前後をゲーム用代表発生にどう含めるか。既存仕様に一律の新規規則を導入せず、証拠を揃えた技群ごとに判断する。今回、本番・採用判断・datasetId・生成処理・履歴監査は変更していない。以下は過去の調査・反映履歴。

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
