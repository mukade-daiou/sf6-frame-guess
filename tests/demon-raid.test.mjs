import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("no-input automatic slash changes only its five source/strength records", () => {
  const policy = JSON.parse(readFileSync("data/adoption-decisions.json"));
  let changed = 0;
  for (const file of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${file}`,
      expected = JSON.parse(execFileSync("git", ["show", `69c2241:${path}`])),
      actual = JSON.parse(readFileSync(path));
    for (const m of expected.moves) {
      for (const r of policy.frameResearch.representatives)
        if (m.id === r.moveId) m.frames[r.field] = r.value;
      const d = policy.demonRaidNoInput.records.find(
        (d) => d.moveId === (m.strengthExpansion?.sourceMoveId || m.id),
      );
      if (d) {
        assert.deepEqual(m.frames, d.before);
        m.frames = d.frames;
        changed++;
        assert.deepEqual(
          [
            m.frames.startup.display,
            m.frames.total.display,
            m.frames.hit.display,
            m.frames.block.display,
          ],
          ["53", "75", "D", "+2"],
        );
      }
    }
    assert.deepEqual(actual, expected);
  }
  assert.equal(changed, 5);
});
