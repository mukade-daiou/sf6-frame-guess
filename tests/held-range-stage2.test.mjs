import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { rollbackClassification } from "../scripts/contact-timing-policy.mjs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
test("C134 stage2 preserves stage1 and uses the exact normal SA source row",()=>{
 const r=read("staging/held-range-review.json"), p=read("data/adoption-decisions.json"), l=read("staging/distance-range-candidates.json"), s=r.stage2;
 assert.equal(s.items.length,134);
 assert.equal(new Set(s.items.map(x=>x.key)).size,134);
 assert.deepEqual(p.distanceRanges.decisions.slice(0,80),s.baseline.decisions);
 assert.equal(s.items.filter(x=>x.resolution==="accepted").length,1);
 assert.equal(s.items.filter(x=>x.resolution==="excluded").length,24);
 assert.equal(s.items.filter(x=>x.resolution==="held").length,109);
 assert.equal(s.items.filter(x=>x.group==="D").length,1);
 for(const x of s.items){
  assert.equal(x.before.group,"C");assert.equal(x.before.resolution,"held");
  assert.ok(x.inspected&&x.priority>=1&&x.priority<=5&&x.nextEvidence&&x.priorityBasis);
  const c=l.candidates.find(c=>`${c.characterId}/${c.sourceIndex}/${c.field}`===x.key);
  assert.equal(c.classification,rollbackClassification(p,x.key,x.resolution));
 }
 for(const x of r.items.filter(x=>x.group==="D"))assert.ok(!s.items.some(y=>y.key===x.key));
 const luke=read("data/characters/luke.json");
 const supers=luke.moves.filter(m=>m.id.startsWith("luke__super_art_3_"));
 assert.equal(supers.length,3);
 assert.equal(new Set(supers.map(m=>m.input.strength)).size,3);
 for(const m of supers){
  const d=p.distanceRanges.decisions.find(d=>d.moveId===m.id&&d.field==="startup");
  assert.equal(d.sourceIndex,9);assert.equal(m.frames.startup.display,"10~27");
  assert.equal(m.saEvidence.cargoRef,`${d.sourcePath}#/data/cargoquery/9/title`);
  assert.ok(d.additionalEvidence.requiredText.every(t=>readFileSync(d.additionalEvidence.path,"utf8").includes(t)));
 }
 const expected=[81,155,501];for(const x of p.distanceRanges.contactTimingRollback?.candidates||[]){expected[x.before==="accepted"?0:1]--;expected[2]++;}
 assert.deepEqual(["accepted","held","excluded"].map(s=>l.candidates.filter(c=>c.moveIds.length&&c.classification===s).length),expected);
});
test("stage2 preparation remains stable alongside historical regeneration",()=>{
 const paths=["staging/held-range-review.json","staging/distance-range-candidates.json","data/adoption-decisions.json"];
 const before=paths.map(read);
 execFileSync("node",["scripts/prepare-held-range-stage2.mjs"]);
 execFileSync("node",["scripts/prepare-held-range-review.mjs"]);
 execFileSync("node",["scripts/review-distance-ranges.mjs"]);
 assert.deepEqual(paths.map(read),before);
});
