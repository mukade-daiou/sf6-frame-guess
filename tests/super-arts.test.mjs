import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("SA source mapping, 288 inputs and all original 908 records survive regeneration", () => {
  execFileSync("node_modules/.bin/tsx", [
    "scripts/audit-super-arts.ts",
    "--check",
  ]);
  const audit = JSON.parse(
    readFileSync("staging/sa-integration/coverage.json", "utf8"),
  );
  assert.equal(audit.characters.length, 32);
  assert.equal(audit.baseSlots, 96);
  assert.equal(audit.inputRecords, 288);
  assert.equal(audit.sourceRows.length, 199);
  assert.equal(
    audit.sourceRows.filter((r) => r.classification === "excluded").length,
    98,
  );
  assert.equal(audit.originalRecordsPreserved, true);
});
