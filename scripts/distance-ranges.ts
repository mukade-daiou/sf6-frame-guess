import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { isContactRevoked } from "./contact-timing-policy.mjs";

// Applied after individual representative decisions, before common strengths.
export function applyDistanceRanges(
  character: Character,
  options: { historicalWithoutSA?: boolean; superArtsOnly?: boolean } = {},
): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const decisions = (policy.distanceRanges?.decisions || []).filter(
    (d: any) => !isContactRevoked(policy, d),
  );
  if (decisions.some((d: any) => d.field !== "startup"))
    throw new Error(
      "Only arrival/distance-dependent startup ranges may be applied",
    );
  const result = structuredClone(character);
  for (const d of decisions.filter(
    (d: any) => d.characterId === character.id,
  )) {
    if (options.superArtsOnly && !d.moveId.includes("__super_art_")) continue;
    const move = result.moves.find((m) => m.id === d.moveId);
    if (
      !move &&
      options.historicalWithoutSA &&
      d.moveId.includes("__super_art_") &&
      !result.moves.some((m) => m.category === "super_art")
    )
      continue;
    const saved = JSON.parse(readFileSync(d.sourcePath, "utf8"));
    if (d.additionalEvidence) {
      const html = readFileSync(d.additionalEvidence.path, "utf8");
      if (
        !d.additionalEvidence.requiredText?.length ||
        !d.additionalEvidence.requiredText.every((text: string) =>
          html.includes(text),
        )
      )
        throw new Error(`Additional range evidence mismatch: ${d.moveId}`);
    }
    if (
      !move ||
      !isDeepStrictEqual(
        saved.data.cargoquery[d.sourceIndex].title,
        d.sourceRecord,
      ) ||
      !isDeepStrictEqual(
        move.frames[d.field as keyof typeof move.frames],
        d.before,
      )
    )
      throw new Error(
        `Distance range evidence/baseline mismatch: ${d.moveId}/${d.field}`,
      );
    (move.frames as any)[d.field] = d.value;
  }
  return characterSchema.parse(result);
}
