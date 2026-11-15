import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { suites } from "../tests/suites.mjs";

const registered = Object.values(suites)
  .flat()
  .map((n) => `${n}.test.mjs`)
  .sort();
const discovered = readdirSync("tests")
  .filter((n) => n.endsWith(".test.mjs"))
  .sort();
if (JSON.stringify(registered) !== JSON.stringify(discovered))
  throw new Error(
    "Each tests/*.test.mjs must be registered exactly once in tests/suites.mjs",
  );
const group = process.argv[2] ?? "all";
if (
  process.argv.length > 3 ||
  (group !== "all" && !Object.hasOwn(suites, group))
)
  throw new Error(`Unknown test suite: ${group}`);
const files =
  group === "all" ? registered : suites[group].map((n) => `${n}.test.mjs`);
const result = spawnSync(
  process.execPath,
  ["--test", "--test-concurrency=1", ...files.map((f) => `tests/${f}`)],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
