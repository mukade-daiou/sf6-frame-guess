import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

// Historical audits must validate the authorized new value before restoring the old one.
export function restoreCompoundStartup(character) {
  const compound = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).compoundStartup;
  const decisions = [
    ...(compound?.decisions || []),
    ...(compound?.saDecisions || []),
    ...(compound?.indicatorDecisions || []),
  ];
  const result = structuredClone(character);
  for (const d of (
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .parentStartupDecisions || []
  ).filter((x) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unauthorized parent startup: ${d.moveId}`);
    move.frames.startup = structuredClone(d.before);
  }
  const special =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .specialStateExclusions || [];
  for (const d of special.filter((x) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.adoption, d.value))
      throw new Error(`Unauthorized special-state exclusion: ${d.moveId}`);
    move.adoption = structuredClone(d.before);
  }
  const userDecisions =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .userConfirmedFrames?.decisions || [];
  for (const d of userDecisions.filter((x) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.frames[d.field], d.value))
      throw new Error(`Unauthorized user-confirmed frame: ${d.moveId}`);
    move.frames[d.field] = structuredClone(d.before);
  }
  const kdDecisions =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .kdHkdCorrections?.decisions || [];
  const additionalKd =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .kdHkdCorrections?.additionalDecisions || [];
  const airborneKd =
    JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"))
      .kdHkdCorrections?.airborneDecisions || [];
  const totals = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  ).whiffTotalCorrections;
  const totalDecisions = [
    ...(totals?.decisions || []),
    ...(totals?.additionalDecisions || []),
    ...(totals?.unverifiableDecisions || []),
  ];
  for (const move of result.moves) {
    const total = totalDecisions.find(
      (d) => d.characterId === result.id && d.moveId === move.id,
    );
    if (total) {
      if (!isDeepStrictEqual(move.frames.total, total.value))
        throw new Error(`Unauthorized whiff total: ${move.id}`);
      move.frames.total = structuredClone(total.before);
    }
    const kd =
      airborneKd.find(
        (d) => d.characterId === result.id && d.moveId === move.id,
      ) ||
      additionalKd.find(
        (d) =>
          d.characterId === result.id &&
          d.moveId === (move.strengthExpansion?.sourceMoveId || move.id),
      ) ||
      kdDecisions.find(
        (d) => d.characterId === result.id && d.moveId === move.id,
      );
    if (kd) {
      if (!isDeepStrictEqual(move.frames.hit, kd.value))
        throw new Error(`Unauthorized KD/HKD: ${move.id}`);
      move.frames.hit = structuredClone(kd.before);
    }
    const sourceId = move.strengthExpansion?.sourceMoveId || move.id;
    const d = decisions.find(
      (item) => item.characterId === result.id && item.moveId === sourceId,
    );
    if (!d) continue;
    if (!isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unauthorized compound startup: ${move.id}`);
    move.frames.startup = structuredClone(d.before);
  }
  return result;
}
