import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
test("fixed baseline differs only in seventeen approved fields", () => {
  const policy = read("data/adoption-decisions.json");
  const startup = [...policy.compoundStartup.saDecisions, ...policy.compoundStartup.indicatorDecisions];
  const hit = policy.kdHkdCorrections.airborneDecisions;
  assert.equal(hit.length, 1);
  let count = 0, records = 0;
  for (const f of readdirSync("data/characters").filter((x) => x.endsWith(".json"))) {
    const p = `data/characters/${f}`;
    const before = JSON.parse(execFileSync("git", ["show", `1e36836adab07b17f5462cf0f5dd35b8b4cd86a6:${p}`]));
    const after = read(p);
    records += before.moves.length;
    for (const m of before.moves) {
      const d = startup.find((x) => x.characterId === before.id && x.moveId === (m.strengthExpansion?.sourceMoveId || m.id));
      if (d) { assert.deepEqual(m.frames.startup, d.before); m.frames.startup = d.value; count++; }
      const kd = hit.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (kd) { assert.deepEqual(m.frames.hit, kd.before); m.frames.hit = kd.value; count++; }
    }
    assert.deepEqual(after, before);
  }
  assert.equal(records, 1298);
  assert.equal(count, 17);
});
test("historical projection rejects unauthorized armor and airborne hit", () => {
  const m = read("data/characters/marisa.json");
  m.moves.find((x) => x.id === "marisa__special_214_K_none__strength_M").frames.startup.numeric = 4;
  assert.throws(() => restoreCompoundStartup(m), /Unauthorized compound startup/);
  const e = read("data/characters/ed.json");
  e.moves.find((x) => x.id === "ed__special_236_K_H").frames.hit.display = "+51";
  assert.throws(() => restoreCompoundStartup(e), /Unauthorized KD\/HKD/);
});

test("normal airborne KD and the two non-held armor rows retain their evidence", () => {
  const p = read("data/adoption-decisions.json");
  const ed = p.kdHkdCorrections.airborneDecisions[0];
  const cargo = read(ed.sourcePath).data.cargoquery[ed.sourceIndex].title;
  const official = read(ed.officialPath).rows.find((r) => r.row === 51);
  assert.equal(ed.moveId, "ed__special_236_K_H");
  assert.equal(cargo.input, "236HK");
  assert.equal(cargo.hitAdv, "KD +51(+63)");
  assert.match(cargo.notes, /only hit airborne opponents/);
  assert.match(official.notes, /地上の相手に当たらない/);
  for (const [id, n, row] of [["marisa__special_214_K_none", 3, 69], ["marisa__special_214_K_OD", 1, 71]]) {
    const d = p.compoundStartup.indicatorDecisions.find((x) => x.moveId === id);
    const source = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
    const officialRow = read(d.officialPath).rows.find((r) => r.row === row);
    assert.match(source.notes, /automatically triggers counterattack/);
    assert.ok(officialRow.notes.includes(`${n}-28`));
    assert.equal(d.value.numeric, n);
  }
});
