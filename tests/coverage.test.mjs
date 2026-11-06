import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
test("source inventory is checked independently from generic historical exclusions", () => {
  const repairs = JSON.parse(
    execFileSync(
      "node_modules/.bin/tsx",
      ["scripts/repair-source-coverage.ts"],
      { encoding: "utf8" },
    ),
  ).additions;
  assert.equal(repairs.length, 20);
  for (const repair of repairs) {
    const snapshot = read(`data/characters/${repair.characterId}.json`);
    assert.deepEqual(
      snapshot.moves.find((m) => m.id === repair.moveId).frames,
      repair.frames,
    );
  }
  execFileSync("node_modules/.bin/tsx", [
    "scripts/audit-source-coverage.ts",
    "--check",
  ]);
  const audit = read("staging/coverage-audit/review.json");
  assert.equal(audit.characters.length, 32);
  assert.equal(
    audit.characters.reduce((n, c) => n + c.sourceRows, 0),
    2442,
  );
  for (const c of audit.characters) {
    const snapshot = read(`data/characters/${c.id}.json`);
    assert.equal(
      snapshot.coverage.special.status,
      c.sourceInventoryComplete ? "complete" : "partial",
    );
    for (const row of c.rows) {
      for (const id of row.moveIds)
        assert.ok(
          snapshot.moves.some((m) => m.id === id),
          `Missing mapped source move: ${c.id}/${id}`,
        );
      if (
        ["recorded", "recorded_ui_unsupported", "held"].includes(
          row.classification,
        )
      )
        assert.ok(row.moveIds.length);
      if (["unresolved", "input_unsupported"].includes(row.classification))
        assert.equal(c.sourceInventoryComplete, false);
    }
    const spd = c.rows.filter((r) => /^360\+/.test(r.input));
    if (["zangief", "lily"].includes(c.id)) {
      assert.equal(spd.length, 4);
      assert.ok(
        spd.every(
          (r) => r.classification === "recorded" && r.moveIds.length === 1,
        ),
      );
    }
  }
});
