import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "./research-projection.mjs";
test("contact rollback changes only the 89 authorized fields and preserves all move attributes", () => {
  const p = JSON.parse(readFileSync("data/adoption-decisions.json")),
    r = p.distanceRanges.contactTimingRollback;
  let changed = 0,
    ranges = 0,
    records = 0,
    sa = 0;
  assert.equal(
    readdirSync("data/characters").filter((f) => f.endsWith(".json")).length,
    32,
  );
  assert.equal(r.revoked.length, 77);
  assert.equal(r.candidates.filter((c) => c.before === "held").length, 47);
  for (const d of r.revoked) {
    const historical = p.distanceRanges.decisions.find(
      (x) => x.moveId === d.moveId && x.field === d.field,
    );
    assert.ok(historical);
    assert.deepEqual(d.before, historical.value);
    assert.deepEqual(d.value, historical.before);
    assert.ok(["hit", "block"].includes(d.field));
  }
  for (const f of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${f}`,
      before = JSON.parse(
        execFileSync("git", ["show", `${r.baselineCommit}:${path}`]),
      ),
      after = restoreCompoundStartup(JSON.parse(readFileSync(path)));
    for (const m of before.moves) {
      records++;
      if (m.category === "super_art") sa++;
      for (const d of r.revoked.filter(
        (d) =>
          d.characterId === before.id &&
          d.moveId === (m.strengthExpansion?.sourceMoveId || m.id),
      )) {
        assert.deepEqual(m.frames[d.field], d.before);
        m.frames[d.field] = d.value;
        changed++;
      }
    }
    assert.deepEqual(after, before);
    for (const m of after.moves)
      for (const [field, v] of Object.entries(m.frames))
        if (v.range || v.openRange) {
          ranges++;
          assert.equal(field, "startup");
        }
  }
  assert.equal(changed, 89);
  assert.equal(ranges, 9);
  assert.equal(records, 1298);
  assert.equal(sa, 288);
  const l = JSON.parse(readFileSync("staging/distance-range-candidates.json"));
  assert.deepEqual(
    ["accepted", "held", "excluded"].map(
      (s) =>
        l.candidates.filter((c) => c.moveIds.length && c.classification === s)
          .length,
    ),
    [4, 108, 625],
  );
});
