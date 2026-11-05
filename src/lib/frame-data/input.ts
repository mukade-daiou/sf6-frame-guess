import type { MoveInput } from "./schema";

// No alias expansion or guessed motion normalization. Keys retain all input dimensions.
export function inputKey(input: MoveInput): string {
  return input.type === "normal"
    ? `normal:${input.direction}:${input.button}:${input.strength}`
    : `special:${input.motion}:${input.button}:${input.strength}`;
}
export function displayInput(input: MoveInput): string {
  if (input.type === "normal")
    return `${input.direction}${input.strength}${input.button}`;
  const suffix =
    input.strength === "OD"
      ? input.button.repeat(2)
      : input.strength === "none"
        ? input.button
        : `${input.strength}${input.button}`;
  return `${input.motion}${suffix}`;
}
