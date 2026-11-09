import { readFileSync, writeFileSync } from "node:fs";
import { applyHeldReviews } from "./held-range-review.mjs";
import { candidateKey } from "./contact-timing-policy.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8")),
  save = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const p = read("data/adoption-decisions.json"),
  r = read("staging/held-range-review.json"),
  l = read("staging/distance-range-candidates.json");
const old = p.distanceRanges.contactTimingRollback;
const revoked = p.distanceRanges.decisions
  .filter((d) => d.field !== "startup")
  .map((d) => ({
    characterId: d.characterId,
    moveId: d.moveId,
    field: d.field,
    before: d.value,
    value: d.before,
    sourcePath: d.sourcePath,
    sourceIndex: d.sourceIndex,
    reason:
      "仕様変更：接触・後半持続によるヒット/ガード硬直差を範囲化しない。到達時間と接触の根拠が混在する場合も元の代表値を維持。",
  }));
const candidates =
  old?.candidates ??
  l.candidates
    .filter(
      (c) =>
        c.moveIds.length &&
        ((c.classification === "accepted" && c.field !== "startup") ||
          (c.classification === "held" &&
            r.stage3.items.find((x) => x.key === candidateKey(c))?.group ===
              "D")),
    )
    .map((c) => ({
      key: candidateKey(c),
      before: c.classification,
      reason:
        c.classification === "accepted"
          ? "採用撤回：接触タイミングによる硬直差は範囲化対象外。元の代表値へ戻す。"
          : "持続当ての端点待ちだった項目。新基準では範囲化対象外。本番値・技の採用状態は維持。",
    }));
p.distanceRanges.contactTimingRollback = {
  baselineCommit: "0e8606004c0f2c85366da51d7c9a1dabeb523ce9",
  revoked,
  candidates,
};
p.datasetId = "arrival-startup-only-2026-11-09-r1";
r.contactTimingRollback = p.distanceRanges.contactTimingRollback;
save("data/adoption-decisions.json", p);
save("staging/held-range-review.json", r);
applyHeldReviews(l.candidates, r);
save("staging/distance-range-candidates.json", l);
console.log({ revoked: revoked.length, candidates: candidates.length });
