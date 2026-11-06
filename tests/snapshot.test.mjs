import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("initial adopted snapshot is reproducible and preserves all previous candidates", () => {
  const current = [
    "data/metadata.json",
    "data/characters/ken.json",
    "data/characters/marisa.json",
  ];
  const old = [
    "archive/staging/sf6-frame-data-release/readiness.json",
    "archive/staging/sf6-frame-data-stage7/review.json",
    "archive/staging/sf6-frame-data-stage8/review.json",
    "archive/staging/sf6-frame-data-stage9/submission.json",
  ];
  const read = (ps) => ps.map((p) => readFileSync(p, "utf8"));
  const before = read(current),
    prior = read(old);
  execFileSync("node_modules/.bin/tsx", [
    "scripts/build-snapshot.ts",
    "--write",
  ]);
  assert.deepEqual(read(current), before);
  assert.deepEqual(read(old), prior);
  assert.equal(JSON.parse(prior[0]).summary.candidates, 860);
  assert.equal(JSON.parse(before[0]).updatePolicy, "manual");
  for (const text of before.slice(1)) {
    const c = JSON.parse(text);
    assert.equal(c.source.verification, "unverified");
    assert.equal(c.adoption.status, "accepted");
  }
});
