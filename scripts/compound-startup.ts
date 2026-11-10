import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";

// Applied to source records before common-strength expansion.
export function applyCompoundStartup(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const result = structuredClone(character);
  for (const d of policy.compoundStartup?.decisions ?? []) {
    if (d.characterId !== character.id) continue;
    const move = result.moves.find((m) => m.id === d.moveId);
    const source = JSON.parse(readFileSync(d.sourcePath, "utf8")).data
      .cargoquery[d.sourceIndex].title;
    if (
      !move ||
      source.input !== d.sourceInput ||
      source.startup !== d.sourceNotation ||
      !isDeepStrictEqual(move.frames.startup, d.before)
    ) {
      throw new Error(
        `Compound startup evidence/baseline mismatch: ${d.moveId}`,
      );
    }
    move.frames.startup = d.value;
  }
  return characterSchema.parse(result);
}

// Project only verified authorized values to the earlier snapshot for historical audits.
export function restoreCompoundStartup(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const result = structuredClone(character);
  for (const move of result.moves) {
    const total = (policy.whiffTotalCorrections?.decisions ?? []).find(
      (item: any) => item.characterId === result.id && item.moveId === move.id,
    );
    if (total) {
      if (!isDeepStrictEqual(move.frames.total, total.value))
        throw new Error(`Unexpected whiff total: ${move.id}`);
      move.frames.total = total.before;
    }
    const kd = (policy.kdHkdCorrections?.decisions ?? []).find(
      (item: any) => item.characterId === result.id && item.moveId === move.id,
    );
    if (kd) {
      if (!isDeepStrictEqual(move.frames.hit, kd.value))
        throw new Error(`Unexpected KD/HKD: ${move.id}`);
      move.frames.hit = kd.before;
    }
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    const d = (policy.compoundStartup?.decisions ?? []).find(
      (item: any) => item.characterId === result.id && item.moveId === sourceId,
    );
    if (!d) continue;
    if (!isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unexpected compound startup: ${move.id}`);
    move.frames.startup = d.before;
  }
  return characterSchema.parse(result);
}
