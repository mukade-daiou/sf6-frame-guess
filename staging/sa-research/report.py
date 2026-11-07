"""Generate only the new research report and decision register from reviewed inventory."""
import collections
import json
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'staging/sa-research'
j=json.loads((OUT/'inventory.json').read_text());rs=j['records'];st=j['statistics']
MODE='x'
if '--refresh-own-artifacts' in sys.argv:
    baseline=json.loads((OUT/'workspace-baseline.json').read_text())
    assert 'docs/SA_RESEARCH_REPORT.md' not in baseline['trackedSha256']
    assert (ROOT/'docs/SA_RESEARCH_REPORT.md').read_text().startswith('# スーパーアーツ全32キャラ調査（第15段階A）')
    MODE='w'  # This task's own newly created artifacts only.
def ids(pred):return [r['id'] for r in rs if pred(r)]
issues=[]
def issue(key,typ,pred,source,why,options,recommendation,scope):
    issues.append({'id':key,'type':typ,'status':'awaiting_specification_review','recordIds':ids(pred),
                   'sourceStatement':source,'reasonDecisionNeeded':why,'options':options,
                   'recommendation':recommendation,'recommendationIsAdoption':False,'appliesTo':scope})
issue('SA-D1','strength_question_identity',lambda r:r['saLevel'] is not None,
      '7 SA枠に強度差。残りは全面的な同一性能の明記なし。P/Kだけの行を多数含む。',
      '同じフレーム値でも性能差があり、強度noneからL/M/Hへの自動展開は既存ルールで禁止。SAの質問単位は未決定。',
      ['強度未指定の共通質問＋根拠のある個別強度質問','全強度を別質問（根拠のない展開は保留）','強度を代表値へ統合（差のあるSAには不適切）'],
      '原典の強度指定を保持する。異なる強度の質問を同一視するかはフレーム以外の性能差も含めて決定。未指定P/Kを質問する共通入力を検討し、根拠なくL/M/Hへ展開しない。',
      '全96 SA枠。confirmedSameAspectsはその属性だけの同一性。')
issue('SA-D2','activation_missing_display',lambda r:r['saType']=='activation',
      '5発動行はstartup=1、total=6/7/10。rawのhit/blockはnullだがCargoでは明示的に-。',
      'ユーザー希望を一般化した「非攻撃・未記載なら-」の条件と、その表示が出題成立へ与える効果を仕様化する必要がある。今回はtotal未記載の純発動系はない。',
      ['明示的対象外は既存ルール、非攻撃と確認した真の未記載だけ表示上-','未記載はすべて不明を維持'],
      '既知totalは必ず保持。明示的対象外は既存ルールで処理。非攻撃と確認したSAの真の未記載だけに表示規則を追加する案をレビューする。攻撃/遅延攻撃/mixedへ適用しない。元値と表示根拠は別保存。',
      '非攻撃SAのみ。Juri hold、JP SA2、Ingrid SA2、Elena healingなどへ自動適用しない。')
issue('SA-D3','ca_inclusion',lambda r:r['edition']=='CA',
      '32キャラの通常SA3対応CAに加え、豪鬼Shun Goku SatsuのCA専用行が1件。計33行。',
      'SA3とCAは同コマンドを共有する場合も別条件。現在は基本版だけを検索するため、CAを採用するなら条件選択が必要。',
      ['初回は通常SA3のみ、CAは調査データに保持','CA専用の条件/モードを追加して別質問','通常SA3と混合（条件消失・衝突が生じる）'],
      '初回候補は通常SA3、CAは条件付きとして保持する案。採用する場合は独立条件を必須とし、値が同じでも統合しない。豪鬼のCA専用技は通常SA3へ代入しない。',
      '全33 CA行。採用・除外はこの調査では決めない。')
issue('SA-D4','sa_input_scope',lambda r:r['inputSupport']['motionFamily'] in ['charge','720'] or r['groundAir']=='air' or 'special_state_only' in r['conditions'],
      '基本版にも[4]646P/K・720+Pがある。空中・特殊状態限定・3ボタン・逐次入力の追加行も存在。',
      'SA追加によって従来対象外の720を扱う必要がある一方、既存の空中/特殊状態/3ボタン除外を覆す指示はない。初回の拡張範囲を決める必要がある。',
      ['地上基本SAとその溜め・720を初回対象にし、既存の条件付き除外は継続','特殊状態や空中も独立条件UIで追加','表現可能なSAのみ先行し未対応は保留'],
      '地上基本96枠の対応を目標とし、720・溜め・共通P/K入力を明示的に設計。空中・ホールド・特殊状態・ストックは既存ルールどおり分離し、初回に採用するという新指示がなければ基本版へ混ぜない。',
      'SA用の新しい入力・採用範囲。通常技/必殺技の既存範囲は変更しない。')
issue('SA-D5','activation_vs_projectile_startup',lambda r:(r['characterId'],r['saLevel']) in [('ingrid',2),('jp',2)],
      'Ingrid SA2: 表startup1/total13、弾発生LP103/MP68/HP98。JP SA2: 表startup1/total13、各攻撃34/71/108/145F。',
      '発動と攻撃発生が別指標。注記の弾発生を単一startupへ上書きすると原典の意味が失われる。',
      ['表の発動Fを主表示、弾発生は別指標に保持','弾発生を出題する専用項目を設ける','意味の確定までstartup質問を保留'],
      '両指標を分離して保持し、発生質問が何を指すかを仕様で明記。Ingridの1Fを各強度103/68/98Fへ置換しない。現行パッチと暗転の算入法は未検証。',
      '遅延攻撃・設置系SA全般。発動系の-規則とは別の問題。')

decisions={'baselineHead':j['baselineHead'],'decisionCount':len(issues),'decisions':issues,
 'existingRulesAppliedWithoutNewQuestion':[
  'KD/HKDをDとして扱い、ダウン後有利を通常ヒット硬直差へ混ぜない。原典表記は保持。',
  '括弧外の代表値ルールは既存。括弧や~から範囲を推測しない。今回は数値採用を行わない。',
  'ホールド・空中・強化・ストック・派生・特殊状態は通常版へ混ぜない。採用範囲拡張は別指示を要する。',
  '真の欠損、未確認パッチ、曖昧な値は保留。公式検証済みへ変更しない。',
  'SA coverageを理由に既存32キャラの通常技/必殺技coverageや抽選対象を変更しない。'],
 'unresolvedEvidence':[
  {'type':'strength_not_fully_verified','recordIds':ids(lambda r:r['strengthClassification']!='strength_different'),
   'reason':'全面的な強度共通性の根拠が不足。属性単位の同一性を全性能へ拡張しない。'},
  {'type':'sagat_sa2_ender','recordIds':ids(lambda r:r['characterId']=='sagat' and r['saLevel']==2),
   'reason':'基本始動はあるがhitはHKD~。方向派生~2/~4/~5/~6は各値あり。標準条件で~5を自動採用する根拠は未確定。既存ルールで未確定を維持。'},
  {'type':'live_source_and_patch','recordIds':ids(lambda r:True),
   'reason':'ライブWikiはAnubis、公式は403。保存済み資料を利用。ゲーム版UNVERIFIED。'},
  {'type':'conditional_frame_notation','recordIds':ids(lambda r:any(c['comparison'] in ['conditional_notation_difference','raw_missing_cargo_has_value'] for c in r['cargo']['comparison'])),
   'reason':'rawが~、括弧、KDを省略した箇所を保持。主値の一致だけで全条件一致とはしない。新たな採用ルールの質問ではなく出典解釈上の保留。'}]}
with (OUT/'decisions-needed.json').open(MODE) as f:json.dump(decisions,f,ensure_ascii=False,indent=2);f.write('\n')

lines=[]
def add(s=''):lines.append(s)
def table(headers,rows):
    add('| '+' | '.join(headers)+' |');add('| '+' | '.join(['---']*len(headers))+' |')
    for row in rows:add('| '+' | '.join(str(v).replace('|','\\|').replace('\n',' ') for v in row)+' |')
    add()
def text(v):return '未記載' if v is None else str(v)
def source_frames(r,which):
    fs=r['frames'] if which=='raw' else r['sourceValues']['cargo'][0]['frames']
    return ' / '.join(text(fs[k]['cleanedForComparison']) for k in ['startup','total','hit','block'])

add('# スーパーアーツ全32キャラ調査（第15段階A）\n')
add('保存済み原典の`super_art`全199行を分類し、32キャラ×SA1/2/3の96枠すべてに対応する基本始動を確認した。独立したSAおよびSA派生は198行、SA2中の派生必殺技Rolling Cannonは1行。強度差を確認したSAは7枠で、全面的な強度共通性を確認できたSAは0枠だった。採用、入力単位、CAの範囲、発動系の表示条件は未決定であり、実装前に第16節の5項目をレビューする。\n')
add('今回の成果物は調査専用。既存32キャラ908レコードと通常技・必殺技coverageは変更していない。worktree・ブランチ作成、commit・push・merge等も行っていない。\n')
add('## 1. 調査対象と情報源\n')
add(f'- 調査記録日時（UTC）：`{j["researchAt"]}`。各ネット取得日時は`source-summary.json`を参照。\n- 開始HEAD：`{j["baselineHead"]}`、開始ブランチ：`main`。開始時の未コミット変更は`workspace-baseline.json`に記録。\n- raw：`archive/staging/sf6-frame-data/raw/*.json`、32ファイル。各行のURL・取得日時・ID・全原典値をinventoryに保存。\n- Cargo：`archive/staging/sf6-frame-data-quality/evidence/*.cargo.json`、32ファイル。取得時刻・JSON Pointer・元HTML表記を保存。\n')
add('rawには2026-08-19取得行だけでなく後続取得行も含まれる。取得日時はレコード単位で扱う。Cargoは2026-11-05取得。同じSuperCombo Wiki由来であり、独立した公式検証ではない。対象ゲーム版は全件`UNVERIFIED`。他サイトで表示された版や取得日からゲーム版を推測しない。ライセンス表記もrawの`CC-BY-SA`とCargoの`CC-BY-SA-4.0`を元のまま残した。\n')
add('SAレベル対応表は[sf6-senseiの固定リビジョン](https://github.com/RyoSogawa/sf6-sensei/blob/a0b4105fb368c308699ec0757ee6e4182e5a9d1c/packages/data/src/sa-levels.json)を参照。リビジョンは`a0b4105fb368c308699ec0757ee6e4182e5a9d1c`（commit日時2026-11-02T12:16:32Z）。内容を`sa-levels.snapshot.json`に保存した。コミュニティの補助表として使い、原典の技名・入力・消費ゲージ・派生注記と照合した。\n')
add('現行[SuperCombo Edページ](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)はAnubisのAccess Denied、[公式リュウフレームページ](https://www.streetfighter.com/6/ja-jp/character/ryu/frame)は403で内容を取得できなかった。GitHubの通常表示も取得失敗したが、固定SHAのraw URLは取得できた。今回の値は保存済み資料を基準とし、現行パッチや実機確認済みとはしていない。\n')
add('## 2. 調査方法\n')
add('`DATA_SPEC`、`DATA_WORKFLOW`、`ADOPTION_RULES`、`GAME_SPEC`、`ROTATION_AND_COVERAGE_AUDIT`、schema/input/resolverは開始HEADの版を読んだ。作業途中のUI変更を評価根拠にしていない。`data/adoption-decisions.json`と本番キャラ32ファイルも読み取り確認し、SAが現行採用範囲外であることと908レコードを確認した。\n')
add('全raw行からcategoryが`super_art`の行を抽出。主キーは`character:raw:配列index`とした。同じ原典技ID・入力でもSA3/CA、強化版、ホールド版等が重複するため、原典IDだけでは統合しない。入力だけによるSAレベル推定は避け、表と明示的消費量を照合した。ディージェイの追加打撃、テリーの追加ゲイザーは親SAと注記から対応付け、追加ゲージ量を独立SAレベルと誤認しない。\n')
add('Cargoは194行が注記完全一致、3行が入力一意一致、アルジュンSA3/CAの2行が入力と明示的CA条件で一意に対応した。入力・注記・条件の元データは全件保持。ゲージ・名前のないCargoだけで新SAを確定しない。候補照合後に残ったCargo 2行はrawのspecialに対応した（第13節）。\n')
add('フレームは原典ごとに数値、特殊値、明示的対象外、未記載、複合/条件値を記録した。原典間の差は別欄に保持。発生＋持続＋硬直の加算、欠損補完、括弧外の採用処理、D変換を実施していない。原典のKDや~を落としているrawは、Cargo表記も参照する必要がある。\n')
add('## 3. 32キャラ別SA1・SA2・SA3一覧\n')
add('各セルは通常状態・地上・非ホールドの基本始動候補。個別強度版は併記した。引用IDの配列位置、全フレーム、注記、出典は付録とinventoryから追跡できる。ここでの「基本版」は採用決定を意味しない。\n')
rows=[]
for cid in sorted({r['characterId'] for r in rs}):
    cr=[r for r in rs if r['characterId']==cid];cells=[]
    for lv in [1,2,3]:
        bs=[r for r in cr if r['saLevel']==lv and r['baseStatus'].startswith('base')]
        cells.append('<br>'.join(f'{r["name"]["en"]} `{r["inputNotation"]}` ({r["id"]})' for r in bs))
    rows.append([cid+' / '+cr[0]['characterName']['nameJa'],*cells,len(cr)])
table(['キャラ','SA1','SA2','SA3','raw行数'],rows)
add('## 4. 基本版SAの収録状況\n')
add('96枠すべてに基本始動が保存され、SAレベルと入力を特定できる。基本候補は強度別行を含め102行。条件付き行は97行。サガットSA2は基本始動が存在するが、ヒット結果は方向選択で変わり、基本行はCargoで`HKD ~`。代表ヒット値は未確定。ジェイミーSA3の技名`(DL2)`はDL2限定という意味にせず、注記のDL0〜DL4ダメージ記載を保持した。\n')
add('## 5. 強度差があるSA：7枠（対象raw 39行）\n')
table(['SA','原典が示す差','フレーム以外の注意'],[
 ['A.K.I. SA2','LP近〜中、MP中〜全画面、HP全画面','毒沼配置・移動も変化。共通の7/153/30/-19を全強度同性能と解釈しない'],
 ['ディージェイSA2','LP/MP/HPで始動ダメージ300/300/200。始動フレーム12/62/+6/-29','派生難度、リズム、最終打撃の可否・ダメージが変わる。派生ボタン強度と始動強度を別記'],
 ['ダルシムSA1','LP/MPは10/128/KD+29/-10、HPは10/133/KD+27/-22。ダメージ1920/2100/2040','MPはLPより短射程・上向き終段。各強度行を保持'],
 ['ダルシムSA2','button strength determines trajectory','非ホールド・部分/最大ホールドでも軌道差。具体的なL/M/H軌道の角度は未記載'],
 ['エドSA2','LP slow / MP mid / HP fast','弾速差。低速版の長いコンボ等も注記。個別速度数値はないので補完しない'],
 ['ガイルSA1','LP/MP横版：8(11)/89/KD+41/-26、HP上向き版：7/75/KD+70/-2','横版P行をLP/MPと対応付ける注記あり。強度差と相手の高さ・距離による条件差を分ける'],
 ['イングリッドSA2','LP弾発生103F/相手前、MP68F/相手上、HP98F/相手後（全画面例外）','0/1/2ストック行の発動表記は1/13。弾発生をその値に上書きしない']])
add('## 6. 強度共通と確認できたSA\n')
add('全性能について`strength_same`と確定できたSAは0枠。原典が同一性を明記した属性は、リュウSA1（通常/電刃）・豪鬼SA1・サガットSA1の弾速、豪鬼の空中SA1の弾速と角度。これらは`confirmedSameAspects`に保存した。発生・持続・無敵・範囲等まで同じという保証へ広げていない。\n')
add('## 7. 強度未指定・未確定のSA\n')
add('raw単位では`strength_different`39行、`strength_unspecified`159行、`strength_uncertain`1行（Rolling Cannon）。7枠以外の89 SA枠は、全性能の強度差なしを確認できていない。全行で発生・全体・ヒット・ガード・ダメージ・弾速・軌道・範囲・持続・無敵を調査欄に設け、未指定も明記した。原典に各強度値がない場合、数値は未確定のままとした。\n')
add('C.ヴァイパーSA2のHP入力時ショートカット制限は入力上の制限として記録。サガットSA3の注記にある強度はキャンセル元Tiger Uppercutを指し、SA3の強度差とはしていない。ジュリSA2の「等しい/上の強度へチェーン可能」も発動ボタンの強度差の証拠にはしない。\n')
add('## 8. 発動系SAとフレームの意味\n')
table(['非攻撃発動SA','raw 発生/全体/ヒット/ガード','Cargo','表示案（未実装）'],[
 [r['characterId']+' SA2 '+r['name']['en'],source_frames(r,'raw'),source_frames(r,'cargo'),f'1 / {r["frames"]["total"]["original"]} / - / -'] for r in rs if r['saType']=='activation'])
add('純発動系は5行。すべて全体Fが明記されており、全体まで`-`にしない。Cargoのhit/blockは元から対象外の`-`で、rawのnullだけを見ると未記載と誤認する。startup=1は攻撃発生ではなく発動行の値。暗転の算入方法、効果が厳密に付くタイミングは資料不足で未確定とした。\n')
add('攻撃＋強化/回復のmixedは8行：C.ヴァイパーSA1、キンバリーSA3/CA、舞SA1通常/Flame、ヤスミンSA1、ジュリSA2ホールド、エレナSA2 Healing。JP SA2とイングリッドSA2は遅延攻撃を生成するattackと分類し、非攻撃発動系の欠損表示を適用しない。ラシードSA2も攻撃を生成するためattack。\n')
add('## 9. 条件付きSA\n')
counts=collections.Counter(t for r in rs for t in r['conditions'])
table(['条件タグ','raw行数（重複あり）'],sorted(counts.items()))
add('97条件付き行にはCA、空中、ホールド、強化、派生、SA関連必殺技が含まれる。同じ行に複数タグが付くため、タグ件数は合計しない。`edition=normal`はCAでないという意味で、基本版を保証しない。\n')
add('リュウSA2のLv.1/2/3はホールド段階であり、すべてSA2。電刃は別条件。ジュリSA1ホールドは風破ストック消費、キンバリーSA1ホールドは缶消費、イングリッドSA1/2ホールドは紋章消費を別々に記録した。リリーWindclad・舞Flame・ジェイミー飲酒状態も通常版へ統合しない。\n')
add('豪鬼Misogi/Kongou-Kokuretsuzan、ベガFinal Psycho Crusher、イングリッドSun Octopusは特殊状態限定。アレックスOmega Wing BusterはOD Power Dropからの派生SA2。テリーTwin/Triple GeyserはSA2系派生。マリーザSA1のホールド・カウンター、サガットSA2の方向別終段、エレナ回復派生、ジェイミー飲み派生は強度差と別の条件として保存。採用範囲の既存ルールを変更していない。\n')
add('## 10. CA版\n')
add('CAは33行。32キャラそれぞれの通常SA3に対応するCAがあり、豪鬼には別コマンドのCA専用Shun Goku Satsuもある。A.K.I.のCAは技名が通常版と同じだが、25%HP以下の注記で区別できる。リュウ・豪鬼・ザンギエフ等の同フレーム版も別条件で保持した。ジェイミーは通常SA3とCAのヒット結果も異なる。\n')
add('## 11. 特殊入力形式とHEAD時点の対応可否\n')
table(['モーション分類','raw行数'],st['motionFamilyByRawRecord'].items())
table(['原典表記・例','既存入力モデル/UIの評価（SAカテゴリを除く）'],[
 ['236236 / 214214 + L/M/HP/K','既存モデル・UIで対応可能。ディージェイ/ダルシムの個別強度始動が該当'],
 ['236236P、214214K等の強度なし','データはstrength noneで保持可能、UIのみ拡張が必要。L/M/Hへ展開しない'],
 ['[4]646P、[4]646HP、[4]646K','5行。モデルは文字列表現可能、HEADの質問UIは溜め未対応。上流表の4646は照合用の対応であり内部表記へ採用しない'],
 ['720+P','通常SA3とCAの2行。motion720は保持可能、2回転のUI対応が必要。360へ変換しない'],
 ['360+KK','Dark Ingrid限定Sun Octopusの1行。360自体は対応、非ODのKKを現行ODへ流用できないため両方の拡張が必要'],
 ['22PPP','Shin Akuma限定。3ボタンを保持・選択する両方の拡張が必要。既存対象外方針を無断変更しない'],
 ['PP (SA2)、LP~LP~6LK~HP、~LP等','派生・逐次入力・始動状態と非OD同時押しの表現に両方の拡張が必要'],
 ['214214[P]、214214{K}、(Hold Lv.2)、~[2]','ボタン/方向ホールドと溜め方向を区別する両方の拡張が必要'],
 ['j.236236K、j.214214P等','空中条件をデータvariantへ記録できるが、地上版との独立キー・選択を含め両方の拡張が必要'],
 ['Any Direction + P (during SA2)','方向・状態の解釈が必要。原典でSA関連必殺技と判明。独立SAとして変換しない']])
add('入力欄以外の原典注記には、テリーSA2の代替`21416+MK+HP`（見た目だけの違い）、舞の低空用`2362369K`もある。前者は異種ボタン同時押しを含むため両方の拡張が必要。後者は追加の上方向を含む方向列として保持できるが、空中状態選択・判定が別途必要。別SA行や正式な内部コマンドへ自動変換していない。\n')
add('上表は入力構文の評価。カテゴリまで含めると、現行schemaはnormal/specialだけ、resolverは基本版入力キーだけで検索し、SAレベル・CA・空中等を識別しない。SAの追加には全件でデータモデルとUI/質問処理双方の変更が必要。作業中の溜めUI変更はこの評価へ取り込んでいない。全入力文字列の重複なし一覧は付録B。\n')
add('## 12. フレーム値の欠損・差異\n')
table(['原典','数値','特殊値','明示的対象外','未記載/未展開テンプレート','複合・条件値'],[
 ['raw 796項目',706,0,0,90,0],['Cargo 796項目',460,139,63,21,113]])
add('Cargoの特殊値には`KD +30`等も含む。数値だけに落とすと意味が失われる。rawの数値とCargoのKDを含む記載を対応させた167項目は、矛盾ではなくrawで意味が省略された箇所。符号表記だけの差は17項目、条件表記の差は79項目。単純な数値の不一致は今回検出しなかったが、条件表記全体の同一性や現行パッチとの整合を保証しない。\n')
add('raw未記載90項目のうち、Cargoで明示的対象外が63、空欄/未展開テンプレートが21、特殊値等が追加で判明するものが6。これらもrawを上書きせず両方保持した。主な例：豪鬼空中SA1のtotal=`{{{total}}}`は値が得られないテンプレート、豪鬼瞬獄殺hit=`HKD + 18`、ダルシムSA2ホールドhit=`KD`、ベガ特殊SA2hit=`KD 0(+6)`、サガットSA2hit=`HKD ~`、Rolling Cannon hit=`KD~`。\n')
add('遠距離の標準条件も既存ルールに従う。例としてラシードSA2の注記はKD値が密着時と明記し、ガイル横SA1の8(11)、エドSA2の+115~等も条件を含む。未記載の遠距離値や上限を計算しない。通常ヒット硬直差・KD後有利・発動F・弾発生Fを同一指標としてまとめない。\n')
add('## 13. SA coverageの評価\n')
add('32キャラともSA1/2/3の存在を保存資料で確認し、原典行・レベル・基本始動・入力・何らかのフレーム値を追跡できる。条件付き版しか見つからない基本SA枠は0。UIでSAを質問できる枠は開始HEADでは0。これは現在の通常技・必殺技coverageとは独立した結果で、既存キャラを抽選対象から外す理由にしない。\n')
table(['指標','件数'],[
 ['調査キャラ',32],['SA枠',96],['保存super_art行',199],['SA/SA派生へレベル対応',198],
 ['SA関連必殺技として区別',1],['基本始動あり',96],['条件付き版のみ',0],['SA用UIで質問可能',0]])
add('Cargoにだけ残った候補は2件とも追加SAではなかった。イングリッド22PPP Sunburst Beamはraw `/moves/13`のspecial、ヤスミン214214P~4KK Linya ng Liwanagはraw `/moves/1`のspecialに入力・注記が一致した。補助候補をinventoryの`supplementalCargoCandidates`に保持した。\n')
add('## 14. 実装時に必要なデータモデルの変更案\n')
add('SAカテゴリ・レベル（1/2/3）、通常SA3とCAの独立条件、強度未指定と明示強度群、派生/空中/ホールド/ストックの識別を検討する。現行variantは条件文字列を保存できるが、質問キーや選択へ反映する仕組みがない。基本版同一入力に複数SAを置けばambiguousになる。\n')
add('発動Fと弾発生F、KD後有利と通常硬直差、原典未記載と対象外を分離して保持する必要がある。非攻撃SAの表示上-は出典値と別の根拠を持たせる。coverageはSA専用に設け、normal/specialのcompleteと混同しない。採用時には別データセットとして908レコードの固定性を検証する。いずれも今回未実装。\n')
add('## 15. UI対応で必要になる変更案\n')
add('SA入力の選択、強度共通P/K、720の専用表現、[4]646の溜め入力を検討する。レベルはコマンドから推測せずデータで識別し、条件付き版を将来採用するならCA・ホールド・空中・状態の明示選択と重複判定が必要。入力別評価は第11節のとおり。`-`表示による質問消費、発生のみモード、履歴の保存値との関係も仕様に含める。今回UIには変更していない。\n')
add('## 16. ユーザー判断が必要な事項：5種類\n')
for d in issues:
    add(f'### {d["id"]}：{d["type"]}\n')
    add(d['sourceStatement']+' '+d['reasonDecisionNeeded']+'\n')
    add('候補：'+'／'.join(d['options'])+'。\n')
    add('推奨案（未採用）：'+d['recommendation']+' 適用範囲：'+d['appliesTo']+'\n')
add('対象レコードIDは`decisions-needed.json`に列挙。同ファイルには既存ルールで処理できる事項と、追加調査を要する証拠不足を分けた。ホールド版の除外、括弧外の原則、D、未検証パッチ、欠損保留について同じ判断を再質問していない。\n')
add('## 17. 推奨する次段階の作業\n')
add('ChatGPTで第16節の5項目を決め、初回の対象を地上基本96枠にするか確認する。その後、強度未指定・720・溜め・遅延攻撃の発生指標を含む仕様と受け入れ条件を作成する。未確定の強度差・暗転/発生定義・サガットSA2の標準終段等は証拠不足として残す。採用値や入力件数の確定は、仕様レビュー後の別指示で行う。\n')
add('### 検証と作業範囲\n')
add('調査用検証は`python3 staging/sa-research/validate.py`。全32ファイルの199行を再抽出し、ID・JSON Pointer・原典全値・SHA256、96枠、レベル根拠、CA条件、強度分類、フレーム無補完、JSONパース、レポートの199行を確認する。コード変更がなく、共有ファイルを書き換える既存生成・整形・ビルドは実行しない。検証結果と終了Git状態は`validation.json`に保存する。\n')
add('研究用Pythonは保存資料の機械抽出・集計と成果物生成だけを行う。実行順はresearch.py→review.py→report.py→validate.py。research.pyとreport.pyは新規作成専用で、既存成果物がある場所では再実行せず別の空の調査コピーで使う。ゲームへの取り込みスクリプトではない。\n')
add('## 付録A. 原典全199行\n')
add('発生 / 全体 / ヒット / ガードの順。rawの未記載は「未記載」と記し、Cargoの`-`と区別した。HTMLは比較用に除去したが元HTMLはinventoryに保持。技名・条件・数値を採用用に変更していない。\n')
table(['record ID','SA','技名 / 入力','区分 / 条件','raw F','Cargo F'],[
 [r['id'],r['saLevel'] if r['saLevel'] else 'SA関連必殺技',r['name']['en']+' / `'+r['inputNotation']+'`',
  r['saType']+' / '+(', '.join(r['conditions']) or '基本候補'),source_frames(r,'raw'),source_frames(r,'cargo')] for r in rs])
add('## 付録B. 入力表記の全件集計\n')
table(['原典入力文字列','raw行数'],sorted(collections.Counter(r['inputNotation'] for r in rs).items()))
report='\n'.join(lines)+'\n'
report=report.replace('102行。条件付き行は97行','101行。条件付き行は98行').replace('97条件付き行には','98条件付き行には')
report=report.replace('HTMLは比較用に除去したが','Cargo欄の空欄は原典の空文字列を示す。HTMLは比較用に除去したが')
with (ROOT/'docs/SA_RESEARCH_REPORT.md').open(MODE) as f:f.write(report)
print('report written; decisions',len(issues),'records',len(rs))
