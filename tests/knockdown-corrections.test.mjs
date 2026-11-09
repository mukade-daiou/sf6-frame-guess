import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("only the 17 sourced KD corrections and their generated strengths change", () => {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json"),
  ).knockdownCorrections;
  assert.equal(policy.decisions.length, 17);
  const ledger = JSON.parse(readFileSync("staging/stage17/frame-ledger.json"));
  assert.deepEqual(
    policy.decisions,
    ledger.knownValueConflicts.map((x) => ({
      characterId: x.characterId,
      moveId: x.moveId,
      field: "hit",
      before: x.current,
      sourceNotation: x.sourceNotation,
      value: { status: "confirmed", display: "D" },
    })),
  );
  let count = 0,
    changed = 0;
  for (const f of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${f}`,
      before = JSON.parse(execFileSync("git", ["show", `f199046:${path}`])),
      after = JSON.parse(readFileSync(path));
    const expected = structuredClone(before);
    for (const m of expected.moves) {
      count++;
      const id = m.strengthExpansion?.sourceMoveId || m.id;
      const d = policy.decisions.find(
        (d) => d.characterId === before.id && d.moveId === id,
      );
      if (d) {
        assert.deepEqual(m.frames.hit, d.before);
        m.frames.hit = { status: "confirmed", display: "D" };
        changed++;
      }
    }
    assert.deepEqual(after, expected);
  }
  assert.equal(count, 1298);
  assert.equal(changed, 23);
});
