import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { applyRiskCorrectionsToBaseline } from "./helpers/apply-user-confirmed.mjs";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const base = "3a460ff687453b719a474afb9864746d30fa5117";
test("exactly 18 individual totals and one exclusion differ from the fixed baseline", () => {
  const policy = read("data/adoption-decisions.json");
  assert.equal(policy.whiffTotalCorrections.unverifiableDecisions.length, 18);
  assert.equal(policy.specialStateExclusions.length, 1);
  let records = 0, accepted = 0;
  for (const name of readdirSync("data/characters").filter((f) => f.endsWith(".json"))) {
    const path = `data/characters/${name}`;
    const before = JSON.parse(execFileSync("git", ["show", `${base}:${path}`]));
    const actual = read(path);
    records += actual.moves.length;
    accepted += actual.moves.filter((m) => m.adoption.status === "accepted").length;
    applyRiskCorrectionsToBaseline(before);
    assert.deepEqual(actual, before, name);
  }
  assert.equal(records, 1298);
  assert.equal(accepted, 1282);
});
test("each approved whiff value preserves its original exact Cargo evidence", () => {
  for (const d of read("data/adoption-decisions.json").whiffTotalCorrections.unverifiableDecisions) {
    const row = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
    assert.equal(row.input, d.sourceInput);
    assert.equal(row.total, `${d.before.display}(${d.value.display})`);
    assert.equal(row.notes, d.sourceNotes);
    assert.match(row.notes, /whiff/i);
    assert.equal(read(`data/characters/${d.characterId}.json`).moves.find((m) => m.id === d.moveId).frames.total.display, d.value.display);
  }
});
test("history rejects unauthorized totals or changes to the excluded state", () => {
  const c = read("data/characters/m_bison.json");
  c.moves.find((m) => m.id === "m_bison__special_623_P_OD").adoption.status = "accepted";
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized special-state exclusion/);
  const b = read("data/characters/blanka.json");
  b.moves.find((m) => m.id === "blanka__normal_2_K_M").frames.total.numeric = 99;
  assert.throws(() => restoreCompoundStartup(b), /Unauthorized whiff total/);
});
test("saved official comparison preserves every status and only removes the excluded move", () => {
  const before = read("staging/official-reevaluation/results-after-user-verification.json");
  const after = read("staging/official-reevaluation/results-after-risk-fixes.json");
  const decisions = read("data/adoption-decisions.json").whiffTotalCorrections.unverifiableDecisions;
  const indexed = new Map(after.map((r) => [r.moveId, r]));
  let changed = 0;
  for (const previous of before) {
    if (previous.moveId === "m_bison__special_623_P_OD") {
      assert.equal(indexed.has(previous.moveId), false);
      continue;
    }
    const current = indexed.get(previous.moveId);
    assert(current);
    for (const [field, old] of Object.entries(previous.fields)) {
      const now = current.fields[field];
      assert.equal(now.status, old.status);
      const d = decisions.find((x) => x.moveId === previous.moveId && x.field === field);
      assert.equal(now.local, d ? d.value.display : old.local);
      if (d) changed++;
    }
  }
  assert.equal(after.length, 1282);
  assert.equal(changed, 18);
});
