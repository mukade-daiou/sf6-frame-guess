import type { Character, FrameValue, Mode, Move, MoveInput } from "./schema";
import { inputKey } from "./input";

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
    values.some((value) => !isDisplayable(value))
  )
    return { status: "unknown" };
  return { status: "found", frames: move.frames };
}
