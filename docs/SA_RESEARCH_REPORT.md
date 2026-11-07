# スーパーアーツ全32キャラ調査（第15段階A）

保存済み原典の`super_art`全199行を分類し、32キャラ×SA1/2/3の96枠すべてに対応する基本始動を確認した。独立したSAおよびSA派生は198行、SA2中の派生必殺技Rolling Cannonは1行。強度差を確認したSAは7枠で、全面的な強度共通性を確認できたSAは0枠だった。採用、入力単位、CAの範囲、発動系の表示条件は未決定であり、実装前に第16節の5項目をレビューする。

今回の成果物は調査専用。既存32キャラ908レコードと通常技・必殺技coverageは変更していない。worktree・ブランチ作成、commit・push・merge等も行っていない。

## 1. 調査対象と情報源

- 調査記録日時（UTC）：`2026-11-06T17:42:26.540333+00:00`。各ネット取得日時は`source-summary.json`を参照。
- 開始HEAD：`a93b5c3a01c6a1ad4de69aa6e7a2b32842fed456`、開始ブランチ：`main`。開始時の未コミット変更は`workspace-baseline.json`に記録。
- raw：`archive/staging/sf6-frame-data/raw/*.json`、32ファイル。各行のURL・取得日時・ID・全原典値をinventoryに保存。
- Cargo：`archive/staging/sf6-frame-data-quality/evidence/*.cargo.json`、32ファイル。取得時刻・JSON Pointer・元HTML表記を保存。

rawには2026-08-19取得行だけでなく後続取得行も含まれる。取得日時はレコード単位で扱う。Cargoは2026-11-05取得。同じSuperCombo Wiki由来であり、独立した公式検証ではない。対象ゲーム版は全件`UNVERIFIED`。他サイトで表示された版や取得日からゲーム版を推測しない。ライセンス表記もrawの`CC-BY-SA`とCargoの`CC-BY-SA-4.0`を元のまま残した。

SAレベル対応表は[sf6-senseiの固定リビジョン](https://github.com/RyoSogawa/sf6-sensei/blob/a0b4105fb368c308699ec0757ee6e4182e5a9d1c/packages/data/src/sa-levels.json)を参照。リビジョンは`a0b4105fb368c308699ec0757ee6e4182e5a9d1c`（commit日時2026-11-02T12:16:32Z）。内容を`sa-levels.snapshot.json`に保存した。コミュニティの補助表として使い、原典の技名・入力・消費ゲージ・派生注記と照合した。

現行[SuperCombo Edページ](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)はAnubisのAccess Denied、[公式リュウフレームページ](https://www.streetfighter.com/6/ja-jp/character/ryu/frame)は403で内容を取得できなかった。GitHubの通常表示も取得失敗したが、固定SHAのraw URLは取得できた。今回の値は保存済み資料を基準とし、現行パッチや実機確認済みとはしていない。

## 2. 調査方法

`DATA_SPEC`、`DATA_WORKFLOW`、`ADOPTION_RULES`、`GAME_SPEC`、`ROTATION_AND_COVERAGE_AUDIT`、schema/input/resolverは開始HEADの版を読んだ。作業途中のUI変更を評価根拠にしていない。`data/adoption-decisions.json`と本番キャラ32ファイルも読み取り確認し、SAが現行採用範囲外であることと908レコードを確認した。

全raw行からcategoryが`super_art`の行を抽出。主キーは`character:raw:配列index`とした。同じ原典技ID・入力でもSA3/CA、強化版、ホールド版等が重複するため、原典IDだけでは統合しない。入力だけによるSAレベル推定は避け、表と明示的消費量を照合した。ディージェイの追加打撃、テリーの追加ゲイザーは親SAと注記から対応付け、追加ゲージ量を独立SAレベルと誤認しない。

Cargoは194行が注記完全一致、3行が入力一意一致、アルジュンSA3/CAの2行が入力と明示的CA条件で一意に対応した。入力・注記・条件の元データは全件保持。ゲージ・名前のないCargoだけで新SAを確定しない。候補照合後に残ったCargo 2行はrawのspecialに対応した（第13節）。

フレームは原典ごとに数値、特殊値、明示的対象外、未記載、複合/条件値を記録した。原典間の差は別欄に保持。発生＋持続＋硬直の加算、欠損補完、括弧外の採用処理、D変換を実施していない。原典のKDや~を落としているrawは、Cargo表記も参照する必要がある。

## 3. 32キャラ別SA1・SA2・SA3一覧

各セルは通常状態・地上・非ホールドの基本始動候補。個別強度版は併記した。引用IDの配列位置、全フレーム、注記、出典は付録とinventoryから追跡できる。ここでの「基本版」は採用決定を意味しない。

| キャラ | SA1 | SA2 | SA3 | raw行数 |
| --- | --- | --- | --- | --- |
| aki / A.K.I. | Deadly Implication `236236K` (aki:raw:13) | Tainted Talons `214214P` (aki:raw:0) | Claws of Ya Zi `236236P` (aki:raw:14) | 4 |
| akuma / 豪鬼 | Messatsu Gohado `236236P` (akuma:raw:17) | Empyrean’s End `214214P` (akuma:raw:1) | Sip of Calamity `236236K` (akuma:raw:15) | 8 |
| alex / アレックス | Raging Spear `236236K` (alex:raw:1) | Sledgecross Hammer `214214P` (alex:raw:0) | The Final Prison `236236P` (alex:raw:2) | 5 |
| arjun / アルジュン | Howling Destruction `236236K` (arjun:raw:6) | Instant Oblivion `214214P` (arjun:raw:0) | Yaksha's Order `236236P` (arjun:raw:7) | 4 |
| blanka / ブランカ | Shout of Earth `236236P` (blanka:raw:10) | Lightning Beast `214214P` (blanka:raw:0) | Ground Shave Cannonball `236236K` (blanka:raw:8) | 5 |
| cammy / キャミィ | Spin Drive Smasher `236236K` (cammy:raw:5) | Killer Bee Spin `214214P` (cammy:raw:0) | Delta Red Assault `236236P` (cammy:raw:6) | 5 |
| chunli / 春麗 | Kikosho `236236P` (chunli:raw:19) | Hoyoku-sen `236236K` (chunli:raw:18) | Soten Ranka `214214K` (chunli:raw:0) | 5 |
| cviper / C.ヴァイパー | Limit Decoupler `236236K` (cviper:raw:17) | Mission Complete `214214P` (cviper:raw:2) | Hard Luck Rejector `214214K` (cviper:raw:0) | 4 |
| dee_jay / ディージェイ | The Greatest Sobat `236236K` (dee_jay:raw:29) | Headliner Sunrise Festival `236236HP` (dee_jay:raw:20)<br>Lowkey Sunrise Festival `236236LP` (dee_jay:raw:30)<br>Marvelous Sunrise Festival `236236MP` (dee_jay:raw:37) | Weekend Pleasure `214214P` (dee_jay:raw:0) | 28 |
| dhalsim / ダルシム | Yoga Inferno `236236HP` (dhalsim:raw:7)<br>Yoga Inferno `236236LP` (dhalsim:raw:10)<br>Yoga Inferno `236236MP` (dhalsim:raw:11) | Yoga Sunburst `214214K` (dhalsim:raw:4) | Merciless Yoga `236236K` (dhalsim:raw:8) | 8 |
| e_honda / エドモンド本田 | Show of Force `236236P` (e_honda:raw:8) | Ultimate Killer Head Ram `[4]646K` (e_honda:raw:28) | The Final Bout `214214P` (e_honda:raw:0) | 4 |
| ed / エド | Psycho Storm `236236K` (ed:raw:5) | Psycho Cannon `214214P` (ed:raw:0) | Psycho Chamber `236236P` (ed:raw:6) | 4 |
| elena / エレナ | Meteor Volley `236236K` (elena:raw:12) | Revival Dance `236236P` (elena:raw:13) | Song of the Grasslands `214214K` (elena:raw:0) | 5 |
| guile / ガイル | Sonic Hurricane `[4]646HP` (guile:raw:24)<br>Sonic Hurricane `[4]646P` (guile:raw:27) | Solid Puncher `214214P` (guile:raw:0) | Crossfire Somersault `[4]646K` (guile:raw:25) | 5 |
| ingrid / イングリッド | Shining Sun (0 Stock) `236236K (0 Stock)` (ingrid:raw:14) | Order of the Sun (0 Stock) `214214P (0 Stock)` (ingrid:raw:1) | Cosmic Ray `236236P` (ingrid:raw:17) | 9 |
| jamie / ジェイミー | Breakin' `236236K` (jamie:raw:12) | The Devil's Song (DL0-DL4) `214214P` (jamie:raw:0) | Getsuga Saiho (DL2) `236236P` (jamie:raw:15) | 5 |
| jp / JP | Chornobog `236236P` (jp:raw:16) | Lovushka `214214P` (jp:raw:0) | Interdiction `236236K` (jp:raw:14) | 4 |
| juri / ジュリ | Sakkai Fuhazan `236236K` (juri:raw:8) | Feng Shui Engine `214214P` (juri:raw:2) | Kaisen Dankai Raku `214214K` (juri:raw:0) | 6 |
| ken / ケン | Dragonlash Flame `214214K` (ken:raw:0) | Shippu Jinrai-kyaku `236236K` (ken:raw:5) | Shinryu Reppa `236236P` (ken:raw:6) | 4 |
| kimberly / キンバリー | Bushin Beats `236236K` (kimberly:raw:11) | Bushin Scramble `214214P` (kimberly:raw:0) | Bushin Ninjastar Cypher `236236P` (kimberly:raw:13) | 6 |
| lily / リリー | Breezing Hawk `236236P` (lily:raw:10) | Thunderbird `236236K` (lily:raw:8) | Raging Typhoon `214214P` (lily:raw:0) | 7 |
| luke / ルーク | Vulcan Blast `236236P` (luke:raw:14) | Eraser `214214P` (luke:raw:0) | Pale Rider `236236K` (luke:raw:12) | 4 |
| m_bison / ベガ | Knee Press Nightmare `236236K` (m_bison:raw:10) | Psycho Punisher `214214K` (m_bison:raw:0) | Unlimited Psycho Crusher `236236P` (m_bison:raw:11) | 5 |
| mai / 不知火舞 | Kagerou no Mai `236236P` (mai:raw:12) | Chou Hissatsu Shinobi Bachi `236236K` (mai:raw:10) | Shiranui Ryuu: Enbu Ada Zakura `214214P` (mai:raw:0) | 8 |
| manon / マノン | Arabesque `236236K` (manon:raw:5) | Étoile `214214K` (manon:raw:0) | Pas de Deux `236236P` (manon:raw:6) | 4 |
| marisa / マリーザ | Javelin of Marisa `236236P` (marisa:raw:19) | Meteorite `214214P` (marisa:raw:0) | Goddess of the Hunt `236236K` (marisa:raw:17) | 6 |
| rashid / ラシード | Super Rashid Kick `236236K` (rashid:raw:16) | Ysaar `214214K` (rashid:raw:0) | Altair `236236P` (rashid:raw:17) | 4 |
| ryu / リュウ | Shinku Hadoken `236236P` (ryu:raw:19) | Shin Hashogeki Lv.1 `214214P` (ryu:raw:0) | Shin Shoryuken `236236K` (ryu:raw:17) | 10 |
| sagat / サガット | Tiger Cannon `236236P` (sagat:raw:17) | Savage Tiger `214214K` (sagat:raw:0) | Tiger Vanquisher `236236K` (sagat:raw:15) | 8 |
| terry / テリー | Buster Wolf `236236K` (terry:raw:12) | Power Geyser `214214P` (terry:raw:0) | Rising Fang `236236P` (terry:raw:13) | 6 |
| yasmine / ヤスミン | Hiwa ng Kalangitan `236236K` (yasmine:raw:8) | Nakatagong Lakas `214214P` (yasmine:raw:0) | Pamumukadkad ng Sampaguita `236236P` (yasmine:raw:9) | 4 |
| zangief / ザンギエフ | Aerial Russian Slam `236236K` (zangief:raw:5) | Cyclone Lariat `236236P` (zangief:raw:6) | Bolshoi Storm Buster `720+P` (zangief:raw:49) | 5 |

## 4. 基本版SAの収録状況

96枠すべてに基本始動が保存され、SAレベルと入力を特定できる。基本候補は強度別行を含め101行。条件付き行は98行。サガットSA2は基本始動が存在するが、ヒット結果は方向選択で変わり、基本行はCargoで`HKD ~`。代表ヒット値は未確定。ジェイミーSA3の技名`(DL2)`はDL2限定という意味にせず、注記のDL0〜DL4ダメージ記載を保持した。

## 5. 強度差があるSA：7枠（対象raw 39行）

| SA | 原典が示す差 | フレーム以外の注意 |
| --- | --- | --- |
| A.K.I. SA2 | LP近〜中、MP中〜全画面、HP全画面 | 毒沼配置・移動も変化。共通の7/153/30/-19を全強度同性能と解釈しない |
| ディージェイSA2 | LP/MP/HPで始動ダメージ300/300/200。始動フレーム12/62/+6/-29 | 派生難度、リズム、最終打撃の可否・ダメージが変わる。派生ボタン強度と始動強度を別記 |
| ダルシムSA1 | LP/MPは10/128/KD+29/-10、HPは10/133/KD+27/-22。ダメージ1920/2100/2040 | MPはLPより短射程・上向き終段。各強度行を保持 |
| ダルシムSA2 | button strength determines trajectory | 非ホールド・部分/最大ホールドでも軌道差。具体的なL/M/H軌道の角度は未記載 |
| エドSA2 | LP slow / MP mid / HP fast | 弾速差。低速版の長いコンボ等も注記。個別速度数値はないので補完しない |
| ガイルSA1 | LP/MP横版：8(11)/89/KD+41/-26、HP上向き版：7/75/KD+70/-2 | 横版P行をLP/MPと対応付ける注記あり。強度差と相手の高さ・距離による条件差を分ける |
| イングリッドSA2 | LP弾発生103F/相手前、MP68F/相手上、HP98F/相手後（全画面例外） | 0/1/2ストック行の発動表記は1/13。弾発生をその値に上書きしない |

## 6. 強度共通と確認できたSA

全性能について`strength_same`と確定できたSAは0枠。原典が同一性を明記した属性は、リュウSA1（通常/電刃）・豪鬼SA1・サガットSA1の弾速、豪鬼の空中SA1の弾速と角度。これらは`confirmedSameAspects`に保存した。発生・持続・無敵・範囲等まで同じという保証へ広げていない。

## 7. 強度未指定・未確定のSA

raw単位では`strength_different`39行、`strength_unspecified`159行、`strength_uncertain`1行（Rolling Cannon）。7枠以外の89 SA枠は、全性能の強度差なしを確認できていない。全行で発生・全体・ヒット・ガード・ダメージ・弾速・軌道・範囲・持続・無敵を調査欄に設け、未指定も明記した。原典に各強度値がない場合、数値は未確定のままとした。

C.ヴァイパーSA2のHP入力時ショートカット制限は入力上の制限として記録。サガットSA3の注記にある強度はキャンセル元Tiger Uppercutを指し、SA3の強度差とはしていない。ジュリSA2の「等しい/上の強度へチェーン可能」も発動ボタンの強度差の証拠にはしない。

## 8. 発動系SAとフレームの意味

| 非攻撃発動SA | raw 発生/全体/ヒット/ガード | Cargo | 表示案（未実装） |
| --- | --- | --- | --- |
| blanka SA2 Lightning Beast | 1 / 10 / 未記載 / 未記載 | 1 / 10 / - / - | 1 / 10 / - / - |
| guile SA2 Solid Puncher | 1 / 6 / 未記載 / 未記載 | 1 / 6 / - / - | 1 / 6 / - / - |
| jamie SA2 The Devil's Song (DL0-DL4) | 1 / 6 / 未記載 / 未記載 | 1 / 6 / - / - | 1 / 6 / - / - |
| juri SA2 Feng Shui Engine | 1 / 7 / 未記載 / 未記載 | 1 / 7 / - / - | 1 / 7 / - / - |
| yasmine SA2 Nakatagong Lakas | 1 / 10 / 未記載 / 未記載 | 1 / 10 / - / - | 1 / 10 / - / - |

純発動系は5行。すべて全体Fが明記されており、全体まで`-`にしない。Cargoのhit/blockは元から対象外の`-`で、rawのnullだけを見ると未記載と誤認する。startup=1は攻撃発生ではなく発動行の値。暗転の算入方法、効果が厳密に付くタイミングは資料不足で未確定とした。

攻撃＋強化/回復のmixedは8行：C.ヴァイパーSA1、キンバリーSA3/CA、舞SA1通常/Flame、ヤスミンSA1、ジュリSA2ホールド、エレナSA2 Healing。JP SA2とイングリッドSA2は遅延攻撃を生成するattackと分類し、非攻撃発動系の欠損表示を適用しない。ラシードSA2も攻撃を生成するためattack。

## 9. 条件付きSA

| 条件タグ | raw行数（重複あり） |
| --- | --- |
| airborne_only | 8 |
| button_hold | 16 |
| counter_trigger | 1 |
| critical_art | 33 |
| direction_ender | 4 |
| drink_level_dependency | 5 |
| follow_up | 31 |
| sa_related_special | 1 |
| sequential_input | 1 |
| special_state_only | 4 |
| stock_or_enhanced | 13 |

98条件付き行にはCA、空中、ホールド、強化、派生、SA関連必殺技が含まれる。同じ行に複数タグが付くため、タグ件数は合計しない。`edition=normal`はCAでないという意味で、基本版を保証しない。

リュウSA2のLv.1/2/3はホールド段階であり、すべてSA2。電刃は別条件。ジュリSA1ホールドは風破ストック消費、キンバリーSA1ホールドは缶消費、イングリッドSA1/2ホールドは紋章消費を別々に記録した。リリーWindclad・舞Flame・ジェイミー飲酒状態も通常版へ統合しない。

豪鬼Misogi/Kongou-Kokuretsuzan、ベガFinal Psycho Crusher、イングリッドSun Octopusは特殊状態限定。アレックスOmega Wing BusterはOD Power Dropからの派生SA2。テリーTwin/Triple GeyserはSA2系派生。マリーザSA1のホールド・カウンター、サガットSA2の方向別終段、エレナ回復派生、ジェイミー飲み派生は強度差と別の条件として保存。採用範囲の既存ルールを変更していない。

## 10. CA版

CAは33行。32キャラそれぞれの通常SA3に対応するCAがあり、豪鬼には別コマンドのCA専用Shun Goku Satsuもある。A.K.I.のCAは技名が通常版と同じだが、25%HP以下の注記で区別できる。リュウ・豪鬼・ザンギエフ等の同フレーム版も別条件で保持した。ジェイミーは通常SA3とCAのヒット結果も異なる。

## 11. 特殊入力形式とHEAD時点の対応可否

| モーション分類 | raw行数 |
| --- | --- |
| 214214 | 61 |
| 236236 | 104 |
| other | 26 |
| charge | 5 |
| 360 | 1 |
| 720 | 2 |

| 原典表記・例 | 既存入力モデル/UIの評価（SAカテゴリを除く） |
| --- | --- |
| 236236 / 214214 + L/M/HP/K | 既存モデル・UIで対応可能。ディージェイ/ダルシムの個別強度始動が該当 |
| 236236P、214214K等の強度なし | データはstrength noneで保持可能、UIのみ拡張が必要。L/M/Hへ展開しない |
| [4]646P、[4]646HP、[4]646K | 5行。モデルは文字列表現可能、HEADの質問UIは溜め未対応。上流表の4646は照合用の対応であり内部表記へ採用しない |
| 720+P | 通常SA3とCAの2行。motion720は保持可能、2回転のUI対応が必要。360へ変換しない |
| 360+KK | Dark Ingrid限定Sun Octopusの1行。360自体は対応、非ODのKKを現行ODへ流用できないため両方の拡張が必要 |
| 22PPP | Shin Akuma限定。3ボタンを保持・選択する両方の拡張が必要。既存対象外方針を無断変更しない |
| PP (SA2)、LP~LP~6LK~HP、~LP等 | 派生・逐次入力・始動状態と非OD同時押しの表現に両方の拡張が必要 |
| 214214[P]、214214{K}、(Hold Lv.2)、~[2] | ボタン/方向ホールドと溜め方向を区別する両方の拡張が必要 |
| j.236236K、j.214214P等 | 空中条件をデータvariantへ記録できるが、地上版との独立キー・選択を含め両方の拡張が必要 |
| Any Direction + P (during SA2) | 方向・状態の解釈が必要。原典でSA関連必殺技と判明。独立SAとして変換しない |

入力欄以外の原典注記には、テリーSA2の代替`21416+MK+HP`（見た目だけの違い）、舞の低空用`2362369K`もある。前者は異種ボタン同時押しを含むため両方の拡張が必要。後者は追加の上方向を含む方向列として保持できるが、空中状態選択・判定が別途必要。別SA行や正式な内部コマンドへ自動変換していない。

上表は入力構文の評価。カテゴリまで含めると、現行schemaはnormal/specialだけ、resolverは基本版入力キーだけで検索し、SAレベル・CA・空中等を識別しない。SAの追加には全件でデータモデルとUI/質問処理双方の変更が必要。作業中の溜めUI変更はこの評価へ取り込んでいない。全入力文字列の重複なし一覧は付録B。

## 12. フレーム値の欠損・差異

| 原典 | 数値 | 特殊値 | 明示的対象外 | 未記載/未展開テンプレート | 複合・条件値 |
| --- | --- | --- | --- | --- | --- |
| raw 796項目 | 706 | 0 | 0 | 90 | 0 |
| Cargo 796項目 | 460 | 139 | 63 | 21 | 113 |

Cargoの特殊値には`KD +30`等も含む。数値だけに落とすと意味が失われる。rawの数値とCargoのKDを含む記載を対応させた167項目は、矛盾ではなくrawで意味が省略された箇所。符号表記だけの差は17項目、条件表記の差は79項目。単純な数値の不一致は今回検出しなかったが、条件表記全体の同一性や現行パッチとの整合を保証しない。

raw未記載90項目のうち、Cargoで明示的対象外が63、空欄/未展開テンプレートが21、特殊値等が追加で判明するものが6。これらもrawを上書きせず両方保持した。主な例：豪鬼空中SA1のtotal=`{{{total}}}`は値が得られないテンプレート、豪鬼瞬獄殺hit=`HKD + 18`、ダルシムSA2ホールドhit=`KD`、ベガ特殊SA2hit=`KD 0(+6)`、サガットSA2hit=`HKD ~`、Rolling Cannon hit=`KD~`。

遠距離の標準条件も既存ルールに従う。例としてラシードSA2の注記はKD値が密着時と明記し、ガイル横SA1の8(11)、エドSA2の+115~等も条件を含む。未記載の遠距離値や上限を計算しない。通常ヒット硬直差・KD後有利・発動F・弾発生Fを同一指標としてまとめない。

## 13. SA coverageの評価

32キャラともSA1/2/3の存在を保存資料で確認し、原典行・レベル・基本始動・入力・何らかのフレーム値を追跡できる。条件付き版しか見つからない基本SA枠は0。UIでSAを質問できる枠は開始HEADでは0。これは現在の通常技・必殺技coverageとは独立した結果で、既存キャラを抽選対象から外す理由にしない。

| 指標 | 件数 |
| --- | --- |
| 調査キャラ | 32 |
| SA枠 | 96 |
| 保存super_art行 | 199 |
| SA/SA派生へレベル対応 | 198 |
| SA関連必殺技として区別 | 1 |
| 基本始動あり | 96 |
| 条件付き版のみ | 0 |
| SA用UIで質問可能 | 0 |

Cargoにだけ残った候補は2件とも追加SAではなかった。イングリッド22PPP Sunburst Beamはraw `/moves/13`のspecial、ヤスミン214214P~4KK Linya ng Liwanagはraw `/moves/1`のspecialに入力・注記が一致した。補助候補をinventoryの`supplementalCargoCandidates`に保持した。

## 14. 実装時に必要なデータモデルの変更案

SAカテゴリ・レベル（1/2/3）、通常SA3とCAの独立条件、強度未指定と明示強度群、派生/空中/ホールド/ストックの識別を検討する。現行variantは条件文字列を保存できるが、質問キーや選択へ反映する仕組みがない。基本版同一入力に複数SAを置けばambiguousになる。

発動Fと弾発生F、KD後有利と通常硬直差、原典未記載と対象外を分離して保持する必要がある。非攻撃SAの表示上-は出典値と別の根拠を持たせる。coverageはSA専用に設け、normal/specialのcompleteと混同しない。採用時には別データセットとして908レコードの固定性を検証する。いずれも今回未実装。

## 15. UI対応で必要になる変更案

SA入力の選択、強度共通P/K、720の専用表現、[4]646の溜め入力を検討する。レベルはコマンドから推測せずデータで識別し、条件付き版を将来採用するならCA・ホールド・空中・状態の明示選択と重複判定が必要。入力別評価は第11節のとおり。`-`表示による質問消費、発生のみモード、履歴の保存値との関係も仕様に含める。今回UIには変更していない。

## 16. ユーザー判断が必要な事項：5種類

### SA-D1：strength_question_identity

7 SA枠に強度差。残りは全面的な同一性能の明記なし。P/Kだけの行を多数含む。 同じフレーム値でも性能差があり、強度noneからL/M/Hへの自動展開は既存ルールで禁止。SAの質問単位は未決定。

候補：強度未指定の共通質問＋根拠のある個別強度質問／全強度を別質問（根拠のない展開は保留）／強度を代表値へ統合（差のあるSAには不適切）。

推奨案（未採用）：原典の強度指定を保持する。異なる強度の質問を同一視するかはフレーム以外の性能差も含めて決定。未指定P/Kを質問する共通入力を検討し、根拠なくL/M/Hへ展開しない。 適用範囲：全96 SA枠。confirmedSameAspectsはその属性だけの同一性。

### SA-D2：activation_missing_display

5発動行はstartup=1、total=6/7/10。rawのhit/blockはnullだがCargoでは明示的に-。 ユーザー希望を一般化した「非攻撃・未記載なら-」の条件と、その表示が出題成立へ与える効果を仕様化する必要がある。今回はtotal未記載の純発動系はない。

候補：明示的対象外は既存ルール、非攻撃と確認した真の未記載だけ表示上-／未記載はすべて不明を維持。

推奨案（未採用）：既知totalは必ず保持。明示的対象外は既存ルールで処理。非攻撃と確認したSAの真の未記載だけに表示規則を追加する案をレビューする。攻撃/遅延攻撃/mixedへ適用しない。元値と表示根拠は別保存。 適用範囲：非攻撃SAのみ。Juri hold、JP SA2、Ingrid SA2、Elena healingなどへ自動適用しない。

### SA-D3：ca_inclusion

32キャラの通常SA3対応CAに加え、豪鬼Shun Goku SatsuのCA専用行が1件。計33行。 SA3とCAは同コマンドを共有する場合も別条件。現在は基本版だけを検索するため、CAを採用するなら条件選択が必要。

候補：初回は通常SA3のみ、CAは調査データに保持／CA専用の条件/モードを追加して別質問／通常SA3と混合（条件消失・衝突が生じる）。

推奨案（未採用）：初回候補は通常SA3、CAは条件付きとして保持する案。採用する場合は独立条件を必須とし、値が同じでも統合しない。豪鬼のCA専用技は通常SA3へ代入しない。 適用範囲：全33 CA行。採用・除外はこの調査では決めない。

### SA-D4：sa_input_scope

基本版にも[4]646P/K・720+Pがある。空中・特殊状態限定・3ボタン・逐次入力の追加行も存在。 SA追加によって従来対象外の720を扱う必要がある一方、既存の空中/特殊状態/3ボタン除外を覆す指示はない。初回の拡張範囲を決める必要がある。

候補：地上基本SAとその溜め・720を初回対象にし、既存の条件付き除外は継続／特殊状態や空中も独立条件UIで追加／表現可能なSAのみ先行し未対応は保留。

推奨案（未採用）：地上基本96枠の対応を目標とし、720・溜め・共通P/K入力を明示的に設計。空中・ホールド・特殊状態・ストックは既存ルールどおり分離し、初回に採用するという新指示がなければ基本版へ混ぜない。 適用範囲：SA用の新しい入力・採用範囲。通常技/必殺技の既存範囲は変更しない。

### SA-D5：activation_vs_projectile_startup

Ingrid SA2: 表startup1/total13、弾発生LP103/MP68/HP98。JP SA2: 表startup1/total13、各攻撃34/71/108/145F。 発動と攻撃発生が別指標。注記の弾発生を単一startupへ上書きすると原典の意味が失われる。

候補：表の発動Fを主表示、弾発生は別指標に保持／弾発生を出題する専用項目を設ける／意味の確定までstartup質問を保留。

推奨案（未採用）：両指標を分離して保持し、発生質問が何を指すかを仕様で明記。Ingridの1Fを各強度103/68/98Fへ置換しない。現行パッチと暗転の算入法は未検証。 適用範囲：遅延攻撃・設置系SA全般。発動系の-規則とは別の問題。

対象レコードIDは`decisions-needed.json`に列挙。同ファイルには既存ルールで処理できる事項と、追加調査を要する証拠不足を分けた。ホールド版の除外、括弧外の原則、D、未検証パッチ、欠損保留について同じ判断を再質問していない。

## 17. 推奨する次段階の作業

ChatGPTで第16節の5項目を決め、初回の対象を地上基本96枠にするか確認する。その後、強度未指定・720・溜め・遅延攻撃の発生指標を含む仕様と受け入れ条件を作成する。未確定の強度差・暗転/発生定義・サガットSA2の標準終段等は証拠不足として残す。採用値や入力件数の確定は、仕様レビュー後の別指示で行う。

### 検証と作業範囲

調査用検証は`python3 staging/sa-research/validate.py`。全32ファイルの199行を再抽出し、ID・JSON Pointer・原典全値・SHA256、96枠、レベル根拠、CA条件、強度分類、フレーム無補完、JSONパース、レポートの199行を確認する。コード変更がなく、共有ファイルを書き換える既存生成・整形・ビルドは実行しない。検証結果と終了Git状態は`validation.json`に保存する。

研究用Pythonは保存資料の機械抽出・集計と成果物生成だけを行う。実行順はresearch.py→review.py→report.py→validate.py。research.pyとreport.pyは新規作成専用で、既存成果物がある場所では再実行せず別の空の調査コピーで使う。ゲームへの取り込みスクリプトではない。

最終検証は成功した。全199行・96枠・原典参照・フレーム値無補完・JSON/レポート件数の整合を確認。本番データと保存済み原典のハッシュは調査用記録時点から不変。並行UIセッションのcommitで終了HEADは`a34d9b847f92b7cbe2433aef2c80d8e884b15d5d`へ進んだが、調査のモデル/UI評価は開始HEADのまま維持した。調査中に`docs/GAME_SPEC.md`、`src/app/App.tsx`、`src/styles.css`の変化を観測したが、この調査からは書き込まず保持した。調査で作成したファイルは指定の新規パス内だけで、この調査のcommitは作成していない。終了時は調査成果物だけがuntracked。日本語lintは`sudachipy`未導入で実行できなかったため、Skillの手動チェックリストで文面を確認した。

## 付録A. 原典全199行

発生 / 全体 / ヒット / ガードの順。rawの未記載は「未記載」と記し、Cargoの`-`と区別した。Cargo欄の空欄は原典の空文字列を示す。HTMLは比較用に除去したが元HTMLはinventoryに保持。技名・条件・数値を採用用に変更していない。

| record ID | SA | 技名 / 入力 | 区分 / 条件 | raw F | Cargo F |
| --- | --- | --- | --- | --- | --- |
| aki:raw:0 | 2 | Tainted Talons / `214214P` | attack / 基本候補 | 7 / 153 / 30 / -19 | 7 / 153 / KD +30 / -19~ |
| aki:raw:13 | 1 | Deadly Implication / `236236K` | attack / 基本候補 | 10 / 80 / 30 / -46 | 10 / 80 / KD +30 / -46 |
| aki:raw:14 | 3 | Claws of Ya Zi / `236236P` | attack / 基本候補 | 10 / 70 / 30 / -36 | 10 / 70 / HKD +30 / -36 |
| aki:raw:15 | 3 | Claws of Ya Zi / `236236P` | attack / critical_art | 10 / 70 / 21 / -36 | 10 / 70 / HKD +21 / -36 |
| akuma:raw:0 | 2 | Misogi / `214214K` | attack / special_state_only | 5 / 99 / 25 / -58 | 5(9~10) / 99(96) / KD +25(26) / -58(-57) |
| akuma:raw:1 | 2 | Empyrean’s End / `214214P` | attack / 基本候補 | 9 / 63 / 29 / -35 | 9 / 63 / HKD +29 (HKD +97 Wallsplat) / -35 |
| akuma:raw:14 | 2 | Kongou-Kokuretsuzan / `22PPP` | attack / special_state_only | 8 / 78 / 38 / -39 | 8 / 78 / KD +38 / -39 |
| akuma:raw:15 | 3 | Sip of Calamity / `236236K` | attack / 基本候補 | 8 / 69 / 18 / -41 | 8(2) / 69 / HKD +18 / -41 |
| akuma:raw:16 | 3 | Sip of Calamity (CA) / `236236K` | attack / critical_art | 8 / 69 / 18 / -41 | 8(2) / 69 / HKD +18 / -41 |
| akuma:raw:17 | 1 | Messatsu Gohado / `236236P` | attack / 基本候補 | 10 / 106 / 9 / -41 | 10 / 106 / KD +9 / -41 |
| akuma:raw:76 | 1 | Tenma Gozanku / `j.236236K` | attack / airborne_only | 14 / 未記載 / 49 / -28 | 14 / {{{total}}} / KD +49~ / -28~ |
| akuma:raw:87 | 3 | Shun Goku Satsu (CA) / `LP~LP~6LK~HP` | attack / critical_art, sequential_input | 6 / 84 / 未記載 / 未記載 | 6+0 / 84 / HKD + 18 / - |
| alex:raw:0 | 2 | Sledgecross Hammer / `214214P` | attack / 基本候補 | 13 / 66 / 19 / -29 | 13 / 66 / HKD +19 (Air: Wall Splat) / -29 |
| alex:raw:1 | 1 | Raging Spear / `236236K` | attack / 基本候補 | 9 / 68 / 30 / -38 | 9 / 68 / KD +30 / -38 |
| alex:raw:2 | 3 | The Final Prison / `236236P` | attack / 基本候補 | 12 / 69 / 18 / -38 | 12 / 69 / HKD +18 / -38 |
| alex:raw:3 | 3 | The Final Prison (CA) / `236236P` | attack / critical_art | 12 / 69 / 25 / -38 | 12 / 69 / HKD +25 / -38 |
| alex:raw:75 | 2 | Omega Wing Buster / `PP (SA2)` | attack / follow_up | 2 / 未記載 / 29 / 未記載 | 2 / - / HKD +29 / - |
| arjun:raw:0 | 2 | Instant Oblivion / `214214P` | attack / 基本候補 | 9 / 69 / 57 / -41 | 9 / 69 / KD +57 / -41 |
| arjun:raw:6 | 1 | Howling Destruction / `236236K` | attack / 基本候補 | 8 / 136 / 43 / -46 | 8 / 136 / KD +43 / -46 |
| arjun:raw:7 | 3 | Yaksha's Order / `236236P` | attack / 基本候補 | 13 / 73 / 22 / -41 | 13 / 73 / HKD +22 / -41 |
| arjun:raw:8 | 3 | Yaksha's Order (CA) / `236236P` | attack / critical_art | 13 / 73 / 35 / -41 | 13 / 73 / HKD +35 / -41 |
| blanka:raw:0 | 2 | Lightning Beast / `214214P` | activation / 基本候補 | 1 / 10 / 未記載 / 未記載 | 1 / 10 / - / - |
| blanka:raw:8 | 3 | Ground Shave Cannonball / `236236K` | attack / 基本候補 | 10 / 73 / 50 / -46 | 10 / 73 / HKD +50 / -46 |
| blanka:raw:9 | 3 | Ground Shave Cannonball (CA) / `236236K` | attack / critical_art | 10 / 73 / 14 / -46 | 10 / 73 / HKD +14 / -46 |
| blanka:raw:10 | 1 | Shout of Earth / `236236P` | attack / 基本候補 | 8 / 78 / 15 / -29 | 8 / 78 / KD +15 / -29 |
| blanka:raw:84 | SA関連必殺技 | Rolling Cannon / `Any Direction + P (during SA2)` | attack / sa_related_special | 3 / 未記載 / 未記載 / 未記載 | 3 / - / KD~ / - |
| cammy:raw:0 | 2 | Killer Bee Spin / `214214P` | attack / 基本候補 | 13 / 58 / 12 / -24 | 13 / 58 / HKD +12 (KD +70 Launch) / -24(-18) |
| cammy:raw:5 | 1 | Spin Drive Smasher / `236236K` | attack / 基本候補 | 9 / 62 / 10 / -24 | 9 / 62 / KD +10 / -24(-22) |
| cammy:raw:6 | 3 | Delta Red Assault / `236236P` | attack / 基本候補 | 9 / 61 / 17 / -33 | 9 / 61 / HKD +17 / -33(-23) |
| cammy:raw:7 | 3 | Delta Red Assault (CA) / `236236P` | attack / critical_art | 9 / 61 / 22 / -33 | 9 / 61 / HKD +22 / -33(-23) |
| cammy:raw:60 | 2 | Aerial Killer Bee Spin / `j.214214P` | attack / airborne_only | 13 / 未記載 / 12 / -23 | 13 / - / HKD +12 (KD +70 Launch) / -23(-18) |
| chunli:raw:0 | 3 | Soten Ranka / `214214K` | attack / 基本候補 | 8 / 82 / 6 / -24 | 8 / 82 / HKD +6 / -24 |
| chunli:raw:1 | 3 | Soten Ranka (CA) / `214214K` | attack / critical_art | 8 / 82 / 18 / -24 | 8 / 82 / HKD +18 / -24 |
| chunli:raw:18 | 2 | Hoyoku-sen / `236236K` | attack / 基本候補 | 11 / 144 / 29 / -35 | 11 / 144 / KD +29 / -35 |
| chunli:raw:19 | 1 | Kikosho / `236236P` | attack / 基本候補 | 7 / 122 / 22 / -22 | 7 / 122 / KD +22 / -22 |
| chunli:raw:58 | 1 | Aerial Kikosho / `j.236236P` | attack / airborne_only | 7 / 103 / 14 / -20 | 7 / 103 / KD +14 / -20 |
| cviper:raw:0 | 3 | Hard Luck Rejector / `214214K` | attack / 基本候補 | 10 / 67 / 21 / -38 | 10 / 67 / HKD +21 / -38 |
| cviper:raw:1 | 3 | Hard Luck Rejector (CA) / `214214K` | attack / critical_art | 10 / 67 / 23 / -38 | 10 / 67 / HKD +23 / -38 |
| cviper:raw:2 | 2 | Mission Complete / `214214P` | attack / 基本候補 | 7 / 55 / 19 / -29 | 7 / 55 / HKD +19 / -29 |
| cviper:raw:17 | 1 | Limit Decoupler / `236236K` | mixed / 基本候補 | 8 / 73 / 21 / -34 | 8 / 73 / KD +21 / -34 |
| dee_jay:raw:0 | 3 | Weekend Pleasure / `214214P` | attack / 基本候補 | 9 / 61 / 26 / -28 | 9 / 61 / HKD +26 / -28 |
| dee_jay:raw:1 | 3 | Weekend Pleasure (CA) / `214214P` | attack / critical_art | 9 / 61 / 22 / -28 | 9 / 61 / HKD +22 / -28 |
| dee_jay:raw:20 | 2 | Headliner Sunrise Festival / `236236HP` | attack / 基本候補 | 12 / 62 / 6 / -29 | 12 / 62 / +6 / -29 |
| dee_jay:raw:21 | 2 | +LP (Headliner Hit 1) / `~LP (1)` | attack / follow_up | 11 / 未記載 / 6 / 未記載 | 11 /  / +6  (KD +41~42) / - |
| dee_jay:raw:22 | 2 | +MP (Headliner Hit 2) / `~MP (2)` | attack / follow_up | 10 / 未記載 / 6 / 未記載 | 10 /  / +6 / - |
| dee_jay:raw:23 | 2 | +HP (Headliner Hit 3) / `~HP (3)` | attack / follow_up | 12 / 未記載 / 6 / 未記載 | 12 /  / +6 / - |
| dee_jay:raw:24 | 2 | +LK (Headliner Hit 4) / `~LK (4)` | attack / follow_up | 15 / 未記載 / 6 / 未記載 | 15 /  / +6 / - |
| dee_jay:raw:25 | 2 | +MK (Headliner Hit 5) / `~MK (5)` | attack / follow_up | 17 / 未記載 / 6 / 未記載 | 17 /  / +6 / - |
| dee_jay:raw:26 | 2 | +HK (Headliner Hit 6) / `~HK (6)` | attack / follow_up | 18 / 未記載 / 19 / 未記載 | 18 /  / HKD +19 (KD +46) / - |
| dee_jay:raw:27 | 2 | Encore Beat / `~HK (End)` | attack / follow_up | 1 / 未記載 / 34 / 未記載 | 1 /  / HKD +34(+37) / - |
| dee_jay:raw:28 | 2 | Climactic Strike / `~HP (End)` | attack / follow_up | 1 / 未記載 / 24 / 未記載 | 1 /  / HKD +24(+18) / - |
| dee_jay:raw:29 | 1 | The Greatest Sobat / `236236K` | attack / 基本候補 | 7 / 43 / 44 / -12 | 7 / 43 / HKD +44 / -12 |
| dee_jay:raw:30 | 2 | Lowkey Sunrise Festival / `236236LP` | attack / 基本候補 | 12 / 62 / 6 / -29 | 12 / 62 / +6 / -29 |
| dee_jay:raw:31 | 2 | +LP (Lowkey Hit 1) / `~LP (1)` | attack / follow_up | 11 / 未記載 / 6 / 未記載 | 11 /  / +6  (KD +41) / - |
| dee_jay:raw:32 | 2 | +MP (Lowkey Hit 2) / `~MP (2)` | attack / follow_up | 10 / 未記載 / 6 / 未記載 | 10 /  / +6 / - |
| dee_jay:raw:33 | 2 | +HP (Lowkey Hit 3) / `~HP (3)` | attack / follow_up | 12 / 未記載 / 6 / 未記載 | 12 /  / +6 / - |
| dee_jay:raw:34 | 2 | +LK (Lowkey Hit 4) / `~LK (4)` | attack / follow_up | 15 / 未記載 / 6 / 未記載 | 15 /  / +6 / - |
| dee_jay:raw:35 | 2 | +MK (Lowkey Hit 5) / `~MK (5)` | attack / follow_up | 17 / 未記載 / 6 / 未記載 | 17 /  / +6 / - |
| dee_jay:raw:36 | 2 | +HK (Lowkey Hit End) / `~HK (End)` | attack / follow_up | 18 / 未記載 / 29 / 未記載 | 18 /  / HKD +29 / - |
| dee_jay:raw:37 | 2 | Marvelous Sunrise Festival / `236236MP` | attack / 基本候補 | 12 / 62 / 6 / -29 | 12 / 62 / +6 / -29 |
| dee_jay:raw:38 | 2 | +LP (Marvelous Hit 1) / `~LP (1)` | attack / follow_up | 11 / 未記載 / 6 / 未記載 | 11 /  / +6 / - |
| dee_jay:raw:39 | 2 | +MP (Marvelous Hit 2) / `~MP (2)` | attack / follow_up | 10 / 未記載 / 6 / 未記載 | 10 /  / +6 / - |
| dee_jay:raw:40 | 2 | +HP (Marvelous Hit 3) / `~HP (3)` | attack / follow_up | 12 / 未記載 / 6 / 未記載 | 12 /  / +6 / - |
| dee_jay:raw:41 | 2 | +LK (Marvelous Hit 4) / `~LK (4)` | attack / follow_up | 15 / 未記載 / 6 / 未記載 | 15 /  / +6 / - |
| dee_jay:raw:42 | 2 | +MK (Marvelous Hit 5) / `~MK (5)` | attack / follow_up | 17 / 未記載 / 6 / 未記載 | 17 /  / +6 / - |
| dee_jay:raw:43 | 2 | +HK (Marvelous Hit 6) / `~HK (6)` | attack / follow_up | 18 / 未記載 / 19 / 未記載 | 18 /  / HKD +19 (KD +46) / - |
| dee_jay:raw:44 | 2 | Encore Beat / `~HK (End)` | attack / follow_up | 1 / 151 / 34 / 未記載 | 1 / 151 / HKD +34(+37) / - |
| dee_jay:raw:45 | 2 | Climactic Strike / `~HP (End)` | attack / follow_up | 1 / 181 / 24 / 未記載 | 1 / 181 / HKD +24(+18) / - |
| dhalsim:raw:4 | 2 | Yoga Sunburst / `214214K` | attack / 基本候補 | 7 / 67 / 50 / -4 | 7 / 67 / KD +50 / -4 |
| dhalsim:raw:5 | 2 | Yoga Sunburst / `214214[K]` | attack / button_hold | 71 / 129 / 未記載 / 未記載 | 71~91 / 129~148 / KD / - |
| dhalsim:raw:6 | 2 | Yoga Sunburst / `214214{K}` | attack / button_hold | 23 / 81 / 未記載 / 未記載 | 23~70 / 81~128 / KD / - |
| dhalsim:raw:7 | 1 | Yoga Inferno / `236236HP` | attack / 基本候補 | 10 / 133 / 27 / -22 | 10 / 133 / KD +27 / -22 |
| dhalsim:raw:8 | 3 | Merciless Yoga / `236236K` | attack / 基本候補 | 10 / 89 / 19 / -62 | 10 / 89 / HKD +19 / -62 |
| dhalsim:raw:9 | 3 | Merciless Yoga (CA) / `236236K` | attack / critical_art | 10 / 89 / 19 / -62 | 10 / 89 / HKD +19 / -62 |
| dhalsim:raw:10 | 1 | Yoga Inferno / `236236LP` | attack / 基本候補 | 10 / 128 / 29 / -10 | 10 / 128 / KD +29 / -10 |
| dhalsim:raw:11 | 1 | Yoga Inferno / `236236MP` | attack / 基本候補 | 10 / 128 / 29 / -10 | 10 / 128 / KD +29 / -10 |
| e_honda:raw:0 | 3 | The Final Bout / `214214P` | attack / 基本候補 | 9 / 73 / 11 / -34 | 9 / 73 / HKD +11 (KD +19) / -34 |
| e_honda:raw:1 | 3 | The Final Bout (CA) / `214214P` | attack / critical_art | 9 / 73 / 34 / -34 | 9 / 73 / HKD +34 (KD +19) / -34 |
| e_honda:raw:8 | 1 | Show of Force / `236236P` | attack / 基本候補 | 7 / 59 / 13 / -33 | 7 / 59 / KD +13(+38) / -33 |
| e_honda:raw:28 | 2 | Ultimate Killer Head Ram / `[4]646K` | attack / 基本候補 | 12 / 61 / 13 / -27 | 12 / 61(81) / HKD +13 / -27 |
| ed:raw:0 | 2 | Psycho Cannon / `214214P` | attack / 基本候補 | 8 / 35 / 115 / 65 | 8 / 35 / KD +115~ / +65~ |
| ed:raw:5 | 1 | Psycho Storm / `236236K` | attack / 基本候補 | 13 / 123 / 33 / -32 | 13 / 123 / KD +33 / -32 |
| ed:raw:6 | 3 | Psycho Chamber / `236236P` | attack / 基本候補 | 10 / 83 / 24 / -49 | 10 / 83 / HKD +24 / -49 |
| ed:raw:7 | 3 | Psycho Chamber (CA) / `236236P` | attack / critical_art | 10 / 83 / 24 / -49 | 10 / 83 / HKD +24 / -49 |
| elena:raw:0 | 3 | Song of the Grasslands / `214214K` | attack / 基本候補 | 8 / 79 / 24 / -54 | 8 / 79 / HKD +24 / -54 |
| elena:raw:1 | 3 | Song of the Grasslands (CA) / `214214K` | attack / critical_art | 8 / 79 / 29 / -54 | 8 / 79 / HKD +29 / -54 |
| elena:raw:12 | 1 | Meteor Volley / `236236K` | attack / 基本候補 | 7 / 94 / 44 / -68 | 7 / 94 / KD +44 / -68 |
| elena:raw:13 | 2 | Revival Dance / `236236P` | attack / 基本候補 | 12 / 79 / 25 / -47 | 12 / 79 / HKD +25 / -47 |
| elena:raw:14 | 2 | Revival Dance (Healing) / `236236P~[2]` | mixed / follow_up | 12 / 79 / 1 / -47 | 12 / 79 / HKD +1 / -47 |
| guile:raw:0 | 2 | Solid Puncher / `214214P` | activation / 基本候補 | 1 / 6 / 未記載 / 未記載 | 1 / 6 / - / - |
| guile:raw:24 | 1 | Sonic Hurricane / `[4]646HP` | attack / 基本候補 | 7 / 75 / 70 / -2 | 7 / 75 / KD +70 / -2 |
| guile:raw:25 | 3 | Crossfire Somersault / `[4]646K` | attack / 基本候補 | 9 / 84 / 16 / -59 | 9 / 84 / HKD +16 / -59 |
| guile:raw:26 | 3 | Crossfire Somersault (CA) / `[4]646K` | attack / critical_art | 9 / 84 / 16 / -59 | 9 / 84 / HKD +16 / -59 |
| guile:raw:27 | 1 | Sonic Hurricane / `[4]646P` | attack / 基本候補 | 8 / 89 / 41 / -26 | 8(11) / 89 / KD +41 / -26 |
| ingrid:raw:1 | 2 | Order of the Sun (0 Stock) / `214214P (0 Stock)` | attack / 基本候補 | 1 / 13 / 未記載 / 未記載 | 1 / 13 / - / - |
| ingrid:raw:2 | 2 | Order of the Sun (1 Stock) / `214214[P] (1 Stock)` | attack / button_hold, stock_or_enhanced | 1 / 13 / 未記載 / 未記載 | 1 / 13 / - / - |
| ingrid:raw:3 | 2 | Order of the Sun (2 Stock) / `214214[P] (2 Stock)` | attack / button_hold, stock_or_enhanced | 1 / 13 / 未記載 / 未記載 | 1 / 13 / - / - |
| ingrid:raw:14 | 1 | Shining Sun (0 Stock) / `236236K (0 Stock)` | attack / 基本候補 | 11 / 129 / 12 / -99 | 11 / 129 / HKD +12 / -99 |
| ingrid:raw:15 | 1 | Shining Sun (1 Stock) / `236236[K] (1 Stock)` | attack / button_hold, stock_or_enhanced | 11 / 129 / 17 / -99 | 11 / 129 / HKD +17 / -99 |
| ingrid:raw:16 | 1 | Shining Sun (2 Stock) / `236236[K] (2 Stock)` | attack / button_hold, stock_or_enhanced | 11 / 129 / 20 / -99 | 11 / 129 / HKD +20 / -99 |
| ingrid:raw:17 | 3 | Cosmic Ray / `236236P` | attack / 基本候補 | 20 / 90 / 30 / -45 | 20 / 90 / HKD +30 / -45 |
| ingrid:raw:18 | 3 | Cosmic Ray (CA) / `236236P` | attack / critical_art | 20 / 90 / 30 / -45 | 20 / 90 / HKD +30 / -45 |
| ingrid:raw:36 | 2 | Sun Octopus / `360+KK` | attack / special_state_only | 6 / 108 / 36 / 未記載 | 6+0 / 108 / HKD +36 / - |
| jamie:raw:0 | 2 | The Devil's Song (DL0-DL4) / `214214P` | activation / drink_level_dependency | 1 / 6 / 未記載 / 未記載 | 1 / 6 / - / - |
| jamie:raw:12 | 1 | Breakin' / `236236K` | attack / drink_level_dependency | 8 / 208 / 12 / -60 | 8 / 208 / KD +12 / -60 |
| jamie:raw:13 | 1 | Breakin' ~ Drink / `236236K~[2]` | attack / drink_level_dependency, follow_up | 8 / 201 / 4 / -93 | 8 / 201(180) / KD +4 (DL3: KD +25) / -93  (DL3:  -72 ) |
| jamie:raw:14 | 3 | Getsuga Saiho (CA) (DL2) / `236236P` | attack / critical_art, drink_level_dependency | 10 / 70 / 18 / -27 | 10 / 70 / HKD +18 (KD +14) / -27 |
| jamie:raw:15 | 3 | Getsuga Saiho (DL2) / `236236P` | attack / drink_level_dependency | 10 / 70 / 71 / -27 | 10 / 70 / HKD +71 (KD +14) / -27 |
| jp:raw:0 | 2 | Lovushka / `214214P` | attack / 基本候補 | 1 / 13 / 未記載 / 未記載 | 1 / 13 / - / - |
| jp:raw:14 | 3 | Interdiction / `236236K` | attack / 基本候補 | 18 / 85 / 23 / -50 | 18 / 85 / HKD +23 / -50 |
| jp:raw:15 | 3 | Interdiction (CA) / `236236K` | attack / critical_art | 18 / 85 / 44 / -50 | 18 / 85 / HKD +44 / -50 |
| jp:raw:16 | 1 | Chornobog / `236236P` | attack / 基本候補 | 8 / 84 / 22 / -33 | 8 / 84 / KD +22(+32) / -33(-23) |
| juri:raw:0 | 3 | Kaisen Dankai Raku / `214214K` | attack / 基本候補 | 10 / 65 / 22 / -36 | 10 / 65 / HKD +22 / -36 |
| juri:raw:1 | 3 | Kaisen Dankai Raku (CA) / `214214K` | attack / critical_art | 10 / 65 / 20 / -36 | 10 / 65 / HKD +20 / -36 |
| juri:raw:2 | 2 | Feng Shui Engine / `214214P` | activation / 基本候補 | 1 / 7 / 未記載 / 未記載 | 1 / 7 / - / - |
| juri:raw:3 | 2 | Feng Shui Engine (hold) / `214214[P]` | mixed / button_hold | 9 / 45 / -4 / -17 | 9 / 45 / -4  (+6) / -17(-7) |
| juri:raw:8 | 1 | Sakkai Fuhazan / `236236K` | attack / 基本候補 | 7 / 201 / 26 / -32 | 7 / 201 / KD +26(+49) / -32 |
| juri:raw:9 | 1 | Sakkai Fuhazan (hold) / `236236[K]` | attack / button_hold | 7 / 201 / 26 / -32 | 7 / 201 / KD +26(+49) / -32 |
| ken:raw:0 | 1 | Dragonlash Flame / `214214K` | attack / 基本候補 | 7 / 50 / 9 / -24 | 7 / 50 / KD +9 / -24 |
| ken:raw:5 | 2 | Shippu Jinrai-kyaku / `236236K` | attack / 基本候補 | 6 / 89 / 36 / -5 | 6 / 89 / KD +36 / -5 |
| ken:raw:6 | 3 | Shinryu Reppa / `236236P` | attack / 基本候補 | 7 / 100 / 15 / -40 | 7 / 100 / HKD +15 / -40(-43) |
| ken:raw:7 | 3 | Shinryu Reppa (CA) / `236236P` | attack / critical_art | 7 / 100 / 21 / -40 | 7 / 100 / HKD +21 / -40(-43) |
| kimberly:raw:0 | 2 | Bushin Scramble / `214214P` | attack / 基本候補 | 13 / 59 / 22 / -26 | 13 / 59 / KD +22 / -26(-20) |
| kimberly:raw:11 | 1 | Bushin Beats / `236236K` | attack / 基本候補 | 10 / 66 / 22 / -25 | 10 / 66 / KD +22 / -25 |
| kimberly:raw:12 | 1 | Bushin Thunderous Beats / `236236[K]` | attack / button_hold | 10 / 66 / 38 / -25 | 10 / 66 / KD +38 / -25 |
| kimberly:raw:13 | 3 | Bushin Ninjastar Cypher / `236236P` | mixed / 基本候補 | 8 / 64 / 16 / -35 | 8 / 64 / HKD +16 / -35 |
| kimberly:raw:14 | 3 | Bushin Ninjastar Cypher (CA) / `236236P` | mixed / critical_art | 8 / 64 / 16 / -35 | 8 / 64 / HKD +16 / -35 |
| kimberly:raw:68 | 2 | Soaring Bushin Scramble / `j.214214P` | attack / airborne_only | 13 / 未記載 / 22 / -26 | 13(2) / - / KD +22 / -26(-20) |
| lily:raw:0 | 3 | Raging Typhoon / `214214P` | attack / 基本候補 | 5 / 114 / 4 / 未記載 | 5+2 / 114 / HKD +4 / - |
| lily:raw:1 | 3 | Raging Typhoon (CA) / `214214P` | attack / critical_art | 5 / 114 / 4 / 未記載 | 5+2 / 114 / HKD +4 / - |
| lily:raw:8 | 2 | Thunderbird / `236236K` | attack / 基本候補 | 9 / 104 / 42 / -60 | 9 / 104 / KD +42 / -60(-66) |
| lily:raw:9 | 2 | Thunderbird (Windclad) / `236236K` | attack / stock_or_enhanced | 9 / 104 / 46 / -59 | 9 / 104 / KD +46 / -59(-65) |
| lily:raw:10 | 1 | Breezing Hawk / `236236P` | attack / 基本候補 | 10 / 101 / 27 / -36 | 10 / 101 / KD +27(+19) / -36 |
| lily:raw:56 | 2 | Soaring Thunderbird / `j.236236K` | attack / airborne_only | 9 / 未記載 / 36 / -54 | 9 / - / KD +36~42 / -54(-66) |
| lily:raw:57 | 2 | Soaring Thunderbird (Windclad) / `j.236236K` | attack / airborne_only, stock_or_enhanced | 9 / 未記載 / 39 / -51 | 9 / - / KD +39~45 / -51(-65) |
| luke:raw:0 | 2 | Eraser / `214214P` | attack / 基本候補 | 5 / 58 / 4 / -29 | 5 / 58 / KD +4 / -29 |
| luke:raw:12 | 3 | Pale Rider / `236236K` | attack / 基本候補 | 10 / 122 / 18 / -42 | 10(27) / 122 / HKD +18 / -42 |
| luke:raw:13 | 3 | Pale Rider (CA) / `236236K` | attack / critical_art | 10 / 122 / 18 / -42 | 10(27) / 122 / HKD +18 / -42 |
| luke:raw:14 | 1 | Vulcan Blast / `236236P` | attack / 基本候補 | 6 / 108 / 17 / -29 | 6 / 108 / KD +17(+30) / -29 |
| m_bison:raw:0 | 2 | Psycho Punisher / `214214K` | attack / 基本候補 | 24 / 82 / 23 / -34 | 24 / 82 / HKD +23 / -34 |
| m_bison:raw:1 | 2 | Final Psycho Crusher / `214214P` | attack / special_state_only | 9 / 117 / 未記載 / -94 | 9(15) / 117 / KD 0(+6) / -94(-88) |
| m_bison:raw:10 | 1 | Knee Press Nightmare / `236236K` | attack / 基本候補 | 10 / 113 / 11 / -41 | 10 / 113 / KD +11 (KD +2) / -41 |
| m_bison:raw:11 | 3 | Unlimited Psycho Crusher / `236236P` | attack / 基本候補 | 10 / 80 / 15 / -46 | 10(5) / 80 / HKD +15 / -46 |
| m_bison:raw:12 | 3 | Unlimited Psycho Crusher (CA) / `236236P` | attack / critical_art | 10 / 80 / 15 / -46 | 10(5) / 80 / HKD +15 / -46 |
| mai:raw:0 | 3 | Shiranui Ryuu: Enbu Ada Zakura / `214214P` | attack / 基本候補 | 10 / 94 / 19 / -33 | 10(3) / 94 / HKD +19 (KD +52) / -33 |
| mai:raw:1 | 3 | Shiranui Ryuu: Enbu Ada Zakura (CA) / `214214P` | attack / critical_art | 10 / 94 / 20 / -33 | 10(3) / 94 / HKD +20 (KD +52) / -33 |
| mai:raw:10 | 2 | Chou Hissatsu Shinobi Bachi / `236236K` | attack / 基本候補 | 7 / 68 / 33 / -24 | 7 / 68(79) / KD +33 / -24 |
| mai:raw:11 | 2 | Chou Hissatsu Shinobi Bachi (Flame) / `236236K` | attack / stock_or_enhanced | 7 / 73 / 38 / -24 | 7 / 73(79) / KD +38 / -24 |
| mai:raw:12 | 1 | Kagerou no Mai / `236236P` | mixed / 基本候補 | 6 / 90 / 26 / -31 | 6 / 90 / KD +26 / -31 |
| mai:raw:13 | 1 | Kagerou no Mai (Flame) / `236236P` | mixed / stock_or_enhanced | 6 / 141 / 40 / -26 | 6 / 141 / KD +40 / -26 |
| mai:raw:74 | 2 | Air Chou Hissatsu Shinobi Bachi / `j.236236K` | attack / airborne_only | 3 / 未記載 / 6 / -50 | 3 / - / KD +6(+11) / -50~ |
| mai:raw:75 | 2 | Air Chou Hissatsu Shinobi Bachi (Flame) / `j.236236K` | attack / airborne_only, stock_or_enhanced | 3 / 未記載 / 7 / -50 | 3 / - / KD +7(+17) / -50~ |
| manon:raw:0 | 2 | Étoile / `214214K` | attack / 基本候補 | 7 / 152 / 32 / -61 | 7 / 152 / KD +32(+37) / -61(-118) |
| manon:raw:5 | 1 | Arabesque / `236236K` | attack / 基本候補 | 10 / 78 / 7 / -49 | 10 / 78 / KD +7(+10) / -49(-46) |
| manon:raw:6 | 3 | Pas de Deux / `236236P` | attack / 基本候補 | 6 / 80 / 16 / 未記載 | 6+1 / 80 / HKD +16 / - |
| manon:raw:7 | 3 | Pas de Deux (CA) / `236236P` | attack / critical_art | 6 / 80 / 16 / 未記載 | 6+1 / 80 / HKD +16 / - |
| marisa:raw:0 | 2 | Meteorite / `214214P` | attack / 基本候補 | 9 / 110 / 17 / -44 | 9 / 110 / HKD +17 / -44(-77) |
| marisa:raw:17 | 3 | Goddess of the Hunt / `236236K` | attack / 基本候補 | 13 / 79 / 14 / -39 | 13 / 79 / HKD +14 / -39(-33) |
| marisa:raw:18 | 3 | Goddess of the Hunt (CA) / `236236K` | attack / critical_art | 13 / 79 / 14 / -39 | 13 / 79 / HKD +14 / -39(-33) |
| marisa:raw:19 | 1 | Javelin of Marisa / `236236P` | attack / 基本候補 | 19 / 83 / 14 / -43 | 19 / 83 / KD +14 / -43 |
| marisa:raw:20 | 1 | Javelin of Marisa / `236236[P] Counter` | attack / button_hold, counter_trigger | 7 / 63 / 46 / -37 | 7 / 63 / KD +46 / -37 |
| marisa:raw:21 | 1 | Javelin of Marisa / `236236[P]` | attack / button_hold | 42 / 107 / 35 / -42 | 42 / 107 / HKD +35 (KD +17) / -42 |
| rashid:raw:0 | 2 | Ysaar / `214214K` | attack / 基本候補 | 11 / 33 / 104 / 33 | 11 / 33 / KD +104 / +33 |
| rashid:raw:16 | 1 | Super Rashid Kick / `236236K` | attack / 基本候補 | 9 / 91 / 1 / -53 | 9 / 91 / KD +1(+7~14) / -53 |
| rashid:raw:17 | 3 | Altair / `236236P` | attack / 基本候補 | 11 / 110 / 17 / -75 | 11 / 110 / HKD +17 / -75 |
| rashid:raw:18 | 3 | Altair (CA) / `236236P` | attack / critical_art | 11 / 110 / 18 / -75 | 11 / 110 / HKD +18 / -75 |
| ryu:raw:0 | 2 | Shin Hashogeki Lv.1 / `214214P` | attack / 基本候補 | 12 / 56 / 20 / -20 | 12 / 56 / KD +20 / -20 |
| ryu:raw:1 | 2 | Denjin Hashogeki Lv.1 / `214214P` | attack / stock_or_enhanced | 12 / 56 / 20 / -20 | 12 / 56 / KD +20 / -20 |
| ryu:raw:2 | 2 | Denjin Hashogeki Lv.2 / `214214P (Hold Lv.2)` | attack / button_hold, stock_or_enhanced | 18 / 62 / 78 / -20 | 18~ / 62~ / KD +78 Tumble / -20 |
| ryu:raw:3 | 2 | Denjin Hashogeki Lv.3 / `214214P (Hold Lv.3)` | attack / button_hold, stock_or_enhanced | 50 / 94 / 78 / -20 | 50~ / 94~ / KD +78 Tumble / -20 |
| ryu:raw:4 | 2 | Shin Hashogeki Lv.2 / `214214P (Hold Lv.2)` | attack / button_hold | 18 / 62 / 20 / -20 | 18~ / 62~ / KD +20 / -20 |
| ryu:raw:5 | 2 | Shin Hashogeki Lv.3 / `214214P (Hold Lv.3)` | attack / button_hold | 50 / 94 / 78 / -20 | 50~ / 94~ / KD +78 Tumble / -20 |
| ryu:raw:17 | 3 | Shin Shoryuken / `236236K` | attack / 基本候補 | 5 / 87 / 14 / -50 | 5(2) / 87 / HKD +14 / -50(-54) |
| ryu:raw:18 | 3 | Shin Shoryuken (CA) / `236236K` | attack / critical_art | 5 / 87 / 14 / -50 | 5(2) / 87 / HKD +14 / -50(-54) |
| ryu:raw:19 | 1 | Shinku Hadoken / `236236P` | attack / 基本候補 | 7 / 86 / 26 / -24 | 7 / 86 / KD +26 / -24 |
| ryu:raw:20 | 1 | Denjin Hadoken / `236236P` | attack / stock_or_enhanced | 7 / 89 / 27 / -24 | 7 / 89 / KD +27 / -24 |
| sagat:raw:0 | 2 | Savage Tiger / `214214K` | attack / 基本候補 | 10 / 87 / 未記載 / -58 | 10 / 87 / HKD ~ / -58 |
| sagat:raw:1 | 2 | Savage Tiger Stomp<br>(Oki) / `214214K~2` | attack / follow_up, direction_ender | 10 / 87 / 19 / -58 | 10 / 87 / HKD +19 / -58 |
| sagat:raw:2 | 2 | Savage Tiger Pendulum<br>(Side Switch) / `214214K~4` | attack / follow_up, direction_ender | 10 / 87 / 7 / -58 | 10 / 87 / HKD +7 / -58 |
| sagat:raw:3 | 2 | Savage Tiger Raid<br>(Damage) / `214214K~5` | attack / follow_up, direction_ender | 10 / 87 / 4 / -58 | 10 / 87 / HKD +4 / -58 |
| sagat:raw:4 | 2 | Savage Tiger Zenith<br>(Launcher) / `214214K~6` | attack / follow_up, direction_ender | 10 / 87 / 53 / -58 | 10 / 87 / HKD +53 / -58 |
| sagat:raw:15 | 3 | Tiger Vanquisher / `236236K` | attack / 基本候補 | 12 / 82 / 15 / -51 | 12(2) / 82 / HKD +15 / -51 |
| sagat:raw:16 | 3 | Tiger Vanquisher (CA) / `236236K` | attack / critical_art | 12 / 82 / 15 / -51 | 12(2) / 82 / HKD +15 / -51 |
| sagat:raw:17 | 1 | Tiger Cannon / `236236P` | attack / 基本候補 | 13 / 109 / 22 / -31 | 13 / 109 / KD +22 / -31 |
| terry:raw:0 | 2 | Power Geyser / `214214P` | attack / 基本候補 | 13 / 79 / 24 / -27 | 13 / 79 / KD +24 / -27 |
| terry:raw:1 | 2 | Twin Geyser / `214214P~PP` | attack / follow_up | 22 / 70 / 55 / 未記載 | 22 / 70 / KD +55 / - |
| terry:raw:2 | 2 | Triple Geyser / `214214P~PP~PP` | attack / follow_up | 14 / 139 / 18 / 未記載 | 14 / 139 / KD +18 / - |
| terry:raw:12 | 1 | Buster Wolf / `236236K` | attack / 基本候補 | 7 / 78 / 22 / -26 | 7 / 78(52) / KD +22 / -26 |
| terry:raw:13 | 3 | Rising Fang / `236236P` | attack / 基本候補 | 8 / 91 / 22 / -50 | 8(2) / 91 / HKD +22 (KD +29~31) / -50(-53) |
| terry:raw:14 | 3 | Rising Fang (CA) / `236236P` | attack / critical_art | 8 / 91 / 37 / -50 | 8(2) / 91 / HKD +37 (KD +29~31) / -50(-53) |
| yasmine:raw:0 | 2 | Nakatagong Lakas / `214214P` | activation / 基本候補 | 1 / 10 / 未記載 / 未記載 | 1 / 10 / - / - |
| yasmine:raw:8 | 1 | Hiwa ng Kalangitan / `236236K` | mixed / 基本候補 | 7 / 62 / 24 / -34 | 7 / 62 / KD +24(+18~20) / -34 |
| yasmine:raw:9 | 3 | Pamumukadkad ng Sampaguita / `236236P` | attack / 基本候補 | 10 / 82 / 42 / -48 | 10(2) / 82 / HKD +42 / -48 |
| yasmine:raw:10 | 3 | Pamumukadkad ng Sampaguita (CA) / `236236P` | attack / critical_art | 10 / 82 / 20 / -48 | 10(2) / 82 / HKD +20 / -48 |
| zangief:raw:5 | 1 | Aerial Russian Slam / `236236K` | attack / 基本候補 | 11 / 77 / 29 / 未記載 | 11 / 77 / HKD +29 / - |
| zangief:raw:6 | 2 | Cyclone Lariat / `236236P` | attack / 基本候補 | 18 / 171 / 5 / -35 | 18 / 171 / HKD +5(+1) / -35 |
| zangief:raw:7 | 2 | Cyclone Lariat (hold P) / `236236[P]` | attack / button_hold | 18 / 172 / 87 / -35 | 18 / 172 / KD +87 Launch / -35 |
| zangief:raw:49 | 3 | Bolshoi Storm Buster / `720+P` | attack / 基本候補 | 6 / 123 / 26 / 未記載 | 6+0 / 123 / HKD +26 / - |
| zangief:raw:50 | 3 | Bolshoi Storm Buster (CA) / `720+P` | attack / critical_art | 6 / 123 / 26 / 未記載 | 6+0 / 123 / HKD +26 / - |

## 付録B. 入力表記の全件集計

| 原典入力文字列 | raw行数 |
| --- | --- |
| 214214K | 15 |
| 214214K~2 | 1 |
| 214214K~4 | 1 |
| 214214K~5 | 1 |
| 214214K~6 | 1 |
| 214214P | 28 |
| 214214P (0 Stock) | 1 |
| 214214P (Hold Lv.2) | 2 |
| 214214P (Hold Lv.3) | 2 |
| 214214P~PP | 1 |
| 214214P~PP~PP | 1 |
| 214214[K] | 1 |
| 214214[P] | 1 |
| 214214[P] (1 Stock) | 1 |
| 214214[P] (2 Stock) | 1 |
| 214214{K} | 1 |
| 22PPP | 1 |
| 236236HP | 2 |
| 236236K | 39 |
| 236236K (0 Stock) | 1 |
| 236236K~[2] | 1 |
| 236236LP | 2 |
| 236236MP | 2 |
| 236236P | 43 |
| 236236P~[2] | 1 |
| 236236[K] | 2 |
| 236236[K] (1 Stock) | 1 |
| 236236[K] (2 Stock) | 1 |
| 236236[P] | 2 |
| 236236[P] Counter | 1 |
| 360+KK | 1 |
| 720+P | 2 |
| Any Direction + P (during SA2) | 1 |
| LP~LP~6LK~HP | 1 |
| PP (SA2) | 1 |
| [4]646HP | 1 |
| [4]646K | 3 |
| [4]646P | 1 |
| j.214214P | 2 |
| j.236236K | 5 |
| j.236236P | 1 |
| ~HK (6) | 2 |
| ~HK (End) | 3 |
| ~HP (3) | 3 |
| ~HP (End) | 2 |
| ~LK (4) | 3 |
| ~LP (1) | 3 |
| ~MK (5) | 3 |
| ~MP (2) | 3 |

