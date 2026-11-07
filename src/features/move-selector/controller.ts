import type { MoveInput } from "../../lib/frame-data/schema";
import { isQuestionInput } from "../../lib/frame-data/input";
export { isQuestionInput } from "../../lib/frame-data/input";
export type Direction = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
const perimeter: Direction[] = ["6", "3", "2", "1", "4", "7", "8", "9"];
export type Rotation = {
  previous: Direction | null;
  steps: number;
  complete: boolean;
};
export const emptyRotation = (): Rotation => ({
  previous: null,
  steps: 0,
  complete: false,
});
export function trackRotation(
  state: Rotation,
  next: Direction,
  turns: 1 | 2 = 1,
): Rotation {
  if (next === "5" || next === state.previous || state.complete) return state;
  if (state.previous === null) return { ...state, previous: next };
  const delta =
    ((perimeter.indexOf(next) - perimeter.indexOf(state.previous) + 12) % 8) -
    4;
  // Opposite/large jumps provide no reliable evidence of a traversed arc.
  if (Math.abs(delta) > 2) return { ...emptyRotation(), previous: next };
  const steps = state.steps + delta;
  return { previous: next, steps, complete: Math.abs(steps) >= 8 * turns };
}
export const attackButtons = (["P", "K"] as const).flatMap((button) =>
  (["L", "M", "H", "OD"] as const).map((strength) => ({
    button,
    strength,
    label:
      strength === "OD"
        ? `弱${button}＋中${button}`
        : `${{ L: "弱", M: "中", H: "強" }[strength]}${button}`,
  })),
);
export function appendDirection(
  command: string,
  previous: Direction,
  next: Direction,
): string {
  if (next === "5" || previous === next) return command;
  const result = command + next;
  return result === "46" ? "[4]6" : result === "28" ? "[2]8" : result;
}
export function getMotionCandidates(
  inputs: MoveInput[],
  prefix: string,
  type: "special" | "super_art" = "special",
  saLevel: 1 | 2 | 3 = 1,
): string[] {
  return [
    ...new Set(
      inputs.flatMap((input) =>
        input.type === type &&
        (input.type !== "super_art" || input.saLevel === saLevel) &&
        isQuestionInput(input) &&
        (["360", "720"].includes(input.motion)
          ? prefix === "" ||
            prefix === input.motion ||
            (input.motion === "720" && prefix === "360") ||
            rotationSuggestions(prefix, input.motion === "720" ? 2 : 1).length >
              0
          : input.motion.startsWith(prefix) ||
            input.motion.replace(/[\[\]]/g, "").startsWith(prefix))
          ? [input.motion]
          : [],
      ),
    ),
  ];
}
export function rotationSuggestions(prefix: string, turns: 1 | 2 = 1) {
  const token = turns === 2 ? "720" : "360";
  const start = perimeter.indexOf(
    (prefix === token || (turns === 2 && prefix === "360")
      ? "6"
      : prefix[0]) as Direction,
  );
  if (start < 0) return [];
  return [1, -1].flatMap((step) => {
    const sequence = Array.from(
      { length: 8 * turns + 1 },
      (_, i) => perimeter[(start + step * i + 24) % 8],
    ).join("");
    return prefix === token ||
      (turns === 2 && prefix === "360") ||
      sequence.startsWith(prefix.replace(/[\[\]]/g, ""))
      ? [{ sequence, clockwise: step === 1 }]
      : [];
  });
}
export function directionAt(x: number, y: number, size: number): Direction {
  const dx = x - size / 2,
    dy = y - size / 2;
  if (Math.hypot(dx, dy) < size * 0.19) return "5";
  return (["6", "3", "2", "1", "4", "7", "8", "9"] as Direction[])[
    (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8
  ];
}
export function selectAttack(
  inputs: MoveInput[],
  type: MoveInput["type"],
  motion: string,
  button: "P" | "K",
  strength: "L" | "M" | "H" | "OD",
  saLevel: 1 | 2 | 3 = 1,
) {
  return inputs.find(
    (input) =>
      isQuestionInput(input) &&
      input.type === type &&
      (input.type !== "super_art" || input.saLevel === saLevel) &&
      (input.type === "normal" ? input.direction : input.motion) === motion &&
      input.button === button &&
      input.strength === strength,
  );
}
