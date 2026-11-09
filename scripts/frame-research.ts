import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { correctKnockdowns } from "./knockdown-corrections";
import { applyDemonRaid } from "./demon-raid";
import {
  type Character,
  type Move,
  type FrameValue,
  characterSchema,
} from "../src/lib/frame-data/schema";

export function applyFrameResearch(character: Character): Character {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).frameResearch;
  if (!policy) return character;
  const ledger = JSON.parse(readFileSync(policy.ledgerPath, "utf8"));
  const selected = policy.fieldDecisions.filter(
    (d: any) => d.characterId === character.id,
  );
  if (
    new Set(selected.map((d: any) => `${d.moveId}:${d.field}`)).size !==
    selected.length
  )
    throw new Error(`Duplicate frame research decision: ${character.id}`);
  const moves = character.moves.map((move) => {
    const decisions = selected.filter((d: any) => d.moveId === move.id);
    if (!decisions.length) return move;
    const result = structuredClone(move);
    for (const d of decisions) {
      const target = ledger.targets.find((t: any) => t.id === d.evidenceId);
      const evidence = ledger.sources.find(
        (s: any) => s.id === target?.sourceId,
      );
      if (
        !target ||
        !evidence ||
        target.sourceMoveId !== move.id ||
        target.field !== d.field ||
        target.characterId !== character.id ||
        !isDeepStrictEqual(target.value, d.value) ||
        !isDeepStrictEqual(move.input, evidence.input)
      )
        throw new Error(`Frame research evidence mismatch: ${move.id}`);
      const cargo = JSON.parse(readFileSync(evidence.cargoPath, "utf8")).data
        .cargoquery[evidence.cargoIndex].title;
      const raw = JSON.parse(readFileSync(evidence.rawPath, "utf8")).moves[
        evidence.rawIndex
      ];
      if (
        !isDeepStrictEqual(cargo, evidence.cargoRecord) ||
        !isDeepStrictEqual(raw, evidence.rawRecord)
      )
        throw new Error(`Frame research source changed: ${move.id}`);
      const field = d.field as keyof Move["frames"];
      if (isDeepStrictEqual(result.frames[field], d.value)) continue;
      if (
        !isDeepStrictEqual(result.frames[field], d.before) ||
        d.before.status !== "unknown"
      )
        throw new Error(
          `Frame research may only replace its exact unknown: ${move.id}/${field}`,
        );
      result.frames[field] = d.value as FrameValue & Move["frames"]["total"];
    }
    return result;
  });
  return characterSchema.parse(
    applyDemonRaid(correctKnockdowns({ ...character, moves })),
  );
}
