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
  const corrections =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .knockdownCorrections?.decisions || [];
  for (const move of result.moves) {
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    for (const d of corrections.filter(
      (d) => d.characterId === character.id && d.moveId === sourceId,
    )) {
      assert.deepEqual(move.frames.hit, { status: "confirmed", display: "D" });
      move.frames.hit = d.before;
    }
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
