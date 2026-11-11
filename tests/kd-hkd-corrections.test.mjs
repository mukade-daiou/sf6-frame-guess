import { applyUserConfirmedToBaseline } from "./helpers/apply-user-confirmed.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const ref = "61471d3f14ef5ca611f6503d1c15c670ad464bd0";
test("66 KD/HKD corrections preserve all other records", () => {
  const decisions = read("data/adoption-decisions.json").kdHkdCorrections.decisions;
  assert.equal(decisions.length, 66);
  assert.equal(new Set(decisions.map((d) => `${d.characterId}/${d.moveId}/${d.field}`)).size, 66);
  let changed = 0, records = 0;
  for (const file of readdirSync("data/characters").filter((f) => f.endsWith(".json"))) {
    const path = `data/characters/${file}`;
    const before = JSON.parse(execFileSync("git", ["show", `${ref}:${path}`]));
    const after = read(path);
    records += before.moves.length;
    for (const m of before.moves) {
      const indicator = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.find((x) => x.characterId === before.id && x.moveId === (m.strengthExpansion?.sourceMoveId || m.id));
      if (indicator) { assert.deepEqual(m.frames.startup, indicator.before); m.frames.startup = indicator.value; }
      const sa = read("data/adoption-decisions.json").compoundStartup.saDecisions.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (sa) { assert.deepEqual(m.frames.startup, sa.before); m.frames.startup = sa.value; }
      const extra = read("data/adoption-decisions.json").kdHkdCorrections.additionalDecisions.find((x) => x.characterId === before.id && x.moveId === (m.strengthExpansion?.sourceMoveId || m.id));
      if (extra) { assert.deepEqual(m.frames.hit, extra.before); m.frames.hit = extra.value; }
      const total = read("data/adoption-decisions.json").whiffTotalCorrections.decisions.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (total) { assert.deepEqual(m.frames.total, total.before); m.frames.total = total.value; }
      const d = decisions.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (!d) continue;
      assert.equal(d.field, "hit");
      assert.deepEqual(m.frames.hit, d.before);
      assert.deepEqual(d.value, { status: "confirmed", display: "D" });
      assert.ok(!m.strengthExpansion && !before.moves.some((x) => x.strengthExpansion?.sourceMoveId === m.id));
      const row = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
      assert.equal(row.hitAdv, d.sourceNotation);
      assert.equal(row.notes, d.sourceNotes);
      m.frames.hit = d.value;
      changed++;
    }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").kdHkdCorrections.airborneDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.hit, d.before); m.frames.hit = d.value; } }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").whiffTotalCorrections.additionalDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.total, d.before); m.frames.total = d.value; } }
    applyUserConfirmedToBaseline(before);
    assert.deepEqual(after, before);
  }
  assert.equal(changed, 66);
  assert.equal(records, 1298);
});
test("projection rejects an unauthorized hit change", () => {
  const c = read("data/characters/akuma.json");
  c.moves.find((m) => m.id === "akuma__normal_2_K_H").frames.hit.display = "+99";
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized KD\/HKD/);
});
