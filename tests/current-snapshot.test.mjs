import test from "node:test";
import { readFileSync } from "node:fs";
import { assertSnapshotDiff } from "../scripts/lib/snapshot-diff.mjs";
import { restoreCommandNormals } from "../scripts/compound-startup-projection.mjs";
import {
  readCurrentSnapshot,
  readHistoricalSnapshot,
} from "./helpers/snapshots.mjs";

test("current production contains only explicitly approved differences from the reviewed baseline", () => {
  const { baselineRef, approvals } = JSON.parse(
    readFileSync("tests/fixtures/snapshot-approvals.json", "utf8"),
  );
  const { commandNormals } = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  assertSnapshotDiff(
    readHistoricalSnapshot(baselineRef),
    readCurrentSnapshot().map((c) =>
      restoreCommandNormals(c, commandNormals?.[c.id]),
    ),
    approvals,
  );
});
