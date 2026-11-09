import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
test("production bundle excludes synthetic fixture data and source maps", () => {
  const files = readdirSync("dist/assets");
  assert.ok(files.some((f) => f.endsWith(".js")));
  assert.ok(!files.some((f) => f.endsWith(".map")));
  for (const f of files.filter((f) => f.endsWith(".js")))
    assert.ok(
      !readFileSync(`dist/assets/${f}`, "utf8").includes("fixture-v1-NOT-SF6"),
    );
});
