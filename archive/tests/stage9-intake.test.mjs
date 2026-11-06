import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
const base = "archive/staging/sf6-frame-data-stage9";
test("preparation preserves candidate data and manual submission", () => {
  const source = "archive/staging/sf6-frame-data-stage7/characters/ken.json";
  const before = readFileSync(source, "utf8"),
    manual = readFileSync(`${base}/submission.json`, "utf8");
  execFileSync("node_modules/.bin/tsx", ["archive/scripts/prepare-stage9.ts"]);
  assert.equal(readFileSync(source, "utf8"), before);
  assert.equal(readFileSync(`${base}/submission.json`, "utf8"), manual);
  const plan = JSON.parse(readFileSync(`${base}/plan.json`, "utf8"));
  assert.equal(plan.moves.length, 63);
  assert.equal(plan.moves.filter((m) => m.requiredPair).length, 11);
  assert.ok(plan.moves.every((m) => m.gameStatus.battleVersion === "pending"));
});
test("intake blocks version mismatches, missing evidence, unsafe paths and wrong pairs", () => {
  const dir = mkdtempSync(join(tmpdir(), "sf6-stage9-"));
  const run = (value) => {
    const input = join(dir, "submission.json");
    writeFileSync(input, JSON.stringify(value));
    const r = spawnSync(
      "node_modules/.bin/tsx",
      ["archive/scripts/check-stage9-submission.ts", input],
      { encoding: "utf8" },
    );
    return { code: r.status, result: r.stdout ? JSON.parse(r.stdout) : null };
  };
  try {
    const empty = run({ sessions: [], observations: [], coverage: [] });
    assert.equal(empty.code, 0);
    assert.equal(empty.result.versionGate, "pending");
    assert.equal(empty.result.canPromote, false);
    const session = {
      id: "ken-session",
      battleVersion: "2.0500.000",
      versionLabel: "Battle Version",
      versionMeaning: "battle_version",
      capturedAt: "2026-11-06T00:00:00Z",
      evidence: [{ file: "missing.png", locator: "whole image" }],
    };
    const mismatch = run({
      sessions: [session],
      observations: [],
      coverage: [],
    });
    assert.equal(mismatch.code, 1);
    assert.ok(
      mismatch.result.issues.some((s) => s.startsWith("version mismatch")),
    );
    const traversal = run({
      sessions: [
        {
          ...session,
          battleVersion: "2.0500.001",
          evidence: [{ file: "../plan.json", locator: "image" }],
        },
      ],
      observations: [],
      coverage: [],
    });
    assert.ok(
      traversal.result.issues.some((s) => s.startsWith("unsafe evidence")),
    );
    const unknown = { status: "unknown", display: null };
    const pair = run({
      sessions: [{ ...session, battleVersion: "2.0500.001" }],
      observations: [
        {
          moveId: "ken__special_236_P_OD",
          observedName: "OD Hadoken (test only)",
          sessionId: session.id,
          inputPair: "LK+MK",
          standardConfirmed: true,
          frames: {
            startup: unknown,
            total: unknown,
            hit: unknown,
            block: unknown,
          },
          evidence: session.evidence,
          notes: "test only",
        },
      ],
      coverage: [],
    });
    assert.ok(
      pair.result.issues.some((s) => s.startsWith("input pair mismatch")),
    );
    assert.ok(pair.result.issues.some((s) => s.startsWith("missing evidence")));
    assert.equal(pair.result.canPromote, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
