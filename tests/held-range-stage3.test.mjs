import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { rollbackClassification } from "../scripts/contact-timing-policy.mjs";
import { restoreCompoundStartup } from "./research-projection.mjs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
test("stage3 checks all C108 and D47 without changing production or existing decisions",()=>{
 const r=read("staging/held-range-review.json"), p=read("data/adoption-decisions.json"), l=read("staging/distance-range-candidates.json"), s=r.stage3;
 assert.equal(s.items.length,155);
 assert.equal(new Set(s.items.map(x=>x.key)).size,155);
 assert.deepEqual(["C","D"].map(g=>s.items.filter(x=>x.group===g).length),[108,47]);
 assert.deepEqual(p.distanceRanges.decisions,s.baseline.decisions);
 assert.equal(p.datasetId,read("data/metadata.json").datasetId);
 let records=0,sa=0;
 for(const [id,before] of Object.entries(s.baseline.production)){
  for(const m of before.moves) for(const d of p.distanceRanges.contactTimingRollback?.revoked||[])if(d.characterId===id&&d.moveId===(m.id.includes("__strength_")?m.id.split("__strength_")[0]:m.id)){
    assert.deepEqual(m.frames[d.field],d.before);m.frames[d.field]=d.value;
  }
  const c=restoreCompoundStartup(read(`data/characters/${id}.json`));
  assert.deepEqual({adoption:c.adoption,coverage:c.coverage,moves:c.moves.map(m=>({id:m.id,input:m.input,adoption:m.adoption,frames:m.frames}))},before);
  records+=c.moves.length;sa+=c.moves.filter(m=>m.category==="super_art").length;
 }
 assert.equal(Object.keys(s.baseline.production).length,32);assert.equal(records,1298);assert.equal(sa,288);
 for(const x of s.items){
  assert.ok(x.availabilityChecked&&x.reason&&x.nextEvidence);
  assert.equal(x.resolution,"held");assert.equal(x.measurement.performed,false);
  assert.ok(x.measurement.contactMethod&&x.measurement.opponent&&x.measurement.requiredResult);
  assert.ok(x.sourceIds.every(id=>s.sources.some(y=>y.id===id)));
  const c=l.candidates.find(c=>`${c.characterId}/${c.sourceIndex}/${c.field}`===x.key);
  assert.equal(c.classification,rollbackClassification(p,x.key,"held"));assert.deepEqual(c.reevaluation.stage3,x);
 }
 assert.deepEqual(["accepted","held","excluded"].map(status=>l.candidates.filter(c=>c.moveIds.length&&c.classification===status).length),[4,108,625]);
});
test("stage3 evidence metadata survives historical regeneration",()=>{
 const paths=["staging/held-range-review.json","staging/distance-range-candidates.json","data/adoption-decisions.json"], before=paths.map(read);
 execFileSync("node",["scripts/prepare-held-range-stage3.mjs"]);
 execFileSync("node",["scripts/prepare-held-range-review.mjs"]);
 execFileSync("node",["scripts/review-distance-ranges.mjs"]);
 assert.deepEqual(paths.map(read),before);
});
