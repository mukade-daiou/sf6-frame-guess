import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const baselineRef = "4c2a26a276dff2ecddb13f2cc2c198190081e4a0";
test("compound corrections preserve every other production field", () => {
  const decisions = read("data/adoption-decisions.json").compoundStartup.decisions;
  assert.deepEqual(decisions.map((d) => [d.moveId, d.before.display, d.value.display]).sort(), [
    ["ed__special_236_K_H", "12", "17"],
    ["ed__special_236_K_L", "11", "16"],
    ["ed__special_236_K_M", "15", "20"],
    ["jp__special_236_K_H", "14", "26~"],
    ["jp__special_236_K_L", "14", "22~"],
    ["jp__special_236_K_M", "14", "26~"],
    ["rashid__special_236_K_none", "11", "17"],
  ]);
  let changed = 0;
  for (const id of ["ed", "jp", "rashid"]) {
    const path = `data/characters/${id}.json`;
    const before = JSON.parse(execFileSync("git", ["show", `${baselineRef}:${path}`]));
    const after = read(path);
    for (const move of before.moves) {
      const total = read("data/adoption-decisions.json").whiffTotalCorrections.decisions.find((x) => x.characterId === id && x.moveId === move.id);
      if (total) { assert.deepEqual(move.frames.total, total.before); move.frames.total = total.value; }
      const kd = read("data/adoption-decisions.json").kdHkdCorrections.decisions.find((x) => x.characterId === id && x.moveId === move.id);
      if (kd) {
        assert.deepEqual(move.frames.hit, kd.before);
        move.frames.hit = kd.value;
      }
      const d = decisions.find((x) => x.characterId === id && x.moveId === (move.strengthExpansion?.sourceMoveId || move.id));
      if (!d) continue;
      assert.deepEqual(move.frames.startup, d.before);
      move.frames.startup = d.value;
      changed++;
    }
    assert.deepEqual(after, before);
  }
  assert.equal(changed, 10);
  assert.equal(read("data/characters/rashid.json").moves.find((m) => m.id === "rashid__special_236_K_OD").frames.startup.numeric, 17);
  assert.equal(read("data/characters/blanka.json").moves.find((m) => m.id === "blanka__special_22_P_none").frames.startup.numeric, 39);
  for (const d of decisions.filter((x) => x.characterId === "jp")) {
    assert.equal(d.value.openRange.unspecified, "trailing");
    assert.equal(d.value.openRange.reference, Number(d.value.display.slice(0, -1)));
    assert.equal(d.value.range, undefined);
  }
});

test("historical projection rejects unauthorized changes", () => {
  const c = read("data/characters/ed.json");
  c.moves.find((m) => m.id === "ed__special_236_K_L").frames.startup.numeric = 99;
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized compound startup/);
  const other = read("data/characters/ed.json");
  other.moves.find((m) => m.id === "ed__special_236_K_L").frames.total.display = "999";
  const baseline = JSON.parse(execFileSync("git", ["show", `${baselineRef}:data/characters/ed.json`]));
  assert.notDeepEqual(restoreCompoundStartup(other), baseline);
});
