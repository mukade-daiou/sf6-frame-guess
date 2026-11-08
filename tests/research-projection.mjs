import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

// Restore only the exact field changes authorized by stage 17, including their
// generated strengths, before running an older independent protection test.
export function restoreResearchFrames(character) {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).frameResearch;
  if (!policy) return character;
  const result = structuredClone(character);
  for (const move of result.moves) {
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    for (const d of policy.fieldDecisions.filter(
      (d) => d.characterId === character.id && d.moveId === sourceId,
    )) {
      assert.deepEqual(
        move.frames[d.field],
        d.value,
        `Unauthorized value: ${move.id}/${d.field}`,
      );
      assert.equal(d.before.status, "unknown");
      move.frames[d.field] = d.before;
    }
  }
  return result;
}
