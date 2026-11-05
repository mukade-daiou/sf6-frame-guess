import type { Character, FrameValue, Mode, Move, MoveInput } from "./schema";
import { inputKey } from "./input";

export type Resolution =
  | { status: "found"; frames: Move["frames"] }
  | { status: "not_found" | "unknown" | "ambiguous" };
export function displayFrame(value: FrameValue): string {
  if (value.display !== null)
    return value.status === "conditional"
      ? `${value.display}（${value.condition}）`
      : value.display;
  return value.status === "not_applicable" ? "対象外" : "不明";
}
export function resolveMove(
  character: Character,
  input: MoveInput,
  mode: Mode,
): Resolution {
  const matches = character.moves.filter(
    (move) =>
      move.variant.kind === "base" && inputKey(move.input) === inputKey(input),
  );
  if (matches.length > 1) return { status: "ambiguous" };
  if (!matches.length) {
    const coverage = character.coverage[input.type];
    return {
      status:
        coverage.status === "complete" &&
        coverage.verification === "verified" &&
        character.source.verification === "verified"
          ? "not_found"
          : "unknown",
    };
  }
  const move = matches[0];
  const values =
    mode === "startup" ? [move.frames.startup] : Object.values(move.frames);
  if (
    move.source.verification !== "verified" ||
    values.some(
      (value) =>
        value.status === "unknown" ||
        value.status === "conditional" ||
        value.display === null,
    )
  )
    return { status: "unknown" };
  return { status: "found", frames: move.frames };
}
