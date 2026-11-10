import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";

export function applyKdHkdCorrections(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const entries = policy.kdHkdCorrections?.decisions ?? [];
  const additional = policy.kdHkdCorrections?.additionalDecisions ?? [];
  if (
    entries.length !== 66 ||
    new Set(entries.map((d: any) => `${d.characterId}/${d.moveId}/${d.field}`))
      .size !== 66
  )
    throw new Error("Invalid KD/HKD decisions");
  const combined = [...entries, ...additional];
  if (
    additional.length !== 15 ||
    new Set(combined.map((d: any) => `${d.characterId}/${d.moveId}/${d.field}`))
      .size !== 81
  )
    throw new Error("Invalid additional KD/HKD decisions");
  const result = structuredClone(character);
  for (const d of combined.filter((d: any) => d.characterId === character.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    const row = JSON.parse(readFileSync(d.sourcePath, "utf8")).data.cargoquery[
      d.sourceIndex
    ].title;
    if (
      !move ||
      (d.input && !isDeepStrictEqual(move.input, d.input)) ||
      d.field !== "hit" ||
      !isDeepStrictEqual(move.frames.hit, d.before) ||
      row.input !== d.sourceInput ||
      row.hitAdv !== d.sourceNotation ||
      row.notes !== d.sourceNotes ||
      !/^H?KD\s*\+?\d/i.test(row.hitAdv) ||
      !isDeepStrictEqual(d.value, { status: "confirmed", display: "D" })
    )
      throw new Error(`KD/HKD evidence or baseline mismatch: ${d.moveId}`);
    move.frames.hit = d.value;
  }
  return characterSchema.parse(result);
}
