import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

// Historical audits must validate the authorized new value before restoring the old one.
export function restoreCompoundStartup(character) {
  const decisions =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .compoundStartup?.decisions || [];
  const result = structuredClone(character);
  const kdDecisions =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .kdHkdCorrections?.decisions || [];
  const additionalKd =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .kdHkdCorrections?.additionalDecisions || [];
  const totalDecisions =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .whiffTotalCorrections?.decisions || [];
  for (const move of result.moves) {
    const total = totalDecisions.find(
      (d) => d.characterId === result.id && d.moveId === move.id,
    );
    if (total) {
      if (!isDeepStrictEqual(move.frames.total, total.value))
        throw new Error(`Unauthorized whiff total: ${move.id}`);
      move.frames.total = structuredClone(total.before);
    }
    const kd =
      additionalKd.find(
        (d) =>
          d.characterId === result.id &&
          d.moveId === (move.strengthExpansion?.sourceMoveId || move.id),
      ) ||
      kdDecisions.find(
        (d) => d.characterId === result.id && d.moveId === move.id,
      );
    if (kd) {
      if (!isDeepStrictEqual(move.frames.hit, kd.value))
        throw new Error(`Unauthorized KD/HKD: ${move.id}`);
      move.frames.hit = structuredClone(kd.before);
    }
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    const d = decisions.find(
      (item) => item.characterId === result.id && item.moveId === sourceId,
    );
    if (!d) continue;
    if (!isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unauthorized compound startup: ${move.id}`);
    move.frames.startup = structuredClone(d.before);
  }
  return result;
}
