# 複合発生F調査

## 2026-11-11 採用判断と修正

ユーザー指定の代表条件に基づき、`compound-startup-2026-11-11-r1`で再生成した。ラシード通常236Kは11→17F（元技と弱・中・強3展開）。原典11+6と公式非ホールド3行の17Fを根拠に、弾の出現Fを採用し、遠距離命中時刻とは分ける。ODは17Fのまま。

エド通常236LK/MK/HKは11/15/12→16/20/17F。原典11+5/15+5/12+5に加え、公式の同強度・非ホールド行47/49/51を独立の根拠とする。後半5Fの内部的意味は未特定のまま。JP通常236LK/MK/HKは14/14/14→22~/26~/26~。原典14+8/14+12/14+12と到達後に攻撃が生じ遠距離ほど遅くなる備考、公式22/26/26を参照。上限は推測しない。ブランカちゃん爆弾は出現・設置完了が攻撃発生と異なるため39Fを保持し、代表指標は別途保留。

今回の判断は各技の原典に限定する。変更前後と公式行・原典の所在は `data/adoption-decisions.json` の `compoundStartup` に保存し、生成処理で対象原典・旧値を検証してから強度展開する。下記の過去の未完了記述および台帳の現在値は調査当時の履歴である。

## 修正依頼に対する追加確認（作業未完了）

ラシード通常236Kの17Fは弾そのものの出現時点で、原典の17〜33Fはボタンを放す時点による幅である。飛び道具の遠距離到達時間の幅とは別で、保存備考には遠距離到達Fの端点がない。公式非ホールド3強度の発生17Fは出現値の補強になるが、到達時間を含む遠距離値が17Fであることは示さない。17Fを固定代表値とするかどうかは既存の距離依存採用判断との照合が未完了。

エド通常236LK/MK/HKのCargo原典は11+5/15+5/12+5であり、公式の非ホールド各行は16/20/17を示す。Cargo備考はホールド強化版を区別するが、5Fの意味を直接説明していない。非ホールド値に後半5Fを含めることの根拠を追加で検証する必要がある。

JP通常236LK/MK/HKは、原典備考にghostの移動中は攻撃が有効でなく、相手へ到達後に攻撃発生8/12/12Fを要し、遠距離ほど合計が延びるとある。22/26/26Fは最短候補であり、遠距離値の端点は未確認。固定値への変更は見送る。

この追記は調査の途中記録であり、採用判断や本番値の変更、スナップショット生成、検証は未実施。

保存資料に基づく全行の処理台帳。フレーム値・採用判断は変更していない。判定不能は処理漏れではなく、根拠不足の結論。候補抽出後の意味の精査には限界があり、下記の疑い・判定不能を解決済みとは扱わない。

## 変換原因と履歴

ラシードの11Fが確認できる最初のローカルGit保存は `ac80e8a`（2026-11-05、Save initial game and reviewed frame-data handoff）の旧 `staging/sf6-frame-data/raw/rashid.json`。`5bfb0d4` はarchiveへの配置変更であり初発ではない。rawの取得日時は2026-08-19で、Git登録日時とは異なる。

ローカル取得処理 `archive/scripts/collect-supercombo.mjs:17` は取得元 `RyoSogawa/sf6-sensei` のコミット `a0b4105fb368c308699ec0757ee6e4182e5a9d1c` を固定している。同コミットの [scraper実装](https://github.com/RyoSogawa/sf6-sensei/blob/a0b4105fb368c308699ec0757ee6e4182e5a9d1c/apps/scraper/src/index.ts#L131) では、`parseFrameValue` が `text.match(/^(\d+)/)` で先頭整数を取り出す。589行でstartupには `.value` だけを保存する。元表記のtextはstartupフィールドへ保存されない。したがって `11+6` は11になる。同固定コミットのgenerated/rashid.jsonも236Kのstartupが11である。実装と固定生成物を今回読み取り照合したが、その生成時に実際に渡されたCargoレスポンスの履歴までは保存資料から確定できない。

ローカル `collect-supercombo.mjs:48` のframe関数は数値をconfirmedとして受け入れ、141行で `frame(item.startup)` を使用する。複合文字列ならconditionalとする保護はあるが、上流で失われた後半には働かない。候補、採用入力、本番元技、共通強度3件へ11が伝わった。根本原因は上流の先頭整数抽出とstartup原文を残さない正規化で、ローカルはその数値を信頼した。後日保存されたCargoをrawの直接入力だったとは扱わない。

原因集計：誤変換確定はラシード1技＋JP3技の計4技、影響7本番レコード（ラシード元＋3展開、JP3）。疑いはエド3技、影響3レコード。合計7元技・10本番レコード。エドも同じ先頭抽出の形だが、各項の意味の独立した明記が不足するため確定へ昇格しない。

SAについては暗転前後の定義自体に未確認がある。現在の採用ルールが表の発生・発動値を指示するため維持と分類したもので、公式不一致を正しい値と認定したものではない。JPの最低22/26Fは標準条件の遠距離値が決まったことを意味しない。

## 範囲と件数

Cargoの全32キャラ2445行、現行1298レコードを対象に対応を検索。加算検出は数字同士の `+`（137行）。範囲加算と、備考のstartup/comes out/after spawning/upon reaching/after release/attack/projectileの時間記述も抽出。候補がないキャラも下表に残す。原典行番号はCargo配列の0始まりindex。共通強度展開は元技に集約し、各詳細に展開数を記載。同入力の別条件は備考完全一致を優先し、一意でなければ複数候補を保持。

| キャラ   | 本番全件 | Cargo全行 | 加算行 | 備考等追加行 |
| -------- | -------: | --------: | -----: | -----------: |
| aki      |       38 |        64 |      4 |            0 |
| akuma    |       42 |        91 |      8 |            2 |
| alex     |       34 |        76 |      3 |            3 |
| arjun    |       45 |        62 |      2 |            1 |
| blanka   |       47 |        85 |      3 |           20 |
| cammy    |       38 |        74 |     10 |            0 |
| chunli   |       45 |        79 |      1 |            9 |
| cviper   |       39 |        64 |      7 |            1 |
| dee_jay  |       43 |        98 |      9 |            8 |
| dhalsim  |       36 |        69 |      1 |            3 |
| e_honda  |       50 |        69 |      3 |            9 |
| ed       |       39 |        65 |     11 |            0 |
| elena    |       41 |        82 |      1 |            6 |
| guile    |       34 |        67 |      1 |           12 |
| ingrid   |       41 |        83 |      2 |            1 |
| jamie    |       46 |       115 |      1 |           20 |
| jp       |       49 |        64 |      7 |            1 |
| juri     |       33 |        87 |      1 |            0 |
| ken      |       42 |        75 |      6 |            0 |
| kimberly |       44 |        84 |     15 |            0 |
| lily     |       37 |        76 |      3 |            1 |
| luke     |       38 |        74 |      5 |            2 |
| m_bison  |       39 |        75 |      8 |           11 |
| mai      |       37 |        87 |      3 |            0 |
| manon    |       37 |        60 |      4 |            1 |
| marisa   |       42 |        90 |      4 |            4 |
| rashid   |       39 |        79 |      7 |            1 |
| ryu      |       45 |        77 |      1 |            0 |
| sagat    |       37 |        69 |      1 |            1 |
| terry    |       41 |        66 |      1 |            6 |
| yasmine  |       43 |        71 |      1 |            1 |
| zangief  |       37 |        68 |      3 |            1 |

| 分類           | 加算137行 | 備考等追加行 |
| -------------- | --------: | -----------: |
| 誤変換確定     |         4 |            0 |
| 誤変換疑い     |         3 |            0 |
| 現状維持が妥当 |       129 |          125 |
| 判定不能       |         1 |            0 |

## 誤変換確定・疑い一覧

| キャラ/入力 | 分類       | 現在 | 修正候補                                           | 元技数 | 影響本番件数 |
| ----------- | ---------- | ---- | -------------------------------------------------- | -----: | -----------: |
| ed 236HK    | 誤変換疑い | 12   | 17                                                 |      1 |            1 |
| ed 236LK    | 誤変換疑い | 11   | 16                                                 |      1 |            1 |
| ed 236MK    | 誤変換疑い | 15   | 20                                                 |      1 |            1 |
| jp 236HK    | 誤変換確定 | 14   | 26以上、遠距離未確定                               |      1 |            1 |
| jp 236LK    | 誤変換確定 | 14   | 22以上、遠距離未確定                               |      1 |            1 |
| jp 236MK    | 誤変換確定 | 14   | 26以上、遠距離未確定                               |      1 |            1 |
| rashid 236K | 誤変換確定 | 11   | 17（最短）。距離到達時間を含む遠距離値は別途未確定 |      1 |            4 |

本表のJP候補は最低値で、仕様上の遠距離代表値を確定したものではない。エドは公式との一致だけで意味を断定せず疑いに留めた。SAは現行採用規則のため維持としたが、リリー・マノン等の公式不一致を解消した意味ではない。

## 台帳の読み方と残る制約

137行は4確定＋3疑い＋129維持＋1判定不能で全行に処理結果を付けた。追加125行は範囲加算1行と備考抽出124行で、すべて維持分類。未分類行は0。原因技の重複集計は上記7技に限定し、対象外行や同入力の特殊状態を別の誤変換原因として数えていない。

ただし、備考候補の個別理由には条件群による共通判断を使用している。同入力で備考が一致しない場合、現行対応欄は対応の可能性がある技を表示する。たとえばSA2強化ブランカの行と通常版は同入力でも同じ条件ではない。これらを同じ技と確定した証拠として使用してはならない。raw生成元も同入力の候補を列挙しており、別条件を区別するため英語技名を併記した。

対象なしの判断はADOPTION_RULES第2節（派生・ホールド・空中・特殊状態）、第4節（ODや共通強度の展開条件）と照合する。MPMK~66の32行はDrive Rushで攻撃技ではない。`~`付きは派生入力、`j.`は空中、ボタンの角括弧・波括弧はホールド版として原典の備考と合わせて保持する。対象外に対する維持判定は「未採用のまま」の意味で、原典値をゲーム用に正しいと認定しない。

備考にあるホールド後の発生は非ホールドへ追加しない。溜め入力の保持時間も攻撃発生へ追加しない。Terryの対地で機能する発生と対空の初期持続は括弧付き原典の外側採用規則に従う。Quick Burnの中段部分の発生も技全体の初撃発生とは区別する。Sag​atのボタン離し後8F、Marisaの部分ホールド後4〜8F、Alexの保持時間による発生延長は通常版の発生へ機械加算しない。ラシードODは備考の最短17Fを既に含む。

SAの実測定義、ブランカ人形の代表指標、JPの遠距離確定値、エドの各項の意味、同入力の全特殊状態と現行IDの一意照合には残る不確実性がある。このため「全行に分類済み」は全候補の独立検証が完了したこととは区別する。

## 全候補の個別処理結果

### aki Cargo[32] 加算：2PP~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json#L364)。発生 11+11。備考：During Sinister Slide; 3f extra recovery on whiff; low profile 1-15f, semi-low profile 16-27f, crouch-sized hurtbox 28-35f; Counter-hit/Punish Counter bonus advantage carries through both hits; good combo tool that is also safe on block; both hits put airborne opponent into limited juggle state; 15f hitconfirm window into SA3 refers to 2nd hit only
- 現行対応：なし
- raw生成元：aki__2ppk (Heel Strike), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/aki.json → staging/adoption-inputs/aki.json → 個別採用規則 → data/characters/aki.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### aki Cargo[33] 加算：2PP~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json#L375)。発生 11+23。備考：During Sinister Slide; 2222 damage on Punish Counter; good range but slow startup
- 現行対応：なし
- raw生成元：aki__2pplplk (Entrapment), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/aki.json → staging/adoption-inputs/aki.json → 個別採用規則 → data/characters/aki.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### aki Cargo[34] 加算：2PP~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json#L386)。発生 11+19。備考：During Sinister Slide; poisons the opponent on hit; triggers Toxic Blossom for a crumple state vs. grounded opponents, or a tumbling OTG state vs. airborne opponents; low profile 1-17f; low crush 20-31f; good anti-zoning tool, but can lose to slower projectiles at some ranges; sets up high damage punish combos (but does not combo naturally when canceled from any grounded normals)
- 現行対応：なし
- raw生成元：aki__2ppp (Venomous Fang), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/aki.json → staging/adoption-inputs/aki.json → 個別採用規則 → data/characters/aki.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### aki Cargo[63] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/aki.cargo.json#L705)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelabe into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.907 (min/throw), 2.437 (min/block), 4.049 (max/final DR frame)
- 現行対応：なし
- raw生成元：aki__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/aki.json → staging/adoption-inputs/aki.json → 個別採用規則 → data/characters/aki.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[21] 加算：236KK~j.214K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L243)。発生 16+5。備考：Can be input on frame 16-38 of 236KK (unless Gou Hadoken is on-screen); does not consume additional Drive gauge; cannot hit cross-up or against grounded opponents; stops Akuma's air momentum; performs final kick on hit only, which slams opponent down into a limited juggle OTG state; KD advantage depends on how high it connects (useful after 4HK launch, allowing most juggle enders to combo); Akuma is in a crouching state on frames 4-10 of landing recovery; lower foot/leg hurtbox is projectile invuln 1f~land
- 現行対応：なし
- raw生成元：akuma__236kkj214k (Demon Gou Rasen), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[22] 加算：236KK~j.236P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L254)。発生 16+6(21)。備考：3-hit OD projectile; can be input on frame 16-38 of 236KK (unless Gou Hadoken is on-screen); does not consume additional Drive gauge; dissipates if Akuma is hit; creates stationary projectile on frames 6-20, then shoots downward at ~50 degree angle (this projectile will only have 2 hits if the initial hitbox collided with opponent); on hit only, landing recovery after 2f is cancelable into any action except walking/jumping; projectile hitbox is considered an airborne attack (can be avoided with anti-air invuln moves); puts airborne opponents into free juggle state (or maintains existing juggle state); puts grounded opponents into limited juggle state; advantage varies significantly depending on timing/spacing/angle; foot hurtbox is projectile invuln 1f~land
- 現行対応：なし
- raw生成元：akuma__236kkj236p (Demon Gou Zanku), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[23] 加算：236KK~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L265)。発生 16+13。備考：5f extra recovery on whiff; button strength determines angle (LK short, MK mid, HK far); puts airborne opponents into limited juggle state (or maintains juggle state if used mid-combo); extends a large projectile invincible hurtbox on frame 11 until landing (making the divekick easier to anti-air while still being useful for avoiding fireballs)
- 現行対応：なし
- raw生成元：akuma__236kkk (Demon Blade Kick), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[25] 加算：236KK~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L287)。発生 16+16。備考：Overhead with many active frames, making it good for meaty pressure; strong hitbox and mid-air pause makes it more difficult to anti-air; cannot hit cross-up; frames 4-8 of landing recovery have a crouch-sized hurtbox (but still standing)
- 現行対応：なし
- raw生成元：akuma__236kkp (Demon Guillotine), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[27] 加算：236K~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L309)。発生 18+13。備考：5f extra recovery on whiff; button strength determines angle (LK short, MK mid, HK far); puts airborne opponents into limited juggle state (or maintains juggle state if used mid-combo); extends a large projectile invincible hurtbox on frame 11 until landing (making the divekick easier to anti-air while still being useful for avoiding fireballs)
- 現行対応：なし
- raw生成元：akuma__236kk (Demon Blade Kick), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[29] 加算：236K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L331)。発生 18+16。備考：Overhead with many active frames, making it good for meaty pressure; strong hitbox and mid-air pause makes it more difficult to anti-air; cannot hit cross-up; frames 4-8 of landing recovery have a crouch-sized hurtbox (but still standing)
- 現行対応：なし
- raw生成元：akuma__236kp (Demon Guillotine), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[36] 備考・範囲追加：236{P}

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L408)。発生 (25~48)+6。備考：2-hit projectile; projectile speed depends on button strength; button must be held at least 25f and up to 48f for Lv.2 version (total startup 31~54f); projectile hitbox comes out 6f after button release; puts opponents into limited juggle state; useful in certain combo/juggle routes and for zoning; extended arm hurtbox is projectile invuln while charging; has an extended leg hurtbox on frames 13~
- 現行対応：なし
- raw生成元：akuma__236{p} (Gou Hadoken Lv.2), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[68] 備考・範囲追加：6KKK~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L760)。発生 (21~37)+8。備考：Total startup 29-45f depending on input timing; can be activated even after passing through opponent; 1.076 Range does not including 6KKK travel distance (maximum total range of 3.697); 2900 damage on Punish Counter
- 現行対応：なし
- raw生成元：akuma__6kkklplk (Oboro Throw), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[87] 加算：LP~LP~6LK~HP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L969)。発生 6+0。備考：Available at 25% HP or below; cinematic time regenerates ~2.3 Drive bars for Akuma; command grab that can be comboed into on grounded opponents; entire startup happens before the Super freeze, making the grab inescapable if the opponent is within throw range; very short range makes it unable to punish most -6 attacks; Range does not include travel distance (max total distance 2.927); generally impractical as a fireball counter due to the slow travel speed and input requirement (unless opponent has a much slower fireball recovery, or a chargeable fireball that can easily be reacted to)
- 現行対応：なし
- raw生成元：akuma__lplp6lkhp (Shun Goku Satsu (CA)), startup=6
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### akuma Cargo[90] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/akuma.cargo.json#L1002)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.880 (min/throw), 2.121 (min/block), 3.425 (max/final DR frame)
- 現行対応：なし
- raw生成元：akuma__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/akuma.json → staging/adoption-inputs/akuma.json → 個別採用規則 → data/characters/akuma.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[17] 加算：2PP~2LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L199)。発生 18+21。備考：Turns into Spiral DDT on Punish Counter (different animation with separate KD advantage and higher damage/meter properties); can only hit standing opponents; regular version gets strong meterless corner oki or Drive Rush midscreen oki; Punish Counter version can walk for meterless oki anywhere on screen; immediately loses low profile state and exits stance upon activation but retains crouching state on frames 1-14 (standing-sized hurtboxes on frames 9-14); can be canceled into from Palm Jab for a more effective tick throw; strong reaction counter to projectiles when already in stance (including invincible projectile Supers)
- 現行対応：なし
- raw生成元：alex__2pp2lplk (Dangerous Armbar<br>(Spiral DDT)), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[24] 備考・範囲追加：2PP~HP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L276)。発生 12。備考：Can be held to gain damage, 2f extra blockstun, and armor properties; puts airborne opponents into a limited juggle state; Counter-hit (+8) / Punish Counter (+10) puts grounded opponents into a Backturned state that can link to 4MK or MP/OD Power Drop (can whiff at long range); shorter range vs. crouching opponents; great pressure tool for depleting the opponent's Drive gauge; can be canceled into from Palm Jab (up to 3 jabs vs. standing or 2 jabs vs. crouching); uncharged version comes out if button is held up to 12 frames; can be spaced out to hit on later active frames for better advantage (up to +8/+5); holding the button 1-5f results in 12f startup; holding the button 6-12f increases the total startup incrementally (up to a maximum startup of 20f); maintains Low Profile on frames 1-6 and crouch state on frames 1-14 (standing-sized hurtbox on frames 11-14)
- 現行対応：なし
- raw生成元：alex__2pphp (Heavy Lariat), startup=12
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[27] 加算：2PP~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L309)。発生 18+5。備考：Acts like a normal throw with extra range (can be teched); turns into Death Valley Bomb on Punish Counter (different animation with separate KD advantage and higher damage/meter properties); leads to good oki anywhere on screen; immediately loses low profile state and exits stance upon activation but retains crouching state on frames 1-7 with standing-sized hurtboxes; cannot be canceled into from Palm Jab (only in throw range after 1 jab on hit or block); a successful Throw Escape builds 0.5 Drive bars for the defender; Throw Escape is awarded to a random player if input simultaneously
- 現行対応：なし
- raw生成元：alex__2pplplk (Hyper Takedown<br>(Death Valley Bomb)), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[36] 備考・範囲追加：5HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L408)。発生 16。備考：Disjointed poke with great range; grounded Punish Counter crumple puts opponent into a free juggle crumple state and is +23 before opponent falls to the ground (no grounded combo possible); puts airborne opponents into a limited juggle state (free juggle on Punish Counter); extends a hurtbox 1f before active that is vulnerable to projectiles; can be held for a stronger, longer-range version (uncharged version comes out if button is held up to 15 frames); holding the button 1-8f results in 16f startup; holding the button 9-15f increases the total startup incrementally by 1f (up to a maximum startup of 23f)
- 現行対応：alex__normal_5_K_H / 立ち強K / 16F / accepted / base
- raw生成元：alex__5hk (Standing Heavy Kick), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：alex__normal_5_K_H: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[37] 備考・範囲追加：5HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L419)。発生 12。備考：Disjointed poke with great range to harass the opponent's Drive gauge; cancelable into Super for a hitconfirm or to punish Drive Impact; extends a wide arm and foot hurtbox on the first 12 recovery frames; high active frame count for meaty setups (up to +8 oH / +1 oB, but high pushback on block); can be held for a stronger, fully cancelable version (uncharged version comes out if button is held up to 15 frames); holding the button 1-7f results in 12f startup; holding the button 8-15f increases the total startup incrementally by 1f (up to a maximum startup of 20f)
- 現行対応：alex__normal_5_P_H / 立ち強P / 12F / accepted / base
- raw生成元：alex__5hp (Standing Heavy Punch), startup=12
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：alex__normal_5_P_H: 一致 12 / 12 (公式表の対応欄)
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### alex Cargo[75] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/alex.cargo.json#L837)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.393 (min/throw), 1.722 (min/block), 3.530 (max/final DR frame)
- 現行対応：なし
- raw生成元：alex__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/alex.json → staging/adoption-inputs/alex.json → 個別採用規則 → data/characters/alex.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### arjun Cargo[4] 備考・範囲追加：22HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json#L56)。発生 3。備考：Absorbs any strike or projectile attack (including Super Arts) without incurring any recoverable damage; automatically performs a counter-attack when absorbing a strike; absorbing a projectile incurs the usual 30f recovery animation after releasing the button; this counter-attack is a guaranteed punish and cannot be baited with a fast normal; counter-attack deals only recoverable damage and cannot KO the opponent; can walk forward or backward while holding button (walk speed: 0.02 in either direction); counter-attack will autocorrect to face the opponent if they switch sides; Arjun is in a counter-hit state on frames 1-2 and a Punish Counter state for the rest of the move duration (including the Moral Breakdown follow-up); depletes 0.3 Drive bars on hit; useful reversal in some blockstrings (such as Drive Impact blockstrings in Burnout if the gap is 3f or larger)
- 現行対応：arjun__special_22_K_H / Indomitable Defense / 3F / accepted / base
- raw生成元：arjun__22hk (Indomitable Defense), startup=3
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：arjun__special_22_K_H: 一致 3 / 3 (公式表の対応欄)
- 経路：raw → staging/candidates/arjun.json → staging/adoption-inputs/arjun.json → 個別採用規則 → data/characters/arjun.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### arjun Cargo[5] 加算：22HK~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json#L67)。発生 26+28。備考：11-hit OD-priority projectile hitbox (disappears if Arjun is hit); can be used to safely pressure without the threat of Drive Impact or reversal SA1; puts opponent into a limited juggle state (slightly higher launch vs. airborne opponents); extremely high juggle potential (can be used for a meterless ender after Justice Beyond); Arjun is in a Punish Counter state for the entire move duration; deals 1100 recoverable damage on block (stacks with chip damage if the opponent is in Burnout); the large number of hits allows it to clash with Super projectiles long enough for Arjun to recover and punish the opponent (despite not depleting any of the Super's hits); Arjun extends a forward hurtbox on frames 28-66 that is vulnerable only to aerial strikes; Arjun will autocorrect to face the opponent if they switch sides during his counter stance
- 現行対応：なし
- raw生成元：arjun__22hkp (Moral Breakdown), startup=26
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/arjun.json → staging/adoption-inputs/arjun.json → 個別採用規則 → data/characters/arjun.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### arjun Cargo[61] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/arjun.cargo.json#L683)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.421 (min/throw), 1.810 (min/block), 3.589 (max/final DR frame)
- 現行対応：なし
- raw生成元：arjun__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/arjun.json → staging/adoption-inputs/arjun.json → 個別採用規則 → data/characters/arjun.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[4] 加算：22P

- 判定：**判定不能**。39Fは人形出現、35Fは着地し使用可能になるまで。合計74Fは設置完了で攻撃発生ではない。代表指標の確認が必要、公式欄は空欄。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L56)。発生 39+35。備考：Doll is consumed on frame 25, and spawns on frame 39 (if Blanka is hit between frames 25-38, loses the doll completely); after spawning, takes 35f to reach the ground and become active; doll despawns after 1000f or if completely off-screen; Blanka is in a counter-hit state for entire move duration; starts each round with 3 dolls (only 1 can be active at a time); Back Taunt is the only way to restore dolls mid-round; button strength determines throw distance (LP close, MP mid, HP far); doll can be activated with any source of electricity, with different effects depending on meterless/OD/SA1 electricity type (SA2 install specials count as meterless or OD moves for this purpose); once activated, doll is considered a projectile; doll disappears if Blanka is hit after activating (does not apply to un-activated doll)
- 現行対応：blanka__special_22_P_none / Blanka-chan Bomb / 39F / accepted / base
- raw生成元：blanka__22p (Blanka-chan Bomb), startup=39
- 採用候補：39（出現）/74（設置完了）。攻撃発生とは別。展開追加数：3、対応本番総数：4。
- 公式照合：blanka__special_22_P_none: 確認不能 39 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; blanka__special_22_P_none__strength_L: 確認不能 39 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; blanka__special_22_P_none__strength_M: 確認不能 39 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; blanka__special_22_P_none__strength_H: 確認不能 39 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[23] 加算：2PP~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L265)。発生 18+8。備考：Puts opponents into limited juggle state on hit; can combo from 5HP; the final 3 active frames have a great disjointed vertical hitbox for anti-air purposes
- 現行対応：なし
- raw生成元：blanka__2ppp (Wild Lift), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[61] 備考・範囲追加：j.[4]6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L683)。発生 13。備考：40f charge time (charge lasts 10f after releasing back direction); can be done from any jump direction or after Coward Crouch > Raid Jump; button strength determines trajectory (LP close, MP mid, HP far); can be canceled into from j.MP; can hit cross-up; puts grounded opponents into limited juggle state; spike knockdown vs. airborne opponents
- 現行対応：なし
- raw生成元：blanka__j[4]6p (Aerial Rolling Attack), startup=13 ; blanka__j[4]6p (Aerial Rolling Attack (SA2)), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[62] 備考・範囲追加：j.[4]6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L694)。発生 13。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into from j.MP; can be done from any jump direction or after Coward Crouch > Raid Jump; button strength determines trajectory (LP close, MP mid, HP far); can hit cross-up; puts grounded opponents into limited juggle state; spike knockdown vs. airborne opponents; hitconfirm time refers to Rolling Cannon cancel vs. grounded opponents (cannot cancel if it connects at minimum height); activates Blanka-chan doll with electricity (meterless 1-hit version); POTENTIAL BUG: at minimum height, canceling into downward Rolling Cannon reduces landing recovery and gives frame advantage without consuming any additional SA2 Install timer
- 現行対応：なし
- raw生成元：blanka__j[4]6p (Aerial Rolling Attack), startup=13 ; blanka__j[4]6p (Aerial Rolling Attack (SA2)), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[63] 備考・範囲追加：j.[4]6PP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L705)。発生 13。備考：40f charge time (charge lasts 10f after releasing back direction); can be done from any jump direction or after Coward Crouch > Raid Jump; can be canceled into from j.MP; can hit cross-up (2nd hit whiffs unless near corner); powerful defensive option, especially vs. throw loops; automatically performs 2nd attack on hit only
- 現行対応：なし
- raw生成元：blanka__j[4]6pp (Aerial Rolling Attack), startup=13 ; blanka__j[4]6pp (Aerial Rolling Attack (SA2)), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[64] 備考・範囲追加：j.[4]6PP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L716)。発生 13。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into from j.MP; can be done from any jump direction or after Coward Crouch > Raid Jump; can hit cross-up (2nd hit whiffs unless near corner); powerful defensive option, especially vs. throw loops; automatically performs 2nd attack on hit only; hitconfirm time refers to Rolling Cannon cancel vs. grounded opponents (cannot cancel on block if it connects at minimum height); activates Blanka-chan doll with electricity (3-hit OD version)
- 現行対応：なし
- raw生成元：blanka__j[4]6pp (Aerial Rolling Attack), startup=13 ; blanka__j[4]6pp (Aerial Rolling Attack (SA2)), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[68] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L760)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.476 (min/throw), 2.082 (min/block), 2.867 (max/final DR frame)
- 現行対応：なし
- raw生成元：blanka__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[69] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L771)。発生 8。備考：Trajectory: straight vertical; 40f charge time (charge lasts 12f after releasing down direction); cannot hit cross-up
- 現行対応：blanka__special_[2]8_K_H / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8hk (Vertical Rolling Attack), startup=8 ; blanka__[2]8hk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_H: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[70] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L782)。発生 8。備考：SA2 install version (drains 100f/6.7% from install timer); trajectory: straight vertical; 40f charge time (charge lasts 12f after releasing down direction); no charge required if canceled into; cannot hit cross-up; activates Blanka-chan doll with electricity (meterless 1-hit version); if opponent crouch blocks, cannot create a true blockstring into Rolling Cannon; difficult to land a grounded punish on block due to only 1f landing recovery (juggle punishes are more consistent); safer on block and bounces farther away then regular version
- 現行対応：blanka__special_[2]8_K_H / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8hk (Vertical Rolling Attack), startup=8 ; blanka__[2]8hk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_H: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[71] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L793)。発生 7。備考：SA2 install version (drains 100f/6.7% from install timer); trajectory: up and slightly forward (less horizontal distance than MK version); 40f charge time (charge lasts 12f after releasing down direction); no charge required if canceled into; cannot hit cross-up; activates Blanka-chan doll with electricity (3-hit OD version); can only cancel into Rolling Cannon on hit (no way to make it safe on block)
- 現行対応：blanka__special_[2]8_K_OD / Vertical Rolling Attack / 7F / accepted / base
- raw生成元：blanka__[2]8kk (Vertical Rolling Attack), startup=7 ; blanka__[2]8kk (Vertical Rolling Attack (SA2)), startup=7
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_OD: 一致 7 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[72] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L804)。発生 7。備考：Trajectory: up and slightly forward (less horizontal distance than MK version); 40f charge time (charge lasts 12f after releasing down direction); cannot hit cross-up
- 現行対応：blanka__special_[2]8_K_OD / Vertical Rolling Attack / 7F / accepted / base
- raw生成元：blanka__[2]8kk (Vertical Rolling Attack), startup=7 ; blanka__[2]8kk (Vertical Rolling Attack (SA2)), startup=7
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_OD: 一致 7 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[73] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L815)。発生 8。備考：Trajectory: ~45 degrees; 40f charge time (charge lasts 12f after releasing down direction); cannot hit cross-up; most useful version in grounded combos due to consistency (but can only chain 2 lights vs. standard height crouching opponents)
- 現行対応：blanka__special_[2]8_K_L / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8lk (Vertical Rolling Attack), startup=8 ; blanka__[2]8lk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_L: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[74] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L826)。発生 8。備考：SA2 install version (drains 100f/6.7% from install timer); trajectory: ~45 degrees; 40f charge time (charge lasts 12f after releasing down direction); no charge required if canceled into; cannot hit cross-up; activates Blanka-chan doll with electricity (meterless 1-hit version); if normal-height opponent crouch blocks, cannot create a true blockstring into Rolling Cannon (true blockstring can occur vs. taller characters); difficult to land a grounded punish on block due to only 1f landing recovery (juggle punishes are more consistent); safer on block and bounces farther away then regular version
- 現行対応：blanka__special_[2]8_K_L / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8lk (Vertical Rolling Attack), startup=8 ; blanka__[2]8lk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_L: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[75] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L837)。発生 8。備考：SA2 install version (drains 100f/6.7% from install timer); trajectory: up and slightly forward; 40f charge time (charge lasts 12f after releasing down direction); no charge required if canceled into; cannot hit cross-up; activates Blanka-chan doll with electricity (meterless 1-hit version); if opponent crouch blocks, cannot create a true blockstring into Rolling Cannon; difficult to land a grounded punish on block due to only 1f landing recovery (juggle punishes are more consistent); safer on block and bounces farther away then regular version
- 現行対応：blanka__special_[2]8_K_M / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8mk (Vertical Rolling Attack), startup=8 ; blanka__[2]8mk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_M: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[76] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L848)。発生 8。備考：Trajectory: up and slightly forward; 40f charge time (charge lasts 12f after releasing down direction); cannot hit cross-up
- 現行対応：blanka__special_[2]8_K_M / Vertical Rolling Attack / 8F / accepted / base
- raw生成元：blanka__[2]8mk (Vertical Rolling Attack), startup=8 ; blanka__[2]8mk (Vertical Rolling Attack (SA2)), startup=8
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[2]8_K_M: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[77] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L859)。発生 20。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into; worse on block than regular version and leaves Blanka closer; activates Blanka-chan doll with electricity (meterless 1-hit version); if opponent crouch blocks, cannot create a true blockstring into Rolling Cannon
- 現行対応：blanka__special_[4]6_P_H / Rolling Attack / 22F / accepted / base
- raw生成元：blanka__[4]6hp (Rolling Attack), startup=22 ; blanka__[4]6hp (Rolling Attack (SA2)), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_H: 一致 22 / 22 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[78] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L870)。発生 22。備考：40f charge time (charge lasts 10f after releasing back direction); safe against most characters unless Perfect Parried; Punish Counter sends opponent tumbling into a limited juggle OTG state (can follow up with Drive Rush 3HP anywhere on screen); only the first 6 active frames are cancelable into SA3; on hit, Blanka's recovery is in a crouching state
- 現行対応：blanka__special_[4]6_P_H / Rolling Attack / 22F / accepted / base
- raw生成元：blanka__[4]6hp (Rolling Attack), startup=22 ; blanka__[4]6hp (Rolling Attack (SA2)), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_H: 一致 22 / 22 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[79] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L881)。発生 10。備考：40f charge time (charge lasts 10f after releasing back direction); useful for baiting a block/parry by whiffing attack into an immediate throw; all active frames are cancelable into SA3; on hit, Blanka's recovery is in a crouching state
- 現行対応：blanka__special_[4]6_P_L / Rolling Attack / 10F / accepted / base
- raw生成元：blanka__[4]6lp (Rolling Attack), startup=10 ; blanka__[4]6lp (Rolling Attack (SA2)), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_L: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[80] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L892)。発生 10。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into; slightly safer on block than regular version, and bounces farther away; activates Blanka-chan doll with electricity (meterless 1-hit version); if opponent crouch blocks, cannot create a true blockstring into Rolling Cannon
- 現行対応：blanka__special_[4]6_P_L / Rolling Attack / 10F / accepted / base
- raw生成元：blanka__[4]6lp (Rolling Attack), startup=10 ; blanka__[4]6lp (Rolling Attack (SA2)), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_L: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[81] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L903)。発生 12。備考：40f charge time (charge lasts 10f after releasing back direction); Punish Counter sends opponent tumbling into a limited juggle OTG state (can follow up with SA1 in the corner); only the first 11 active frames are cancelable into SA3; on hit, Blanka's recovery is in a crouching state
- 現行対応：blanka__special_[4]6_P_M / Rolling Attack / 12F / accepted / base
- raw生成元：blanka__[4]6mp (Rolling Attack), startup=12 ; blanka__[4]6mp (Rolling Attack (SA2)), startup=12
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_M: 一致 12 / 12 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[82] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L914)。発生 12。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into; Punish Counter sends opponent tumbling into a limited juggle OTG state (can follow up with enhanced SA1 or 3P Rolling Cannon anywhere on screen); slightly safer on block than regular version; activates Blanka-chan doll with electricity (meterless 1-hit version); if opponent crouch blocks, cannot create a true blockstring into Rolling Cannon
- 現行対応：blanka__special_[4]6_P_M / Rolling Attack / 12F / accepted / base
- raw生成元：blanka__[4]6mp (Rolling Attack), startup=12 ; blanka__[4]6mp (Rolling Attack (SA2)), startup=12
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_M: 一致 12 / 12 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[83] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L925)。発生 18。備考：40f charge time (charge lasts 10f after releasing back direction); side switch on hit unless too close to the corner; puts opponent into limited juggle state; only the first 2 active frames are cancelable into SA2/SA3; completely safe unless Perfect Parried; SA2 cancel: KD +74/+9
- 現行対応：blanka__special_[4]6_P_OD / Rolling Attack / 18F / accepted / base
- raw生成元：blanka__[4]6pp (Rolling Attack), startup=18 ; blanka__[4]6pp (Rolling Attack (SA2)), startup=18
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_OD: 一致 18 / 18 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### blanka Cargo[84] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/blanka.cargo.json#L936)。発生 18。備考：SA2 install version (drains 100f/6.7% from install timer); 40f charge time (charge lasts 10f after releasing back direction); no charge required if canceled into; completely safe unless Perfect Parried; less pushback on block than the regular version; can only cancel into Rolling Cannon on block; activates Blanka-chan doll with electricity (3-hit OD version); can lead to true blockstring into Rolling Cannon
- 現行対応：blanka__special_[4]6_P_OD / Rolling Attack / 18F / accepted / base
- raw生成元：blanka__[4]6pp (Rolling Attack), startup=18 ; blanka__[4]6pp (Rolling Attack (SA2)), startup=18
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：blanka__special_[4]6_P_OD: 一致 18 / 18 (公式表の対応欄)
- 経路：raw → staging/candidates/blanka.json → staging/adoption-inputs/blanka.json → 個別採用規則 → data/characters/blanka.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[14] 加算：236PP~2K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L166)。発生 20+18。備考：2 hits; causes OTG bounce vs. airborne opponents that can juggle into 623MK/HK/KK or any Super (low height juggle connect will only allow canceled Air SA2 to connect); does not autocorrect toward opponent after crossing over; crouching state during landing recovery
- 現行対応：なし
- raw生成元：cammy__236pp2k (Reverse Edge), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[15] 加算：236PP~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L177)。発生 20+13。備考：Startup refers to earliest timing from Hooligan; button strength does not affect divekick trajectory; puts airborne opponents into limited juggle state; autocorrects toward opponent after crossing over
- 現行対応：なし
- raw生成元：cammy__236ppk (Hooligan Cannon Strike), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[16] 加算：236PP~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L188)。発生 20+10。備考：Throws standing opponents only; puts opponent into limited juggle state; 1150 damage on Punish Counter; up to 8f more recovery before landing (depends on activation height); crouching state during landing recovery; extends a proximity guard box that immediately forces a crouch blocking opponent's hurtbox to reach its crouching height, preventing uncrouchable meaty setups (but can still throw opponents that hold straight down on wakeup)
- 現行対応：なし
- raw生成元：cammy__236pplplk (Fatal Leg Twister), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[19] 加算：236P~2K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L221)。発生 20+18。備考：236P trajectory affects frame advantage (lower height is better); up to 3f more recovery before landing (depends on activation height); does not autocorrect toward opponent after crossing over; crouching state during landing recovery
- 現行対応：なし
- raw生成元：cammy__236p2k (Reverse Edge), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[20] 加算：236P~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L232)。発生 20+13。備考：Startup refers to earliest timing from Hooligan; button strength affects divekick trajectory (LK short, MK medium, HK far); spike knockdown vs. airborne opponents; autocorrects toward opponent after crossing over
- 現行対応：なし
- raw生成元：cammy__236pk (Hooligan Cannon Strike), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[21] 加算：236P~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L243)。発生 20+10。備考：Throws standing opponents only; 2070 damage on Punish Counter; up to 8f more total recovery before landing (depends on activation height); crouching state during landing recovery; extends a proximity guard box that immediately forces a crouch blocking opponent's hurtbox to reach its crouching height, preventing uncrouchable meaty setups (but can still throw opponents that hold straight down on wakeup)
- 現行対応：なし
- raw生成元：cammy__236plplk (Fatal Leg Twister), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[26] 加算：236[HP]~2K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L298)。発生 38+18。備考：2 hits; causes OTG bounce vs. airborne opponents that can juggle into 623MK/HK/KK or SA1/SA3 Super (low height juggle connect will not allow time for follow-up); does not autocorrect toward opponent after crossing over; crouching state during landing recovery
- 現行対応：なし
- raw生成元：cammy__236[hp]2k (Reverse Edge), startup=38
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[27] 加算：236[HP]~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L309)。発生 38+13。備考：Startup refers to earliest timing from Hooligan; button strength does not affect divekick trajectory; puts airborne opponents into limited juggle state; autocorrects toward opponent after crossing over
- 現行対応：なし
- raw生成元：cammy__236[hp]k (Hooligan Cannon Strike), startup=38
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[28] 加算：236[HP]~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L320)。発生 38+10。備考：Throws standing opponents only; puts opponent into limited juggle state; 1150 damage on Punish Counter; up to 2f more total recovery before landing (depends on activation height); crouching state during landing recovery; extends a proximity guard box that immediately forces a crouch blocking opponent's hurtbox to reach its crouching height, preventing uncrouchable meaty setups (but can still throw opponents that hold straight down on wakeup)
- 現行対応：なし
- raw生成元：cammy__236[hp]lplk (Fatal Leg Twister), startup=38
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cammy Cargo[73] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cammy.cargo.json#L815)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.603 (min/throw), 2.027 (min/block), 2.796 (max/final DR frame)
- 現行対応：なし
- raw生成元：cammy__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cammy.json → staging/adoption-inputs/cammy.json → 個別採用規則 → data/characters/cammy.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[7] 備考・範囲追加：214P~8

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L89)。発生 -。備考：Input Up (or another 214P) to manually exit stance (fastest total Serenity Stream time is 37f); cannot block while exiting stance; counter-hit state for entire animation; final 14f of recovery is in a standing state; 18f version occurs automatically after 14+57f (can delay by holding crouch); when Stance Exit occurs automatically after LP/LK/MK stance attacks, the total exit duration is increased and Chun can stand block before the final 18f recovery period
- 現行対応：なし
- raw生成元：chunli__214p8 (Serenity Stream Exit), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[70] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L782)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 1.044 (min/throw), 2.222 (min/block), 3.163 (max/final DR frame)
- 現行対応：なし
- raw生成元：chunli__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[71] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L793)。発生 20。備考：30f charge time (charge lasts 12f after releasing down direction); no charge required if canceled from Stance normals; combos from 2HP, 4HP, 2MP, 5MK, Stance HP, and Stance MK; cannot hit cross-up
- 現行対応：chunli__special_[2]8_K_H / HK Spinning Bird Kick / 20F / accepted / base
- raw生成元：chunli__[2]8hk (HK Spinning Bird Kick), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[2]8_K_H: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[72] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L804)。発生 16。備考：30f charge time (charge lasts 12f after releasing down direction); no charge required if canceled from Stance normals; puts opponent into limited juggle state (juggle follow-up only possible vs. grounded opponents); combos from medium normals; cannot hit cross-up
- 現行対応：chunli__special_[2]8_K_OD / OD Spinning Bird Kick / 16F / accepted / base
- raw生成元：chunli__[2]8kk (OD Spinning Bird Kick), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[2]8_K_OD: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[73] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L815)。発生 9。備考：30f charge time (charge lasts 12f after releasing down direction); no charge required if canceled from Stance normals; combos from light normals; cannot hit cross-up
- 現行対応：chunli__special_[2]8_K_L / LK Spinning Bird Kick / 9F / accepted / base
- raw生成元：chunli__[2]8lk (LK Spinning Bird Kick), startup=9
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[2]8_K_L: 一致 9 / 9 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[74] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L826)。発生 16。備考：30f charge time (charge lasts 12f after releasing down direction); no charge required if canceled from Stance normals; combos from medium normals; cannot hit cross-up
- 現行対応：chunli__special_[2]8_K_M / MK Spinning Bird Kick / 16F / accepted / base
- raw生成元：chunli__[2]8mk (MK Spinning Bird Kick), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[2]8_K_M: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[75] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L837)。発生 11。備考：50f charge (charge lasts 10f after releasing back direction); no charge required if canceled from Stance normals; travels ~60% screen; Super cancel timing is very strict
- 現行対応：chunli__special_[4]6_P_H / HP Kikoken / 11F / accepted / base
- raw生成元：chunli__[4]6hp (HP Kikoken), startup=11
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[4]6_P_H: 一致 11 / 11 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[76] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L848)。発生 15。備考：50f charge (charge lasts 10f after releasing back direction); no charge required if canceled from Stance normals; travels ~90% screen; Super cancel timing is very strict
- 現行対応：chunli__special_[4]6_P_L / LP Kikoken / 15F / accepted / base
- raw生成元：chunli__[4]6lp (LP Kikoken), startup=15
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[4]6_P_L: 一致 15 / 15 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[77] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L859)。発生 12。備考：50f charge (charge lasts 10f after releasing back direction); no charge required if canceled from Stance normals; travels ~80% screen; Super cancel timing is very strict
- 現行対応：chunli__special_[4]6_P_M / MP Kikoken / 12F / accepted / base
- raw生成元：chunli__[4]6mp (MP Kikoken), startup=12
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[4]6_P_M: 一致 12 / 12 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### chunli Cargo[78] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/chunli.cargo.json#L870)。発生 11。備考：45f charge (charge lasts 10f after releasing back direction); no charge required if canceled from Stance normals; 2-hit projectile; counter-hit/Punish Counter bonus advantage applies after both hits; 2nd hit with higher juggle limit only comes out if 1st hit connects
- 現行対応：chunli__special_[4]6_P_OD / OD Kikoken / 11F / accepted / base
- raw生成元：chunli__[4]6pp (OD Kikoken), startup=11
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：chunli__special_[4]6_P_OD: 一致 11 / 11 (公式表の対応欄)
- 経路：raw → staging/candidates/chunli.json → staging/adoption-inputs/chunli.json → 個別採用規則 → data/characters/chunli.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[5] 加算：214K

- 判定：**現状維持が妥当**。GAME_SPECの承認済みLv.1代表値23/20Fが後半10Fを含む。既に個別補正済み。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L67)。発生 13+10。備考：Lv.1 version when uncharged or when button is held up to 19f; can hold button longer to charge to a stronger version (20f Lv.2 / 59f Lv.3); 1-hit armor frames cover the full body, ending immediately if button is released after frame 13; absorbing a strike results in an automatic counter-attack with 10f startup (comes out on frame 14 at the earliest); absorbing an attack early in the armor frames makes it possible for the counter-attack to be blocked; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 12 until button is released (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); 2f extra knockdown advantage on Punish Counter; only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke); Focus + Dash can be used to absorb projectiles when Drive gauge is too low for Parry; can be used against Drive Impact while in Burnout (but armor starts too late to work in most DI-cancel blockstrings)
- 現行対応：cviper__held_special_214_K_none / Focus Force (Lv.1) / 23F / accepted / base
- raw生成元：cviper__214k (Focus Force (Lv.1)), startup=13
- 採用候補：現在値維持。展開追加数：3、対応本番総数：4。
- 公式照合：cviper__held_special_214_K_none: 一致 23 / 23 (公式表の対応欄) ; cviper__held_special_214_K_none__strength_L: 一致 23 / 23 (公式表の対応欄) ; cviper__held_special_214_K_none__strength_M: 一致 23 / 23 (公式表の対応欄) ; cviper__held_special_214_K_none__strength_H: 一致 23 / 23 (公式表の対応欄)
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[6] 加算：214KK

- 判定：**現状維持が妥当**。GAME_SPECの承認済みLv.1代表値23/20Fが後半10Fを含む。既に個別補正済み。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L78)。発生 10+10。備考：Lv.1 version when uncharged or when button is held up to 19f; can hold button longer to charge to a stronger version (20f Lv.2 / 57f Lv.3); 1-hit armor frames cover the full body, ending immediately if button is released after frame 10; absorbing a strike results in an automatic counter-attack with 10f startup (comes out on frame 11 at the earliest); absorbing an attack early in the armor frames makes it possible for the counter-attack to be blocked; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 9 until button is released (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); 2f extra knockdown advantage on Punish Counter; only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke)
- 現行対応：cviper__held_special_214_K_OD / OD Focus Force (Lv.1) / 20F / accepted / base
- raw生成元：cviper__214kk (OD Focus Force (Lv.1)), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：cviper__held_special_214_K_OD: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[12] 備考・範囲追加：214P~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L144)。発生 12/8/6。備考：Feint animation lasts 12f but occurs at a different timing from each meterless strength of Thunder Dash (LP 12+12 / MP 8+12 / HP 6+12); can be input more easily by holding any K while inputting 214P; 214HP version gives better combo potential from 2HP or from High Jump canceled 5HP/5HK; Counter-hit state for entire feint animation
- 現行対応：なし
- raw生成元：cviper__214pk (Thunder Dash Feint), startup=12
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[13] 加算：214[KK]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L155)。発生 57+10。備考：Fully charged Lv.3 version when button is held at least 57f; Punish Counter causes a limited juggle crumple state (+29 before opponent falls to the ground); extremely powerful combo starter for Stun or punishing very unsafe Supers; 1-hit armor frames cover the full body; attack hitbox starts up 10f after reaching full charge (no armor on these frames); absorbing a strike while charging results in an automatic counter-attack with 10f startup; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 9-58 (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke)
- 現行対応：なし
- raw生成元：cviper__214[kk] (OD Focus Force (Lv.3)), startup=57
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[14] 加算：214[K]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L166)。発生 59+10。備考：Fully charged Lv.3 version when button is held at least 59f; Punish Counter causes a limited juggle crumple state (+29 before opponent falls to the ground); 1-hit armor frames cover the full body; attack hitbox starts up 10f after reaching full charge (no armor on these frames); absorbing a strike while charging results in an automatic counter-attack with 10f startup; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 12-60 (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke)
- 現行対応：なし
- raw生成元：cviper__214[k] (Focus Force (Lv.3)), startup=59
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[15] 加算：214{KK}

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L177)。発生 20~56+10。備考：Partially charged Lv.2 version when button is held at least 20f (up to 56f); Punish Counter causes a limited juggle crumple state (+8 before opponent falls to the ground); 1-hit armor frames cover the full body, ending immediately if button is released after frame 10; attack hitbox starts up 10f after button release (no armor on these frames); absorbing a strike results in an automatic counter-attack with 10f startup; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 9 until button is released (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke)
- 現行対応：なし
- raw生成元：cviper__214{kk} (OD Focus Force (Lv.2)), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[16] 加算：214{K}

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L188)。発生 20~58+10。備考：Partially charged Lv.2 version when button is held at least 20f (up to 58f); Punish Counter causes a limited juggle crumple state (+8 before opponent falls to the ground); 1-hit armor frames cover the full body, ending immediately if button is released after frame 13; attack hitbox starts up 10f after button release (no armor on these frames); absorbing a strike results in an automatic counter-attack with 10f startup; C. Viper incurs only 7f armor hitstop from absorbing a strike; armor can absorb projectiles but does not perform counter-attack (C. Viper incurs 10f projectile hitstop during armor); cancelable into Forward Dash from frame 12 until button is released (not possible after absorbing a strike); C. Viper is in a Punish Counter state for entire duration (including Forward Dash cancel); only the first hit gains the bonus damage from a Counter-hit/Punish Counter; -17 on Punish Counter if only the first hit of counter-attack reaches opponent (e.g. absorbing a ranged Dhalsim poke); Focus + Dash can be used to absorb projectiles when Drive gauge is too low for Parry
- 現行対応：なし
- raw生成元：cviper__214{k} (Focus Force (Lv.2)), startup=20
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### cviper Cargo[63] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/cviper.cargo.json#L705)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.374 (min/throw), 1.756 (min/block), 3.355 (max/final DR frame)
- 現行対応：なし
- raw生成元：cviper__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/cviper.json → staging/adoption-inputs/cviper.json → 個別採用規則 → data/characters/cviper.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[6] 加算：214KK~6P~4P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L78)。発生 19+16。備考：Hit/block advantage refers to data after 214KK attack connects (fastest timing); only 1f faster than letting 6P dash finish and ending with regular backdash; Distance: 1.0 back; can follow up with OD Jus Cool LK / MK / HK follow-ups (but not another Juggling Dash)
- 現行対応：なし
- raw生成元：dee_jay__214kk6p4p (Juggling Sway), startup=19
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[7] 加算：214KK~HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L89)。発生 25+11。備考：Puts the opponent into limited juggle state (free juggle state on grounded Punish Counter; requires initial 214KK to whiff); the upper hitbox whiffs on crouching opponents unless they extend a vertical hurtbox (can only hit crouchers at very close range); can work as an anti-air if opponent jumps during Sway startup, and can hit cross-up
- 現行対応：なし
- raw生成元：dee_jay__214kkhk (Maximum Strike), startup=25
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[8] 加算：214KK~LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L100)。発生 25+9。備考：Safe low ender; 5f extra recovery on whiff or vs. armor; good for whiff punishing after baiting opponent with 214KK; earliest timing on block gives 4f gap that can set up trade combos into 5HP
- 現行対応：なし
- raw生成元：dee_jay__214kklk (Funky Slicer), startup=25
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[9] 加算：214KK~MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L111)。発生 25+19(21)。備考：Safe overhead ender that can lead to follow-up combos on hit; 12-22f low crush (not airborne); first 2 active frames can only hit airborne; +7 on hit vs. standing; +6 on hit vs. all crouching characters (most likely scenario due to being an overhead); causes OTG bounce vs. airborne opponents (can juggle into any Super, OD Jackknife, or MK/HK Sobat); Punish Counter vs. airborne gives a more lenient juggle state on ground bounce
- 現行対応：なし
- raw生成元：dee_jay__214kkmk (Waning Moon), startup=25
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[11] 加算：214K~6P~4P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L133)。発生 13+17。備考：Startup refers to fastest 214K + 6P animation before 4P can be input, recovery refers to the 4P dash animation; only 1f faster than letting 6P dash finish and ending with regular backdash; Distance: 1.0 back; can follow up with Jus Cool LK / MK / HK follow-ups (but not another Juggling Dash)
- 現行対応：なし
- raw生成元：dee_jay__214k6p4p (Juggling Sway), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[12] 加算：214K~HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L144)。発生 13+15。備考：Upper body hurtbox shrinks down on frames 6-14 and 20-44; puts the opponent into limited juggle state; can work as an anti-air if opponent jumps during Sway startup and can hit cross-up; the upper hitbox whiffs on crouching opponents unless they extend a vertical hurtbox (can only hit crouchers at very close range)
- 現行対応：なし
- raw生成元：dee_jay__214khk (Maximum Strike), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[13] 加算：214K~LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L155)。発生 13+12。備考：Safe low ender; 2f extra recovery on hit, 5f extra recovery on whiff or vs. armor; good for whiff punishing after baiting opponent with 214K; against opponents in Burnout, canceling from 5HP into 214K~LK allows for a frame trap that leads to counter-hit combos
- 現行対応：なし
- raw生成元：dee_jay__214klk (Funky Slicer), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[14] 加算：214K~MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L166)。発生 13+25。備考：12-22f low crush (not airborne); gives great oki on hit or additional pressure on block; causes spike knockdown vs. airborne opponents; causes limited juggle OTG bounce on Punish Counter
- 現行対応：なし
- raw生成元：dee_jay__214kmk (Waning Moon), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[67] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L749)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.763 (min/throw), 2.535 (min/block), 2.713 (max/final DR frame)
- 現行対応：なし
- raw生成元：dee_jay__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[68] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L760)。発生 5。備考：40f charge time (holds charge for 12f after release); whiffs on crouching opponents unless they extend a vertical attack hurtbox; gives a perfect safe jump setup when connecting vs. grounded opponents; when juggled after [2]8MK, the +37 KD Adv. sets up a safe jump with j.2LK; last hit ends juggle state due to +100 juggle count increase; cannot hit cross-up
- 現行対応：dee_jay__special_[2]8_K_H / Jackknife Maximum / 5F / accepted / base
- raw生成元：dee_jay__[2]8hk (Jackknife Maximum), startup=5
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[2]8_K_H: 一致 5 / 5 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[69] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L771)。発生 6。備考：40f charge time (holds charge for 12f after release); 2nd/3rd hits whiff on crouching opponents unless they extend a vertical hurtbox; puts opponent into limited juggle state; cannot hit cross-up; at close range, may cross over opponents on whiff/block; on hit only, Dee Jay performs 2 extra hits that spike the opponent to the ground
- 現行対応：dee_jay__special_[2]8_K_OD / Jackknife Maximum / 6F / accepted / base
- raw生成元：dee_jay__[2]8kk (Jackknife Maximum), startup=6
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[2]8_K_OD: 一致 6 / 6 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[70] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L782)。発生 23。備考：40f charge time (holds charge for 12f after release); startup refers to earliest air normal timing; 6f landing recovery only applies to empty jump version (air normals have the usual 3f landing recovery); can hold back mid-air to shorten jump trajectory; Distance: 1.51~1.63
- 現行対応：dee_jay__special_[2]8_K_L / Jackknife Maximum / 23F / accepted / base
- raw生成元：dee_jay__[2]8lk (Jackknife Maximum), startup=23
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[2]8_K_L: 確認不能 23 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[71] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L793)。発生 6。備考：40f charge time (holds charge for 12f after release); whiffs on crouching opponents unless they extend a vertical attack hurtbox; puts opponent into limited juggle state (can follow up with [2]8HK/KK or SA1 depending on distance from opponent); can trade with jump-ins due to short invincibility window; cannot hit cross-up
- 現行対応：dee_jay__special_[2]8_K_M / Jackknife Maximum / 6F / accepted / base
- raw生成元：dee_jay__[2]8mk (Jackknife Maximum), startup=6
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[2]8_K_M: 一致 6 / 6 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[72] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L804)。発生 17(34)。備考：45 charge time (holds charge for 10f after release); throws two 1-hit projectiles; useful option in fireball wars but very vulnerable to jumps and anti-projectile moves; Counter-hit/Punish Counter bonus advantage applies to both hits; () refers to startup of 2nd fireball; recovery is counted after first projectile startup; 2nd projectile moves faster than the 1st; can be canceled into Speedy Maracas after 35f even on whiff
- 現行対応：dee_jay__special_[4]6_P_H / Air Slasher / 17F / accepted / base
- raw生成元：dee_jay__[4]6hp (Air Slasher), startup=17
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[4]6_P_H: 一致 17 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[73] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L815)。発生 -。備考：45 charge time (holds charge for 10f after release); feint that can be used to bait opponent's reaction or extend close range combos/blockstrings
- 現行対応：dee_jay__special_[4]6_P_L / Air Slasher / -F / accepted / base
- raw生成元：dee_jay__[4]6lp (Air Slasher), startup=null
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[4]6_P_L: 確認不能 - / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[74] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L826)。発生 17。備考：45 charge time (holds charge for 10f after release); 1-hit projectile; safest zoning option against jumps and anti-projectile moves; can be canceled into Speedy Maracas after 23f even on whiff
- 現行対応：dee_jay__special_[4]6_P_M / Air Slasher / 17F / accepted / base
- raw生成元：dee_jay__[4]6mp (Air Slasher), startup=17
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[4]6_P_M: 一致 17 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dee_jay Cargo[75] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dee_jay.cargo.json#L837)。発生 10(23)。備考：45 charge time (holds charge for 10f after release); throws two 1-hit projectiles at close range; Counter-hit/Punish Counter bonus advantage carries through both hits; from farther ranges, they merge into a single 2-hit projectile that knocks down on hit (puts opponent into limited juggle state); powerful option for zoning, pressure, Burnout chip sequences, and fireball wars; very low pushback on block, allowing for corner loops and pressure; puts airborne opponents into limited juggle state; projectile starts moving forward on frame 22; can be canceled into Speedy Maracas after 31f even on whiff
- 現行対応：dee_jay__special_[4]6_P_OD / Air Slasher / 10F / accepted / base
- raw生成元：dee_jay__[4]6pp (Air Slasher), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：dee_jay__special_[4]6_P_OD: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/dee_jay.json → staging/adoption-inputs/dee_jay.json → 個別採用規則 → data/characters/dee_jay.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dhalsim Cargo[4] 備考・範囲追加：214214K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json#L56)。発生 7。備考：Button strength determines trajectory; 5-hit projectile; cannot hit crouching opponents on the way up unless they extend a vertical hurtbox (opponent can safely pressure Dhalsim with a crouching meaty attack); automatically releases if the hitbox above Dhalsim's head connects; can hold the button to charge into a more powerful version; upon hitting the floor, creates a larger stationary hitbox that lasts 20f; [] refers to active projectile time after release
- 現行対応：dhalsim__super_art_2_L / Yoga Sunburst / 7F / accepted / base ; dhalsim__super_art_2_M / Yoga Sunburst / 7F / accepted / base ; dhalsim__super_art_2_H / Yoga Sunburst / 7F / accepted / base
- raw生成元：dhalsim__214214k (Yoga Sunburst), startup=7
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：dhalsim__super_art_2_L: 一致 7 / 7 (公式表の対応欄) ; dhalsim__super_art_2_M: 一致 7 / 7 (公式表の対応欄) ; dhalsim__super_art_2_H: 一致 7 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/dhalsim.json → staging/adoption-inputs/dhalsim.json → 個別採用規則 → data/characters/dhalsim.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dhalsim Cargo[5] 備考・範囲追加：214214[K]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json#L67)。発生 71~91。備考：Button strength determines trajectory; 9-hit projectile; cannot hit crouching opponents on the way up; larger hitbox than partially charged version; automatically releases if the hitbox above Dhalsim's head connects; upon hitting the floor, creates a larger stationary hitbox that lasts 20f; [] refers to active projectile time after release; Dhalsim can hold the fireball for 20f after fully charged (no benefit for doing this)
- 現行対応：なし
- raw生成元：dhalsim__214214[k] (Yoga Sunburst), startup=71
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dhalsim.json → staging/adoption-inputs/dhalsim.json → 個別採用規則 → data/characters/dhalsim.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dhalsim Cargo[6] 備考・範囲追加：214214{K}

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json#L78)。発生 23~70。備考：Button strength determines trajectory; 7-hit projectile; cannot hit crouching opponents on the way up; larger hitbox than uncharged version; automatically releases if the hitbox above Dhalsim's head connects; upon hitting the floor, creates a larger stationary hitbox that lasts 20f; [] refers to active projectile time after release
- 現行対応：なし
- raw生成元：dhalsim__214214{k} (Yoga Sunburst), startup=23
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dhalsim.json → staging/adoption-inputs/dhalsim.json → 個別採用規則 → data/characters/dhalsim.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### dhalsim Cargo[68] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/dhalsim.cargo.json#L760)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.471 (min/throw), 1.787 (min/block), 2.700 (max/final DR frame)
- 現行対応：なし
- raw生成元：dhalsim__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/dhalsim.json → staging/adoption-inputs/dhalsim.json → 個別採用規則 → data/characters/dhalsim.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[16] 加算：236KK~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L188)。発生 13+9。備考：Honda advances forward with frame advantage on hit or block for more mixups/pressure; incredibly disjointed hitbox for neutral approaches; puts airborne opponents into limited juggle state; always a true blockstring into the follow-up attack (should only be done on hit unless it will chip out)
- 現行対応：なし
- raw生成元：e_honda__236kkp (Teppo Triple Slap 1), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[19] 加算：236K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L221)。発生 13+9。備考：Puts opponents into limited juggle state on hit, allowing for Super or P follow-up to juggle; incredibly disjointed hitbox for neutral approaches; safe but minus on block (recovers outside the opponent's throw range if well spaced); canceling into the final P follow-up creates a 2f frame trap that can punish opponents trying to retake their turn; sets up a safe jump anywhere on screen if not canceled into the Triple Slap ender; can frame trap from 5HP or 5HK (1st hit) at closer ranges; combos from 5MP for a great neutral threat
- 現行対応：なし
- raw生成元：e_honda__236kp (Teppo Triple Slap 1), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[59] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L661)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.213 (min/throw), 1.769 (min/block), 3.375 (max/final DR frame)
- 現行対応：なし
- raw生成元：e_honda__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[60] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L672)。発生 11(39)。備考：[] refers to damage on cross-up version of downward smash; () refers to total startup on the overhead downward smash vs. standing opponents (2nd hit becomes active mid-air on frame 37); downward smash has 1f better KD Adv. vs. crouching opponents; 40f charge time (holds charge for 12f after releasing down direction); 1st hit whiffs on crouching opponents and cannot hit cross-up; can alter trajectory on the way up by holding forward/back
- 現行対応：e_honda__special_[2]8_K_H / Sumo Smash / 11F / accepted / base
- raw生成元：e_honda__[2]8hk (Sumo Smash), startup=11
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[2]8_K_H: 一致 11 / 11 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[61] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L683)。発生 6(31~36)。備考：[] refers to damage on cross-up version of downward smash; () refers to total startup on the overhead downward smash vs. standing opponents (2nd hit becomes active mid-air on frame 31); downward smash has 1f better KD Adv. vs. crouching opponents; 40f charge time (holds charge for 12f after releasing down direction); 1st hit whiffs on crouching opponents and cannot hit cross-up; can alter trajectory on the way up by holding forward/back; holding LK or MK will cause Honda to hang mid-air before starting his descent (LK 4f longer, MK 2f longer)
- 現行対応：e_honda__special_[2]8_K_OD / Sumo Smash / 6F / accepted / base
- raw生成元：e_honda__[2]8kk (Sumo Smash), startup=6
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[2]8_K_OD: 一致 6 / 6 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[62] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L694)。発生 11(45)。備考：[] refers to damage on cross-up version of downward smash; () refers to total startup on the overhead downward smash vs. standing opponents (2nd hit becomes active mid-air on frame 41); downward smash has 1f better KD Adv. vs. crouching opponents; 40f charge time (holds charge for 12f after releasing down direction); 1st hit whiffs on crouching opponents and cannot hit cross-up; can alter trajectory on the way up by holding forward/back
- 現行対応：e_honda__special_[2]8_K_L / Sumo Smash / 11F / accepted / base
- raw生成元：e_honda__[2]8lk (Sumo Smash), startup=11
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[2]8_K_L: 一致 11 / 11 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[63] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L705)。発生 11(42)。備考：[] refers to damage on cross-up version of downward smash; () refers to total startup on the overhead downward smash vs. standing opponents (2nd hit becomes active mid-air on frame 39); downward smash has 1f better KD Adv. vs. crouching opponents; 40f charge time (holds charge for 12f after releasing down direction); 1st hit whiffs on crouching opponents and cannot hit cross-up; can alter trajectory on the way up by holding forward/back
- 現行対応：e_honda__special_[2]8_K_M / Sumo Smash / 11F / accepted / base
- raw生成元：e_honda__[2]8mk (Sumo Smash), startup=11
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[2]8_K_M: 一致 11 / 11 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[64] 備考・範囲追加：[4]646K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L716)。発生 12。備考：40f charge (charge lasts 28f after releasing back direction); travels full screen, making it a useful anti-projectile tool; becomes projectile invincible on hit up until the fully invincible cinematic ender (ensures a full connect even against slow projectiles); first hit has very short range (slightly less damage and Drive damage from longer ranges); from frame 24 onward, Honda transitions to his 45f recovery animation if he switches sides with the opponent; if Honda whiffs entire SA2 without crossing under the opponent, landing recovery becomes 12+33 (total recovery time is unchanged); full dmg distribution: 50,500,100x14,900; detailed charge requirements: first Forward input must be within 28f of releasing charge, next Back input must be within the next 6 frames, next Forward input must be within the next 6 frames, final K input must be within the next 6 frames (slowest possible input takes 48f after releasing charge)
- 現行対応：e_honda__super_art_2_L / Ultimate Killer Head Ram / 12F / accepted / base ; e_honda__super_art_2_M / Ultimate Killer Head Ram / 12F / accepted / base ; e_honda__super_art_2_H / Ultimate Killer Head Ram / 12F / accepted / base
- raw生成元：e_honda__[4]646k (Ultimate Killer Head Ram), startup=12
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：e_honda__super_art_2_L: 一致 12 / 12 (公式表の対応欄) ; e_honda__super_art_2_M: 一致 12 / 12 (公式表の対応欄) ; e_honda__super_art_2_H: 一致 12 / 12 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[65] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L727)。発生 14。備考：() refers to reduced damage on active frame 5 onward; 2f extra landing recovery on block; 40f charge time (charge lasts 10f after releasing back direction); continues until it reaches opponent or edge of screen (variable Active and Total frame count); only first 4 active frames are cancelable into SA3; always -3 on block regardless of how meaty it connects, and usually in range for opponent's 4f normal to connect; extra pushback on block when opponent is in Burnout; good for chipping at opponent's Drive gauge; if Honda switches sides, he will start landing recovery (11+9 land) after 15 active frames (cannot safely fly under neutral jumps)
- 現行対応：e_honda__special_[4]6_P_H / Sumo Headbutt / 14F / accepted / base
- raw生成元：e_honda__[4]6hp (Sumo Headbutt), startup=14
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[4]6_P_H: 一致 14 / 14 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[66] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L738)。発生 10。備考：() refers to reduced damage on active frame 5 onward; 1f less landing recovery on block; 40f charge time (charge lasts 10f after releasing back direction); travels ~50% screen length; only first 4 active frames are cancelable into SA3; always -3 on block regardless of how meaty it connects, and usually in range for opponent's 4f normal to connect; extra pushback on block when opponent is in Burnout; good for chipping at opponent's Drive gauge
- 現行対応：e_honda__special_[4]6_P_L / Sumo Headbutt / 10F / accepted / base
- raw生成元：e_honda__[4]6lp (Sumo Headbutt), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[4]6_P_L: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[67] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L749)。発生 10。備考：() refers to reduced damage on active frame 5 onward; 2f extra landing recovery on block; 40f charge time (charge lasts 10f after releasing back direction); travels ~80% screen length; only first 4 active frames are cancelable into SA3; always -3 on block regardless of how meaty it connects, and usually in range for opponent's 4f normal to connect; extra pushback on block when opponent is in Burnout; good for chipping at opponent's Drive gauge
- 現行対応：e_honda__special_[4]6_P_M / Sumo Headbutt / 10F / accepted / base
- raw生成元：e_honda__[4]6mp (Sumo Headbutt), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[4]6_P_M: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### e_honda Cargo[68] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/e_honda.cargo.json#L760)。発生 9。備考：2 hits if used from close range; 2nd hit continues until it reaches opponent or edge of screen (variable Active and Total frame count); 7f extra landing recovery on block; 40f charge time (charge lasts 10f after releasing back direction); 1 hit of armor before active frames, then another hit of armor that lasts until end of active frames; armor has fixed 7f hitstop that allows it to punish safe jumps using Medium/Heavy air normals (Light safe jumps can still block OD Headbutt); always -20 on block regardless of how meaty it connects; from frame 26 onward, Honda transitions to his 30f recovery animation if he switches sides with the opponent
- 現行対応：e_honda__special_[4]6_P_OD / Sumo Headbutt / 9F / accepted / base
- raw生成元：e_honda__[4]6pp (Sumo Headbutt), startup=9
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：e_honda__special_[4]6_P_OD: 一致 9 / 9 (公式表の対応欄)
- 経路：raw → staging/candidates/e_honda.json → staging/adoption-inputs/e_honda.json → 個別採用規則 → data/characters/e_honda.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[8] 加算：236HK

- 判定：**誤変換疑い**。通常版の複合欄の後半5Fが欠落。公式の同強度・非ホールド行は合計値と一致する。保存備考だけでは前後各項の厳密な定義が不足するため疑いとする。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L100)。発生 12+5。備考：1-hit projectile hitbox; can only hit airborne opponents (puts opponent into limited juggle state); KD advantage varies based on height; must hold HK at least 30f to get enhanced version (releasing early results in delayed regular version); extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame); cancelable into 6KK/4KK on hit only (comes out after 15 recovery frames), giving Ed better oki after midscreen anti-air 236HK, or a juggle after corner anti-air 236HK
- 現行対応：ed__special_236_K_H / HK Psycho Flicker / 12F / accepted / base
- raw生成元：ed__236hk (HK Psycho Flicker), startup=12
- 採用候補：17。展開追加数：0、対応本番総数：1。
- 公式照合：ed__special_236_K_H: 不一致 12 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[10] 加算：236LK

- 判定：**誤変換疑い**。通常版の複合欄の後半5Fが欠落。公式の同強度・非ホールド行は合計値と一致する。保存備考だけでは前後各項の厳密な定義が不足するため疑いとする。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L122)。発生 11+5。備考：1-hit projectile hitbox (causes screen freeze on Perfect Parry); Punish Counter crumple state leaves opponent airborne (+21 before opponent hits the ground, can follow up with Drive Rush combo); puts airborne opponents into limited juggle state; total recovery is 2f faster on whiff; must hold LK at least 26f to get enhanced version (releasing early results in delayed regular version); when Super canceled, the SA3 incurs 30% immediate damage scaling; extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame); cancelable into 6KK/4KK on hit only (comes out after 15 recovery frames), giving Ed a juggle or improved oki after Punish Counter 236LK; Kill Rush Forward/Back cancel data: -18 oH, KD +42 on PC (+3 before opponent is knocked down after full dash animation)
- 現行対応：ed__special_236_K_L / LK Psycho Flicker / 11F / accepted / base
- raw生成元：ed__236lk (LK Psycho Flicker), startup=11
- 採用候補：16。展開追加数：0、対応本番総数：1。
- 公式照合：ed__special_236_K_L: 不一致 11 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[11] 加算：236MK

- 判定：**誤変換疑い**。通常版の複合欄の後半5Fが欠落。公式の同強度・非ホールド行は合計値と一致する。保存備考だけでは前後各項の厳密な定義が不足するため疑いとする。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L133)。発生 15+5。備考：1-hit projectile hitbox (causes screen freeze on Perfect Parry); Counter-Hit: KD +36; Punish Counter crumple state leaves opponent airborne (+23 before opponent hits the ground, can follow up with Drive Rush combo); puts airborne opponents into limited juggle state; total recovery is 1f faster on whiff; must hold MK at least 30f to get enhanced version (releasing early results in delayed regular version); when Super canceled, the SA3 incurs 30% immediate damage scaling; extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame); cancelable into 6KK/4KK on hit only (comes out after 17 recovery frames), giving Ed better oki after Counter-hit 236MK or a meterless juggle after Punish Counter 236MK; Kill Rush Forward/Back cancel data: -17 oH, KD +16 on CH, KD +42 on PC (+3 before opponent is knocked down after full dash animation)
- 現行対応：ed__special_236_K_M / MK Psycho Flicker / 15F / accepted / base
- raw生成元：ed__236mk (MK Psycho Flicker), startup=15
- 採用候補：20。展開追加数：0、対応本番総数：1。
- 公式照合：ed__special_236_K_M: 不一致 15 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[16] 加算：236[HK]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L188)。発生 30+5。備考：2-hit projectile hitbox; can only hit airborne opponents; slams opponent down into a limited juggle OTG bounce on hit; KD advantage varies based on height; can hold button for a maximum of 115+5 startup; recovery refers to whiffed version; KD advantage varies based on height; cancelable into Kill Rush (forward or back) on frames 16-115; automatically releases attack after 115f charge time; extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame)
- 現行対応：なし
- raw生成元：ed__236[hk] (HK Psycho Flicker (Hold)), startup=30
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[17] 加算：236[LK]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L199)。発生 26+5。備考：2-hit projectile hitbox (causes screen freeze on Perfect Parry); can grab opponent through 1-hit non-OD projectile or dissipate 2-hit non-OD projectile; pulls opponent a short distance toward Ed for a strike/throw mixup on block (pulled in half as far when Parried); launches opponent upward on grounded hit; slams opponent down into limited juggle OTG bounce on airborne hit; recovery refers to whiffed version; great oki tool (especially useful after corner throw); cancelable into Kill Rush (forward or back) on frames 16-115; automatically releases attack after 115f charge time; extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame)
- 現行対応：なし
- raw生成元：ed__236[lk] (LK Psycho Flicker (Hold)), startup=26
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[18] 加算：236[MK]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L210)。発生 30+5。備考：2-hit projectile hitbox (causes screen freeze on Perfect Parry); can grab opponent through 1-hit non-OD projectile or dissipate 2-hit non-OD projectile; pulls opponent a short distance toward Ed for a strike/throw mixup on block (pulled in half as far when Parried); launches opponent upward on grounded hit; slams opponent down into limited juggle OTG bounce on airborne hit; recovery refers to whiffed version; great oki tool; cancelable into Kill Rush (forward or back) on frames 16-115; automatically releases attack after 115f charge time; extends a forward hurtbox on frame 1 until the end of recovery (this hurtbox is projectile invuln until the first active frame)
- 現行対応：なし
- raw生成元：ed__236[mk] (MK Psycho Flicker (Hold)), startup=30
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[30] 加算：5/6KK~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L342)。発生 11+11。備考：6P must be input early (from 1-12f); cannot hit cross-up; puts opponent into limited juggle state
- 現行対応：なし
- raw生成元：ed__5/6kk6p (Kill Switch Break), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[31] 加算：5/6KK~dl.6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L353)。発生 13+11。備考：6P must be input late (from 13-24f); cannot hit cross-up; launches opponent into limited juggle state (higher than Kill Switch Break, often allowing better follow-ups); SA3 cancel whiffs on the final 2 cancelable frames
- 現行対応：なし
- raw生成元：ed__5/6kkdl6p (Kill Switch Chaser), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[44] 加算：5[HP]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L496)。発生 30+9。備考：Requires 30f of charge time; side switch on hit/block unless opponent is cornered (4f better block advantage in corner); crumples opponent on hit; 4f extra grounded advantage on Punish Counter; charging animation is cancelable only into Kill Rush Forward (5/6KK or 66) on frames 9-30; transitions from active to recovery if Ed crosses behind the opponent; extended foot hurtbox from frame 7 onward; Recovery: 29 on hit/block (25 on corner block only), 32 on whiff, 35 on corner whiff if all 15 active frames play out; POSSIBLE BUG: if attack connects on active frame 10-15 (only possible in meaty oki scenarios), Ed will not switch sides on block and will incur 35f recovery, making it punishable (<span style="color: #b70c0b;">'''-13'''</span> to <span style="color: #b70c0b;">'''-8'''</span>)
- 現行対応：なし
- raw生成元：ed__5[hp] (Psycho Knuckle (Lv.1)), startup=30 ; ed__5[hp] (Psycho Knuckle (Lv.2)), startup=60
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[45] 加算：5[HP]

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L507)。発生 60+9。備考：Requires 60f of charge time; has 1 hit of meterless projectile durability during active frames (8f hitstop when clashing); side switch on hit/block unless opponent is cornered; crumples opponent on hit; 4f extra grounded advantage on Punish Counter; charging animation is cancelable only into Kill Rush Forward (5/6KK or 66) on frames 9-60; transitions from active to recovery if Ed crosses behind the opponent; extended foot hurtbox from frame 7 onward; Recovery: 29 on hit/block, 32 on whiff, 35 on corner whiff if all 15 active frames play out
- 現行対応：なし
- raw生成元：ed__5[hp] (Psycho Knuckle (Lv.1)), startup=30 ; ed__5[hp] (Psycho Knuckle (Lv.2)), startup=60
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ed Cargo[64] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#L716)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.910 (min/throw), 2.190 (min/block), 3.374 (max/final DR frame)
- 現行対応：なし
- raw生成元：ed__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ed.json → staging/adoption-inputs/ed.json → 個別採用規則 → data/characters/ed.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[23] 備考・範囲追加：236PP~6HK or 236P~6P~6HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L265)。発生 22 (+Roll)。備考：2 hits (if 1st hit is blocked, 2nd hit is no longer an overhead); Low Crush 5-22f (can avoid moves before becoming airborne); projectile invuln disappears for a brief period after Lynx Song/Whirl (less effective as a fireball counter); projectile invuln does not apply to the top of Elena's head; Elena immediately loses crouch-sized hurtbox from Lynx Song; overhead that gives strong follow-up pressure on block, a 2LP on hit, and a medium combo after baiting the opponent's low buttons or throw tech; puts airborne opponents into limited juggle state on hit (can always pick up a juggle, but exact route depends on height and distance); total minimum startup from OD Lynx Song is 18+22 (longer and variable when used from Lynx Whirl)
- 現行対応：なし
- raw生成元：elena__236pp6hkor236p6p6hk (OD Mallet Smash), startup=22
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[24] 備考・範囲追加：236PP~6LK or 236P~6P~6LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L276)。発生 10 (+Roll)。備考：Elena immediately loses crouch-sized hurtbox and projectile invuln from Lynx Song (hard to use vs. projectiles); strong ender from Spinning Scythe on hit (3f gap) to reset pressure (but does not frame trap on block); useful for pressure on block (can beat 4f normals with 2LP, catch back walk with 2LK~2LP, and throw except vs. midscreen back walk); 1f extra recovery on whiff; the version used from OD Lynx Song is not considered an OD move for cancel purposes (no SA2 cancel); puts the opponent into a limited juggle state; total minimum startup from OD Lynx Song is 15+10 (longer and variable when used from Lynx Whirl)
- 現行対応：なし
- raw生成元：elena__236pp6lkor236p6p6lk (OD Leopard Snap), startup=10
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[25] 備考・範囲追加：236PP~6MK or 236P~6P~6MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L287)。発生 8 (+Roll)。備考：2f extra recovery on block/whiff; 1st hit pulls opponents inward on hit/block for combo consistency; feet/leg hurtboxes are anti-air invuln while active on frames 8-10 (both the kicking leg and the topmost body hurtbox); can anti-air opponents jumping out of roll pressure, but cannot hit cross-up; maintains projectile invuln from Lynx Song/Whirl to counter fireballs more effectively; Elena immediately loses crouch-sized hurtbox from Lynx Song; can combo from Spinning Scythe ~ Lynx Whirl on Counter-hit/Punish Counter; puts opponent into a limited juggle state; total minimum startup from OD Lynx Song is 18+8 (longer and variable when used from Lynx Whirl)
- 現行対応：なし
- raw生成元：elena__236pp6mkor236p6p6mk (OD Harvest Circle), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[27] 備考・範囲追加：236P~6HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L309)。発生 22 (+Roll)。備考：Low Crush 14-24f (final active frame is considered standing but still has a high hurtbox); projectile invuln disappears for a brief period after Lynx Song (less effective as a fireball counter); projectile invuln does not apply to the top of Elena's head; Elena immediately loses crouch-sized hurtbox from Lynx Song; safe overhead that can lead to a 5MK combo after baiting the opponent's throw tech; puts airborne opponents into limited juggle state on hit (can always pick up corner juggles, but midscreen juggles depend on height/spacing); total minimum startup depends on which strength of Lynx Song was used (LP 16+22, MP 18+22, HP 19+22)
- 現行対応：なし
- raw生成元：elena__236p6hk (Mallet Smash), startup=22
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[29] 備考・範囲追加：236P~6LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L331)。発生 10 (+Roll)。備考：Elena immediately loses crouch-sized hurtbox and projectile invuln from Lynx Song (hard to use vs. projectiles); generally safe on block if spaced as a poke; punishable by most characters at closer ranges (notable exceptions: A.K.I. only gets 2LK, Mai gets nothing); combos when buffered from 2MP or 2MK~HK in neutral; puts the opponent into a limited juggle state (only into SA3 cancel except in high corner juggles); total minimum startup depends on which strength of Lynx Song was used (LP 13+10, MP 13+10, HP 16+10)
- 現行対応：なし
- raw生成元：elena__236p6lk (Leopard Snap), startup=10
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[31] 備考・範囲追加：236P~6MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L353)。発生 8 (+Roll)。備考：Feet/leg hurtboxes are anti-air invuln while active on frames 8-10 (both the kicking leg and the topmost body hurtbox); can anti-air opponents jumping out of roll pressure, but cannot hit cross-up; maintains projectile invuln from Lynx Song to counter fireballs more effectively; Elena immediately loses crouch-sized hurtbox from Lynx Song; total minimum startup depends on which strength of Lynx Song was used (LP 16+8, MP 18+8, HP 19+8); puts opponent into a limited juggle state
- 現行対応：なし
- raw生成元：elena__236p6mk (Harvest Circle), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### elena Cargo[81] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/elena.cargo.json#L903)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.548 (min/throw), 2.100 (min/block), 3.011 (max/final DR frame)
- 現行対応：なし
- raw生成元：elena__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/elena.json → staging/adoption-inputs/elena.json → 個別採用規則 → data/characters/elena.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[51] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L573)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.805 (min/throw), 1.898 (min/block), 3.461 (max/final DR frame)
- 現行対応：なし
- raw生成元：guile__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[53] 備考・範囲追加：[2]8HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L595)。発生 7。備考：45f charge (charge lasts 12f after releasing down direction); cannot hit cross-ups; input 8+HK within 3f of each other for Perfect timing (better damage); does 400 less damage on active frames 3-6 (800 regular, 1000 perfect)
- 現行対応：guile__special_[2]8_K_H / HK Somersault Kick / 7F / accepted / base
- raw生成元：guile__[2]8hk (HK Somersault Kick), startup=7
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[2]8_K_H: 一致 7 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[54] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L606)。発生 6。備考：45f charge (charge lasts 15f after releasing down direction); cannot hit cross-ups; does not have a Perfect timing version; 2nd hit whiffs vs. crouch block (4f worse advantage, less chip damage); 1st hit does 300 less damage on active frames 3-4 (high anti-air or long range connect)
- 現行対応：guile__special_[2]8_K_OD / OD Somersault Kick / 6F / accepted / base
- raw生成元：guile__[2]8kk (OD Somersault Kick), startup=6
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[2]8_K_OD: 一致 6 / 6 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[55] 備考・範囲追加：[2]8LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L617)。発生 5。備考：45f charge (charge lasts 12f after releasing down direction); cannot hit cross-ups; input 8+LK within 3f of each other for Perfect timing (better damage); does 200 less damage on active frames 3-6 (800 regular, 1000 perfect); 2nd active frame extends a wide combo-only hitbox (important for specific combo routes like CH/PC 2MK~6MP bounce or max range CH 2MP link)
- 現行対応：guile__special_[2]8_K_L / LK Somersault Kick / 5F / accepted / base
- raw生成元：guile__[2]8lk (LK Somersault Kick), startup=5
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[2]8_K_L: 一致 5 / 5 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[56] 備考・範囲追加：[2]8MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L628)。発生 6。備考：45f charge (charge lasts 12f after releasing down direction); cannot hit cross-ups; input 8+MK within 3f of each other for Perfect timing (better damage); does 300 less damage on active frames 3-6 (800 regular, 1000 perfect)
- 現行対応：guile__special_[2]8_K_M / MK Somersault Kick / 6F / accepted / base
- raw生成元：guile__[2]8mk (MK Somersault Kick), startup=6
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[2]8_K_M: 一致 6 / 6 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[57] 備考・範囲追加：[4]646HP

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L639)。発生 7。備考：45f charge (charge lasts 22f after releasing back direction); 7-hit Super projectile; primarily used in air juggles (whiffs on crouching opponents unless they extend a vertical hurtbox, can hit standing opponents at close range); puts opponent into limited juggle state; KD Adv. can vary depending on juggle height; cannot be used while Sonic Blade projectile is active on-screen; can follow up with a LP/MP SA1 after hitting a grounded opponent
- 現行対応：guile__super_art_1_H / Sonic Hurricane / 7F / accepted / base
- raw生成元：guile__[4]646hp (Sonic Hurricane), startup=7
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：1。
- 公式照合：guile__super_art_1_H: 一致 7 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[58] 備考・範囲追加：[4]646K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L650)。発生 9。備考：45f charge (charge lasts 22f after releasing back direction); active frames 3-6 give a non-cinematic hit with reduced damage and chip; cannot hit cross-up; cinematic time regenerates ~1.8 Drive bars for Guile
- 現行対応：guile__super_art_3_L / Crossfire Somersault / 9F / accepted / base ; guile__super_art_3_M / Crossfire Somersault / 9F / accepted / base ; guile__super_art_3_H / Crossfire Somersault / 9F / accepted / base
- raw生成元：guile__[4]646k (Crossfire Somersault), startup=9 ; guile__[4]646k (Crossfire Somersault (CA)), startup=9
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：guile__super_art_3_L: 一致 9 / 9 (公式表の対応欄) ; guile__super_art_3_M: 一致 9 / 9 (公式表の対応欄) ; guile__super_art_3_H: 一致 9 / 9 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[59] 備考・範囲追加：[4]646K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L661)。発生 9。備考：45f charge (charge lasts 22f after releasing back direction); active frames 3-6 give a non-cinematic hit with reduced damage and chip; cannot hit cross-up; available at 25% HP or below; cinematic time regenerates ~2 Drive bars for Guile
- 現行対応：guile__super_art_3_L / Crossfire Somersault / 9F / accepted / base ; guile__super_art_3_M / Crossfire Somersault / 9F / accepted / base ; guile__super_art_3_H / Crossfire Somersault / 9F / accepted / base
- raw生成元：guile__[4]646k (Crossfire Somersault), startup=9 ; guile__[4]646k (Crossfire Somersault (CA)), startup=9
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：guile__super_art_3_L: 一致 9 / 9 (公式表の対応欄) ; guile__super_art_3_M: 一致 9 / 9 (公式表の対応欄) ; guile__super_art_3_H: 一致 9 / 9 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[60] 備考・範囲追加：[4]646P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L672)。発生 8(11)。備考：45f charge (charge lasts 22f after releasing back direction); 7-hit Super projectile; can input this horizontal version with LP or MP; cannot be used while Sonic Blade projectile is active on-screen; active frames 1-3 only hits on the shorter-range hitbox in front of Guile, but extends a combo-only hitbox to its full range that connects if the opponent is in hitstun (essentially has 11f startup as a long-range punish tool, like when used against the opponent's projectile); the upper combo-only hitbox applies to strike-based hitstun (e.g. j.MP air-to-air) while the lower combo-only hitbox applies to projectile-based hitstun (e.g. anti-air Sonic Boom); can be juggled into after HP SA1 if the opponent was launched from a grounded state
- 現行対応：guile__super_art_1_L / Sonic Hurricane / 8F / accepted / base ; guile__super_art_1_M / Sonic Hurricane / 8F / accepted / base
- raw生成元：guile__[4]646p (Sonic Hurricane), startup=8
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：2。
- 公式照合：guile__super_art_1_L: 一致 8 / 8 (公式表の対応欄) ; guile__super_art_1_M: 一致 8 / 8 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[61] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L683)。発生 10。備考：1-hit projectile; 45f charge (charge lasts 10f after releasing back direction); input 6+HP within 3f of each other for Perfect timing (better damage and Hit advantage); can follow up with Sonic Break (6P) during SA2; arm hurtbox appears 2f before active
- 現行対応：guile__special_[4]6_P_H / HP Sonic Boom / 10F / accepted / base
- raw生成元：guile__[4]6hp (HP Sonic Boom), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[4]6_P_H: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[62] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L694)。発生 10。備考：1-hit projectile; 45f charge (charge lasts 10f after releasing back direction); input 6+LP within 3f of each other for Perfect timing (better damage and Hit advantage); can follow up with Sonic Break (6P) during SA2; arm hurtbox appears 2f before active
- 現行対応：guile__special_[4]6_P_L / LP Sonic Boom / 10F / accepted / base
- raw生成元：guile__[4]6lp (LP Sonic Boom), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[4]6_P_L: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[63] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L705)。発生 10。備考：1-hit projectile; 45f charge (charge lasts 10f after releasing back direction); input 6+MP within 3f of each other for Perfect timing (better damage and Hit advantage); can follow up with Sonic Break (6P) during SA2; arm hurtbox appears 2f before active; has the most Drive Damage and Super Gain of all meterless versions, giving it a unique purpose
- 現行対応：guile__special_[4]6_P_M / MP Sonic Boom / 10F / accepted / base
- raw生成元：guile__[4]6mp (MP Sonic Boom), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[4]6_P_M: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### guile Cargo[64] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/guile.cargo.json#L716)。発生 10。備考：2-hit OD projectile; 45f charge (charge lasts 13f after releasing back direction); does not have a Perfect timing version; puts opponents into limited juggle state; can follow up with Sonic Break (6P) during SA2; SA2 cancel: KD+65/+25
- 現行対応：guile__special_[4]6_P_OD / OD Sonic Boom / 10F / accepted / base
- raw生成元：guile__[4]6pp (OD Sonic Boom), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：guile__special_[4]6_P_OD: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/guile.json → staging/adoption-inputs/guile.json → 個別採用規則 → data/characters/guile.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ingrid Cargo[7] 備考・範囲追加：214LP (HOLD OK)

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json#L89)。発生 -。備考：Builds Sun Crests up to a maximum of 4 stocks; can hold the button to extend the move and build stocks slightly more quickly (ends automatically upon reaching 4 stocks); Lv.1 (unheld version): 48F total, stock is built on frame 47 (or frame 42 when continuing to Lv.2 Hold); Lv.2 Hold: 94F total, button must be held 23F, 2nd stock is built on frame 93 (or frame 88 when continuing to Lv.3 Hold); Lv.3 Hold: 140F total, button must be held 85F, 3rd stock is built on frame 139 (or frame 134 when continuing to Lv.4 Hold); Lv.4 Hold: 186F total, button must be held 131F, 4th stock is built on frame 182; if activated with 4 Sun Crests, Ingrid instead builds 3000 Drive gauge every 46 frames (frame data is identical to the regular version but the button can be held indefinitely); Ingrid is in a counter-hit state for the entire duration; hurtbox expands upward on frames 10-44 (Lv.1) / 10-84 (Lv.2) / 10-130 (Lv.3) / 10-184 (Lv.4)
- 現行対応：ingrid__coverage_6 / Sun Flare / -F / accepted / base
- raw生成元：ingrid__214lp(holdok) (Sun Flare), startup=null
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：ingrid__coverage_6: 確認不能 - / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/ingrid.json → staging/adoption-inputs/ingrid.json → 個別採用規則 → data/characters/ingrid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ingrid Cargo[37] 加算：360+KK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json#L419)。発生 6+0。備考：Dark Ingrid only; command grab Super; opponent cannot jump after the freeze; can be comboed into on grounded opponents; cinematic time regenerates ~1.6 Drive bars for Ingrid
- 現行対応：なし
- raw生成元：ingrid__360+kk (Sun Octopus), startup=6
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ingrid.json → staging/adoption-inputs/ingrid.json → 個別採用規則 → data/characters/ingrid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ingrid Cargo[82] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ingrid.cargo.json#L914)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.375 (min/throw), 1.502 (min/block), 3.083 (max/final DR frame)
- 現行対応：なし
- raw生成元：ingrid__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ingrid.json → staging/adoption-inputs/ingrid.json → 個別採用規則 → data/characters/ingrid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[8] 備考・範囲追加：22P (activation)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L100)。発生 1。備考：Occurs automatically upon reaching Drink Level 4; causes drink animation to recover slightly faster, potentially giving better oki; screen freezes for 25f (invincible for 1f right as freeze occurs); 4f recovery is in a counter-hit state
- 現行対応：なし
- raw生成元：jamie__22p(activation) (The Devil Inside (DL4 activation)), startup=1
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[21] 備考・範囲追加：236HP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L243)。発生 15 [54]。備考：Can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; 2 hits; counter-hit/Punish Counter bonus only applies if 2nd hit connects; 2-7f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236hp6p (HP Freeflow Strikes Punch 1 (DL2)), startup=19 ; jamie__236hp6p (HP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[22] 備考・範囲追加：236HP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L254)。発生 19 [45]。備考：Damage DL0-DL3: 405/427/450/472 (Chip: 100/106/112/117); can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; counter-hit/Punish Counter bonus only applies if 1st Rekka did not hit; 3-8f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236hp6p (HP Freeflow Strikes Punch 1 (DL2)), startup=19 ; jamie__236hp6p (HP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[23] 備考・範囲追加：236HP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L265)。発生 16 [84]。備考：Can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 3 hits; 2-6f gap between 2nd/3rd Rekkas on block
- 現行対応：なし
- raw生成元：jamie__236hp6p6p (HP Freeflow Strikes Punch 2 (DL2)), startup=19 ; jamie__236hp6p6p (HP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[24] 備考・範囲追加：236HP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L276)。発生 19 [71]。備考：Damage DL0-DL3: 585(468)/617(494)/650(520)/682(546) (Chip: 145/153/162/170); can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 3-7f gap before final hit on block
- 現行対応：なし
- raw生成元：jamie__236hp6p6p (HP Freeflow Strikes Punch 2 (DL2)), startup=19 ; jamie__236hp6p6p (HP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[31] 備考・範囲追加：236LP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L353)。発生 13 [33]。備考：Damage DL0-DL3: 315/332/350/367 (Chip: 78/82/87/91); can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; counter-hit/Punish Counter bonus only applies if 1st Rekka did not hit; 0-2f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236lp6p (LP Freeflow Strikes Punch 1 (DL2)), startup=13 ; jamie__236lp6p (LP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[32] 備考・範囲追加：236LP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L364)。発生 15 [48]。備考：Can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; 2 hits; counter-hit/Punish Counter bonus only applies if 2nd hit connects; 2-7f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236lp6p (LP Freeflow Strikes Punch 1 (DL2)), startup=13 ; jamie__236lp6p (LP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[33] 備考・範囲追加：236LP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L375)。発生 13 [53]。備考：Damage DL0-DL3: 495(396)/522(418)/550(440)/577(462) (Chip: 123/130/137/144); can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 1-5f gap before final hit on block
- 現行対応：なし
- raw生成元：jamie__236lp6p6p (LP Freeflow Strikes Punch 2 (DL2)), startup=13 ; jamie__236lp6p6p (LP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[34] 備考・範囲追加：236LP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L386)。発生 16 [78]。備考：Can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 3 hits; 2-6f gap between 2nd/3rd Rekkas on block
- 現行対応：なし
- raw生成元：jamie__236lp6p6p (LP Freeflow Strikes Punch 2 (DL2)), startup=13 ; jamie__236lp6p6p (LP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[40] 備考・範囲追加：236MP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L452)。発生 15 [51]。備考：Can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; 2 hits; counter-hit/Punish Counter bonus only applies if 2nd hit connects; 2-7f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236mp6p (MP Freeflow Strikes Punch 1 (DL2)), startup=16 ; jamie__236mp6p (MP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[41] 備考・範囲追加：236MP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L463)。発生 16 [39]。備考：Damage DL0-DL3: 360/380/400/420 (Chip: 90/95/100/105); can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; counter-hit/Punish Counter bonus only applies if 1st Rekka did not hit; 0-5f blockstring gap depending on input timing
- 現行対応：なし
- raw生成元：jamie__236mp6p (MP Freeflow Strikes Punch 1 (DL2)), startup=16 ; jamie__236mp6p (MP Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[42] 備考・範囲追加：236MP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L474)。発生 16 [62]。備考：Damage DL0-DL3: 540(432)/570(456)/600(480)/630(504) (Chip: 135/142/150/157); can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 2-6f gap before final hit on block
- 現行対応：なし
- raw生成元：jamie__236mp6p6p (MP Freeflow Strikes Punch 2 (DL2)), startup=16 ; jamie__236mp6p6p (MP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[43] 備考・範囲追加：236MP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L485)。発生 16 [81]。備考：Can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; () refers to scaled damage when starting combo from 236P; 3 hits; 2-6f gap between 2nd/3rd Rekkas on block
- 現行対応：なし
- raw生成元：jamie__236mp6p6p (MP Freeflow Strikes Punch 2 (DL2)), startup=16 ; jamie__236mp6p6p (MP Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[48] 備考・範囲追加：236PP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L540)。発生 13 [34]。備考：Damage DL0-DL3: 405/427/450/472 (Chip: 100/106/112/117); can be performed on hit/block/whiff (startup is delayed by 5f on whiff version); [] refers to total startup when whiffing initial 236P; counter-hit/Punish Counter bonus only applies if 1st Rekka did not hit; 0-5f blockstring gap depending on input timing; does not count as a separate move for damage scaling purposes (but does apply scaling to any follow-ups after 3rd rekka hit)
- 現行対応：なし
- raw生成元：jamie__236pp6p (OD Freeflow Strikes Punch 1 (DL2)), startup=13 ; jamie__236pp6p (OD Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[49] 備考・範囲追加：236PP~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L551)。発生 15 [48]。備考：Can be performed on hit/block/whiff (startup is delayed by 4f on whiff version); [] refers to total startup when whiffing initial 236P; 2 hits; counter-hit/Punish Counter bonus only applies if 2nd hit connects; 0-5f blockstring gap depending on input timing; does not count as a separate move for damage scaling purposes (but does apply scaling to any follow-ups after 3rd rekka hit)
- 現行対応：なし
- raw生成元：jamie__236pp6p (OD Freeflow Strikes Punch 1 (DL2)), startup=13 ; jamie__236pp6p (OD Freeflow Strikes Punch 1 (DL4)), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[50] 備考・範囲追加：236PP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L562)。発生 13 [53]。備考：Damage DL0-DL3: 675(540)/712(570)/750(600)/787(630) (Chip: 168/177/187/196); can be performed on hit/block/whiff (startup is delayed by 2f on whiff version); [] refers to total startup when whiffing initial 236P~6P; 0-2f gap before final hit on block; does not count as a separate move for damage scaling purposes (but does apply scaling to follow-ups); SA2 cancel: KD+57/+10
- 現行対応：なし
- raw生成元：jamie__236pp6p6p (OD Freeflow Strikes Punch 2 (DL2)), startup=13 ; jamie__236pp6p6p (OD Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[51] 備考・範囲追加：236PP~6P~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L573)。発生 16 [78]。備考：Can be performed on hit/block/whiff (startup is delayed by 3f on whiff version); [] refers to total startup when whiffing initial 236P~6P; 3 hits; 2-6f gap between 2nd/3rd Rekkas on block; does not count as a separate move for damage scaling purposes (but does apply scaling to follow-ups); SA2 cancel: KD+58/+10
- 現行対応：なし
- raw生成元：jamie__236pp6p6p (OD Freeflow Strikes Punch 2 (DL2)), startup=13 ; jamie__236pp6p6p (OD Freeflow Strikes Punch 2 (DL4)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[87] 備考・範囲追加：6HK~4HK~P (close)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L969)。発生 (24~45)+14。備考：Drink Lv.4 only; 3f gap on block; combos naturally on hit (relatively confirmable); cancelable into any special or Super; startup includes 6HK plus the delay before Headbutt can be input; SA2 cancel: KD+54/+10; Drink cancel: KD+10/-34; special/DR/DI cancel is delayed until after 4th active frame; puts airborne opponents into free juggle state (e.g. if opponent tries to jump after 6HK)
- 現行対応：なし
- raw生成元：jamie__6hk4hkp(close) (Ransui Haze Headbutt (DL4)), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[88] 備考・範囲追加：6HK~4HK~P (far)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L980)。発生 (76~100)+Drink。備考：Drink Lv.4 only; can be performed on whiff; restores 1 bar of Drive gauge on the final recovery frame (2 bars if no input is made until frame 112); startup includes 6HK plus the delay before Drink can be input
- 現行対応：なし
- raw生成元：jamie__6hk4hkp(far) (Ransui Haze Drink (DL4)), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[89] 備考・範囲追加：6HK~4HK~P (mid)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L991)。発生 (51~75)+4。備考：Drink Lv.4 only; can be performed on whiff; can punish attempts to chase down the sway; first hit has short range and may whiff if the opponent is stationary; final hit is cancelable into any special or Super; startup includes 6HK plus the delay before Spin can be input; SA2 cancel: KD+57/+13; Drink cancel: KD+13/-31
- 現行対応：なし
- raw生成元：jamie__6hk4hkp(mid) (Ransui Haze Triple Fist (DL4)), startup=null
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jamie Cargo[114] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jamie.cargo.json#L1266)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.988 (min/throw), 2.03 (min/block), 3.002 (max/final DR frame)
- 現行対応：なし
- raw生成元：jamie__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jamie.json → staging/adoption-inputs/jamie.json → 個別採用規則 → data/characters/jamie.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[0] 備考・範囲追加：214214P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L12)。発生 1。備考：Spawns 4 separate 1-hit Super projectiles that track the opponent; starter scaling applies to 3rd attack in the combo; immediate scaling applies to the SA2 projectiles if comboed into; total startup for each hit of the sequence is 34f, 71f, 108f, 145f; leaves a 17f gap between each projectile on block; hitstun/blockstun values include the 13f hitstop inflicted on the defender
- 現行対応：jp__super_art_2_L / Lovushka / 1F / accepted / base ; jp__super_art_2_M / Lovushka / 1F / accepted / base ; jp__super_art_2_H / Lovushka / 1F / accepted / base
- raw生成元：jp__214214p (Lovushka), startup=1
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：jp__super_art_2_L: 条件違い 1 / 29 (ローカル1Fは発動値。公式29Fは攻撃発生であり、承認済みの発動値を置換しない) ; jp__super_art_2_M: 条件違い 1 / 29 (ローカル1Fは発動値。公式29Fは攻撃発生であり、承認済みの発動値を置換しない) ; jp__super_art_2_H: 条件違い 1 / 29 (ローカル1Fは発動値。公式29Fは攻撃発生であり、承認済みの発動値を置換しない)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[3] 加算：214P

- 判定：**現状維持が妥当**。設置発動50/40Fと自動攻撃までの100/70F。既存公式照合は定義の条件違い。設置代表値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L45)。発生 50+100。備考：Spawns a portal in the air according to button strength (LP close, MP mid, HP far); while the portal is active, JP cannot use 214P command grab; portal disappears if JP is hit or thrown; can manually input 214LP/MP or 214HP follow-up while portal is active; if no follow-up is input, the portal automatically spawns a 1-hit spike projectile toward the opponent 100f after JP recovers (150f total startup); spike puts opponents into a free juggle state; the automatic spike activation allows for strong mixups, as JP is free to move while it occurs (unlike 214P~214HP version where he snaps his fingers); cannot spawn another portal until the first has disappeared; Juggle Increase value becomes 1 when connecting mid-combo against opponent in a Free Juggle state (ensures that opponent will have Juggle Count 1 after the spike connects)
- 現行対応：jp__special_214_P_none / Departure / 50F / accepted / base
- raw生成元：jp__214p (Departure), startup=50
- 採用候補：現在値維持。展開追加数：3、対応本番総数：4。
- 公式照合：jp__special_214_P_none: 条件違い 50 / 150 (ローカルは設置発動の50F/40F、公式は自動攻撃の150F/110F。原典の設置後遅延注記と対応し、定義を混ぜない) ; jp__special_214_P_none__strength_L: 条件違い 50 / 150 (ローカルは設置発動の50F/40F、公式は自動攻撃の150F/110F。原典の設置後遅延注記と対応し、定義を混ぜない) ; jp__special_214_P_none__strength_M: 条件違い 50 / 150 (ローカルは設置発動の50F/40F、公式は自動攻撃の150F/110F。原典の設置後遅延注記と対応し、定義を混ぜない) ; jp__special_214_P_none__strength_H: 条件違い 50 / 150 (ローカルは設置発動の50F/40F、公式は自動攻撃の150F/110F。原典の設置後遅延注記と対応し、定義を混ぜない)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[4] 加算：214PP

- 判定：**現状維持が妥当**。設置発動50/40Fと自動攻撃までの100/70F。既存公式照合は定義の条件違い。設置代表値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L56)。発生 40+70。備考：Spawns 2 portals in the air according to button strengths used (LP close, MP mid, HP far); while the portals are active, JP cannot use 214P command grab; portals disappear if JP is hit or thrown; can manually input 214LP/MP or 214HP follow-up while portals are active; if no follow-up is input, each portal automatically spawns a 1-hit OD spike projectile (starting with the closest portal) angled toward the opponent 70f after JP recovers (110f total startup); spikes put opponents into a free juggle state; the automatic spike activation allows for strong mixups, as JP is free to move while it occurs (unlike 214PP~214HP version where he snaps his fingers); cannot spawn another portal until both have disappeared; Juggle Increase value becomes 1 when connecting mid-combo against opponent in a Free Juggle state (ensures that opponent will have Juggle Count 1 after the spikes connect)
- 現行対応：jp__special_214_P_OD / Departure / 40F / accepted / base
- raw生成元：jp__214pp (Departure), startup=40
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：jp__special_214_P_OD: 条件違い 40 / 110 (ローカルは設置発動の50F/40F、公式は自動攻撃の150F/110F。原典の設置後遅延注記と対応し、定義を混ぜない)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[17] 加算：236HK

- 判定：**誤変換確定**。14Fでghostが出ても移動中は非攻撃。到達後に8/12Fの攻撃発生が必要と明記。14のみは攻撃発生ではない。遠距離はさらに遅く固定の遠距離値は確定不可。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L199)。発生 14+12。備考：Spawns a "ghost" that travels toward opponent and clashes with 1-hit non-OD projectiles; upon reaching the opponent, begins an 12f low-hitting projectile attack; if the opponent moves forward quickly, it is possible to dodge the projectile entire since it is not active while traveling; from longer range, total startup increases and grants better frame advantage; cannot be used while SA2 is active; cancel into SA3 won't combo at close range without CH/PC; projectile speed decelerates by 0.01/frame when in proximity of opponent
- 現行対応：jp__special_236_K_H / Torbalan / 14F / accepted / base
- raw生成元：jp__236hk (Torbalan), startup=14
- 採用候補：26以上、遠距離未確定。展開追加数：0、対応本番総数：1。
- 公式照合：jp__special_236_K_H: 不一致 14 / 26 (公式表の対応欄)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[19] 加算：236KK

- 判定：**現状維持が妥当**。ODは既に22Fを採用し、14+8の必要な後半を含む。距離による追加時間の確定値は別問題。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L221)。発生 14+8。備考：Spawns a "ghost" that travels toward opponent with 2-hit OD projectile priority; upon reaching the opponent, begins an OD projectile attack with 8f startup; after clashing with 1-hit OD projectile, only the 1st hit of the projectile attack will come out; SA2 cancel is a true blockstring or combo into the projectile attacks; if the opponent moves forward quickly, it is possible to dodge the projectile entire since it is not active while traveling; from longer range, total startup increases and grants better frame advantage; cannot be used while SA2 is active; if 1st hit is Perfect Parried, leaves a large gap where JP can be punished if close enough; projectile speed decelerates by 0.01/frame when in proximity of opponent
- 現行対応：jp__special_236_K_OD / Torbalan / 22F / accepted / base
- raw生成元：jp__236kk (Torbalan), startup=22
- 採用候補：22を維持。展開追加数：0、対応本番総数：1。
- 公式照合：jp__special_236_K_OD: 一致 22 / 22 (公式表の対応欄)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[20] 加算：236LK

- 判定：**誤変換確定**。14Fでghostが出ても移動中は非攻撃。到達後に8/12Fの攻撃発生が必要と明記。14のみは攻撃発生ではない。遠距離はさらに遅く固定の遠距離値は確定不可。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L232)。発生 14+8。備考：Spawns a "ghost" that travels toward opponent and clashes with 1-hit non-OD projectiles; upon reaching the opponent, begins an 8f projectile attack; if the opponent moves forward quickly, it is possible to dodge the projectile entire since it is not active while traveling; from longer range, total startup increases and grants better frame advantage; cannot be used while SA2 is active; projectile speed decelerates by 0.01/frame when in proximity of opponent
- 現行対応：jp__special_236_K_L / Torbalan / 14F / accepted / base
- raw生成元：jp__236lk (Torbalan), startup=14
- 採用候補：22以上、遠距離未確定。展開追加数：0、対応本番総数：1。
- 公式照合：jp__special_236_K_L: 不一致 14 / 22 (公式表の対応欄)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[22] 加算：236MK

- 判定：**誤変換確定**。14Fでghostが出ても移動中は非攻撃。到達後に8/12Fの攻撃発生が必要と明記。14のみは攻撃発生ではない。遠距離はさらに遅く固定の遠距離値は確定不可。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L254)。発生 14+12。備考：Spawns a "ghost" that travels toward opponent and clashes with 1-hit non-OD projectiles; upon reaching the opponent, begins an 12f overhead projectile attack; if the opponent moves forward quickly, it is possible to dodge the projectile entire since it is not active while traveling; from longer range, total startup increases and grants better frame advantage; cannot be used while SA2 is active; cancel into SA3 won't combo at close range without CH/PC; projectile speed decelerates by 0.01/frame when in proximity of opponent
- 現行対応：jp__special_236_K_M / Torbalan / 14F / accepted / base
- raw生成元：jp__236mk (Torbalan), startup=14
- 採用候補：26以上、遠距離未確定。展開追加数：0、対応本番総数：1。
- 公式照合：jp__special_236_K_M: 不一致 14 / 26 (公式表の対応欄)
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### jp Cargo[63] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/jp.cargo.json#L705)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.525 (min/throw), 1.857 (min/block), 3.628 (max/final DR frame)
- 現行対応：なし
- raw生成元：jp__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/jp.json → staging/adoption-inputs/jp.json → 個別採用規則 → data/characters/jp.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### juri Cargo[86] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/juri.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/juri.cargo.json#L958)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.641 (min/throw), 2.479 (min/block), 3.999 (max/final DR frame)
- 現行対応：なし
- raw生成元：juri__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/juri.json → staging/adoption-inputs/juri.json → 個別採用規則 → data/characters/juri.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[65] 加算：KK~214K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L727)。発生 11+13。備考：Meterless only, does not vary by button strength; alternates between forward/backward hits; backwards hitbox can pull opponent towards Ken from behind; CH/PC advantage carries through all hits, making it a great punish starter against very unsafe moves; leaves Ken at close range for a strike/throw mixup on grounded hits; () refers to knockdown advantage when canceled from 5MP~HP
- 現行対応：なし
- raw生成元：ken__kk214k (Run~Tatsumaki Senpukyaku), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[66] 加算：KK~623K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L738)。発生 11+9(20)。備考：Meterless only, does not vary by button strength; properties similar to 623KK (startup, hits twice in juggles, side switch, 2f better advantage vs. crouch); lower OTG bounce height than 623KK; functional startup vs. standing opponents is 11+20f
- 現行対応：なし
- raw生成元：ken__kk623k (Run~Dragonlash Kick), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[67] 加算：KK~623P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L749)。発生 11+8。備考：Meterless only, does not vary by button strength; final hit whiffs vs. crouch block (1f worse advantage, 75 less chip dmg); cannot hit cross-up
- 現行対応：なし
- raw生成元：ken__kk623p (Run~Shoryuken), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[68] 加算：KK~HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L760)。発生 9+8。備考：Acts like a Normal Attack for Super canceling (including no extra damage scaling when canceled to SA3); puts airborne opponents into limited juggle state; unsafe at closer ranges but can be spaced safely; extends a forward hurtbox during recovery; 4f extra recovery on whiff or when absorbed by armor (guaranteed DI punish if absorbed and not canceled into Super)
- 現行対応：なし
- raw生成元：ken__kkhk (Forward Step Kick), startup=9
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[70] 加算：KK~MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L782)。発生 11+18。備考：Ken's only overhead outside of Jinrai Kick follow-ups; notably can't benefit from Drive Rush like other overheads, but can be used in meaty setups (+4) to link afterwards; lifts Ken's leg hurtbox on frames 10-20, allowing it to dodge some low attacks
- 現行対応：なし
- raw生成元：ken__kkmk (Thunder Kick), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ken Cargo[74] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ken.cargo.json#L826)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.745 (min/throw), 2.449 (min/block), 3.721 (max/final DR frame)
- 現行対応：なし
- raw生成元：ken__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ken.json → staging/adoption-inputs/ken.json → 個別採用規則 → data/characters/ken.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[17] 加算：236K (close)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L199)。発生 15+6。備考：Can frame trap vs. 4f normals when canceled from 2HP, 5HP, or 5MP; only comes out if there is an opponent at close range on or near the ground after the 15th frame of Sprint; if opponent becomes airborne after startup, the whiffed attack has 1f active + 25f recovery; if Perfect Parried, Kimberly becomes airborne before opponent can Throw punish (can be punished with Drive Impact airborne connect or a Forced Knockdown normal up to 6f startup)
- 現行対応：なし
- raw生成元：kimberly__236k(close) (Arc Step), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[18] 加算：236K (close)~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L210)。発生 8+15+13。備考：KD Adv. is +31 if Arc Step is blocked, +30 on hit midscreen, +29 on hit in the corner
- 現行対応：なし
- raw生成元：kimberly__236k(close)k (Bushin Hojin Kick), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[19] 加算：236K (close)~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L221)。発生 8+15+13。備考：Grabs standing/crouching opponents, whiffs vs. airborne (can be backdashed); 1656 damage on Punish Counter
- 現行対応：なし
- raw生成元：kimberly__236k(close)p (Bushin Izuna Otoshi), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[21] 加算：236KK (close)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L243)。発生 13+6。備考：True blockstring when canceled from 2HP; can frame trap vs. 4f normals when canceled from 5HP, 5MP, 5MK, or 5MP~HP; only comes out if there is an opponent at close range on or near the ground after the 13th frame of OD Sprint; if opponent becomes airborne after startup, the whiffed attack has 1f active + 25f recovery; if Perfect Parried, Kimberly becomes airborne before opponent can Throw punish (can be punished with Drive Impact airborne connect or a Forced Knockdown normal up to 6f startup)
- 現行対応：なし
- raw生成元：kimberly__236kk(close) (Arc Step), startup=13
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[22] 加算：236KK (close)~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L254)。発生 8+13+13。備考：Causes Wall Splat on hit near the corner; 2nd hit of the divekick occurs on hit only (1 hit on whiff or block); SA2 cancel works on either hit
- 現行対応：なし
- raw生成元：kimberly__236kk(close)k (Bushin Hojin Kick), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[23] 加算：236KK (close)~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L265)。発生 8+13+13。備考：Throw connects against grounded opponents, whiffs vs. airborne or backdash; opponent is put into a limited juggle OTG state (slightly less time for juggle follow-ups than j.236PP); 1035 damage on Punish Counter
- 現行対応：なし
- raw生成元：kimberly__236kk(close)p (Bushin Izuna Otoshi), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[24] 加算：236KK~HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L276)。発生 8+15。備考：Puts airborne opponents into short OTG juggle state (only SA2/SA3 cancels can follow up); Super cancels whiff vs. grounded opponents
- 現行対応：なし
- raw生成元：kimberly__236kkhk (Neck Hunter), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[25] 加算：236KK~LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L287)。発生 8+17。備考：Kicking legs are Anti-Air Invuln 14-23f (cannot hit cross-up); active frames 3-7 only hit airborne opponents above Kimberly (only active frames 1-2 are useful for meaty pressure); 2nd hit will expand its hitbox if the 1st hit connects, allowing both to connect on hit/block; puts opponent into limited juggle state (launches high in juggles, allowing Drive Rush 2HP loops); () refers to higher KD advantage when juggled into
- 現行対応：なし
- raw生成元：kimberly__236kklk (Torso Cleaver), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[26] 加算：236KK~MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L298)。発生 8+8。備考：4-19f low profile and upper body projectile invuln (only on the Slide itself); puts opponent into limited juggle state; advantage varies significantly depending on which active frame of the 2nd hit connects; () refers to KD advantage when juggled into (KD +49 from 5MP~HP unless delayed); 1st hit forces stand vs. grounded opponents (ensures SA2 cancel can connect); if the 1st hit connects with the opponent, the 2nd hit has a greatly expanded vertical hitbox to ensure juggle consistency
- 現行対応：なし
- raw生成元：kimberly__236kkmk (Shadow Slide), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[27] 加算：236KK~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L309)。発生 6+13。備考：Allows combo extensions from 5HP or 2HP, like a Drive Rush cancel for 2 bars with no damage scaling; latest possible stop occurs after 41f (54f total animation); shortest OD Run~Stop distance: 1.48
- 現行対応：なし
- raw生成元：kimberly__236kkp (Emergency Stop), startup=6
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[28] 加算：236K~HK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L320)。発生 8+19。備考：SA3 cancel can only combo in high connect juggles, or if overhead is absorbed by armor
- 現行対応：なし
- raw生成元：kimberly__236khk (Neck Hunter), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[29] 加算：236K~LK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L331)。発生 8+21。備考：Kicking legs are Anti-Air Invuln 18-27f (cannot hit cross-up); active frames 3-7 only hit airborne opponents above Kimberly (only active frames 1-2 are useful for meaty pressure); puts opponent into limited juggle state; () refers to higher KD advantage when juggled into
- 現行対応：なし
- raw生成元：kimberly__236klk (Torso Cleaver), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[30] 加算：236K~MK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L342)。発生 8+10。備考：6-21f low profile and upper body projectile invuln (only on the Slide itself); puts opponent into limited juggle state; advantage varies significantly depending on which active frame connects; () refers to KD advantage when juggled into (KD +47 from 5MP~HP unless delayed); cancel to SA3 can whiff when used from longer range
- 現行対応：なし
- raw生成元：kimberly__236kmk (Shadow Slide), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[31] 加算：236K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L353)。発生 8+14。備考：Latest possible stop occurs after 41f (55f total animation); shortest Run~Stop distance: 1.64
- 現行対応：なし
- raw生成元：kimberly__236kp (Emergency Stop), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### kimberly Cargo[83] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/kimberly.cargo.json#L925)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.817 (min/throw), 2.479 (min/block), 3.565 (max/final DR frame)
- 現行対応：なし
- raw生成元：kimberly__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/kimberly.json → staging/adoption-inputs/kimberly.json → 個別採用規則 → data/characters/kimberly.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### lily Cargo[0] 加算：214214P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json#L12)。発生 5+2。備考：Can be jumped out of during startup; can be comboed into like a hit-grab (immediate damage scaling applies to any combo into SA3); cinematic time regenerates ~1.7 Drive bars for Lily; Range: 1.728 (1.755 on 2nd active frame)
- 現行対応：lily__super_art_3_L / Raging Typhoon / 5F / accepted / base ; lily__super_art_3_M / Raging Typhoon / 5F / accepted / base ; lily__super_art_3_H / Raging Typhoon / 5F / accepted / base
- raw生成元：lily__214214p (Raging Typhoon), startup=5 ; lily__214214p (Raging Typhoon (CA)), startup=5
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：lily__super_art_3_L: 不一致 5 / 7 (公式表の対応欄) ; lily__super_art_3_M: 不一致 5 / 7 (公式表の対応欄) ; lily__super_art_3_H: 不一致 5 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/lily.json → staging/adoption-inputs/lily.json → 個別採用規則 → data/characters/lily.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### lily Cargo[1] 加算：214214P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json#L23)。発生 5+2。備考：Can be jumped out of during startup; can be comboed into like a hit-grab (immediate damage scaling applies to any combo into SA3); available at 25% HP or below; cinematic time regenerates ~2.4 Drive bars for Lily; Range: 1.728 (1.755 on 2nd active frame)
- 現行対応：lily__super_art_3_L / Raging Typhoon / 5F / accepted / base ; lily__super_art_3_M / Raging Typhoon / 5F / accepted / base ; lily__super_art_3_H / Raging Typhoon / 5F / accepted / base
- raw生成元：lily__214214p (Raging Typhoon), startup=5 ; lily__214214p (Raging Typhoon (CA)), startup=5
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：lily__super_art_3_L: 不一致 5 / 7 (公式表の対応欄) ; lily__super_art_3_M: 不一致 5 / 7 (公式表の対応欄) ; lily__super_art_3_H: 不一致 5 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/lily.json → staging/adoption-inputs/lily.json → 個別採用規則 → data/characters/lily.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### lily Cargo[35] 備考・範囲追加：5PPPKKK (HOLD OK)

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json#L397)。発生 147(17)。備考："Okay, smile! Good stuff."; Camera flash is a 1-hit low priority projectile; can hold any button to indefinitely delay the camera flash (17f startup after release)
- 現行対応：なし
- raw生成元：lily__5pppkkk(holdok) (Neutral Taunt), startup=147
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/lily.json → staging/adoption-inputs/lily.json → 個別採用規則 → data/characters/lily.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### lily Cargo[62] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/lily.cargo.json#L694)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.434 (min/throw), 1.900 (min/block), 3.044 (max/final DR frame)
- 現行対応：なし
- raw生成元：lily__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/lily.json → staging/adoption-inputs/lily.json → 個別採用規則 → data/characters/lily.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[9] 備考・範囲追加：236236K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L111)。発生 10(27)。備考：Luke runs forward; active frames occur upon reaching the opponent or on frame 27 (whichever occurs first) but invincibility is not extended when far from opponent; has juggle potential; on block, bounces away with a fixed recovery period (whiff recovery is 26f slower); cinematic time regenerates ~2 Drive bars for Luke; takes opponent to Memphis
- 現行対応：luke__super_art_3_L / Pale Rider / 10~27F / accepted / base ; luke__super_art_3_M / Pale Rider / 10~27F / accepted / base ; luke__super_art_3_H / Pale Rider / 10~27F / accepted / base
- raw生成元：luke__236236k (Pale Rider), startup=10 ; luke__236236k (Pale Rider (CA)), startup=10
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：luke__super_art_3_L: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない) ; luke__super_art_3_M: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない) ; luke__super_art_3_H: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない)
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[10] 備考・範囲追加：236236K

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L122)。発生 10(27)。備考：Luke runs forward; active frames occur upon reaching the opponent or on frame 27 (whichever occurs first) but invincibility is not extended when far from opponent; has juggle potential; on block, bounces away with a fixed recovery period (whiff recovery is 26f slower); cinematic time regenerates ~2.3 Drive bars for Luke; available at 25% HP or below; does not take opponent to Memphis
- 現行対応：luke__super_art_3_L / Pale Rider / 10~27F / accepted / base ; luke__super_art_3_M / Pale Rider / 10~27F / accepted / base ; luke__super_art_3_H / Pale Rider / 10~27F / accepted / base
- raw生成元：luke__236236k (Pale Rider), startup=10 ; luke__236236k (Pale Rider (CA)), startup=10
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：luke__super_art_3_L: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない) ; luke__super_art_3_M: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない) ; luke__super_art_3_H: 条件違い 10~27 / 10 (ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない)
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[15] 加算：236KK~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L177)。発生 11+13。備考：First 2 active frames can only hit airborne opponents; Luke is in a crouching state for entire recovery duration; puts opponent into limited juggle state (airborne hit will always juggle at least as high as a grounded hit)
- 現行対応：なし
- raw生成元：luke__236kkk (OD Impaler), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[16] 加算：236KK~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L188)。発生 11+12。備考：Puts opponent into limited juggle state; very late connect to juggle into 623LP/MP, SA1, or SA2 (otherwise, can only cancel into SA2 or SA3); midscreen, later active frames canceled into SA2 will whiff
- 現行対応：なし
- raw生成元：luke__236kkp (OD No Chaser), startup=11
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[17] 加算：236K~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L199)。発生 12+13。備考：First 2 active frames can only hit airborne opponents; 3rd active frame hits grounded and gives the best KD Advantage (cannot hit meaty to allow a follow-up juggle); Luke is in a crouching state for entire recovery duration; puts opponents into limited juggle state; 5f extra recovery on whiff
- 現行対応：なし
- raw生成元：luke__236kk (Impaler), startup=12
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[18] 加算：236K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L210)。発生 12+12。備考：Puts opponent into limited juggle state; very late connect to juggle into 623LP/MP, SA1, or SA2 (otherwise, can only cancel into SA3)
- 現行対応：なし
- raw生成元：luke__236kp (No Chaser), startup=12
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### luke Cargo[70] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/luke.cargo.json#L782)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.817 (min/throw), 2.499 (min/block), 3.461 (max/final DR frame)
- 現行対応：なし
- raw生成元：luke__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/luke.json → staging/adoption-inputs/luke.json → 個別採用規則 → data/characters/luke.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[1] 備考・範囲追加：214214P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L23)。発生 9(15)。備考：Shin Bison only (requires detonating Psycho Mine with Forward Taunt); cannot hit cross-up; 1st active frame only connects when Bison is cornered (usually connects on 7th active frame midscreen, making it functionally 15f startup); fullscreen anti-air and anti-projectile Super; during recovery, flies off-screen then reappears on the opposite side of opponent (does not switch sides vs. cornered opponents on HIT
- 現行対応：なし
- raw生成元：m_bison__214214p (Final Psycho Crusher), startup=9
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[27] 加算：4PPPKKK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L309)。発生 400+42 (792 total)。備考："My power howls. Face me!"; if opponent steps within range, Bison unleashes an unblockable strike that knocks down for no damage ("Not yet."); attack still comes out even if opponent stands behind Bison; if opponent does not approach: "Hmm. Coward."
- 現行対応：なし
- raw生成元：m_bison__4pppkkk (Back Taunt), startup=400
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[57] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L639)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.593 (min/throw), 2.650 (min/block), 4.425 (max/final DR frame)
- 現行対応：なし
- raw生成元：m_bison__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[58] 備考・範囲追加：[2]8K

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L650)。発生 18~46。備考：40f charge time (charge lasts 10f after releasing down direction); button strength determines trajectory (LK close, MK mid, HK far); landing recovery and total frame refers to LK/MK/HK version respectively; Bison is in a crouching state on the final landing recovery frame; can use the OD versions of follow-ups by pressing PP or KK; foot hurtbox is projectile invincible
- 現行対応：m_bison__special_[2]8_K_none / Shadow Rise / 18F / accepted / base
- raw生成元：m_bison__[2]8k (Shadow Rise), startup=18
- 採用候補：現在値維持。展開追加数：3、対応本番総数：4。
- 公式照合：m_bison__special_[2]8_K_none: 確認不能 18 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; m_bison__special_[2]8_K_none__strength_L: 確認不能 18 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; m_bison__special_[2]8_K_none__strength_M: 確認不能 18 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足) ; m_bison__special_[2]8_K_none__strength_H: 確認不能 18 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[59] 備考・範囲追加：[2]8KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L661)。発生 16~47。備考：40f charge time (charge lasts 10f after releasing down direction); automatically tracks opponent's location; horizontal travel speed depends on distance from opponent (much faster than HK Shadow Rise when used from longer ranges); follow-ups will become their respective OD versions without spending additional Drive gauge; Bison is in a crouching state on the final landing recovery frame
- 現行対応：m_bison__special_[2]8_K_OD / OD Shadow Rise / 16~47F / accepted / base
- raw生成元：m_bison__[2]8kk (OD Shadow Rise), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[2]8_K_OD: 確認不能 16~47 / 空欄 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[60] 加算：[2]8KK~K or [2]8K~KK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L672)。発生 16+15。備考：Can also be input after meterless Shadow Rise; transitions to cinematic follow-up on grounded hit (causing Psycho Mine to disappear); lands near opponent on block (does not bounce like meterless version); puts airborne opponents into limited juggle OTG state, dealing 800 less damage; can get better block advantage by inputting as late as possible before landing
- 現行対応：なし
- raw生成元：m_bison__[2]8kkkor[2]8kkk (OD Head Press), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[61] 加算：[2]8KK~P or [2]8K~PP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L683)。発生 16+21。備考：2 hits; can be steered left/right; cannot hit cross-up (but will turn around if Punch is input behind the opponent); 5f extra landing recovery on whiff; puts opponent into limited juggle state; gives good advantage on block; on whiff, final landing recovery frame is in a crouching state; on hit/block, all landing recovery frames are in a crouching state; does not extend a wide hurtbox like the meterless version, making it better for approaching
- 現行対応：なし
- raw生成元：m_bison__[2]8kkpor[2]8kpp (OD Devil Reverse), startup=16 ; m_bison__[2]8kkpor[2]8kpp (OD Devil Reverse (Mine)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[62] 加算：[2]8KK~P or [2]8K~PP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L694)。発生 16+21。備考：Detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); can be steered left/right; cannot hit cross-up (but will turn around if Punch is input behind the opponent); gives great advantage on block or a juggle on hit (follow-ups possible in the corner); Bison is in a crouching state during landing recovery; does not extend a wide hurtbox like the meterless version, making it better for approaching
- 現行対応：なし
- raw生成元：m_bison__[2]8kkpor[2]8kpp (OD Devil Reverse), startup=16 ; m_bison__[2]8kkpor[2]8kpp (OD Devil Reverse (Mine)), startup=16
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[63] 加算：[2]8K~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L705)。発生 18+15。備考：Bounces off opponent's head on hit/block/armor (can steer left/right after bounce); can hit cross-up; Hard Knockdown on Punish Counter; puts airborne opponents into limited juggle OTG state; Bison can auto-correct to face the opponent before descending; good hitbox and delayed descent makes it tricky to anti-air; drops straight to the ground on Perfect Parry (no follow-up possible)
- 現行対応：なし
- raw生成元：m_bison__[2]8kk (Head Press), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[65] 加算：[2]8K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L727)。発生 18+16。備考：Can be steered left/right; cannot hit cross-up (but will turn around if Punch is input behind the opponent); puts opponent into limited juggle state; gives good advantage on block; final landing recovery frame is in a crouching state; extends a wide full-body hurtbox forward on frame 9~ and a forward/downward hurtbox on the arms while active (easy to anti-air)
- 現行対応：なし
- raw生成元：m_bison__[2]8kp (Devil Reverse), startup=18 ; m_bison__[2]8kp (Devil Reverse (Mine)), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[66] 加算：[2]8K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L738)。発生 18+16。備考：Detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); can be steered left/right; cannot hit cross-up (but will turn around if Punch is input behind the opponent); gives great advantage on block or a juggle on hit (follow-ups possible in the corner); Bison is in a crouching state during landing recovery; extends a wide full-body hurtbox forward on frame 9~ and a forward/downward hurtbox on the arms while active (easy to anti-air)
- 現行対応：なし
- raw生成元：m_bison__[2]8kp (Devil Reverse), startup=18 ; m_bison__[2]8kp (Devil Reverse (Mine)), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[67] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L749)。発生 24。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when HP is input); 1-hit projectile clash hitbox on frames 24-49
- 現行対応：m_bison__special_[4]6_P_H / HP Psycho Crusher Attack / 24F / accepted / base
- raw生成元：m_bison__[4]6hp (HP Psycho Crusher Attack), startup=24 ; m_bison__[4]6hp (HP Psycho Crusher (Mine)), startup=24
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_H: 一致 24 / 24 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[68] 備考・範囲追加：[4]6HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L760)。発生 24。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when HP is input); strike hitbox surrounded by a 1-hit projectile clash hitbox on frames 24-49; detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); puts opponent into limited juggle state, allowing a follow-up juggle (SA1 midscreen, 214LP/SA3 corner); KD advantage depends on spacing (+46 close range, +51 most mid/far ranges); useful pressure tool after Backfist Combo due to its block advantage, but is susceptible to Perfect Parry; when Perfect Parried, Bison will usually be airborne as the opponent punishes
- 現行対応：m_bison__special_[4]6_P_H / HP Psycho Crusher Attack / 24F / accepted / base
- raw生成元：m_bison__[4]6hp (HP Psycho Crusher Attack), startup=24 ; m_bison__[4]6hp (HP Psycho Crusher (Mine)), startup=24
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_H: 一致 24 / 24 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[69] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L771)。発生 14。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when LP is input); 1-hit projectile clash hitbox on frames 14-29
- 現行対応：m_bison__special_[4]6_P_L / LP Psycho Crusher Attack / 14F / accepted / base
- raw生成元：m_bison__[4]6lp (LP Psycho Crusher Attack), startup=14 ; m_bison__[4]6lp (LP Psycho Crusher (Mine)), startup=14
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_L: 一致 14 / 14 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[70] 備考・範囲追加：[4]6LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L782)。発生 14。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when LP is input); strike hitbox surrounded by a 1-hit projectile clash hitbox on frames 14-29; detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); puts opponent into limited juggle state (cancel into SA3 connects before Psycho Mine explodes); KD advantage depends on spacing (+41 close range, +42 most mid ranges, +39 on last active frame); useful pressure tool after Backfist Combo due to its block advantage, but is susceptible to Perfect Parry; when Perfect Parried, Bison will usually be airborne as the opponent punishes
- 現行対応：m_bison__special_[4]6_P_L / LP Psycho Crusher Attack / 14F / accepted / base
- raw生成元：m_bison__[4]6lp (LP Psycho Crusher Attack), startup=14 ; m_bison__[4]6lp (LP Psycho Crusher (Mine)), startup=14
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_L: 一致 14 / 14 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[71] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L793)。発生 20。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when MP is input); 1-hit projectile clash hitbox on frames 20-35
- 現行対応：m_bison__special_[4]6_P_M / MP Psycho Crusher Attack / 20F / accepted / base
- raw生成元：m_bison__[4]6mp (MP Psycho Crusher Attack), startup=20 ; m_bison__[4]6mp (MP Psycho Crusher (Mine)), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_M: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[72] 備考・範囲追加：[4]6MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L804)。発生 20。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when MP is input); strike hitbox surrounded by a 1-hit projectile clash hitbox on frames 20-35; detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); puts opponent into limited juggle state (cancel into SA3 connects before Psycho Mine explodes); KD advantage depends on spacing (+41 close range, +42 most mid ranges, +39 on last active frame); useful pressure tool after Backfist Combo due to its block advantage, but is susceptible to Perfect Parry; when Perfect Parried, Bison will usually be airborne as the opponent punishes
- 現行対応：m_bison__special_[4]6_P_M / MP Psycho Crusher Attack / 20F / accepted / base
- raw生成元：m_bison__[4]6mp (MP Psycho Crusher Attack), startup=20 ; m_bison__[4]6mp (MP Psycho Crusher (Mine)), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_M: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[73] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L815)。発生 16。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when PP is input); cancel into SA2 does not combo
- 現行対応：m_bison__special_[4]6_P_OD / OD Psycho Crusher Attack / 16F / accepted / base
- raw生成元：m_bison__[4]6pp (OD Psycho Crusher Attack), startup=16 ; m_bison__[4]6pp (OD Psycho Crusher (Mine)), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_OD: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### m_bison Cargo[74] 備考・範囲追加：[4]6PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/m_bison.cargo.json#L826)。発生 16。備考：45f charge time (charge lasts 8f after releasing back direction, and must be holding forward when PP is input); strike hitbox (no projectile clash since Bison has full projectile invuln); detonates Psycho Mine on hit/block (does not trigger on Perfect Parry); launches opponent high into a limited juggle state, followed by an OTG bounce; when juggling late on these OTG bounce frames, an extra 10% Immediate Scaling is applied to the follow-ups (but an earlier juggle has no extra scaling); useful pressure tool after Backfist Combo due to its block advantage, but is susceptible to Perfect Parry; when Perfect Parried, Bison will usually be airborne as the opponent punishes
- 現行対応：m_bison__special_[4]6_P_OD / OD Psycho Crusher Attack / 16F / accepted / base
- raw生成元：m_bison__[4]6pp (OD Psycho Crusher Attack), startup=16 ; m_bison__[4]6pp (OD Psycho Crusher (Mine)), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：m_bison__special_[4]6_P_OD: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/m_bison.json → staging/adoption-inputs/m_bison.json → 個別採用規則 → data/characters/m_bison.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### mai Cargo[32] 加算：236[PP]~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json#L364)。発生 57+15。備考：Throws an additional 2-hit projectile with OD priority (does not dissipate on contact with strike hitboxes); on contact with the opponent, the fan splits into 2 additional projectiles and bounces up before hitting on the way down; the two falling fans bounce at staggered heights, with the second hitting much later than the first; if 1 hit of the first Midare Kachousen is dissipated then the low bouncing fan does not appear; puts opponents into a limited juggle state if the initial Midare Kachousen fan connects, while the falling fans keep the opponent in grounded hitstun; () refers to damage/hitstun values of the bouncing follow-ups on hit or block; any hit that connects after the follow-up bounce overwrites the fan's hitstun/blockstun; Mai has an extended hurtbox vulnerable to strikes on her arm/head (28-79f); the listed frame advantage assumes Mai is at point blank range; all hits up to the first bouncing fan are a true blockstring (advantage is calculated from that point, ignoring the final delayed fan); the bouncing fan does not trigger proximity guard (allowing back walk) and counts as an air attack (allows anti-air invuln moves to pass through)
- 現行対応：なし
- raw生成元：mai__236[pp]6p (Midare Kachousen), startup=57 ; mai__236[pp]6p (Midare Kachousen (Flame)), startup=57
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/mai.json → staging/adoption-inputs/mai.json → 個別採用規則 → data/characters/mai.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### mai Cargo[33] 加算：236[PP]~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json#L375)。発生 57+15。備考：Throws an additional 2-hit projectile with OD priority (does not dissipate on contact with strike hitboxes); on contact with the opponent, the fan splits into 2 additional projectiles and bounces up before hitting on the way down; the two falling fans bounce at staggered heights, with the second hitting much later than the first; if 1 hit of the first Midare Kachousen is dissipated then the low bouncing fan does not appear; puts opponents into a limited juggle state if the initial Midare Kachousen fan connects, while the falling fans keep the opponent in grounded hitstun; () refers to damage/hitstun values of the bouncing follow-ups on hit or block; any hit that connects after the follow-up bounce overwrites the fan's hitstun/blockstun; Mai has an extended hurtbox vulnerable to strikes on her arm/head (28-79f); the listed frame advantage assumes Mai is at point blank range; there are small interruptible gaps on block before Midare Kachousen or the bouncing follow-ups connect; the exact gaps between falling fans varies greatly depending on spacing, standing/crouching, and character height; the bouncing fan does not trigger proximity guard (allowing back walk) and counts as an air attack (allows anti-air invuln moves to pass through)
- 現行対応：なし
- raw生成元：mai__236[pp]6p (Midare Kachousen), startup=57 ; mai__236[pp]6p (Midare Kachousen (Flame)), startup=57
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/mai.json → staging/adoption-inputs/mai.json → 個別採用規則 → data/characters/mai.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### mai Cargo[86] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/mai.cargo.json#L958)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.669 (min/throw), 2.383 (min/block), 2.977 (max/final DR frame)
- 現行対応：なし
- raw生成元：mai__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/mai.json → staging/adoption-inputs/mai.json → 個別採用規則 → data/characters/mai.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### manon Cargo[1] 備考・範囲追加：214HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json#L23)。発生 20(21)。備考：Forces crouch on hit; 1st active frame can only hit airborne opponents (functionally 21f startup); works as a low crush but not actually airborne
- 現行対応：manon__special_214_K_H / HK Dégagé / 20F / accepted / base
- raw生成元：manon__214hk (HK Dégagé), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：manon__special_214_K_H: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/manon.json → staging/adoption-inputs/manon.json → 個別採用規則 → data/characters/manon.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### manon Cargo[6] 加算：236236P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json#L78)。発生 6+1。備考：Command throw that can be comboed into; opponent can jump on reaction after the Super freeze; damage at Medal Lv. 1-5: 4000/4100/4200/4400/4600; cannot hit opponents behind Manon; juggles into meterless 236P grant a restand that combos into SA3; cinematic time regenerates ~2.2 Drive bars for Manon; Range: 1.463 (2nd active frame 1.489)
- 現行対応：manon__super_art_3_L / Pas de Deux / 6F / accepted / base ; manon__super_art_3_M / Pas de Deux / 6F / accepted / base ; manon__super_art_3_H / Pas de Deux / 6F / accepted / base
- raw生成元：manon__236236p (Pas de Deux), startup=6 ; manon__236236p (Pas de Deux (CA)), startup=6
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：manon__super_art_3_L: 不一致 6 / 7 (公式表の対応欄) ; manon__super_art_3_M: 不一致 6 / 7 (公式表の対応欄) ; manon__super_art_3_H: 不一致 6 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/manon.json → staging/adoption-inputs/manon.json → 個別採用規則 → data/characters/manon.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### manon Cargo[7] 加算：236236P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json#L89)。発生 6+1。備考：Command throw that can be comboed into; opponent can jump on reaction after the Super freeze; damage at Medal Lv. 1-5: 4500/4600/4700/4900/5100; cannot hit opponents behind Manon; juggles into meterless 236P grant a restand that combos into SA3; available at 25% HP or below; cinematic time regenerates ~2.4 Drive bars for Manon; Range: 1.463 (2nd active frame 1.489)
- 現行対応：manon__super_art_3_L / Pas de Deux / 6F / accepted / base ; manon__super_art_3_M / Pas de Deux / 6F / accepted / base ; manon__super_art_3_H / Pas de Deux / 6F / accepted / base
- raw生成元：manon__236236p (Pas de Deux), startup=6 ; manon__236236p (Pas de Deux (CA)), startup=6
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：manon__super_art_3_L: 不一致 6 / 7 (公式表の対応欄) ; manon__super_art_3_M: 不一致 6 / 7 (公式表の対応欄) ; manon__super_art_3_H: 不一致 6 / 7 (公式表の対応欄)
- 経路：raw → staging/candidates/manon.json → staging/adoption-inputs/manon.json → 個別採用規則 → data/characters/manon.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### manon Cargo[16] 加算：236PP~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json#L188)。発生 15+10。備考：Any invincibility from 236PP is lost as soon as the kick follow-up starts (can slightly delay the follow-up to extend invincibility); puts opponent into free juggle state on hit; can be spaced to be safer in neutral; combos naturally from 4HP, making it an excellent combo tool for damage and corner carry
- 現行対応：なし
- raw生成元：manon__236ppk (OD Grand Fouetté), startup=15
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/manon.json → staging/adoption-inputs/manon.json → 個別採用規則 → data/characters/manon.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### manon Cargo[59] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/manon.cargo.json#L661)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.506 (min/throw), 1.417 (min/block), 2.347 (max/final DR frame)
- 現行対応：なし
- raw生成元：manon__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/manon.json → staging/adoption-inputs/manon.json → 個別採用規則 → data/characters/manon.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[7] 加算：214K~K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L89)。発生 8+16。備考：Risky low ender; may catch opponent by surprise since the overhead ender is safe on block; Marisa is in a Punish Counter state for entire duration; range includes 0.218 forward movement from 214K startup
- 現行対応：なし
- raw生成元：marisa__214kk (Procella), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[8] 加算：214K~LPLK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L100)。発生 8+5。備考：Marisa is in a Punish Counter state for entire duration; Range: 1.109 (final active frame: 1.164); range includes 0.218 forward movement from 214K startup; 2875 damage on Punish Counter
- 現行対応：なし
- raw生成元：marisa__214klplk (Enfold), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[9] 加算：214K~P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L111)。発生 8+15(16)。備考：1st active frame only hits airborne opponents (functionally 8+16f startup vs. grounded); causes spike knockdown vs. airborne opponents; Marisa is in a Punish Counter state for entire duration; hitconfirm window is 1f shorter vs. grounded opponents; cannot be canceled into Tonitrus 2 on whiff; range includes 0.218 forward movement from 214K startup
- 現行対応：なし
- raw生成元：marisa__214kp (Tonitrus 1), startup=8
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[23] 備考・範囲追加：236HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L265)。発生 22。備考：Armor loses to low attacks; cannot hit cross-up; can hold the button 35f to charge a more powerful version (armor is lost immediately upon button release); after releasing partial charge, startup is 10f (frames 12-19), 9f (frames 20-27), or 8f (frames 28-34); holding the button for 33-34f results in an uncharged 236HP with even slower startup than the fully charged version
- 現行対応：marisa__special_236_P_H / Gladius / 22F / accepted / base
- raw生成元：marisa__236hp (Gladius), startup=22
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：marisa__special_236_P_H: 一致 22 / 22 (公式表の対応欄)
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[26] 備考・範囲追加：236LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L298)。発生 17。備考：Armor loses to low attacks; cannot hit cross-up; can hold the button 26f to charge a more powerful version (armor is lost immediately upon button release); after releasing partial charge, startup is 5f (frames 12-19) or 4f (frames 20-25); holding the button for 11-12f can extend the armor by 1-2f without increasing startup
- 現行対応：marisa__special_236_P_L / Gladius / 17F / accepted / base
- raw生成元：marisa__236lp (Gladius), startup=17
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：marisa__special_236_P_L: 一致 17 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[28] 備考・範囲追加：236MP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L320)。発生 19。備考：Armor loses to low attacks; cannot hit cross-up; can hold the button 29f to charge a more powerful version (armor is lost immediately upon button release); after releasing partial charge, startup is 7f (frames 12-19) or 6f (frames 20-28)
- 現行対応：marisa__special_236_P_M / Gladius / 19F / accepted / base
- raw生成元：marisa__236mp (Gladius), startup=19
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：marisa__special_236_P_M: 一致 19 / 19 (公式表の対応欄)
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[29] 備考・範囲追加：236PP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L331)。発生 19。備考：Armor loses to low attacks; cannot hit cross-up; can hold the button 29f to charge a more powerful version; after releasing partial charge, startup is 8f (frames 11-12), 7f (frames 13-19), or 6f (frames 20-28)
- 現行対応：marisa__special_236_P_OD / Gladius / 19F / accepted / base
- raw生成元：marisa__236pp (Gladius), startup=19
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：marisa__special_236_P_OD: 一致 19 / 19 (公式表の対応欄)
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### marisa Cargo[87] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/marisa.cargo.json#L969)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.544 (min/throw), 1.903 (min/block), 3.081 (max/final DR frame)
- 現行対応：なし
- raw生成元：marisa__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/marisa.json → staging/adoption-inputs/marisa.json → 個別採用規則 → data/characters/marisa.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[21] 加算：236K

- 判定：**誤変換確定**。11〜27Fで離して6F後に弾発生、合計17〜33Fとの明記。11だけでは弾が発生しない。非ホールド最短17F。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L243)。発生 11+6。備考：1-hit projectile that travels forward before arcing upward; can hold button to charge for a powered-up version; trajectory depends on button strength (LK = farthest/horizontal, MK = middle, HK = shortest/vertical); projectile comes out in 6f if button is released from frames 11-27 (total startup 17-33f); cannot use if SA2 is active
- 現行対応：rashid__special_236_K_none / Whirlwind Shot / 11F / accepted / base
- raw生成元：rashid__236k (Whirlwind Shot), startup=11
- 採用候補：17（最短）。距離到達時間を含む遠距離値は別途未確定。展開追加数：3、対応本番総数：4。
- 公式照合：rashid__special_236_K_none: 不一致 11 / 17 (公式表の対応欄) ; rashid__special_236_K_none__strength_L: 不一致 11 / 17 (公式表の対応欄) ; rashid__special_236_K_none__strength_M: 不一致 11 / 17 (公式表の対応欄) ; rashid__special_236_K_none__strength_H: 不一致 11 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[22] 備考・範囲追加：236KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L254)。発生 17。備考：2-hit OD projectile; 2nd hit puts opponent into limited juggle state on hit; travels fullscreen; hitbox is low to the ground, making many low-profile anti-projectile moves ineffective; projectile comes out in 6f if button is released from frames 11-34 (total startup 17-40f); cannot use if SA2 is active
- 現行対応：rashid__special_236_K_OD / Whirlwind Shot / 17F / accepted / base
- raw生成元：rashid__236kk (Whirlwind Shot), startup=17
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：rashid__special_236_K_OD: 一致 17 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[31] 加算：236{K}

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L353)。発生 28+6。備考：2-hit projectile; trajectory depends on button strength (LK = farthest/horizontal, MK = middle, HK = shortest/vertical); must hold button 28f; counter-hit/Punish Counter bonus advantage applies to both hits; projectile comes out in 6f if button is released from frames 28-47 (total startup 34-53f); cannot use if SA2 is active
- 現行対応：なし
- raw生成元：rashid__236{k} (Whirlwind Shot (Partial Hold)), startup=28
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[53] 加算：6KK~KK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L595)。発生 18+51 total。備考：Input during 6KK; holding forward/back/neutral direction affects flip distance; can use any air attack frames 22-40; can be affected by Air Current on frames 1-36, traveling forward fullscreen
- 現行対応：なし
- raw生成元：rashid__6kkkk (Front Flip), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[57] 加算：6[6]~6K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L639)。発生 18+16。備考：Counter-hit/Punish Counter bonus advantage applies to both hits; frames 1-3 can be affected by Air Current, becoming the Enhanced version
- 現行対応：なし
- raw生成元：rashid__6[6]6k (Tempest Moon), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[58] 加算：6[6]~6K

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L650)。発生 18+9。備考：Puts opponent into limited juggle OTG state if first hit connects (regular knockdown if first hit doesn't connect)
- 現行対応：なし
- raw生成元：rashid__6[6]6k (Tempest Moon), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[59] 加算：6[6]~6P

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L661)。発生 18+8。備考：Crouching state for entire move duration; on hit, connects twice and switches sides, remaining projectile invincible throughout the entire animation; on block, connects once and stays on the same side; if opponent is cornered, Rashid is close enough for a follow-up combo; counter-hit/Punish Counter bonus advantage applies to both hits; frames 1-17 can be affected by Air Current
- 現行対応：なし
- raw生成元：rashid__6[6]6p (Backup), startup=18
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### rashid Cargo[78] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/rashid.cargo.json#L870)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.796 (min/throw), 2.253 (min/block), 2.998 (max/final DR frame)
- 現行対応：なし
- raw生成元：rashid__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/rashid.json → staging/adoption-inputs/rashid.json → 個別採用規則 → data/characters/rashid.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### ryu Cargo[76] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/ryu.cargo.json#L848)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.525 (min/throw), 1.878 (min/block), 3.628 (max/final DR frame)
- 現行対応：なし
- raw生成元：ryu__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/ryu.json → staging/adoption-inputs/ryu.json → 個別採用規則 → data/characters/ryu.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### sagat Cargo[47] 備考・範囲追加：623HP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json#L529)。発生 18。備考：Extremely long range but slow startup (cannot combo naturally from light normals, but works well as a combo ender from 5LK whiff punish); deals 600 less damage on active frames 3-10; cannot hit cross-up; can be charged into a much stronger version by holding the button 24 frames; releasing the button early results in uncharged 623HP with 8f startup after release; if partially charged, the Air Invuln is 1-9f then 1-11f after the button is released, and the airborne frames are 12-57f after the button is released; puts opponent into a limited juggle state (allows SA3 cancel on active frames 1-2 only)
- 現行対応：sagat__special_623_P_H / HP Tiger Uppercut / 18F / accepted / base
- raw生成元：sagat__623hp (HP Tiger Uppercut), startup=18
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：sagat__special_623_P_H: 一致 18 / 18 (公式表の対応欄)
- 経路：raw → staging/candidates/sagat.json → staging/adoption-inputs/sagat.json → 個別採用規則 → data/characters/sagat.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### sagat Cargo[68] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/sagat.cargo.json#L760)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.546 (min/throw), 1.869 (min/block), 3.156 (max/final DR frame)
- 現行対応：なし
- raw生成元：sagat__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/sagat.json → staging/adoption-inputs/sagat.json → 個別採用規則 → data/characters/sagat.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[3] 備考・範囲追加：214HK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L45)。発生 23(30)。備考：2 hits vs. grounded, up to 3 hits vs. airborne; first 7 active frames can only hit airborne opponents (functionally 30f startup); cannot hit cross-up; puts airborne opponent into limited juggle state; kicking leg is anti-air invuln on frames 28-30; can be spaced out to hit once with 2f better advantage; technically has 4 hits, but up to 3 can land at once; damage is highly variable depending on which hits connect (last hit does most damage, but landing all 3 airborne hits allows strong juggle extensions); can hop over many grounded attacks (even some standing); can be used for a sideswitch mid-combo or a corpse hop on downed opponents; strong vs. Burnout, dealing chip while staying close range with frame advantage (but too slow to cancel into for Burnout loops); last hit is lower to the ground than other versions and can beat moves that low profile other versions
- 現行対応：terry__special_214_K_H / HK Crack Shoot / 23F / accepted / base
- raw生成元：terry__214hk (HK Crack Shoot), startup=23
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：terry__special_214_K_H: 一致 23 / 23 (公式表の対応欄)
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[5] 備考・範囲追加：214KK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L67)。発生 20(21)。備考：Puts airborne opponents into limited juggle OTG state; first active frame does not connect on grounded opponents (functionally 21f startup); first 2 active frames have a good anti-air hitbox; can hop over many grounded attacks (even some standing); very strong vs. Burnout, dealing chip while staying close range with frame advantage (often required to get point blank after 2 reps of meterless Burnout loop)
- 現行対応：terry__special_214_K_OD / OD Crack Shoot / 20F / accepted / base
- raw生成元：terry__214kk (OD Crack Shoot), startup=20
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：terry__special_214_K_OD: 一致 20 / 20 (公式表の対応欄)
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[6] 備考・範囲追加：214LK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L78)。発生 16(18)。備考：First 2 active frames can only hit airborne opponents (functionally 18f startup); cannot hit cross-up; causes spike knockdown vs. airborne opponents; causes Hard Knockdown on Punish Counter (prevents follow-up links); can hop over many grounded attacks (especially crouching); can be used for a sideswitch mid-combo or a corpse hop on downed opponents; very strong vs. Burnout, dealing chip while staying close range with frame advantage
- 現行対応：terry__special_214_K_L / LK Crack Shoot / 16F / accepted / base
- raw生成元：terry__214lk (LK Crack Shoot), startup=16
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：terry__special_214_K_L: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[7] 備考・範囲追加：214LP

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L89)。発生 10(22)。備考：2 hits; functionally 22f startup as an overhead; on hit, leaves Terry at close range for a strike/throw/shimmy mixup or can backdash shimmy to become at least +10 vs. throw tech; short range, primarily used in light confirms
- 現行対応：terry__special_214_P_L / Quick Burn / 10F / accepted / base
- raw生成元：terry__214lp (Quick Burn), startup=10
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：terry__special_214_P_L: 一致 10 / 10 (公式表の対応欄)
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[8] 備考・範囲追加：214LPMP or 214LPHP

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L100)。発生 10(22)。備考：2 hits that transition to a 3rd attack on hit only; functionally 22f startup as an overhead; gives solid damage and oki from light normals
- 現行対応：なし
- raw生成元：terry__214lpmpor214lphp (OD Quick Burn), startup=10
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[9] 備考・範囲追加：214MK

- 判定：**現状維持が妥当**。備考を候補として抽出。ホールド・距離・追加攻撃等の別条件を記述し、必要項の欠落を示す根拠は確認できない。一般加算せず現在値を保持。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L111)。発生 17(22)。備考：2 hits vs. airborne, 1 hit vs. grounded (different damage values accordingly); first 5 active frames can only hit airborne opponents (functionally 22f startup); cannot hit cross-up; puts airborne opponents into limited juggle state; causes Hard Knockdown on Counter-hit/Punish Counter (prevents follow-up links); can hop over many grounded attacks (even some standing); can be used for a sideswitch mid-combo or a corpse hop on downed opponents; very strong vs. Burnout, dealing chip while staying close range with frame advantage
- 現行対応：terry__special_214_K_M / MK Crack Shoot / 17F / accepted / base
- raw生成元：terry__214mk (MK Crack Shoot), startup=17
- 採用候補：現在値維持。展開追加数：0、対応本番総数：1。
- 公式照合：terry__special_214_K_M: 一致 17 / 17 (公式表の対応欄)
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### terry Cargo[65] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/terry.cargo.json#L727)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.634 (min/throw), 2.416 (min/block), 3.181 (max/final DR frame)
- 現行対応：なし
- raw生成元：terry__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/terry.json → staging/adoption-inputs/terry.json → 個別採用規則 → data/characters/terry.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### yasmine Cargo[1] 備考・範囲追加：214214P~4KK

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/yasmine.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/yasmine.cargo.json#L23)。発生 22(30)。備考：Requires SA2 install; each use consumes 375f (25%) of SA2 install timer; deals Drive Damage on normal hit (0.5 bars if both hits connect); reaches fullscreen and extends a huge proximity guard hitbox from frame 15 onward; if the 1st hit is blocked, parried, or absorbed by armor, Yasmine stops her forward movement and does not perform the 2nd hit (this hit has 2f active + 24f recovery); on hit, Yasmine will dash behind the opponent (even in the corner) and perform a 2nd hit that launches the opponent into a limited juggle state; this cross-up hit can also occur if the first hit whiffs (like in a knockdown setup or on a jumping opponent); cross-up hit has functionally 30f startup when used as an oki tool; can be canceled into from 2MK~HK and 5MK~MK~HK Target Combos on hit; active frame distribution is 2(11)5 when both hits connect; whiff recovery is 1f faster (19f) if Yasmine passes far behind the opponent before the 2nd hit comes out; startup time can be up to 3f faster (19f) if Yasmine passes through a close range airborne/teleporting opponent with no collision box; after a corner sideswitch, some follow-up juggles can whiff under the opponent (623HK requires delay, while 623MK and SA1 are auto-timed)
- 現行対応：なし
- raw生成元：yasmine__214214p4kk (Linya ng Liwanag), startup=22
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/yasmine.json → staging/adoption-inputs/yasmine.json → 個別採用規則 → data/characters/yasmine.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### yasmine Cargo[70] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/yasmine.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/yasmine.cargo.json#L782)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.708 (min/throw), 2.478 (min/block), 3.918 (max/final DR frame)
- 現行対応：なし
- raw生成元：yasmine__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/yasmine.json → staging/adoption-inputs/yasmine.json → 個別採用規則 → data/characters/yasmine.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### zangief Cargo[26] 備考・範囲追加：5HP

- 判定：**現状維持が妥当**。非ホールド16Fの承認済み個別代表条件。範囲の最大ホールドを混ぜない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json#L298)。発生 (6~22)+10。備考：Button can be held up to 22f for armored partial charge (armor loses to hitboxes that connect on Zangief's lower body); 10f startup after button release (total startup 16-32f); 2 extra recovery frames on whiff; counter-hit also gives KD +32; puts airborne opponents into limited juggle state
- 現行対応：zangief__normal_5_P_H / 立ち強P / 16F / accepted / base
- raw生成元：zangief__5hp (Standing Heavy Punch), startup=null
- 採用候補：16。展開追加数：0、対応本番総数：1。
- 公式照合：zangief__normal_5_P_H: 一致 16 / 16 (公式表の対応欄)
- 経路：raw → staging/candidates/zangief.json → staging/adoption-inputs/zangief.json → 個別採用規則 → data/characters/zangief.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### zangief Cargo[49] 加算：720+P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json#L551)。発生 6+0。備考：Command grab Super; opponent cannot jump after the freeze; can only be comboed into with OD Lariat (1st hit), Punish Counter 3HK wall splat, or grounded crumple state; cinematic time regenerates ~2.2 Drive bars for Zangief; Range: 1.56 (2nd active frame, jumpable: 1.60)
- 現行対応：zangief__super_art_3_L / Bolshoi Storm Buster / 6F / accepted / base ; zangief__super_art_3_M / Bolshoi Storm Buster / 6F / accepted / base ; zangief__super_art_3_H / Bolshoi Storm Buster / 6F / accepted / base
- raw生成元：zangief__720+p (Bolshoi Storm Buster), startup=6 ; zangief__720+p (Bolshoi Storm Buster (CA)), startup=6
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：zangief__super_art_3_L: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足) ; zangief__super_art_3_M: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足) ; zangief__super_art_3_H: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/zangief.json → staging/adoption-inputs/zangief.json → 個別採用規則 → data/characters/zangief.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### zangief Cargo[50] 加算：720+P

- 判定：**現状維持が妥当**。SAは原典表の発生・発動値を保持する現行規則。暗転前後を一般加算しない。公式不一致は別の定義検証課題として残す。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json#L562)。発生 6+0。備考：Command grab Super; opponent cannot jump after the freeze; can only be comboed into with OD Lariat (1st hit), Punish Counter 3HK wall splat, or grounded crumple state; available at 25% HP or below; cinematic time regenerates ~2.7 Drive bars for Zangief; Range: 1.61 (2nd active frame, jumpable: 1.65)
- 現行対応：zangief__super_art_3_L / Bolshoi Storm Buster / 6F / accepted / base ; zangief__super_art_3_M / Bolshoi Storm Buster / 6F / accepted / base ; zangief__super_art_3_H / Bolshoi Storm Buster / 6F / accepted / base
- raw生成元：zangief__720+p (Bolshoi Storm Buster), startup=6 ; zangief__720+p (Bolshoi Storm Buster (CA)), startup=6
- 採用候補：現在値維持（SA定義の検証は未確定）。展開追加数：0、対応本番総数：3。
- 公式照合：zangief__super_art_3_L: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足) ; zangief__super_art_3_M: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足) ; zangief__super_art_3_H: 確認不能 6 / 6+0 (公式値が空欄、複合値、または全体Fの根拠不足)
- 経路：raw → staging/candidates/zangief.json → staging/adoption-inputs/zangief.json → 個別採用規則 → data/characters/zangief.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。

### zangief Cargo[65] 加算：MPMK~66

- 判定：**現状維持が妥当**。対応する基本技なし。Drive系・派生・ホールド・空中・特殊状態等は収録規則の対象外。対応なしを技の不存在とは解釈しない。
- 原典：[archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json](../archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json#L727)。発生 3+8。備考：See [[Street_Fighter_6/Gauges#Drive_Rush|Drive Rush]]; 1-bar version performed out of a Parry; startup refers to minimum time before an attack can cancel the Drive Rush animation (if performed immediately after a successful Parry, only 1+8 startup); the first 15 recovery frames are cancelable into any attack; the final 22 recovery frames are cancelable into any attack or movement option or blocking (except Parry); only Normal and Command Normal attacks are enhanced with +4 frame advantage and improved juggle properties; Distance: 0.327 (min/throw), 1.455 (min/block), 3.040 (max/final DR frame)
- 現行対応：なし
- raw生成元：zangief__mpmk66 (Parry Drive Rush), startup=3
- 採用候補：採用値変更なし。展開追加数：0、対応本番総数：0。
- 公式照合：対応技なし、公式照合の対象外
- 経路：raw → staging/candidates/zangief.json → staging/adoption-inputs/zangief.json → 個別採用規則 → data/characters/zangief.json。対応なしの場合、この経路で基本技への採用を確認できない。rawに数値しかない場合、候補生成は既存数値をconfirmedとして保持するため元の複合表記を復元できない。
