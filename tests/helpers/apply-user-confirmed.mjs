import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
export function applyUserConfirmedToBaseline(character) {
  const ds = JSON.parse(readFileSync("data/adoption-decisions.json", "utf8")).userConfirmedFrames.decisions;
  for (const d of ds.filter((x) => x.characterId === character.id)) {
    const m = character.moves.find((x) => x.id === d.moveId);
    assert(m);
    assert.deepEqual(m.frames[d.field], d.before);
    m.frames[d.field] = structuredClone(d.value);
  }
  return character;
}
