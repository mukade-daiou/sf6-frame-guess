import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const read = (p) => readFileSync(p, "utf8");
const path = "staging/sf6-frame-data-stage8/review.json";
test("all 63 candidates have named counterparts without certifying patch or input pairs", () => {
  const r = JSON.parse(read(path));
  assert.equal(r.productionEligible, 0);
  assert.equal(r.patchConfirmed, false);
  assert.equal(r.candidatesChanged, false);
  assert.deepEqual(
    r.characters.map((c) => [
      c.recorded,
      c.counterpartMatches,
      c.normalKeys,
      c.sourceSpecialRows,
    ]),
    [
      [33, 33, 12, 34],
      [30, 30, 12, 32],
    ],
  );
  for (const c of r.characters) {
    assert.deepEqual(c.duplicateKeys, []);
    assert.equal(c.sourceRowsClassified, true);
    for (const m of c.moves) {
      assert.equal(m.patchConsistency, "unverified");
      assert.ok(m.totalComparison.startsWith("not_compared"));
      if (m.input.strength === "OD" || m.sourceInput === "KK")
        assert.ok(
          m.requiredEvidence.some(
            (e) => e.fact === "low_medium_pair_performance",
          ),
        );
    }
  }
});
test("audit is reproducible and cannot overwrite previous-stage candidates", () => {
  const paths = [
    "staging/sf6-frame-data-stage7/review.json",
    "staging/sf6-frame-data-stage7/characters/ken.json",
    "staging/sf6-frame-data-stage7/characters/marisa.json",
    "staging/sf6-frame-data-release/readiness.json",
  ];
  const before = paths.map(read),
    report = read(path);
  execFileSync("node_modules/.bin/tsx", ["scripts/audit-stage8.ts"]);
  assert.deepEqual(paths.map(read), before);
  assert.equal(read(path), report);
});
