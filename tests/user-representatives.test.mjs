import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreDemonRaid } from "./research-projection.mjs";
test("only the three user-approved representative fields change", () => {
  const decisions = JSON.parse(readFileSync("data/adoption-decisions.json"))
    .frameResearch.representatives;
  assert.equal(decisions.length, 3);
  let changed = 0;
  for (const file of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${file}`,
      before = JSON.parse(execFileSync("git", ["show", `69c2241:${path}`])),
      after = restoreDemonRaid(JSON.parse(readFileSync(path)));
    for (const d of decisions) {
      const m = before.moves.find((m) => m.id === d.moveId);
      if (m) {
        assert.equal(m.frames[d.field].status, "unknown");
        m.frames[d.field] = d.value;
        changed++;
      }
    }
    assert.deepEqual(after, before);
  }
  assert.equal(changed, 3);
});
