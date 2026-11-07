import type { Character, Move } from "./schema";

export function isMoveUsable(character: Character, move: Move): boolean {
  if (
    character.adoption?.status === "held" ||
    move.adoption?.status === "held" ||
    character.adoption?.status === "excluded" ||
    move.adoption?.status === "excluded"
  )
    return false;
  if (character.adoption?.status === "accepted")
    return move.adoption?.status === "accepted";
  return move.source.verification === "verified";
}
export function hasCompleteScope(
  character: Character,
  category: Move["category"],
): boolean {
  const coverage = character.coverage[category];
  if (!coverage) return false;
  if (
    character.adoption?.status === "held" ||
    character.adoption?.status === "excluded"
  )
    return false;
  return (
    coverage.status === "complete" &&
    (character.adoption?.status === "accepted" ||
      (coverage.verification === "verified" &&
        character.source.verification === "verified"))
  );
}
