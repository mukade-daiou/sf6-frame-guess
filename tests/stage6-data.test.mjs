import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("stage6 regeneration is deterministic and preserves previous stages", () => {
  const oldPaths = [
    "staging/sf6-frame-data-release/readiness.json",
    "staging/sf6-frame-data-stage5/review.json",
  ];
  const newPaths = [
    "review.json",
    "review-policy.json",
    "characters/ken.json",
    "characters/marisa.json",
  ].map((p) => `staging/sf6-frame-data-stage6/${p}`);
  const read = (paths) => paths.map((p) => readFileSync(p, "utf8"));
  const old = read(oldPaths),
    before = read(newPaths);
  execFileSync("node_modules/.bin/tsx", ["scripts/build-stage6.ts"]);
  assert.deepEqual(read(newPaths), before);
  assert.deepEqual(read(oldPaths), old);
  assert.equal(JSON.parse(old[0]).summary.candidates, 860);
  assert.equal(
    JSON.parse(old[1]).characters.reduce((sum, c) => sum + c.moves.length, 0),
    62,
  );
});
test("production artifacts exclude development data and its opt-in control", () => {
  const files = readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
  assert.ok(files.length);
  for (const file of files) {
    const body = readFileSync(`dist/assets/${file}`, "utf8");
    assert.doesNotMatch(
      body,
      /ken_quick_dash_simultaneous|未検証の実データで試遊|stage6\/characters/,
    );
  }
});
