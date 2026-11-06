import { createHash } from "node:crypto";
import { convert } from "./collect-supercombo.mjs";

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, canonical(value[k])]),
    );
  return value;
}
// A review applies only to the exact source record it examined, across future updates.
export const fingerprint = (value) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
export function convertReviewed(raw, decisions = []) {
  const relevant = decisions.filter((d) => d.characterId === raw.id);
  const applied = [],
    stale = [],
    seen = new Set(),
    moves = [];
  for (const d of relevant)
    if (!raw.moves.some((m) => fingerprint(m) === d.fingerprint)) stale.push(d);
  if (stale.length)
    throw new Error(
      `Stale reviews for ${raw.id}: ${stale.map((d) => d.name).join(", ")}`,
    );
  for (const item of raw.moves) {
    const hash = fingerprint(item);
    if (seen.has(hash)) {
      applied.push({
        action: "merge_exact_duplicate",
        input: item.input?.numpad,
        name: item.name?.en,
        fingerprint: hash,
      });
      continue;
    }
    seen.add(hash);
    const decision = relevant.find(
      (d) => d.fingerprint === hash && d.action === "exclude",
    );
    if (decision) {
      applied.push(decision);
      continue;
    }
    moves.push(item);
  }
  const result = convert({ ...raw, moves });
  for (const move of result.character.moves) {
    const original = moves.find(
      (m) =>
        move.notes.includes(`upstreamInput: ${m.input?.numpad}`) &&
        move.notes.includes(`upstreamName: ${m.name?.en}`),
    );
    const review =
      original &&
      relevant.find(
        (d) =>
          d.fingerprint === fingerprint(original) &&
          d.action === "quarantine_hit",
      );
    if (
      review &&
      !relevant.some(
        (d) =>
          d.fingerprint === fingerprint(original) &&
          d.action === "replace_hit_D",
      )
    ) {
      move.notes.push(
        `qualityReview: ${review.reason}; original onHit=${original.onHit}; comparison=${review.urls.join(", ")}`,
      );
      move.frames.hit = { status: "unknown", display: null };
      applied.push(review);
    }
    const semantics = original
      ? relevant.filter((d) => d.fingerprint === fingerprint(original))
      : [];
    for (const decision of semantics) {
      if (decision.action === "replace_hit_D") {
        move.frames.hit = { status: "confirmed", display: "D" };
        move.notes.push(
          `qualityReview: restored ${decision.sourceDisplay} as D; original onHit=${original.onHit}; source=${decision.urls.join(", ")}`,
        );
        applied.push(decision);
      }
      if (decision.action === "mark_not_applicable") {
        const extra =
          decision.field === "total"
            ? { provenance: null, calculation: null }
            : {};
        move.frames[decision.field] = {
          status: "not_applicable",
          display: "-",
          ...extra,
        };
        applied.push(decision);
      }
    }
  }
  const classifiedExclusions = result.audit.excluded.map((issue) => {
    const input = issue.input;
    const classification = /~|>/.test(input)
      ? "follow_up"
      : /j\./i.test(input)
        ? "air_move"
        : /^W\./.test(input)
          ? "windclad_resource"
          : /\[[LMH]?[PK]+\]|\(hold\)/i.test(input)
            ? "held_button"
            : issue.category === "normal" && !/^[52][LMH][PK]$/.test(input)
              ? "non_basic_normal"
              : issue.reason.startsWith("unresolved_base_collision:")
                ? "unresolved_same_input"
                : "unsupported_or_unreviewed";
    return { ...issue, classification };
  });
  return { ...result, review: { applied, stale, classifiedExclusions } };
}
