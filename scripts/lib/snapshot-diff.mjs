import { isDeepStrictEqual } from "node:util";

// JSON snapshots: array order is significant except for characters and moves.
function index(rows, label) {
  if (!Array.isArray(rows)) throw new Error(`${label}: expected array`);
  const result = new Map();
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || !row.id || result.has(row.id))
      throw new Error(`${label}: missing or duplicate ID ${row?.id}`);
    result.set(row.id, row);
  }
  return result;
}

function fields(before, after, path, emit) {
  if (isDeepStrictEqual(before, after)) return;
  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    for (const key of [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].sort())
      fields(before[key], after[key], [...path, key], emit);
  } else emit(path, before, after);
}

export function diffSnapshots(before, after) {
  const changes = [];
  function compare(a, b, characterId, moveId = null) {
    const emit = (path, old, value) =>
      changes.push({
        characterId,
        moveId,
        path,
        kind:
          old === undefined ? "add" : value === undefined ? "remove" : "change",
        ...(old === undefined ? {} : { before: old }),
        ...(value === undefined ? {} : { after: value }),
      });
    if (!a || !b) emit([], a, b);
    else fields(a, b, [], emit);
  }
  const left = index(before, "before characters"),
    right = index(after, "after characters");
  // Validate move IDs even in wholly added/deleted characters.
  for (const [label, rows] of [
    ["before", before],
    ["after", after],
  ])
    for (const c of rows) index(c.moves, `${label}/${c.id}/moves`);
  for (const id of [...new Set([...left.keys(), ...right.keys()])].sort()) {
    const a = left.get(id),
      b = right.get(id);
    if (!a || !b) {
      compare(a, b, id);
      continue;
    }
    const { moves: am, ...ac } = a,
      { moves: bm, ...bc } = b;
    compare(ac, bc, id);
    const ai = index(am, id),
      bi = index(bm, id);
    for (const mid of [...new Set([...ai.keys(), ...bi.keys()])].sort())
      compare(ai.get(mid), bi.get(mid), id, mid);
  }
  return changes;
}

// Approvals use the exact diff shape, including full before/after values.
// A parent approval cannot silently authorize unrelated descendant changes.
export function verifySnapshotDiff(before, after, approvals = []) {
  const changes = diffSnapshots(before, after);
  const key = (d) => JSON.stringify([d.characterId, d.moveId, d.path]);
  const approved = new Map();
  for (const d of approvals) {
    if (
      !d ||
      typeof d.characterId !== "string" ||
      !(d.moveId === null || typeof d.moveId === "string") ||
      !Array.isArray(d.path) ||
      !d.path.every((p) => typeof p === "string") ||
      !["add", "remove", "change"].includes(d.kind) ||
      Object.hasOwn(d, "before") !== (d.kind !== "add") ||
      Object.hasOwn(d, "after") !== (d.kind !== "remove")
    )
      throw new Error("Invalid approval");
    if (approved.has(key(d))) throw new Error(`Duplicate approval: ${key(d)}`);
    approved.set(key(d), d);
  }
  const unexpected = [],
    mismatched = [];
  for (const d of changes) {
    const approval = approved.get(key(d));
    if (!approval) unexpected.push(d);
    else {
      if (!isDeepStrictEqual(approval, d))
        mismatched.push({ change: d, approval });
      approved.delete(key(d));
    }
  }
  const unused = [...approved.values()];
  return {
    ok: !unexpected.length && !mismatched.length && !unused.length,
    changes,
    unexpected,
    mismatched,
    unused,
  };
}

export function assertSnapshotDiff(before, after, approvals = []) {
  const result = verifySnapshotDiff(before, after, approvals);
  if (!result.ok)
    throw new Error(
      `Unauthorized snapshot differences: ${JSON.stringify(result)}`,
    );
  return result;
}
