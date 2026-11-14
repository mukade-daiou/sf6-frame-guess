import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";

export function applyUserConfirmedFrames(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const decisions = policy.userConfirmedFrames?.decisions ?? [];
  if (
    decisions.length !== 2 ||
    new Set(
      decisions.map((d: any) => `${d.characterId}/${d.moveId}/${d.field}`),
    ).size !== 2
  )
    throw new Error("Invalid user-confirmed frame decisions");
  const result = structuredClone(character);
  for (const d of decisions.filter((x: any) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (
      !move ||
      !["total", "block"].includes(d.field) ||
      !isDeepStrictEqual(move.input, d.input) ||
      !isDeepStrictEqual(move.variant, d.variant) ||
      !isDeepStrictEqual(move.frames[d.field as "total" | "block"], d.before)
    )
      throw new Error(`User-confirmed frame baseline mismatch: ${d.moveId}`);
    move.frames[d.field as "total" | "block"] = d.value;
  }
  for (const d of (policy.parentStartupDecisions ?? []).filter(
    (x: any) => x.characterId === result.id,
  )) {
    const move = result.moves.find((m) => m.id === d.moveId);
    const row = JSON.parse(readFileSync(d.sourcePath, "utf8")).data.cargoquery[
      d.sourceIndex
    ]?.title;
    if (
      !move ||
      !isDeepStrictEqual(move.frames.startup, d.before) ||
      row?.input !== d.sourceInput ||
      row.notes !== d.sourceNotes
    )
      throw new Error(`Parent startup baseline mismatch: ${d.moveId}`);
    move.frames.startup = d.value;
  }
  return characterSchema.parse(result);
}

export function restoreUserConfirmedFrames(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const result = structuredClone(character);
  for (const d of (policy.parentStartupDecisions ?? []).filter(
    (x: any) => x.characterId === result.id,
  )) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unauthorized parent startup: ${d.moveId}`);
    move.frames.startup = d.before;
  }
  for (const d of (policy.specialStateExclusions ?? []).filter(
    (x: any) => x.characterId === result.id,
  )) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.adoption, d.value))
      throw new Error(`Unauthorized special-state exclusion: ${d.moveId}`);
    move.adoption = d.before;
  }
  for (const d of (policy.userConfirmedFrames?.decisions ?? []).filter(
    (x: any) => x.characterId === result.id,
  )) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (
      !move ||
      !isDeepStrictEqual(move.frames[d.field as "total" | "block"], d.value)
    )
      throw new Error(`Unauthorized user-confirmed frame: ${d.moveId}`);
    move.frames[d.field as "total" | "block"] = d.before;
  }
  return characterSchema.parse(result);
}
