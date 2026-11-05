import type { Character, Move } from "./schema";

export function isMoveUsable(character: Character, move: Move): boolean {
  if (character.adoption?.status === "held" || move.adoption?.status === "held")
    return false;
  if (character.adoption?.status === "accepted")
    return move.adoption?.status === "accepted";
  return move.source.verification === "verified";
}
export function hasCompleteScope(
  character: Character,
  category: "normal" | "special",
): boolean {
  const coverage = character.coverage[category];
  if (character.adoption?.status === "held") return false;
  return (
    coverage.status === "complete" &&
    (character.adoption?.status === "accepted" ||
      (coverage.verification === "verified" &&
        character.source.verification === "verified"))
  );
}
