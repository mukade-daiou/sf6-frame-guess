import type { MoveInput } from "./schema";

// Question controls support directional motions and six attacks plus OD pairs.
// Supports the two explicit charge motions; other complex records remain intact.
export function isQuestionInput(input: MoveInput): boolean {
  if (input.type === "super_art") return true;
  return (
    input.type === "normal" ||
    (input.motion !== "none" &&
      (["360", "[4]6", "[2]8"].includes(input.motion) ||
        /^[12346789]+$/.test(input.motion)) &&
      input.strength !== "none")
  );
}

// No alias expansion or guessed motion normalization. Keys retain all input dimensions.
export function inputKey(input: MoveInput): string {
  if (input.type === "super_art")
    return `super_art:${input.saLevel}:${input.motion}:${input.button}:${input.strength}`;
  if (input.type === "special" && input.motion === "none")
    return `special:buttons:${input.buttonCombination}`;
  return input.type === "normal"
    ? `normal:${input.direction}:${input.button}:${input.strength}`
    : `special:${input.motion}:${input.button}:${input.strength}`;
}
export function displayInput(input: MoveInput): string {
  if (input.type === "special" && input.motion === "none")
    return `${input.button.repeat(2)} (${input.buttonCombination})`;
  if (input.type === "normal")
    return `${input.direction}${input.strength}${input.button}`;
  const suffix =
    input.strength === "OD"
      ? input.button.repeat(2)
      : input.strength === "none"
        ? input.button
        : `${input.strength}${input.button}`;
  return `${input.type === "super_art" ? `SA${input.saLevel}：` : ""}${input.motion}${suffix}`;
}
