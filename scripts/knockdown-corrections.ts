import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import type { Character } from "../src/lib/frame-data/schema";
export function correctKnockdowns(c: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).knockdownCorrections;
  if (!policy) return c;
  const ledger = JSON.parse(
    readFileSync("staging/stage17/frame-ledger.json", "utf8"),
  );
  return {
    ...c,
    moves: c.moves.map((m) => {
      const d = policy.decisions.find(
        (d: any) => d.moveId === m.id && d.characterId === c.id,
      );
      if (!d) return m;
      const conflict = ledger.knownValueConflicts.find(
        (x: any) =>
          x.moveId === m.id && x.characterId === c.id && x.field === "hit",
      );
      const source = ledger.sources.find(
        (s: any) => s.id === conflict?.sourceId,
      );
      if (
        !source ||
        !isDeepStrictEqual(m.input, source.input) ||
        !isDeepStrictEqual(d.before, conflict.current) ||
        d.sourceNotation !== conflict.sourceNotation ||
        !/^H?KD\s+[+]\d+(?:\([+]\d+\))?$/.test(d.sourceNotation)
      )
        throw new Error(`Invalid KD correction: ${m.id}`);
      const cargo = JSON.parse(readFileSync(source.cargoPath, "utf8")).data
        .cargoquery[source.cargoIndex].title;
      const raw = JSON.parse(readFileSync(source.rawPath, "utf8")).moves[
        source.rawIndex
      ];
      if (
        !isDeepStrictEqual(cargo, source.cargoRecord) ||
        !isDeepStrictEqual(raw, source.rawRecord)
      )
        throw new Error(`KD source changed: ${m.id}`);
      const value = { status: "confirmed" as const, display: "D" };
      if (
        !isDeepStrictEqual(m.frames.hit, d.before) &&
        !isDeepStrictEqual(m.frames.hit, value)
      )
        throw new Error(`KD old value mismatch: ${m.id}`);
      return { ...m, frames: { ...m.frames, hit: value } };
    }),
  };
}
