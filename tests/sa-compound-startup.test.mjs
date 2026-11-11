import { applyUserConfirmedToBaseline } from "./helpers/apply-user-confirmed.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
test("exactly six SA startup values change from fixed snapshot", () => {
  const decisions = read("data/adoption-decisions.json").compoundStartup.saDecisions;
  assert.equal(decisions.length, 6);
  assert.equal(new Set(decisions.map((d) => d.moveId)).size, 6);
  let count = 0, records = 0;
  for (const file of readdirSync("data/characters").filter((f) => f.endsWith(".json"))) {
    const path = `data/characters/${file}`;
    const before = JSON.parse(execFileSync("git", ["show", `1e36836adab07b17f5462cf0f5dd35b8b4cd86a6:${path}`]));
    const after = read(path);
    records += before.moves.length;
    for (const move of before.moves) {
      const indicator = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.find((x) => x.characterId === before.id && x.moveId === (move.strengthExpansion?.sourceMoveId || move.id));
      if (indicator) { assert.deepEqual(move.frames.startup, indicator.before); move.frames.startup = indicator.value; }
      const d = decisions.find((x) => x.characterId === before.id && x.moveId === move.id);
      if (!d) continue;
      assert.deepEqual(move.frames.startup, d.before);
      assert.equal(read(d.sourcePath).data.cargoquery[d.sourceIndex].title.startup, d.sourceNotation);
      assert.equal(read(d.officialPath).rows.find((r) => r.row === d.officialRows[0]).startup, "7");
      assert.equal(move.saEvidence.researchRecordId, d.sourceResearchId);
      move.frames.startup = d.value;
      count++;
    }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").kdHkdCorrections.airborneDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.hit, d.before); m.frames.hit = d.value; } }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").whiffTotalCorrections.additionalDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.total, d.before); m.frames.total = d.value; } }
    applyUserConfirmedToBaseline(before);
    assert.deepEqual(after, before);
  }
  assert.equal(records, 1298);
  assert.equal(count, 6);
});
test("historical projection rejects unauthorized SA values", () => {
  const c = read("data/characters/lily.json");
  c.moves.find((m) => m.id === "lily__super_art_3_L").frames.startup.numeric = 8;
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized compound startup/);
});
