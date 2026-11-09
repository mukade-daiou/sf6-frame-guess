import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import type { Character } from "../src/lib/frame-data/schema";
export function applyDemonRaid(c: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).demonRaidNoInput;
  if (!policy || c.id !== "akuma") return c;
  return {
    ...c,
    moves: c.moves.map((m) => {
      const d = policy.records.find((d: any) => d.moveId === m.id);
      if (!d) return m;
      const cargo = JSON.parse(readFileSync(d.cargoPath, "utf8")).data
        .cargoquery[d.cargoIndex].title;
      const raw = JSON.parse(readFileSync(d.rawPath, "utf8")).moves[d.rawIndex];
      if (
        !isDeepStrictEqual(cargo, d.cargoRecord) ||
        !isDeepStrictEqual(raw, d.rawRecord) ||
        !isDeepStrictEqual(m.input, d.input) ||
        m.variant.kind !== "base"
      )
        throw new Error(`No-input source mismatch: ${m.id}`);
      if (
        !isDeepStrictEqual(m.frames, d.before) &&
        !isDeepStrictEqual(m.frames, d.frames)
      )
        throw new Error(`No-input previous frames mismatch: ${m.id}`);
      return { ...m, frames: d.frames };
    }),
  };
}
