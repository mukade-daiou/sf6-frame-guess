import { applyUserConfirmedToBaseline } from "./helpers/apply-user-confirmed.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const baseline = "e800bd7a124044ad5f6fd74ed013354bd064969f";
test("approved totals match the reviewed ledger and 39 held totals remain unchanged", () => {
  const policy = read("data/adoption-decisions.json").whiffTotalCorrections.decisions;
  const rows = read("staging/official-reevaluation/total-audit.json").records.filter((r) => r.field === "total");
  assert.equal(rows.length, 92);
  assert.equal(new Set(rows.map((r) => `${r.characterId}/${r.moveId}`)).size, 92);
  assert.equal(rows.filter((r) => r.classification === "A").length, 53);
  assert.equal(rows.filter((r) => r.classification === "B").length, 39);
  for (const row of rows) {
    const move = read(`data/characters/${row.characterId}.json`).moves.find((m) => m.id === row.moveId);
    const decision = policy.find((d) => d.characterId === row.characterId && d.moveId === row.moveId);
    assert.ok(move, row.moveId);
    if (row.classification === "A") {
      assert.ok(decision, row.moveId);
      assert.equal(decision.before.display, row.current);
      assert.equal(decision.value.display, row.proposal);
      assert.equal(move.frames.total.display, row.proposal);
    } else {
      assert.equal(decision, undefined);
      const correction = read("data/adoption-decisions.json").whiffTotalCorrections.additionalDecisions.find((d) => d.characterId === row.characterId && d.moveId === row.moveId);
      if (correction) assert.equal(correction.before.display, row.current);
      const user = read("data/adoption-decisions.json").userConfirmedFrames.decisions.find((d) => d.characterId === row.characterId && d.moveId === row.moveId && d.field === "total");
      assert.equal(move.frames.total.display, user ? user.value.display : correction ? correction.value.display : row.current);
    }
  }
});
test("authorized 53 totals are the only production differences", () => {
  const ds = read("data/adoption-decisions.json").whiffTotalCorrections.decisions;
  assert.equal(ds.length, 53);
  assert.equal(new Set(ds.map((x) => `${x.characterId}/${x.moveId}/${x.field}`)).size, 53);
  let records = 0, changed = 0;
  for (const file of readdirSync("data/characters").filter((f) => f.endsWith(".json"))) {
    const path = `data/characters/${file}`;
    const before = JSON.parse(execFileSync("git", ["show", `${baseline}:${path}`]));
    const after = read(path);
    records += before.moves.length;
    for (const m of before.moves) {
      const indicator = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.find((x) => x.characterId === before.id && x.moveId === (m.strengthExpansion?.sourceMoveId || m.id));
      if (indicator) { assert.deepEqual(m.frames.startup, indicator.before); m.frames.startup = indicator.value; }
      const sa = read("data/adoption-decisions.json").compoundStartup.saDecisions.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (sa) { assert.deepEqual(m.frames.startup, sa.before); m.frames.startup = sa.value; }
      const extra = read("data/adoption-decisions.json").kdHkdCorrections.additionalDecisions.find((x) => x.characterId === before.id && x.moveId === (m.strengthExpansion?.sourceMoveId || m.id));
      if (extra) { assert.deepEqual(m.frames.hit, extra.before); m.frames.hit = extra.value; }
      const d = ds.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (!d) continue;
      assert.equal(d.field, "total");
      assert.deepEqual(m.frames.total, d.before);
      const cargo = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
      assert.equal(cargo.total, d.sourceNotation);
      assert.equal(cargo.notes, d.sourceNotes);
      m.frames.total = d.value;
      changed++;
    }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").kdHkdCorrections.airborneDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.hit, d.before); m.frames.hit = d.value; } }
    for (const m of before.moves) { const d = read("data/adoption-decisions.json").whiffTotalCorrections.additionalDecisions.find(x => x.characterId === before.id && x.moveId === m.id); if (d) { assert.deepEqual(m.frames.total, d.before); m.frames.total = d.value; } }
    applyUserConfirmedToBaseline(before);
    assert.deepEqual(after, before);
  }
  assert.equal(records, 1298);
  assert.equal(changed, 53);
  const bison = read("data/characters/m_bison.json").moves;
  for (const [id, value] of [["m_bison__special_[2]8_K_none", "53"], ["m_bison__special_[2]8_K_none__strength_L", "53"], ["m_bison__special_[2]8_K_none__strength_M", "58"], ["m_bison__special_[2]8_K_none__strength_H", "63"], ["m_bison__special_[2]8_K_OD", "54"]]) assert.equal(bison.find((m) => m.id === id).frames.total.display, value);
  const manon = read("data/characters/manon.json").moves;
  for (const id of ["manon__special_236_K_H", "manon__special_236_K_OD"]) assert.equal(manon.find((m) => m.id === id).frames.total.display, "46");
});
test("history rejects changed approved total", () => {
  const c = read("data/characters/aki.json");
  c.moves.find((m) => m.id === "aki__normal_5_K_M").frames.total.numeric = 99;
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized whiff total/);
});
