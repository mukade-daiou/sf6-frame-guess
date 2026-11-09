import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { expectedDistanceValue, isContactRevoked } from "../scripts/contact-timing-policy.mjs";
test("distance decisions change only exact authorized fields and generated strengths", () => {
  const decisions = JSON.parse(readFileSync("data/adoption-decisions.json")).distanceRanges.decisions;
  const policy=JSON.parse(readFileSync("data/adoption-decisions.json"));
  let fields = 0;
  for (const file of readdirSync("data/characters").filter(f => f.endsWith(".json"))) {
    const path = `data/characters/${file}`;
    const ref = JSON.parse(readFileSync("data/adoption-decisions.json")).distanceRanges.protectionRef;
    const before = JSON.parse(execFileSync("git", ["show", `${ref}:${path}`]));
    for (const move of before.moves) for (const d of decisions.filter(d => d.characterId === before.id && d.moveId === (move.strengthExpansion?.sourceMoveId || move.id))) {
      assert.deepEqual(move.frames[d.field], d.before);
      move.frames[d.field] = expectedDistanceValue(policy,d);
      fields++;
    }
    assert.deepEqual(JSON.parse(readFileSync(path)), before);
  }
  assert.equal(fields, 98);
  const ledger = JSON.parse(readFileSync("staging/distance-range-candidates.json"));
  assert.equal(ledger.characters.length, 32);
  assert.ok(ledger.characters.every(c => c.rows.length === c.sourceRows && c.rows.every(r => r.reviewed)));
  assert.ok(ledger.candidates.every(c => c.reviewed && c.reason));
  for (const cr of ledger.characters) {
    const c = JSON.parse(readFileSync(`data/characters/${cr.characterId}.json`));
    for (const m of c.moves.filter(m => m.adoption?.status === "accepted" && m.variant.kind === "base" && !m.strengthExpansion)) assert.ok(cr.rows.some(r => r.moveIds.includes(m.id)), `Unmapped: ${m.id}`);
  }
  for (const d of decisions) {
    const row = JSON.parse(readFileSync(d.sourcePath)).data.cargoquery[d.sourceIndex].title;
    assert.deepEqual(row, d.sourceRecord);
    assert.ok(ledger.candidates.some(c => c.characterId === d.characterId && c.sourceIndex === d.sourceIndex && c.field === d.field && c.classification === (isContactRevoked(policy,d)?"excluded":"accepted") && c.moveIds.includes(d.moveId)));
    if (d.value.range) {
      // All adopted endpoints must literally occur in the source field or note.
      const field = { startup:"startup", total:"total", hit:"hitAdv", block:"blockAdv" }[d.field];
      const text = row[field] + " " + row.notes;
      for (const n of [d.value.range.min,d.value.range.max]) assert.ok(text.includes(String(n)), `${d.moveId}/${d.field}/${n}`);
    }
  }
});
