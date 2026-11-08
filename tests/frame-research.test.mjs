import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

test("every stage17 change is an evidenced unknown field and all 1298 records remain protected", () => {
  execFileSync("node_modules/.bin/tsx", [
    "scripts/research-missing-frames.ts",
    "--check",
  ]);
  const ledger = JSON.parse(
    readFileSync("staging/stage17/frame-ledger.json", "utf8"),
  );
  assert.deepEqual(
    [
      ledger.before.unknownRecords,
      ledger.before.unknownFields,
      ledger.before.deduplicatedFieldTargets,
    ],
    [47, 56, 32],
  );
  assert.equal(ledger.targets.length, ledger.before.deduplicatedFieldTargets);
  assert.equal(ledger.sources.length, ledger.before.deduplicatedSourceRecords);
  assert.equal(
    ledger.targets.reduce((n, t) => n + t.recordIds.length, 0),
    ledger.before.unknownFields,
  );
  assert.ok(ledger.targets.every((t) => t.before.status === "unknown"));
  assert.equal(ledger.after.records, ledger.before.records);
  assert.equal(ledger.after.saInputs, 288);
  assert.equal(ledger.after.saUnknownInputs, 0);
  assert.ok(ledger.after.unknownFields < ledger.before.unknownFields);
  for (const t of ledger.targets.filter((t) => t.decision === "retain_unknown"))
    assert.deepEqual(t.value, t.before);
});
