"""Validate research artifacts without executing game generators or changing Git state."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'staging/sa-research'
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).rstrip('\n')
def pointer(obj,p):
    for part in p.strip('/').split('/'):
        obj=obj[int(part)] if isinstance(obj,list) else obj[part]
    return obj

j=load(OUT/'inventory.json');rs=j['records'];st=j['statistics'];baseline=load(OUT/'workspace-baseline.json')
checks={}
def check(key,value):
    checks[key]=bool(value)
    assert value,key

json_paths=list(OUT.glob('*.json'))
for p in json_paths:load(p)
for p in OUT.glob('*.py'):compile(p.read_text(),str(p),'exec')
check('json_parse_and_python_syntax',True)
expected={}
for p in sorted((ROOT/'archive/staging/sf6-frame-data/raw').glob('*.json')):
    raw=load(p)
    for i,m in enumerate(raw['moves']):
        if m['category']=='super_art':expected[f'{p.stem}:raw:{i}']=m
check('all_32_characters',len({r['characterId'] for r in rs})==32)
check('all_saved_super_art_rows_exactly_once',len(rs)==len(expected)==199 and len({r['id'] for r in rs})==199 and set(expected)=={r['id'] for r in rs})
for r in rs:
    check('original_record_unmodified_'+r['id'],r['originalRecord']==expected[r['id']])
    ref=r['sourceRef'];p=ROOT/ref['path']
    assert sha(p)==ref['sha256']
    assert pointer(load(p),ref['jsonPointer'])==r['originalRecord']
    for f,k in [('startup','startup'),('total','totalFrames'),('hit','onHit'),('block','onBlock')]:
        assert r['frames'][f]['original']==r['originalRecord'].get(k)
    for c in r['cargo']['candidates']:
        assert pointer(load(ROOT/r['cargo']['path']),c['jsonPointer'])==c['record']
    assert r['strengthClassification'] in ['strength_different','strength_same','strength_unspecified','strength_uncertain']
    assert r['saType'] in ['attack','activation','mixed','uncertain']
    if r['saLevel'] is not None:assert r['saLevelEvidence']['rationale']
    if r['edition']=='CA':assert r['baseStatus']=='conditional' and 'critical_art' in r['conditions']
    if r['baseStatus'].startswith('base'):
        assert r['saLevelEvidence']['tableAgreement'] is True
        assert r['saLevelEvidence']['sourceGaugeCandidates']==[r['saLevel']]
        assert not set(r['conditions']) & {'critical_art','button_hold','follow_up','special_state_only','airborne_only','stock_or_enhanced'}
check('all_source_pointers_and_hashes',True)
check('no_frame_calculation_or_missing_value_fill',True)
check('all_records_strength_type_condition_reviewed',True)
check('base_level_mapping_table_and_explicit_cost_agree',True)
check('ca_separated_from_base',sum(r['edition']=='CA' for r in rs)==33)
check('all_96_sa_groups_with_basic_starter',len(j['coverage'])==96 and all(c['normalBaseIdentified'] for c in j['coverage']))
check('related_special_not_assigned_sa_level',len([r for r in rs if r['saLevel'] is None])==1 and next(r for r in rs if r['saLevel'] is None)['name']['en']=='Rolling Cannon')
check('cargo_all_rows_uniquely_matched',all(len(r['cargo']['candidates'])==1 for r in rs))
check('cargo_extra_candidates_resolved',len(j['supplementalCargoCandidates'])==2 and all(s['classification']=='related_special_outside_super_art' for s in j['supplementalCargoCandidates']))
for s in j['supplementalCargoCandidates']:
    ref=s['rawCounterpart'];assert pointer(load(ROOT/ref['path']),ref['jsonPointer'])==ref['originalRecord']
check('raw_and_cargo_each_796_frame_fields',sum(st['frameStatesRaw'].values())==796 and sum(st['frameStatesCargo'].values())==796)
check('strength_difference_seven_groups',len({(r['characterId'],r['saLevel']) for r in rs if r['strengthClassification']=='strength_different'})==7)
check('input_motion_families_cover_all_rows',sum(st['motionFamilyByRawRecord'].values())==199 and st['motionFamilyByRawRecord']['720']==2 and st['motionFamilyByRawRecord']['360']==1)
check('report_json_statistics_equal',load(OUT/'source-summary.json')['statistics']==st)
report=(ROOT/'docs/SA_RESEARCH_REPORT.md').read_text()
appendix=report.split('## 付録A. 原典全199行\n')[1].split('## 付録B.')[0]
tableids=re.findall(r'^\| ([a-z_]+:raw:\d+) \|',appendix,re.M)
check('report_all_199_rows_once',len(tableids)==199 and set(tableids)==set(expected))
check('report_has_17_required_sections',len(re.findall(r'^## \d+\.',report,re.M))==17)
check('report_counts_101_base_98_conditional',st['baseCandidateRawRecords']==101 and st['conditionalRawRecords']==98 and '101行。条件付き行は98行' in report)
for r in rs:
    row=next(line for line in appendix.splitlines() if line.startswith('| '+r['id']+' |'))
    assert r['inputNotation'] in row and r['saType'] in row
decisions=load(OUT/'decisions-needed.json')
check('five_grouped_decisions_with_valid_record_ids',decisions['decisionCount']==len(decisions['decisions'])==5 and all(set(d['recordIds'])<=set(expected) for d in decisions['decisions']))
prod_paths=list((ROOT/'data/characters').glob('*.json'))
check('production_32_characters_908_records',len(prod_paths)==32 and sum(len(load(p)['moves']) for p in prod_paths)==908)
production_changed=[p for p,h in baseline['trackedSha256'].items() if p.startswith('data/') and sha(ROOT/p)!=h]
check('production_bytes_preserved',not production_changed)
sources_changed=[p for p,h in baseline['trackedSha256'].items() if p.startswith('archive/staging/') and sha(ROOT/p)!=h]
check('archived_source_bytes_preserved',not sources_changed)
changed=[p for p,h in baseline['trackedSha256'].items() if not (ROOT/p).is_file() or sha(ROOT/p)!=h]
end_head=git('rev-parse','HEAD')
check('research_baseline_remains_pinned',j['baselineHead']==baseline['startHead'])
head_change={'startHead':baseline['startHead'],'endHead':end_head,'changed':end_head!=baseline['startHead'],
             'note':'並行UIセッションのcommitによりHEADが進行。本調査はGit変更操作を行わず、開始HEADを評価基準として維持。'}
allowed=lambda p:p=='docs/SA_RESEARCH_REPORT.md' or p.startswith('staging/sa-research/')
new_files=git('ls-files','--others','--exclude-standard').splitlines()
start_untracked=[line[3:] for line in baseline['startStatusShort'].splitlines() if line.startswith('?? ')]
unexpected_new=[p for p in new_files if not allowed(p) and p not in start_untracked]
verification={'validatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':True,
              'checks':checks,'statistics':st,'head':end_head,'headChange':head_change,'gitStatus':git('status','--short','--branch'),
              'trackedChangedSinceHashCapture':changed,
              'trackedChangeInterpretation':'本調査の書き込みは指定された新規ファイルのみ。並行UIセッションの変更は保持し、巻き戻さない。',
              'newFilesOutsideResearchNotPresentAtStart':unexpected_new,
              'productionChanged':production_changed,'archivedSourcesChanged':sources_changed,
              'japaneseWritingReview':{'automatedLint':'unavailable: ModuleNotFoundError sudachipy',
                                       'fallback':'Skill manual checklist: terminology, count units, factual uncertainty and review proposals inspected'},
              'testsAndBuild':'Not run: research-only; shared generated outputs intentionally untouched.',
              'gitMutations':'none; no worktree/branch/commit/push/merge/reset/checkout/stash'}
(OUT/'validation.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':True,'checks':len(checks),'statistics':st,'concurrentTrackedChanges':changed,'unexpectedNewFiles':unexpected_new},ensure_ascii=False,indent=2))
