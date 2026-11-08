import { readFileSync } from "node:fs";
import { type Character, type FrameValue } from "../src/lib/frame-data/schema";
import { inputKey } from "../src/lib/frame-data/input";
export const cleanSource = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replaceAll("'", "")
    .trim();
export function conditionalFrame(
  s: string,
  field: string,
  focus = false,
): FrameValue {
  const text = cleanSource(s || "");
  if (text === "-") return { status: "not_applicable", display: "-" };
  if (!text) return { status: "unknown", display: null };
  if (field === "hit" && /\b(?:HKD|KD)\b/.test(text))
    return { status: "confirmed", display: "D" };
  if (focus && field === "startup" && /^\d+\+10$/.test(text))
    return { status: "confirmed", display: text };
  const n = /^([+-]?\d+)(?:\s*\(.*\))?$/.exec(text);
  return n
    ? { status: "confirmed", display: n[1], numeric: Number(n[1]) }
    : { status: "unknown", display: null };
}
export function applyConditionalSpecials(c: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).conditionalSpecials;
  if (!policy) return c;
  return {
    ...c,
    moves: c.moves.map((m) => {
      if (m.id === policy.excludedMoveId)
        return {
          ...m,
          adoption: {
            status: "excluded" as const,
            basis:
              "第16段階ユーザー指定: Speedy Maracasのみ対象外。原典を保持。",
          },
        };
      const d = policy.selections.find(
        (d: any) => d.moveId === m.id && d.characterId === c.id,
      );
      if (!d || m.representativeCondition) return m;
      const raw = JSON.parse(readFileSync(d.rawPath, "utf8")).moves[d.rawIndex];
      const cargoFile = JSON.parse(readFileSync(d.cargoPath, "utf8"));
      const cargo = cargoFile.data.cargoquery[d.cargoIndex].title;
      if (
        raw.name.en !== d.sourceName ||
        raw.input.numpad !== d.sourceInput ||
        cargo.input !== d.sourceInput ||
        cargo.notes !== d.expectedCargoNotes
      )
        throw new Error(`Conditional source mismatch: ${m.id}`);
      const collision = c.moves.find(
        (x) =>
          x.id !== m.id &&
          x.variant.kind === "base" &&
          x.adoption?.status !== "excluded" &&
          inputKey(x.input) === inputKey(m.input),
      );
      if (collision)
        throw new Error(`Conditional input collision: ${m.id}/${collision.id}`);
      const frames = Object.fromEntries(
        [
          ["startup", "startup"],
          ["total", "total"],
          ["hit", "hitAdv"],
          ["block", "blockAdv"],
        ].map(([f, k]) => [
          f,
          conditionalFrame(cargo[k], f, c.id === "cviper"),
        ]),
      );
      return {
        ...m,
        variant: { kind: "base" as const, condition: null },
        adoption: { status: "accepted" as const, basis: d.condition },
        frames: {
          startup: frames.startup,
          total: {
            ...frames.total,
            provenance:
              frames.total.status === "confirmed" ? ("source" as const) : null,
            calculation: null,
          },
          hit: frames.hit,
          block: frames.block,
        },
        source: {
          ...m.source,
          url: raw.source.url,
          retrievedAt: cargoFile.retrievedAt,
        },
        notes: [
          ...m.notes,
          `upstreamName: ${raw.name.en}`,
          `第16段階: 以前のheld理由を解消。${d.condition}`,
          `sourceNotation: ${JSON.stringify(cargo)}`,
          `rawSource: ${d.rawPath}#/moves/${d.rawIndex}`,
        ],
        representativeCondition: {
          condition: d.condition,
          rawRef: `${d.rawPath}#/moves/${d.rawIndex}`,
          cargoRef: `${d.cargoPath}#/data/cargoquery/${d.cargoIndex}/title`,
        },
      };
    }),
  };
}
