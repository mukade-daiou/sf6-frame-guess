import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
test("all original 300 held fields have separate triage and evidenced resolutions",()=>{
 const r=read("staging/held-range-review.json"), l=read("staging/distance-range-candidates.json"), p=read("data/adoption-decisions.json");
 assert.equal(r.items.length,300);
 assert.equal(new Set(r.items.map(x=>x.key)).size,300);
 assert.deepEqual(p.distanceRanges.decisions.slice(0,75),r.baseline.decisions);
 for(const i of r.items){
  assert.ok(["A","B","C","D"].includes(i.group));
  assert.equal(i.before.classification,"held");
  const row=read(i.before.sourcePath).data.cargoquery[i.before.sourceIndex].title;
  assert.deepEqual(row,i.before.sourceRecord);
  assert.ok(row.notes.includes(i.evidenceQuote)||i.before.notation===i.evidenceQuote);
  assert.ok(i.nextEvidence && i.reason && i.checkedSources.length);
  assert.deepEqual(i.currentValues.map(v=>v.moveId),i.before.moveIds);
  const candidate=l.candidates.find(c=>`${c.characterId}/${c.sourceIndex}/${c.field}`===i.key);
  const stage2=r.stage2?.items.find(x=>x.key===i.key);
  assert.equal(candidate.classification,stage2?.resolution ?? i.resolution);
  if((stage2?.resolution ?? i.resolution)!=="accepted")for(const v of i.currentValues){
   const c=read(`data/characters/${i.before.characterId}.json`);
   const d=p.distanceRanges.decisions.slice(80).find(d=>d.moveId===v.moveId&&d.field===i.before.field);
   if (d) assert.deepEqual(d.before,v.value);
   assert.deepEqual(c.moves.find(m=>m.id===v.moveId).frames[i.before.field],d?.value ?? v.value);
  }
 }
 const production=l.candidates.filter(c=>c.moveIds.length);
 assert.equal(production.length,737);
 const expected=[80,180,477];
 for (const x of r.stage2?.items || []) if (x.resolution !== "held") { expected[1]--; expected[x.resolution === "accepted" ? 0 : 2]++; }
 assert.deepEqual(["accepted","held","excluded"].map(s=>production.filter(c=>c.classification===s).length),expected);
});
test("review and ledger can be regenerated without losing resolved classifications",()=>{
 const paths=["staging/held-range-review.json","staging/distance-range-candidates.json","data/adoption-decisions.json"];
 const before=paths.map(p=>read(p));
 execFileSync("node",["scripts/prepare-held-range-review.mjs"]);
 execFileSync("node",["scripts/review-distance-ranges.mjs"]);
 assert.deepEqual(paths.map(p=>read(p)),before);
});
