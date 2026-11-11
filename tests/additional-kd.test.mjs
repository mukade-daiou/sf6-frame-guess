import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";
const read = (p) => JSON.parse(readFileSync(p,"utf8"));
test("15 source corrections change exactly 21 hits across all 1298 records",()=>{
 const ds=read("data/adoption-decisions.json").kdHkdCorrections.additionalDecisions;
 assert.equal(ds.length,15);assert.equal(new Set(ds.map(d=>d.characterId+"/"+d.moveId)).size,15);
 let changed=0,n=0;
 for(const f of readdirSync("data/characters").filter(f=>f.endsWith(".json"))){
  const path=`data/characters/${f}`,before=JSON.parse(execFileSync("git",["show",`9b34299a3f4146e189fe53137021bb4ef678b59d:${path}`])),after=read(path);n+=before.moves.length;
  for(const m of before.moves){const d=ds.find(d=>d.characterId===before.id&&d.moveId===(m.strengthExpansion?.sourceMoveId||m.id));if(d){assert.deepEqual(m.frames.hit,d.before);assert.deepEqual(d.value,{status:"confirmed",display:"D"});m.frames.hit=d.value;changed++;} const sa=read("data/adoption-decisions.json").compoundStartup.saDecisions.find(d=>d.characterId===before.id&&d.moveId===m.id);if(sa){assert.deepEqual(m.frames.startup,sa.before);m.frames.startup=sa.value;}}
  for(const m of before.moves){const d=read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.find(x=>x.characterId===before.id&&x.moveId===(m.strengthExpansion?.sourceMoveId||m.id));if(d){assert.deepEqual(m.frames.startup,d.before);m.frames.startup=d.value;}}
  for(const m of before.moves){const d=read("data/adoption-decisions.json").kdHkdCorrections.airborneDecisions.find(x=>x.characterId===before.id&&x.moveId===m.id);if(d){assert.deepEqual(m.frames.hit,d.before);m.frames.hit=d.value;}}
  assert.deepEqual(after,before);
 }
 assert.equal(changed,21);assert.equal(n,1298);
});
test("history rejects an unauthorized added hit",()=>{const c=read("data/characters/arjun.json");c.moves.find(m=>m.id==="arjun__special_214_K_none__strength_M").frames.hit.display="+99";assert.throws(()=>restoreCompoundStartup(c),/Unauthorized KD\/HKD/);});
