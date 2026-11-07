"""Mechanical enrichment of this task's own new artifacts after source review.

Never touches the source data or application. Run after research.py.
"""
import collections
import html
import json
import pathlib
import re

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'staging/sa-research'
def load(n): return json.loads((OUT/n).read_text())
def save(n,v): (OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def clean(v):
    if v is None:return None
    return html.unescape(re.sub('<[^>]*>',' ',str(v))).replace("'''",'').replace("''",'').strip()
def state(v):
    c=clean(v)
    if not c or '{{{' in c:return 'not_recorded'
    if c in ['-','—','N/A','n/a']:return 'explicit_not_applicable'
    if re.fullmatch(r'[+-]?\d+(\.\d+)?',c):return 'numeric'
    if re.search(r'\d',c) and re.search(r'[~()\[\]/]|\d-\d',c):return 'multiple_or_conditional'
    return 'special'
def nums(s):return [float(n.replace(' ','')) for n in re.findall(r'[+-]?\s*\d+(?:\.\d+)?',s or '')]

j=load('inventory.json'); rs=j['records']
for r in rs:
    cid,lv=r['characterId'],r['saLevel']; inp=r['inputNotation']; notes=(r['originalRecord'].get('notes') or {}).get('en') or ''
    if cid=='elena' and lv==2 and '~' not in inp:
        r['saType']='attack'
        r['classificationRationale']['type']='通常Revival Danceは攻撃。~[2]で回復する条件付き行のみmixed。'
    if cid=='alex' and inp=='PP (SA2)':
        r['conditions']=sorted(set(r['conditions']+['follow_up']))
        r['baseStatus']='conditional'
        r['classificationRationale']['base']='OD Power Dropを背向け相手へ決めた後だけ実行可能。基本始動SA2から区別。'
    # Exact-input candidates can be separated by an explicit CA condition, never by row order.
    if r['verification']['cargoMatch']=='ambiguous_exact_input':
        cand=[c for c in r['cargo']['candidates'] if bool(re.search('available at 25% HP or below',c['record'].get('notes',''),re.I))==(r['edition']=='CA')]
        if len(cand)==1:
            r['cargo']['candidates']=cand
            r['verification']['cargoMatch']='unique_input_and_explicit_ca_condition'
    m=re.match(r'(?:j\.)?((?:\[\d+\]|\d)+)',inp)
    motion=m.group(1) if m else None
    r['motion']=motion
    family='720' if motion=='720' else '360' if motion=='360' else 'charge' if motion and '[' in motion else motion if motion in ['236236','214214'] else 'other'
    r['inputSupport']['motionFamily']=family
    if re.fullmatch(r'(236236|214214)[LMH][PK]',inp):
        r['inputSupport']['inputSyntax']='existing_model_ui_supported'
    elif re.search('PPP|KKK',inp) or inp=='360+KK' or inp=='PP (SA2)':
        r['inputSupport']['inputSyntax']='both_extensions_needed'
    if cid=='dee_jay' and inp.startswith('~'):
        r['strength']=re.search(r'~([LMH])[PK]',inp).group(1)
        r['strengthRole']='follow_up_button_not_starter_strength'
        r['starterStrength']= 'H' if 21<=int(r['id'].split(':')[-1])<=28 else 'L' if 31<=int(r['id'].split(':')[-1])<=36 else 'M'
    if inp=='LP~LP~6LK~HP':
        r['buttonType']=None;r['strength']=None
        r['strengthRole']='mixed_button_sequence_no_single_strength'
        r['conditions']=sorted((set(r['conditions'])-{'follow_up'})|{'sequential_input'})
    if 'Automatically triggers counterattack' in notes:
        r['conditions']=sorted(set(r['conditions']+['counter_trigger']))
    # DL2 in the title is the tabulated damage baseline, not proof that SA3 requires DL2.
    if cid=='jamie' and lv==3 and r['edition']=='normal':
        r['baseStatus']='base_identified_with_state_dependent_damage'
        r['classificationRationale']['base']='技名DL2だけでDL2限定としない。注記がDL0-DL4各ダメージを明記。通常状態でも成立する基本SA3。状態別ダメージは元注記を保持。'
    r['inputDetails']={'original':inp,'proposedInternalMotion':motion if family in ['236236','214214','charge','360','720'] else None,
                       'normalizationAdopted':False,'explicitStrengths':[],
                       'sequence':inp if '~' in inp else None,
                       'simultaneous':bool(re.search('PP|KK',inp)),
                       'buttonHold': 'button_hold' in r['conditions'],
                       'airborneOnly':r['groundAir']=='air'}
    r['inputDetails']['alternativesInNotes']=[]
    if cid=='terry' and inp=='214214P':
        r['inputDetails']['alternativesInNotes']=[{'original':'21416+MK+HP','meaning':'cosmetic difference only','support':'both_extensions_needed','adopted':False}]
    if cid=='mai' and r['groundAir']=='air':
        r['inputDetails']['alternativesInNotes']=[{'original':'2362369K','meaning':'Tiger Knee motion for minimum height','support':'both_extensions_needed','adopted':False}]
    if r['strength']:
        r['inputDetails']['explicitStrengths']=[r['strength']]
    if cid=='guile' and lv==1 and inp=='[4]646P':
        r['inputDetails']['explicitStrengths']=['L','M']
        r['inputDetails']['explicitStrengthBasis']='原典注記can input this horizontal version with LP or MP'
    r['sourceValues']={'raw':r['frames'],'cargo':[]}
    comparisons=[]
    for cand in r['cargo']['candidates']:
        cr=cand['record']
        fs={f:{'original':cr.get(k),'cleanedForComparison':clean(cr.get(k)),'state':state(cr.get(k))}
            for f,k in [('startup','startup'),('total','total'),('hit','hitAdv'),('block','blockAdv')]}
        r['sourceValues']['cargo'].append({'jsonPointer':cand['jsonPointer'],'frames':fs})
        for f,v in fs.items():
            a=r['frames'][f]['cleanedForComparison']; b=v['cleanedForComparison']
            av=r['frames'][f]['original']; ast=r['frames'][f]['state']; bst=v['state']
            if a==b: cmp='exact'
            elif ast=='not_recorded' and bst=='not_recorded':cmp='both_absent_or_template_placeholder'
            elif ast=='not_recorded' and bst=='explicit_not_applicable':cmp='raw_null_cargo_explicit_not_applicable'
            elif ast=='not_recorded':cmp='raw_missing_cargo_has_value'
            elif bst=='not_recorded':cmp='cargo_missing'
            elif ast=='numeric' and bst=='numeric' and float(a)==float(b):cmp='numeric_equivalent_sign_notation'
            elif re.search(r'\b(?:HKD|KD)\b',b or '') and ast=='numeric' and float(a) in nums(b):cmp='kd_semantics_lost_in_raw'
            elif ast=='numeric' and float(a) in nums(b):cmp='conditional_notation_difference'
            else:cmp='potential_conflict'
            comparisons.append({'field':f,'raw':av,'cargo':v['original'],'comparison':cmp})
    r['cargo']['comparison']=comparisons
    r['frameConflicts']=[c for c in comparisons if c['comparison']=='potential_conflict']
    r['strengthReview']={k:{'finding':'not_specified_by_strength','sourceValue':r['originalRecord'].get(k)} for k in
        ['startup','totalFrames','onHit','onBlock','damage','projectileSpeed','projectileTrajectory','attackRange','active','invuln']}
    for k in r['confirmedSameAspects']:
        r['strengthReview'][k]={'finding':'explicit_same_for_this_attribute','evidence':r['strengthEvidence']}
    diffs={('aki',2):['attackRange','projectilePlacement','projectileMovement'],('dee_jay',2):['damage','followupDifficulty','availableEnders'],
           ('dhalsim',1):['totalFrames','onHit','onBlock','damage','attackRange','projectileTrajectory'],
           ('dhalsim',2):['projectileTrajectory'],('ed',2):['projectileSpeed'],
           ('guile',1):['startup','totalFrames','onHit','onBlock','projectileTrajectory','attackRange'],
           ('ingrid',2):['projectileStartup','projectilePlacement']}
    if (cid,lv) in diffs:
        r['strengthDifferentAttributes']=diffs[(cid,lv)]
        for k in diffs[(cid,lv)]:
            r['strengthReview'][k]={'finding':'difference_confirmed_in_source_or_same_sa_rows','evidence':r['strengthEvidence']}
    else:r['strengthDifferentAttributes']=[]
    if cid=='ingrid' and lv==2:
        r['perStrengthSourceValues']={'L':{'projectileStartup':103,'beaconPosition':'in front of opponent'},
            'M':{'projectileStartup':68,'beaconPosition':'above opponent'},'H':{'projectileStartup':98,'beaconPosition':'behind opponent except fullscreen'}}
        r['frameMeaning']='startup=1とtotal=13は表の発動行。注記の弾発生LP103/MP68/HP98とは別指標。どちらを出題するか未決定。'
    elif r['saType']=='activation':
        r['frameMeaning']='攻撃判定の発生ではなく発動行のstartup=1。totalは発動動作の表記値。効果付与の厳密なフレーム定義・暗転の算入法は保存資料で未確認。'
    elif cid=='jp' and lv==2:
        r['frameMeaning']='表のstartup=1/total=13と注記の各攻撃34/71/108/145Fを区別。遅延攻撃なので非攻撃SAの欠損表示規則を自動適用しない。'
    else:r['frameMeaning']=None
    if cid=='sagat' and lv==3:
        r['strengthReview']['other']={'finding':'not_sa_strength_evidence','evidence':'原典のweaker strengthはキャンセル元Tiger Uppercutの強度。SA3自身の強度差の証拠にはしない。'}
    if cid=='cviper' and lv==2:
        r['strengthReview']['other']={'finding':'explicit_input_restriction','evidence':'原典はHP入力時のeasy shortcut制限を明記。フレーム・性能差の証明とは分離。'}

# The two unmatched candidates have exact counterparts outside raw.super_art.
for s in j['supplementalCargoCandidates']:
    cid=s['characterId']; raw=json.loads((ROOT/f'archive/staging/sf6-frame-data/raw/{cid}.json').read_text())
    matches=[(i,m) for i,m in enumerate(raw['moves']) if m['input']['numpad']==s['originalRecord']['input'] and clean((m.get('notes') or {}).get('en'))==clean(s['originalRecord'].get('notes'))]
    assert len(matches)==1
    i,m=matches[0]
    s.update({'classification':'related_special_outside_super_art','verification':'matched_input_notes_and_raw_category_special',
              'rawCounterpart':{'path':f'archive/staging/sf6-frame-data/raw/{cid}.json','jsonPointer':f'/moves/{i}','originalRecord':m},
              'basis':'原典category=special。消費SAゲージではなくゲージ獲得を記載。独立SAとして追加しない。'})

for c in j['coverage']:
    cr=[r for r in rs if r['characterId']==c['characterId'] and r['saLevel']==c['saLevel']]
    bs=[r for r in cr if r['baseStatus'].startswith('base')]
    c['baseRecordIds']=[r['id'] for r in bs]; c['normalBaseIdentified']=bool(bs);c['onlyConditionalOrUncertain']=not bool(bs)
    c['allFourRawFieldsPresentForBase']=bool(bs) and all(all(f['state']!='not_recorded' for f in r['frames'].values()) for r in bs)
    c['frameCompletenessNote']='原典行の保存と標準条件の代表値確定は別。Sagat SA2は方向派生未選択。Ingrid/JP SA2は発動と弾発生を分離。'

st=j['statistics']
st.update({'cargoMatchByRawRecord':dict(collections.Counter(r['verification']['cargoMatch'] for r in rs)),
           'saTypeByRawRecord':dict(collections.Counter(r['saType'] for r in rs)),
           'cargoComparisonFields':dict(collections.Counter(c['comparison'] for r in rs for c in r['cargo']['comparison'])),
           'frameStatesCargo':dict(collections.Counter(f['state'] for r in rs for c in r['sourceValues']['cargo'] for f in c['frames'].values())),
           'motionFamilyByRawRecord':dict(collections.Counter(r['inputSupport']['motionFamily'] for r in rs)),
           'coverageGroupsWithBase':sum(c['normalBaseIdentified'] for c in j['coverage']),
           'baseCandidateRawRecords':sum(r['baseStatus'].startswith('base') for r in rs),
           'uncertainBaseRawRecords':sum(r['baseStatus']=='uncertain' for r in rs),
           'conditionalRawRecords':sum(r['baseStatus']=='conditional' for r in rs),
           'potentialConflictFields':sum(len(r['frameConflicts']) for r in rs),
           'relatedSpecialRowsInSuperArt':1,'supplementalCargoCandidatesResolvedAsSpecial':2})
j['reviewNotes']=['人手で原典注記を確認し、CA判定・SA2派生・強度差・発動/弾発生を照合した。',
  '通常版は通常SA3の意味。baseStatusは通常状態・地上・非ホールド・非派生の別軸。',
  'strengthDifferentSAGroupsはcharacterId+SA level単位。派生行やホールド行を重複計数しない。',
  'rawの数値にKD意味が落ちている箇所をCargoで検出。rawフレームは書き換えていない。']
save('inventory.json',j)
s=load('source-summary.json');s['statistics']=st
s['reviewNotes']=j['reviewNotes'];save('source-summary.json',s)
print(json.dumps(st,ensure_ascii=False,indent=2))
print('CONFLICTS',[(r['id'],r['frameConflicts']) for r in rs if r['frameConflicts']])
