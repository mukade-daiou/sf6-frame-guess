import {
  characterSchema,
  metadataSchema,
  type Character,
  type Metadata,
  type MoveInput,
} from "./schema";
import { inputKey } from "./input";
import { resolveMove } from "./resolver";

export interface Dataset {
  metadata: Metadata;
  characters: Character[];
  eligible: Character[];
  inputs: MoveInput[];
  errors: string[];
}
export function validateDataset(
  rawMetadata: unknown,
  files: Record<string, unknown>,
): Dataset {
  const metadata = metadataSchema.parse(rawMetadata);
  const characters: Character[] = [];
  const errors: string[] = [];
  for (const [file, raw] of Object.entries(files)) {
    const result = characterSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`${file}: ${result.error.message}`);
      continue;
    }
    const character = result.data;
    if (
      character.gameVersion !== metadata.gameVersion ||
      character.source.gameVersion !== metadata.gameVersion ||
      character.moves.some(
        (move) => move.source.gameVersion !== metadata.gameVersion,
      )
    ) {
      errors.push(`${file}: mixed game versions`);
      continue;
    }
    if (characters.some((other) => other.id === character.id)) {
      errors.push(`${file}: duplicate character id ${character.id}`);
      continue;
    }
    const ids = new Set<string>();
    let duplicate = false;
    for (const move of character.moves) {
      if (ids.has(move.id)) {
        errors.push(`${file}: duplicate move id ${move.id}`);
        duplicate = true;
      }
      ids.add(move.id);
    }
    if (duplicate) continue;
    // Repeated base inputs are kept as ambiguous, never silently pick one.
    const keys = character.moves
      .filter((m) => m.variant.kind === "base")
      .map((m) => inputKey(m.input));
    for (const key of new Set(keys))
      if (keys.filter((k) => k === key).length > 1)
        errors.push(`${file}: ambiguous base input ${key}`);
    characters.push(character);
  }
  const eligible = characters.filter(
    (c) =>
      c.source.verification === "verified" &&
      Object.values(c.coverage).every(
        (v) => v.status === "complete" && v.verification === "verified",
      ) &&
      c.moves.every((m) => m.source.verification === "verified"),
  );
  const inputs = [
    ...new Map(
      eligible.flatMap((c) =>
        c.moves
          .filter((m) => m.variant.kind === "base")
          .map((m) => [inputKey(m.input), m.input] as const),
      ),
    ).values(),
  ].filter((input) =>
    eligible.some((c) => resolveMove(c, input, "startup").status === "found"),
  );
  return { metadata, characters, eligible, inputs, errors };
}
