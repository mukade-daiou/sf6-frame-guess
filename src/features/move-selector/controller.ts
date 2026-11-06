import type { MoveInput } from "../../lib/frame-data/schema";
import { isQuestionInput } from "../../lib/frame-data/input";
export { isQuestionInput } from "../../lib/frame-data/input";
export type Direction = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
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
  return next === "5" || previous === next ? command : command + next;
}
export function getMotionCandidates(
  inputs: MoveInput[],
  prefix: string,
): string[] {
  return [
    ...new Set(
      inputs.flatMap((input) =>
        input.type === "special" &&
        isQuestionInput(input) &&
        input.motion.startsWith(prefix)
          ? [input.motion]
          : [],
      ),
    ),
  ];
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
) {
  return inputs.find(
    (input) =>
      isQuestionInput(input) &&
      input.type === type &&
      (input.type === "normal" ? input.direction : input.motion) === motion &&
      input.button === button &&
      input.strength === strength,
  );
}
