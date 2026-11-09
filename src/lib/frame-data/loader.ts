import {
  characterSchema,
  metadataSchema,
  type Character,
  type Metadata,
  type MoveInput,
} from "./schema";
import { inputKey } from "./input";
import { isQuestionInput } from "./input";
import { hasCompleteScope, isMoveUsable } from "./adoption";

export interface Dataset {
  // Present only on the explicit development review adapter; never set by validateDataset.
  review?: { absentInputs: Record<string, string[]> };
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
      hasCompleteScope(c, "normal") &&
      hasCompleteScope(c, "special") &&
      (c.adoption?.status === "accepted" ||
        c.source.verification === "verified") &&
      c.moves.every(
        (m) =>
          isMoveUsable(c, m) ||
          m.adoption?.status === "held" ||
          m.adoption?.status === "excluded",
      ),
  );
  const adoptedInputs = [
    ...new Map(
      eligible.flatMap((c) =>
        c.moves
          .filter((m) => m.variant.kind === "base" && isMoveUsable(c, m))
          .map((m) => [inputKey(m.input), m.input] as const),
      ),
    ).values(),
  ].filter(isQuestionInput);
  // Candidate availability depends on a real adopted base move somewhere in the
  // eligible roster, never on the randomly selected target character.
  const inputs = adoptedInputs;
  const commandInputs: MoveInput[] = [
    ...new Map(
      inputs
        .filter((i) => i.type !== "normal")
        .map((i) => {
          const input = {
            type: "special" as const,
            motion: i.motion,
            button: i.button,
            strength: i.strength,
            includeSuperArts: true as const,
          };
          return [inputKey(input), input] as const;
        }),
    ).values(),
  ];
  return {
    metadata,
    characters,
    eligible,
    inputs: [...inputs, ...commandInputs],
    errors,
  };
}
