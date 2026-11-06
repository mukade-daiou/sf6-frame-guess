import type { Character, FrameValue, Mode, Move, MoveInput } from "./schema";
import { inputKey } from "./input";
import { hasCompleteScope, isMoveUsable } from "./adoption";

export type Resolution =
  | {
      status: "review";
      frames: Move["frames"] | null;
      assessment: "recorded" | "source_absent" | "not_recorded" | "ambiguous";
      reason: string;
    }
  | { status: "found"; frames: Move["frames"] }
  | { status: "not_found" | "unknown" | "ambiguous" };
export function displayFrame(value: FrameValue): string {
  if (value.status === "conditional")
    return value.range ? `${value.range.min}~${value.range.max}` : "不明";
  if (value.status === "unknown") return "不明";
  if (value.display !== null) return value.display;
  return value.status === "not_applicable" ? "対象外" : "不明";
}
export function isDisplayable(value: FrameValue): boolean {
  return (
    value.status !== "unknown" &&
    (value.status !== "conditional" || value.range !== undefined) &&
    (value.status === "not_applicable" || value.display !== null)
  );
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
    // A strengthless source record is not proof that a specific button variant is absent.
    if (
      input.type === "special" &&
      input.strength !== "OD" &&
      character.moves.some(
        (m) =>
          m.input.type === "special" &&
          m.input.motion === input.motion &&
          m.input.button === input.button &&
          m.input.strength === "none",
      )
    )
      return { status: "unknown" };
    if (character.moves.some((m) => inputKey(m.input) === inputKey(input)))
      return { status: "unknown" };
    return {
      status: hasCompleteScope(character, input.type) ? "not_found" : "unknown",
    };
  }
  const move = matches[0];
  const values =
    mode === "startup" ? [move.frames.startup] : Object.values(move.frames);
  if (
    !isMoveUsable(character, move) ||
    values.some((value) => !isDisplayable(value))
  )
    return { status: "unknown" };
  return { status: "found", frames: move.frames };
}
