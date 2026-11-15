import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

// Identity is kept outside JSON: an old value read from disk (or copied without
// its validation history) must never count as an already validated projection.
const reviewedProjections = new WeakMap();
export function restoreReviewedUpdates(character, policy) {
  const batches = policy.reviewedUpdates ?? [];
  const policyKey = JSON.stringify([character.id, batches]);
  const prior = reviewedProjections.get(character);
  const result = structuredClone(character);
  if (prior) {
    if (prior.policyKey !== policyKey)
      throw new Error("Reviewed projection policy mismatch");
    for (const d of prior.fields) {
      const m = result.moves.find((m) => m.id === d.moveId);
      if (!m || !isDeepStrictEqual(m.frames[d.field], d.value))
        throw new Error(
          `Unauthorized reviewed projection: ${d.moveId}/${d.field}`,
        );
    }
  } else {
    for (const batch of [...batches].reverse())
      for (const d of [...batch.decisions].reverse()) {
        if (d.characterId !== character.id) continue;
        const m = result.moves.find((m) => m.id === d.moveId);
        if (!m || !isDeepStrictEqual(m.frames[d.field], d.after))
          throw new Error(
            `Unauthorized reviewed update: ${d.moveId}/${d.field}`,
          );
        m.frames[d.field] = structuredClone(d.before);
      }
  }
  const fields = new Map();
  for (const batch of batches)
    for (const d of batch.decisions) {
      if (d.characterId !== character.id) continue;
      fields.set(JSON.stringify([d.moveId, d.field]), {
        moveId: d.moveId,
        field: d.field,
        value: structuredClone(
          result.moves.find((m) => m.id === d.moveId).frames[d.field],
        ),
      });
    }
  reviewedProjections.set(result, { policyKey, fields: [...fields.values()] });
  return result;
}

// Historical audits must validate the authorized new value before restoring the old one.
export function restoreCompoundStartup(character) {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  const compound = policy.compoundStartup;
  const decisions = [
    ...(compound?.decisions || []),
    ...(compound?.saDecisions || []),
    ...(compound?.indicatorDecisions || []),
  ];
  const result = restoreReviewedUpdates(character, policy);
  for (const d of (policy.parentStartupDecisions || []).filter(
    (x) => x.characterId === result.id,
  )) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.frames.startup, d.value))
      throw new Error(`Unauthorized parent startup: ${d.moveId}`);
    move.frames.startup = structuredClone(d.before);
  }
  const special = policy.specialStateExclusions || [];
  for (const d of special.filter((x) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.adoption, d.value))
      throw new Error(`Unauthorized special-state exclusion: ${d.moveId}`);
    move.adoption = structuredClone(d.before);
  }
  const userDecisions = policy.userConfirmedFrames?.decisions || [];
  for (const d of userDecisions.filter((x) => x.characterId === result.id)) {
    const move = result.moves.find((m) => m.id === d.moveId);
    if (!move || !isDeepStrictEqual(move.frames[d.field], d.value))
      throw new Error(`Unauthorized user-confirmed frame: ${d.moveId}`);
    move.frames[d.field] = structuredClone(d.before);
  }
  const kdDecisions = policy.kdHkdCorrections?.decisions || [];
  const additionalKd = policy.kdHkdCorrections?.additionalDecisions || [];
  const airborneKd = policy.kdHkdCorrections?.airborneDecisions || [];
  const totals = policy.whiffTotalCorrections;
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
