import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("stage7 is reproducible and preserves the previous candidate datasets", () => {
  const root = "archive/staging/sf6-frame-data-stage7/";
  const outputs = [
    "review.json",
    "review-policy.json",
    "characters/ken.json",
    "characters/marisa.json",
  ].map((p) => root + p);
  const preserved = [
    "archive/staging/sf6-frame-data-release/readiness.json",
    "archive/staging/sf6-frame-data-stage5/review.json",
    "archive/staging/sf6-frame-data-stage6/review.json",
    ...readdirSync("staging/candidates").map(
      (p) => "staging/candidates/" + p,
    ),
  ];
  const read = (paths) => paths.map((p) => readFileSync(p, "utf8"));
  const before = read(outputs),
    old = read(preserved);
  execFileSync("node_modules/.bin/tsx", ["archive/scripts/build-stage7.ts"]);
  assert.deepEqual(read(outputs), before);
  assert.deepEqual(read(preserved), old);
  const review = JSON.parse(before[0]);
  assert.equal(review.productionEligible, 0);
  assert.equal(review.updatePolicy, "frozen_until_explicit_user_update");
});
test("normal production bundle excludes Stage 7 candidate records", () => {
  const files = readdirSync("dist/assets").filter((p) => p.endsWith(".js"));
  assert.ok(files.length);
  for (const p of files)
    assert.doesNotMatch(
      readFileSync("dist/assets/" + p, "utf8"),
      /stage7\/characters|未検証の実データで試遊/,
    );
});
