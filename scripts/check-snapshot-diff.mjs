import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { verifySnapshotDiff } from "./lib/snapshot-diff.mjs";

const [beforeDir, afterDir, approvalsPath, ...extra] = process.argv.slice(2);
if (!beforeDir || !afterDir || extra.length) {
  console.error(
    "Usage: node scripts/check-snapshot-diff.mjs BEFORE_CHARACTERS AFTER_CHARACTERS [APPROVALS.json]",
  );
  process.exitCode = 2;
} else {
  const read = (p) => JSON.parse(readFileSync(p, "utf8"));
  const load = (dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => read(resolve(dir, f)));
  const result = verifySnapshotDiff(
    load(beforeDir),
    load(afterDir),
    approvalsPath ? read(approvalsPath) : [],
  );
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
