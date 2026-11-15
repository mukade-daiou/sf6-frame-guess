import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { officialCandidate } from "./official-additions";
import { inputKey } from "../src/lib/frame-data/input";

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
      if (d.kind === "add_character") continue;
      const raw = readFileSync(d.sourcePath);
      if (digest(raw) !== d.sourceHash)
        throw new Error("Reviewed source hash mismatch");
      const source = JSON.parse(raw.toString());
      if (!source.rows.some((r: unknown) => isDeepStrictEqual(r, d.sourceRow)))
        throw new Error("Reviewed source row missing");
      if (d.kind === "add_move") {
        const candidates = officialCandidate(
          source,
          result.id,
          result.gameVersion,
          d.retrievedAt,
        ).character.moves;
        if (
          !candidates.some((m) => isDeepStrictEqual(m, d.move)) ||
          d.move.adoption?.status !== "accepted" ||
          result.moves.some(
            (m) =>
              m.id === d.move.id ||
              inputKey(m.input) === inputKey(d.move.input),
          )
        )
          throw new Error("Invalid/duplicate official move addition");
        result.moves.push(d.move);
        continue;
      }
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
