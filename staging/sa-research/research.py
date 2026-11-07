"""Read-only source research. Writes only new files in the authorized research paths.

Run once; exclusive writes intentionally refuse to replace artifacts.
No game-data conversion, frame calculation, Git mutation, or source update.
"""
import collections
import datetime
import hashlib
import html
import json
import pathlib
import re
import subprocess
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'staging/sa-research'
HEAD = 'a93b5c3a01c6a1ad4de69aa6e7a2b32842fed456'
REV = 'a0b4105fb368c308699ec0757ee6e4182e5a9d1c'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
INITIAL_STATUS = ''' M README.md
 M docs/DATA_SPEC.md
 M docs/DESIGN_DECISIONS.md
 M docs/GAME_SPEC.md
 M index.html
 M scripts/verify-gameplay.mjs
 M src/app/App.tsx
 M src/components/History.test.tsx
 M src/components/MoveNotation.tsx
 M src/features/move-selector/controller.test.tsx
 M src/features/move-selector/controller.ts
 M src/lib/frame-data/input.ts
 M src/styles.css
 M staging/coverage-audit/review.json
?? scripts/verify-charge.mjs
?? src/features/move-selector/charge.test.tsx'''

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).rstrip('\n')

def read(path):
    return json.loads((ROOT / path).read_text())

def write(path, value):
    with (ROOT / path).open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

def clean(v):
    if v is None: return None
    return html.unescape(re.sub('<[^>]*>', '', str(v))).replace("'''", '').replace("''", '').strip()

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()

tracked = {p: digest(ROOT / p) for p in git('ls-files').splitlines() if (ROOT / p).is_file()}
write('staging/sa-research/workspace-baseline.json', {
    'recordedAt': NOW, 'startHead': HEAD, 'startBranch': 'main',
    'startStatusShort': INITIAL_STATUS, 'hashCaptureAt': NOW,
    'note': '開始時のstatusは最初の読み取り結果。ハッシュは資料確認後の時点。他セッションの継続変更はあり得る。',
    'trackedSha256': tracked,
})

fetches = []
def fetch(url):
    at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'SA-research/1.0'}), timeout=35) as r:
            body = r.read()
            fetches.append({'url': url, 'retrievedAt': at, 'status': r.status, 'sha256': hashlib.sha256(body).hexdigest()})
            return body
    except Exception as e:
        fetches.append({'url': url, 'retrievedAt': at, 'error': str(e)})
        return None

url = f'https://raw.githubusercontent.com/RyoSogawa/sf6-sensei/{REV}/packages/data/src/sa-levels.json'
levels = json.loads(fetch(url))
write('staging/sa-research/sa-levels.snapshot.json', {'revision': REV, 'url': url, 'data': levels})

# Stored sources are authoritative for values. Live probes are access checks only.
for url in ['https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data',
            'https://www.streetfighter.com/6/ja-jp/character/ryu/frame']:
    b = fetch(url)
    if b is not None:
        fetches[-1]['accessDenied'] = b'Anubis' in b or b'Access Denied' in b
        fetches[-1]['usedForFrameValues'] = False

def core(s):
    s = s.replace('[4]646', '4646').replace('720+', '720')
    return re.sub(r'[\[\]{}]', '', s)

DIFFERENT = {('aki', 2), ('dee_jay', 2), ('dhalsim', 1), ('dhalsim', 2), ('ed', 2), ('guile', 1), ('ingrid', 2)}
ACTIVATION = {('blanka', 2), ('guile', 2), ('jamie', 2), ('juri', 2), ('yasmine', 2)}
MIXED = {('cviper', 1), ('kimberly', 3), ('mai', 1), ('yasmine', 1), ('elena', 2)}
PERFORMANCE = ['startup','totalFrames','onHit','onBlock','damage','projectileSpeed','attackRange','active','invuln']
sources, records = [], []
characters = {}

def frame(v):
    c = clean(v)
    if c in [None, '']: status = 'not_recorded'
    elif c in ['-', '—', 'N/A', 'n/a']: status = 'explicit_not_applicable'
    elif re.fullmatch(r'[+-]?\d+(?:\.\d+)?', c): status = 'numeric'
    elif re.search(r'[~()\[\]/]|\d-\d', c): status = 'multiple_or_conditional'
    else: status = 'special'
    return {'original': v, 'cleanedForComparison': c, 'state': status}

for p in sorted((ROOT / 'archive/staging/sf6-frame-data/raw').glob('*.json')):
    cid = p.stem
    prod = read(f'data/characters/{cid}.json')
    characters[cid] = {'nameJa': prod['nameJa'], 'nameEn': prod['nameEn']}
    raw = json.loads(p.read_text())
    cp = f'archive/staging/sf6-frame-data-quality/evidence/{cid}.cargo.json'
    cargo = read(cp)
    rows = [x['title'] for x in cargo['data']['cargoquery']]
    rp = str(p.relative_to(ROOT))
    sources.append({'characterId': cid, 'rawPath': rp, 'rawSha256': digest(p),
                    'rawFetchedAt': sorted({m['source']['fetchedAt'] for m in raw['moves'] if m.get('source')}),
                    'cargoPath': cp, 'cargoSha256': digest(ROOT / cp),
                    'cargoRetrievedAt': cargo['retrievedAt'], 'cargoUrl': cargo['url'],
                    'gameVersion': cargo['gameVersion'], 'reliability': 'community_same_wiki_not_independent'})
    for idx, m in enumerate(raw['moves']):
        if m['category'] != 'super_art': continue
        name = m['name']['en']
        inp = m['input']['numpad']
        notes = (m.get('notes') or {}).get('en') or ''
        ca = bool('(CA)' in name or re.search('available at 25% HP or below', notes, re.I))
        # Never infer SA level solely from the motion: compare the table with source gauge cost.
        table = [int(k[-1]) for k,v in levels[cid].items() if core(inp).replace('LP','P').replace('MP','P').replace('HP','P').startswith(v)]
        gauge = m.get('superGauge') or {}
        costs = {abs(v)//10000 for v in gauge.values() if isinstance(v, int) and abs(v) in [10000,20000,30000]}
        costlevel = next(iter(costs)) if len(costs)==1 else None
        level = costlevel
        reason = ['raw.superGaugeの明示的消費量'] if level else []
        if cid == 'dee_jay' and inp.startswith('~'):
            level = 2
            reason = ['技名のHeadliner/Lowkey/Marvelous/Encore/Climacticと直前のSA2始動・派生注記。追加入力の強度は始動強度と別。']
        if cid == 'terry' and ('~' in inp):
            level = 2
            reason = ['Power Geyser→Twin Geyser→Triple Geyserの明示派生。Tripleの追加1ゲージをSA1と誤認しない。']
        is_related = cid == 'blanka' and name == 'Rolling Cannon'
        if is_related:
            level = None
            reason = ['原典はSpecial move follow-up during SA2と明記。super_art分類行だが独立したSAではない。']
        basis = {'level': level, 'upstreamTableCandidates': table, 'sourceGaugeCandidates': sorted(costs),
                 'rationale': reason, 'tableAgreement': level in table if table and level else None}
        tags = []
        if ca: tags.append('critical_art')
        air = inp.startswith('j.')
        if air: tags.append('airborne_only')
        held = bool(re.search(r'\[[PK]\]|\{[PK]\}|Hold Lv|\(hold', inp+' '+name, re.I))
        if held: tags.append('button_hold')
        if re.search('Denjin|Windclad|\(Flame\)|\([12] Stock\)', name): tags.append('stock_or_enhanced')
        if cid == 'jamie': tags.append('drink_level_dependency')
        if re.search('Shin Akuma only|Shin Bison only|Dark Ingrid only', notes): tags.append('special_state_only')
        if '~' in inp: tags.append('follow_up')
        if is_related: tags.append('sa_related_special')
        if 'Counter Javelin' in name: tags.append('counter_trigger')
        if cid == 'sagat' and '~' in inp: tags.append('direction_ender')
        baseline_blockers = set(tags) - {'drink_level_dependency'}
        base = not baseline_blockers
        base_status = 'base_identified' if base else 'conditional'
        if cid == 'jamie' and level == 3:
            base_status = 'uncertain' if not ca else 'conditional'
        if cid == 'sagat' and inp == '214214K': base_status = 'base_with_unselected_ender'
        kind = 'attack'
        if (cid,level) in ACTIVATION and not (cid=='juri' and held): kind = 'activation'
        if (cid,level) in MIXED or (cid=='juri' and level==2 and held): kind = 'mixed'
        # A deferred attacking projectile is an attack, not a non-attacking install.
        if (cid,level) in [('jp',2),('ingrid',2)]: kind = 'attack'
        strength = re.search(r'([LMH])([PK])', inp)
        strength_value = strength.group(1) if strength and not inp.startswith('~') else None
        button = re.search('[PK]', inp)
        strength_status = 'strength_different' if (cid,level) in DIFFERENT else 'strength_unspecified'
        if is_related: strength_status = 'strength_uncertain'
        same_aspects = []
        if re.search(r'(not affected by button strength|button strength does not affect)', notes):
            same_aspects = ['projectileSpeed'] + (['projectileAngle'] if 'speed/angle' in notes else [])
        matches = [(i,r) for i,r in enumerate(rows) if clean(r.get('notes')) == clean(notes) and clean(notes)]
        method = 'unique_exact_notes' if len(matches)==1 else 'ambiguous_exact_notes'
        if not matches:
            matches = [(i,r) for i,r in enumerate(rows) if r.get('input') == inp]
            method = 'unique_exact_input' if len(matches)==1 else 'ambiguous_exact_input'
        if not matches:
            matches = [(i,r) for i,r in enumerate(rows) if core(r.get('input','')) == core(inp)]
            method = 'unique_normalized_input_candidate' if len(matches)==1 else 'unresolved'
        frames = {f: frame(m.get(k)) for f,k in [('startup','startup'),('total','totalFrames'),('hit','onHit'),('block','onBlock')]}
        comparisons = []
        if len(matches)==1:
            _, cr = matches[0]
            for f,k in [('startup','startup'),('total','total'),('hit','hitAdv'),('block','blockAdv')]:
                a,b = frames[f]['cleanedForComparison'], clean(cr.get(k))
                # Preserve KD labels, parentheses, and ranges; no representative value is adopted here.
                if a == b: state = 'exact'
                elif a is None and b in [None,'']: state = 'both_absent'
                elif a is None and b == '-': state = 'raw_null_cargo_explicit_not_applicable'
                elif b and a and re.search(r'\b(?:HKD|KD)\b',b) and a in re.findall(r'[+-]?\d+',b): state = 'kd_semantics_lost_in_raw'
                elif a is None: state = 'raw_missing_cargo_has_value'
                elif b in [None,'']: state = 'cargo_missing'
                elif a and b and (a in re.findall(r'[+-]?\d+', b)): state = 'conditional_notation_difference'
                else: state = 'potential_conflict'
                comparisons.append({'field':f,'raw':m.get({'startup':'startup','total':'totalFrames','hit':'onHit','block':'onBlock'}[f]),
                                    'cargo':cr.get(k), 'comparison':state})
        motion = re.match(r'(?:j\.)?([\d\[\]]+)', inp)
        motion = motion.group(1) if motion else None
        support = 'ui_only_extension_needed'
        if air or held or '~' in inp or 'Stock)' in inp or inp == 'LP~LP~6LK~HP' or is_related:
            support = 'both_extensions_needed'
        special_motion = '720' if motion == '720' else '360' if motion == '360' else 'charge' if motion and '[' in motion else '236236' if motion=='236236' else '214214' if motion=='214214' else 'other'
        evidence = [s.strip() for s in notes.split(';') if re.search('strength|trajectory|LP version|MP version|HP version|LP or MP',s,re.I)]
        if strength_status=='strength_different' and not evidence:
            evidence = ['同キャラ同SAの個別強度行と性能・技名・注記を比較。']
        records.append({
            'id':f'{cid}:raw:{idx}', 'characterId':cid, 'characterName':characters[cid],
            'sourceMoveId':m['id'], 'name':m['name'], 'saLevel':level, 'saLevelEvidence':basis,
            'inputNotation':inp, 'motion':motion, 'buttonType':button.group() if button else None,
            'strength':strength_value, 'strengthNotation':strength.group() if strength else None,
            'groundAir':'air' if air else 'ground', 'edition':'CA' if ca else 'normal',
            'conditions':tags, 'baseStatus':base_status, 'frames':frames,
            'performance':{k:m.get(k) for k in PERFORMANCE},
            'strengthClassification':strength_status, 'strengthEvidence':evidence,
            'confirmedSameAspects':same_aspects,
            'strengthCaveat':'未指定は全強度共通の証明ではない。同一と明示された属性だけconfirmedSameAspectsに記録。',
            'saType':kind, 'classificationRationale':{'type': '保存原典の技説明・攻撃値・自己強化効果を照合。遅延攻撃はattack、非攻撃自己強化はactivation、攻撃＋強化/回復はmixed。',
                'conditions':'入力・技名と原典注記を参照。条件の全文はoriginalRecord.notesに保持。'},
            'inputSupport':{'baselineHead':HEAD,'inputSyntax':support,'saCategory':'both_extensions_needed',
                            'questionableNow':False,'motionFamily':special_motion,
                            'note':'入力構文の可否とSAカテゴリ未実装を分離。強度なしはHEADのisQuestionInputが拒否。溜め・720は保存可能だがUI未対応。'},
            'source':{'url':m['source']['url'],'retrievedAt':m['source']['fetchedAt'],
                      'gameVersion':'UNVERIFIED','kind':'community','verification':'unverified'},
            'verification':{'status':'stored_sources_reviewed_current_patch_unverified','cargoMatch':method},
            'sourceRef':{'path':rp,'jsonPointer':f'/moves/{idx}','sha256':digest(p)},
            'originalRecord':m,
            'cargo':{'path':cp,'retrievedAt':cargo['retrievedAt'],'url':cargo['url'],
                     'candidates':[{'jsonPointer':f'/data/cargoquery/{i}/title','record':r} for i,r in matches],
                     'comparison':comparisons},
        })

# Cargo has no category/name/ID. List all additional SA-like candidates separately;
# do not silently invent independent SA records from a motion-only match.
supplemental=[]
for cid in characters:
    cp=f'archive/staging/sf6-frame-data-quality/evidence/{cid}.cargo.json'
    rows=read(cp)['data']['cargoquery']
    used={x['jsonPointer'] for r in records if r['characterId']==cid for x in r['cargo']['candidates']}
    for i,x in enumerate(rows):
        r=x['title']; s=r.get('input','')
        relevant = any(core(s).replace('LP','P').replace('MP','P').replace('HP','P').startswith(v) for v in levels[cid].values())
        relevant = relevant or s in ['22PPP','360+KK','LP~LP~6LK~HP'] or s.startswith('j.214214') or s.startswith('j.236236')
        ptr=f'/data/cargoquery/{i}/title'
        if relevant and ptr not in used:
            supplemental.append({'id':f'{cid}:cargo:{i}','characterId':cid,'sourceRef':{'path':cp,'jsonPointer':ptr},
                                 'originalRecord':r,'classification':'unmatched_sa_like_cargo_candidate',
                                 'saLevel':None,'verification':'requires_correspondence_review'})

groups={}
for r in records:
    if r['saLevel'] is not None: groups.setdefault((r['characterId'],r['saLevel']),[]).append(r)
coverage=[]
for cid in characters:
    for level in [1,2,3]:
        rs=groups.get((cid,level),[])
        bs=[r for r in rs if r['baseStatus'] in ['base_identified','base_with_unselected_ender']]
        coverage.append({'characterId':cid,'saLevel':level,'existsInStoredEvidence':bool(rs),
                         'sourceRowSaved':bool(rs),'levelIdentified':bool(rs),'normalBaseIdentified':bool(bs),
                         'inputIdentified':any(r['inputNotation'] for r in rs),
                         'anyFramesRecorded':any(any(v['state']!='not_recorded' for v in r['frames'].values()) for r in rs),
                         'allFourRawFieldsPresentForBase':bool(bs) and all(all(v['state']!='not_recorded' for v in r['frames'].values()) for r in bs),
                         'uiQuestionableAtBaseline':False, 'onlyConditionalOrUncertain':bool(rs) and not bs,
                         'baseRecordIds':[r['id'] for r in bs], 'allRecordIds':[r['id'] for r in rs]})

stats={'characters':len(characters),'rawSuperArtRecords':len(records),'mappedRawRecords':sum(r['saLevel'] is not None for r in records),
       'levelGroups':len(groups),'rawRecordsByLevel':dict(collections.Counter(r['saLevel'] for r in records if r['saLevel'])),
       'strengthDifferentSAGroups':len(DIFFERENT),'strengthSameSAGroups':0,
       'strengthClassificationByRawRecord':dict(collections.Counter(r['strengthClassification'] for r in records)),
       'saTypeByRawRecord':dict(collections.Counter(r['saType'] for r in records)),
       'conditionalRawRecords':sum(r['baseStatus']=='conditional' for r in records),
       'uncertainBaseRawRecords':sum(r['baseStatus']=='uncertain' for r in records),
       'caRawRecords':sum(r['edition']=='CA' for r in records),
       'cargoMatchByRawRecord':dict(collections.Counter(r['verification']['cargoMatch'] for r in records)),
       'frameStatesRaw':dict(collections.Counter(v['state'] for r in records for v in r['frames'].values())),
       'cargoComparisonFields':dict(collections.Counter(c['comparison'] for r in records for c in r['cargo']['comparison'])),
       'motionFamilyByRawRecord':dict(collections.Counter(r['inputSupport']['motionFamily'] for r in records)),
       'supplementalCargoCandidates':len(supplemental),'coverageGroupsWithBase':sum(c['normalBaseIdentified'] for c in coverage)}
write('staging/sa-research/inventory.json',{'researchAt':NOW,'baselineHead':HEAD,'scope':'saved super_art rows; no adoption',
      'definitions':{'recordId':'character:raw:zero-based-index; sourceMoveIdは重複するため主キーにしない',
                     'frameStates':'numeric / special / explicit_not_applicable / not_recorded / multiple_or_conditional。原典間矛盾はcargo.comparisonに別記。',
                     'strengthClassification':'同一性能の全面確認がない場合strength_sameへ昇格しない。属性単位の同一性はconfirmedSameAspects。',
                     'support':'inputSyntaxはカテゴリを除いた入力表現。SAカテゴリを含めると全行モデル・UI双方拡張が必要。'},
      'statistics':stats,'records':records,'supplementalCargoCandidates':supplemental,'coverage':coverage})
write('staging/sa-research/source-summary.json',{'researchAt':NOW,'baselineHead':HEAD,'startStatusShort':INITIAL_STATUS,
      'upstream':{'revision':REV,'revisionDiscovery':'GitHub REST commits/main read during research; commit date 2026-11-02T12:16:32Z',
                  'url':f'https://github.com/RyoSogawa/sf6-sensei/blob/{REV}/packages/data/src/sa-levels.json',
                  'snapshot':'staging/sa-research/sa-levels.snapshot.json','authority':'補助対応表。rawの技名・消費ゲージ・注記を照合。公式原典ではない。'},
      'liveFetches':fetches,'webToolFailures':[{'url':'https://github.com/RyoSogawa/sf6-sensei/blob/main/packages/data/src/sa-levels.json','result':'Cache miss; fixed revision raw retrieval succeeded'},
        {'url':'https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data','result':'Anubis Access Denied'},
        {'url':'https://www.streetfighter.com/6/ja-jp/character/ryu/frame','result':'403 Forbidden'}],
      'sources':sources,'limitations':['全対象ゲームバージョン未検証。取得日をパッチ版とみなさない。',
        'Cargoは同Wiki由来の別時点・別表現。独立した公式照合ではない。',
        'ライブ原典取得不可のため、全強度で差がないことや現行パッチは確認できていない。',
        'raw.totalFramesの上流算出過程は未検証。ここでは保存済み値を転記するだけで計算しない。'],
      'statistics':stats})
print(json.dumps(stats,ensure_ascii=False,indent=2))
print('SUPPLEMENTAL', json.dumps(supplemental,ensure_ascii=False))
