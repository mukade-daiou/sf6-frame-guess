import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
export function applyRiskCorrectionsToBaseline(character) {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  for (const d of (policy.parentStartupDecisions || []).filter(
    (x) => x.characterId === character.id,
  )) {
    const m = character.moves.find((x) => x.id === d.moveId);
    assert(m);
    assert.deepEqual(m.frames.startup, d.before);
    m.frames.startup = structuredClone(d.value);
  }
  for (const d of (
    policy.whiffTotalCorrections.unverifiableDecisions || []
  ).filter((x) => x.characterId === character.id)) {
    const m = character.moves.find((x) => x.id === d.moveId);
    assert(m);
    assert.deepEqual(m.frames.total, d.before);
    m.frames.total = structuredClone(d.value);
  }
  for (const d of (policy.specialStateExclusions || []).filter(
    (x) => x.characterId === character.id,
  )) {
    const m = character.moves.find((x) => x.id === d.moveId);
    assert(m);
    assert.deepEqual(m.adoption, d.before);
    m.adoption = structuredClone(d.value);
  }
  return character;
}
export function applyUserConfirmedToBaseline(character) {
  const ds = JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
    .userConfirmedFrames.decisions;
  for (const d of ds.filter((x) => x.characterId === character.id)) {
    const m = character.moves.find((x) => x.id === d.moveId);
    assert(m);
    assert.deepEqual(m.frames[d.field], d.before);
    m.frames[d.field] = structuredClone(d.value);
  }
  return applyRiskCorrectionsToBaseline(character);
}
