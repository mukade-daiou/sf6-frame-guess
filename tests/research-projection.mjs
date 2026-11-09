import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { expectedDistanceValue } from "../scripts/contact-timing-policy.mjs";

// Restore only the exact field changes authorized by stage 17, including their
// generated strengths, before running an older independent protection test.
export function restoreResearchFrames(character) {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).frameResearch;
  if (!policy) return character;
  const result = restoreDemonRaid(character);
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

export function restoreDemonRaid(character) {
  const result = structuredClone(character),
    records =
      JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
        .demonRaidNoInput?.records || [];
  restoreDistanceRanges(result);
  for (const m of result.moves) {
    const d = records.find(
      (d) => d.moveId === (m.strengthExpansion?.sourceMoveId || m.id),
    );
    if (d) {
      assert.deepEqual(m.frames, d.frames);
      m.frames = d.before;
    }
  }
  return result;
}

export function restoreDistanceRanges(result) {
  const ranges = JSON.parse(readFileSync("data/adoption-decisions.json", "utf8")).distanceRanges?.decisions || [];
  for (const m of result.moves) {
    for (const d of ranges.filter(d => d.characterId === result.id && d.moveId === (m.strengthExpansion?.sourceMoveId || m.id))) {
      assert.deepEqual(m.frames[d.field], expectedDistanceValue(JSON.parse(readFileSync("data/adoption-decisions.json")),d));
      m.frames[d.field] = d.before;
    }
  }
  return result;
}
