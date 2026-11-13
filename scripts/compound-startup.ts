import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { restoreUserConfirmedFrames } from "./user-confirmed-frames";

// Applied to source records before common-strength expansion.
export function applyCompoundStartup(
  character: Character,
  mode: "all" | "saOnly" | "withoutSA" = "all",
): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const result = structuredClone(character);
  for (const d of [
    ...(mode === "saOnly" ? [] : (policy.compoundStartup?.decisions ?? [])),
    ...(mode === "saOnly"
      ? []
      : (policy.compoundStartup?.indicatorDecisions ?? [])),
    ...(mode === "withoutSA"
      ? []
      : (policy.compoundStartup?.saDecisions ?? [])),
  ]) {
    if (d.characterId !== character.id) continue;
    const move = result.moves.find((m) => m.id === d.moveId);
    const source = JSON.parse(readFileSync(d.sourcePath, "utf8")).data
      .cargoquery[d.sourceIndex].title;
    const official =
      d.officialNotes === undefined
        ? null
        : JSON.parse(readFileSync(d.officialPath, "utf8")).rows.find(
            (r: any) => r.row === d.officialRows[0],
          );
    if (
      !move ||
      source.input !== d.sourceInput ||
      source.startup !== d.sourceNotation ||
      (d.sourceNotes !== undefined && source.notes !== d.sourceNotes) ||
      (d.officialNotes !== undefined &&
        (!official ||
          official.notes !== d.officialNotes ||
          official.startup !== d.officialStartup)) ||
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
  const result = restoreUserConfirmedFrames(character);
  for (const move of result.moves) {
    const total = [
      ...(policy.whiffTotalCorrections?.decisions ?? []),
      ...(policy.whiffTotalCorrections?.additionalDecisions ?? []),
      ...(policy.whiffTotalCorrections?.unverifiableDecisions ?? []),
    ].find(
      (item: any) => item.characterId === result.id && item.moveId === move.id,
    );
    if (total) {
      if (!isDeepStrictEqual(move.frames.total, total.value))
        throw new Error(`Unexpected whiff total: ${move.id}`);
      move.frames.total = total.before;
    }
    const kd =
      (policy.kdHkdCorrections?.airborneDecisions ?? []).find(
        (item: any) =>
          item.characterId === result.id && item.moveId === move.id,
      ) ||
      (policy.kdHkdCorrections?.additionalDecisions ?? []).find(
        (item: any) =>
          item.characterId === result.id &&
          item.moveId === (move.strengthExpansion?.sourceMoveId || move.id),
      ) ||
      (policy.kdHkdCorrections?.decisions ?? []).find(
        (item: any) =>
          item.characterId === result.id && item.moveId === move.id,
      );
    if (kd) {
      if (!isDeepStrictEqual(move.frames.hit, kd.value))
        throw new Error(`Unexpected KD/HKD: ${move.id}`);
      move.frames.hit = kd.before;
    }
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    const d = [
      ...(policy.compoundStartup?.decisions ?? []),
      ...(policy.compoundStartup?.saDecisions ?? []),
      ...(policy.compoundStartup?.indicatorDecisions ?? []),
    ].find(
      (item: any) => item.characterId === result.id && item.moveId === sourceId,
    );
    if (!d) continue;
    if (!isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unexpected compound startup: ${move.id}`);
    move.frames.startup = d.before;
  }
  return characterSchema.parse(result);
}
