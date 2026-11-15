import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";

export const digest = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export function applyReviewedUpdates(
  character: Character,
  batches: any[] = [],
): Character {
  const result = structuredClone(character);
  for (const batch of batches)
    for (const d of batch.decisions) {
      if (d.characterId !== result.id) continue;
      const raw = readFileSync(d.sourcePath);
      if (digest(raw) !== d.sourceHash)
        throw new Error("Reviewed source hash mismatch");
      const source = JSON.parse(raw.toString());
      if (!source.rows.some((r: unknown) => isDeepStrictEqual(r, d.sourceRow)))
        throw new Error("Reviewed source row missing");
      const move = result.moves.find((m) => m.id === d.moveId);
      if (
        !move ||
        !["startup", "total", "hit", "block"].includes(d.field) ||
        !isDeepStrictEqual(
          move.frames[d.field as keyof typeof move.frames],
          d.before,
        )
      )
        throw new Error(`Reviewed baseline mismatch: ${d.moveId}/${d.field}`);
      (move.frames as any)[d.field] = structuredClone(d.after);
    }
  return characterSchema.parse(result);
}
