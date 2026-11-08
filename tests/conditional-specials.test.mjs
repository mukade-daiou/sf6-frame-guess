import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("only approved conditional adoptions differ from the previous snapshot", () => {
  execFileSync("node_modules/.bin/tsx", [
    "scripts/audit-conditional-specials.ts",
  ]);
  const r = JSON.parse(
    readFileSync("staging/conditional-specials/audit.json", "utf8"),
  );
  assert.equal(r.changedOriginalRecords, 21);
  assert.equal(r.questions.length, 24);
  assert.ok(
    r.questions.every((q) => q.normal === "found" && q.hard === "found"),
  );
  assert.equal(r.afterCount - r.beforeCount, r.newRecords);
});
