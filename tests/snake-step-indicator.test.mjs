import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
test("weak Snake Step retains total while removing total-as-startup", () => {
  const c = read("data/characters/aki.json");
  const m = c.moves.find((x) => x.id === "aki__special_236_K_L");
  const d = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions[0];
  const cargo = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
  const official = read(d.officialPath).rows.find((r) => r.row === 44);
  assert.equal(cargo.startup, "37 total");
  assert.equal(cargo.total, "37");
  assert.equal(official.startup, "");
  assert.equal(official.recovery, "全体 37");
  assert.deepEqual(m.frames.startup, { status: "not_applicable", display: "-" });
  assert.equal(m.frames.total.display, "37");
  assert.deepEqual(restoreCompoundStartup(c).moves.find((x) => x.id === m.id).frames.startup, d.before);
  m.frames.startup.display = "99";
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized compound startup/);
});

test("each strength is an individually evidenced total-time correction", () => {
  const c = read("data/characters/aki.json");
  const decisions = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.filter((d) => d.characterId === "aki");
  assert.deepEqual(decisions.map((d) => d.moveId).sort(), ["aki__special_236_K_H", "aki__special_236_K_L", "aki__special_236_K_M", "aki__special_236_K_OD"]);
  for (const d of decisions) {
    const m = c.moves.find((x) => x.id === d.moveId);
    const cargo = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
    const official = read(d.officialPath).rows.find((r) => r.row === d.officialRows[0]);
    assert.equal(cargo.input, d.sourceInput);
    assert.equal(cargo.startup, d.sourceNotation);
    assert.equal(official.startup, "");
    assert.match(official.recovery, new RegExp(`\\b${d.before.numeric}\\b`));
    assert.equal(m.frames.total.numeric, d.before.numeric);
    assert.deepEqual(m.frames.startup, d.value);
    if (d.moveId.endsWith("_OD")) assert.match(cargo.notes, /Same-side version: 42f total animation/);
    else assert.match(cargo.startup, /total/);
  }
});
