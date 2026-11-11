import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
test("weak non-held Sun Flare uses the evidenced effect time", () => {
  const c = read("data/characters/ingrid.json");
  const m = c.moves.find((x) => x.id === "ingrid__coverage_6");
  const d = read("data/adoption-decisions.json").compoundStartup.indicatorDecisions.find((x) => x.moveId === m.id);
  const cargo = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
  const official = read(d.officialPath).rows.find((r) => r.row === d.officialRows[0]);
  assert.equal(cargo.input, "214LP (HOLD OK)");
  assert.match(cargo.notes, /Lv\.1 \(unheld version\): 48F total, stock is built on frame 47/);
  assert.equal(official.startup, "");
  assert.match(official.notes, /47F目にサンシンボルストックが1増加/);
  assert.equal(m.frames.total.numeric, 48);
  assert.deepEqual(m.frames.startup, { status: "confirmed", display: "47", numeric: 47 });
  assert.deepEqual(restoreCompoundStartup(c).moves.find((x) => x.id === m.id).frames.startup, d.before);
  m.frames.startup.numeric = 48;
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized compound startup/);
});
