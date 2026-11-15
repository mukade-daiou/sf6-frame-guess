import test from "node:test";
import { readFileSync } from "node:fs";
import { assertSnapshotDiff } from "../scripts/lib/snapshot-diff.mjs";
import {
  readCurrentSnapshot,
  readHistoricalSnapshot,
} from "./helpers/snapshots.mjs";

test("current production contains only explicitly approved differences from the reviewed baseline", () => {
  const { baselineRef, approvals } = JSON.parse(
    readFileSync("tests/fixtures/snapshot-approvals.json", "utf8"),
  );
  assertSnapshotDiff(
    readHistoricalSnapshot(baselineRef),
    readCurrentSnapshot(),
    approvals,
  );
});
