import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { restoreCompoundStartup } from "../scripts/compound-startup-projection.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
test("four approved fields are the only changes from the published baseline", () => {
  const policy = read("data/adoption-decisions.json");
  const ds = [...policy.whiffTotalCorrections.additionalDecisions, ...policy.userConfirmedFrames.decisions];
  assert.deepEqual(ds.map((d) => [d.moveId, d.field, d.before.display, d.value.display]), [["arjun__special_236_P_H", "total", "50", "53"], ["arjun__special_236_P_OD", "total", "45", "48"], ["ryu__special_623_P_H", "block", "-39", "-36"], ["alex__normal_5_P_M", "total", "24", "27"]]);
  let records = 0, changed = 0;
  for (const file of readdirSync("data/characters").filter((f) => f.endsWith(".json"))) {
    const path = `data/characters/${file}`;
    const before = JSON.parse(execFileSync("git", ["show", `148d6dabf0792b4477051a3f9034a6007b075ed3:${path}`]));
    records += before.moves.length;
    for (const d of ds.filter((x) => x.characterId === before.id)) {
      const move = before.moves.find((m) => m.id === d.moveId);
      assert(move);
      assert.deepEqual(move.frames[d.field], d.before);
      assert.deepEqual(move.input, d.input);
      move.frames[d.field] = d.value;
      changed++;
    }
    assert.deepEqual(read(path), before);
  }
  assert.equal(records, 1298);
  assert.equal(changed, 4);
  for (const d of policy.userConfirmedFrames.unchangedConfirmations) {
    const m = read(`data/characters/${d.characterId}.json`).moves.find((x) => x.id === d.moveId);
    assert.equal(m.frames[d.field].display, d.reportedValue);
  }
});
test("user-confirmed frames are protected by historical projection", () => {
  for (const [id, moveId, field] of [["ryu", "ryu__special_623_P_H", "block"], ["alex", "alex__normal_5_P_M", "total"]]) {
    const c = read(`data/characters/${id}.json`);
    c.moves.find((m) => m.id === moveId).frames[field].numeric = 999;
    assert.throws(() => restoreCompoundStartup(c), /Unauthorized user-confirmed frame/);
  }
});
test("saved official comparison moves only two prior mismatches to matches", () => {
  const old = read("staging/official-reevaluation/results-after-sa3.json");
  const actual = read("staging/official-reevaluation/results-after-user-verification.json");
  const indexed = new Map(old.map((r) => [`${r.characterId}/${r.moveId}`, r]));
  let changes = [], counts = {};
  assert.equal(actual.length, 1283);
  for (const r of actual) {
    const previous = indexed.get(`${r.characterId}/${r.moveId}`);
    assert(previous);
    for (const [field, value] of Object.entries(r.fields)) {
      counts[value.status] = (counts[value.status] || 0) + 1;
      if (previous.fields[field].status !== value.status) changes.push([r.moveId, field, previous.fields[field].status, value.status]);
    }
  }
  assert.deepEqual(counts, { 一致: 4459, 確認不能: 570, 条件違い: 42, 不一致: 61 });
  assert.deepEqual(changes, [["alex__normal_5_P_M", "total", "不一致", "一致"], ["ryu__special_623_P_H", "block", "不一致", "一致"]]);
  for (const [id, field, local] of [["yasmine__special_214_P_M", "hit", "+2"], ["rashid__special_236_P_OD", "block", "-53"], ["arjun__special_236_P_H", "total", "53"], ["arjun__special_236_P_OD", "total", "48"]]) {
    const r = actual.find((x) => x.moveId === id);
    assert.equal(r.fields[field].status, "不一致");
    assert.equal(r.fields[field].local, local);
  }
});
