import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { restoreUserConfirmedFrames } from "./user-confirmed-frames";

// Individual decisions are applied after strength expansion, including explicit expansion IDs.
export function applyWhiffTotalCorrections(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const decisions = policy.whiffTotalCorrections?.decisions ?? [];
  const additional = policy.whiffTotalCorrections?.additionalDecisions ?? [];
  const reviewed = policy.whiffTotalCorrections?.unverifiableDecisions ?? [];
  if (
    decisions.length !== 53 ||
    new Set(
      decisions.map((d: any) => `${d.characterId}/${d.moveId}/${d.field}`),
    ).size !== 53 ||
    additional.length !== 2 ||
    reviewed.length !== 18 ||
    new Set(
      [...decisions, ...additional, ...reviewed].map(
        (d: any) => `${d.characterId}/${d.moveId}/${d.field}`,
      ),
    ).size !== 73
  )
    throw new Error("Invalid whiff total decisions");
  const result = structuredClone(character);
  for (const d of [...decisions, ...additional, ...reviewed].filter(
    (d: any) => d.characterId === result.id,
  )) {
    const m = result.moves.find((m) => m.id === d.moveId);
    const row = JSON.parse(readFileSync(d.sourcePath, "utf8")).data.cargoquery[
      d.sourceIndex
    ].title;
    if (
      !m ||
      d.field !== "total" ||
      !isDeepStrictEqual(m.frames.total, d.before) ||
      row.input !== d.sourceInput ||
      row.total !== d.sourceNotation ||
      row.notes !== d.sourceNotes ||
      d.value.status !== "confirmed" ||
      Number(d.value.display) !== d.value.numeric
    )
      throw new Error(`Whiff total evidence or baseline mismatch: ${d.moveId}`);
    m.frames.total = d.value;
  }
  return characterSchema.parse(result);
}

export function restoreWhiffTotalCorrections(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const result = restoreUserConfirmedFrames(character);
  for (const d of [
    ...(policy.whiffTotalCorrections?.decisions ?? []),
    ...(policy.whiffTotalCorrections?.additionalDecisions ?? []),
    ...(policy.whiffTotalCorrections?.unverifiableDecisions ?? []),
  ]) {
    if (d.characterId !== result.id) continue;
    const m = result.moves.find((item) => item.id === d.moveId);
    if (!m || !isDeepStrictEqual(m.frames.total, d.value))
      throw new Error(`Unauthorized whiff total: ${d.moveId}`);
    m.frames.total = d.before;
  }
  return characterSchema.parse(result);
}
