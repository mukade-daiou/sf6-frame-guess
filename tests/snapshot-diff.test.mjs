import test from "node:test";
import assert from "node:assert/strict";
import {
  diffSnapshots,
  verifySnapshotDiff,
} from "../scripts/lib/snapshot-diff.mjs";

const baseline = () => [
  {
    id: "a",
    coverage: "complete",
    moves: [
      {
        id: "m",
        frames: { startup: { numeric: 5, display: "5" } },
        adoption: { status: "accepted" },
      },
      { id: "n", frames: { startup: null } },
    ],
  },
];
const approval = {
  characterId: "a",
  moveId: "m",
  path: ["frames", "startup", "numeric"],
  kind: "change",
  before: 5,
  after: 6,
};
test("exact approvals protect fields and do not mutate inputs", () => {
  const before = baseline(),
    after = baseline();
  after[0].moves[0].frames.startup.numeric = 6;
  const saved = structuredClone([before, after, approval]);
  assert.equal(verifySnapshotDiff(before, after, [approval]).ok, true);
  assert.equal(verifySnapshotDiff(before, after).ok, false);
  assert.equal(
    verifySnapshotDiff(before, after, [{ ...approval, before: 4 }]).mismatched
      .length,
    1,
  );
  assert.equal(
    verifySnapshotDiff(before, after, [{ ...approval, after: 7 }]).mismatched
      .length,
    1,
  );
  assert.equal(verifySnapshotDiff(before, before, [approval]).unused.length, 1);
  assert.deepEqual([before, after, approval], saved);
});
for (const [name, mutate] of Object.entries({
  frame: (a) => {
    a[0].moves[0].frames.startup.display = "99";
  },
  adoption: (a) => {
    a[0].moves[0].adoption.status = "held";
  },
  metadata: (a) => {
    a[0].coverage = "partial";
  },
  addMove: (a) => {
    a[0].moves.push({ id: "new", frames: {} });
  },
  removeMove: (a) => {
    a[0].moves.pop();
  },
  addCharacter: (a) => {
    a.push({ id: "new", moves: [] });
  },
  removeCharacter: (a) => {
    a.pop();
  },
  addField: (a) => {
    a[0].moves[0].note = null;
  },
  removeField: (a) => {
    delete a[0].moves[0].frames;
  },
}))
  test(`detects unauthorized ${name} even alongside an approved change`, () => {
    const before = baseline(),
      after = baseline();
    after[0].moves[0].frames.startup.numeric = 6;
    const projected = structuredClone(after);
    mutate(after);
    // Preserve the rejection boundary of the former whole-object comparison.
    assert.throws(() => assert.deepEqual(after, projected));
    assert.equal(verifySnapshotDiff(before, after, [approval]).ok, false);
    const exact = diffSnapshots(before, after);
    assert.equal(verifySnapshotDiff(before, after, exact).ok, true);
  });
test("rejects duplicate IDs, duplicate and malformed approvals", () => {
  for (const duplicate of [
    (a) => a.push(a[0]),
    (a) => a[0].moves.push(a[0].moves[0]),
  ]) {
    const a = baseline();
    duplicate(a);
    assert.throws(() => diffSnapshots([], a), /duplicate ID/);
  }
  assert.throws(
    () => verifySnapshotDiff([], [], [approval, approval]),
    /Duplicate approval/,
  );
  assert.throws(
    () => verifySnapshotDiff([], [], [{ ...approval, path: "frames" }]),
    /Invalid approval/,
  );
});
test("matches IDs regardless of roster and move order or roster size", () => {
  const a = [...baseline(), { id: "b", moves: [] }],
    b = structuredClone(a).reverse();
  b[1].moves.reverse();
  assert.deepEqual(diffSnapshots(a, b), []);
  assert.equal(verifySnapshotDiff([], []).ok, true);
});
