import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { characterSchema } from "../src/lib/frame-data/schema";
import { applyConditionalSpecials } from "./conditional-specials";
import { applyFrameResearch } from "./frame-research";
import { applyDistanceRanges } from "./distance-ranges";
import { withStrengthExpansions } from "../src/lib/frame-data/strength-expansion";
import { resolveMove } from "../src/lib/frame-data/resolver";
const policy = JSON.parse(
  readFileSync("data/adoption-decisions.json", "utf8"),
).conditionalSpecials;
const changed: any[] = [];
let beforeCount = 0,
  afterCount = 0;
const questions: any[] = [];
for (const f of readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const path = `data/characters/${f}`;
  const before = characterSchema.parse(
    JSON.parse(
      execFileSync("git", ["show", `${policy.protectionRef}:${path}`], {
        encoding: "utf8",
      }),
    ),
  );
  const after = characterSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  const expected = withStrengthExpansions(
    applyDistanceRanges(applyFrameResearch(applyConditionalSpecials(before))),
  );
  if (!isDeepStrictEqual(expected, after))
    throw new Error(`Unexpected conditional changes: ${f}`);
  beforeCount += before.moves.length;
  afterCount += after.moves.length;
  const researchBefore = withStrengthExpansions(applyFrameResearch(before));
  for (const old of before.moves) {
    const current = structuredClone(after.moves.find((m) => m.id === old.id)!);
    const ranges = JSON.parse(
      readFileSync("data/adoption-decisions.json", "utf8"),
    ).distanceRanges.decisions;
    for (const d of ranges.filter(
      (d: any) =>
        d.moveId === (current.strengthExpansion?.sourceMoveId || current.id),
    )) {
      if (
        !isDeepStrictEqual(
          current.frames[d.field as keyof typeof current.frames],
          d.value,
        )
      )
        throw new Error(`Unexpected distance range: ${current.id}`);
      (current.frames as any)[d.field] = d.before;
    }
    const projected = researchBefore.moves.find((m) => m.id === old.id)!;
    if (!isDeepStrictEqual(current, projected))
      changed.push({ id: old.id, before: old, after: current });
  }
  for (const m of after.moves.filter(
    (m) => m.representativeCondition && m.input.strength !== "none",
  ))
    questions.push({
      characterId: after.id,
      moveId: m.id,
      input: m.input,
      frames: m.frames,
      condition: m.representativeCondition,
      normal: resolveMove(after, m.input, "normal").status,
      hard: resolveMove(after, m.input, "startup").status,
    });
}
const allowed = new Set([
  ...policy.selections.map((s: any) => s.moveId),
  policy.excludedMoveId,
]);
if (changed.some((m) => !allowed.has(m.id)) || changed.length !== allowed.size)
  throw new Error("Unexpected changed original records");
const report = {
  beforeCount,
  afterCount,
  changedOriginalRecords: changed.length,
  newRecords: afterCount - beforeCount,
  questions,
  changed,
};
mkdirSync("staging/conditional-specials", { recursive: true });
writeFileSync(
  "staging/conditional-specials/audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    beforeCount,
    afterCount,
    changed: changed.length,
    questions: questions.length,
    normalFound: questions.filter((q) => q.normal === "found").length,
  }),
);
