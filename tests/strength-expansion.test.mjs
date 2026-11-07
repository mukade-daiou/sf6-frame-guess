import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("strength expansion preserves all pre-existing records, coverage and is reproducible", () => {
  execFileSync("node_modules/.bin/tsx", [
    "scripts/audit-strength-expansion.ts",
    "--check",
  ]);
  const { summary, rows } = JSON.parse(
    readFileSync("staging/strength-expansion/audit.json", "utf8"),
  );
  assert.equal(summary.generatedOD, 0);
  assert.equal(summary.characters, 32);
  assert.equal(
    summary.generatedInputs,
    rows
      .filter((r) => r.classification === "expandable")
      .flatMap((r) => r.strengths)
      .filter((s) => !s.explicitMoveIds.length).length,
  );
  assert.equal(
    summary.totalRecords,
    summary.originalRecordsVerified + summary.generatedInputs,
  );
});
