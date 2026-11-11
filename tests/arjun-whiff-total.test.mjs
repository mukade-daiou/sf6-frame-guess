import { applyUserConfirmedToBaseline } from "./helpers/apply-user-confirmed.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
test("only two whiff totals change from the fixed published baseline", () => {
  const ds = read("data/adoption-decisions.json").whiffTotalCorrections.additionalDecisions;
  assert.deepEqual(ds.map((d) => [d.moveId, d.before.display, d.value.display]), [["arjun__special_236_P_H", "50", "53"], ["arjun__special_236_P_OD", "45", "48"]]);
  let records = 0, changed = 0;
  for (const f of readdirSync("data/characters").filter((x) => x.endsWith(".json"))) {
    const path = `data/characters/${f}`;
    const before = JSON.parse(execFileSync("git", ["show", `148d6dabf0792b4477051a3f9034a6007b075ed3:${path}`]));
    records += before.moves.length;
    for (const m of before.moves) {
      const d = ds.find((x) => x.characterId === before.id && x.moveId === m.id);
      if (!d) continue;
      assert.deepEqual(m.frames.total, d.before);
      const row = read(d.sourcePath).data.cargoquery[d.sourceIndex].title;
      assert.equal(row.input, d.sourceInput);
      assert.equal(row.total, `${d.before.display}(${d.value.display})`);
      assert.match(row.notes, /3f extra recovery on whiff/);
      m.frames.total = d.value;
      changed++;
    }
    applyUserConfirmedToBaseline(before);
    assert.deepEqual(read(path), before);
  }
  assert.equal(records, 1298);
  assert.equal(changed, 2);
});
test("historical projection rejects unauthorized whiff totals", () => {
  const c = read("data/characters/arjun.json");
  c.moves.find((m) => m.id === "arjun__special_236_P_H").frames.total.numeric = 54;
  assert.throws(() => restoreCompoundStartup(c), /Unauthorized whiff total/);
});
