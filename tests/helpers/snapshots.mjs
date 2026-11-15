import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

export const readCurrentSnapshot = () =>
  readdirSync("data/characters")
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(`data/characters/${f}`, "utf8")));

// Enumerate the baseline tree independently: using today's roster hides deletions.
export function readHistoricalSnapshot(ref) {
  const commit = execFileSync(
    "git",
    ["rev-parse", "--verify", `${ref}^{commit}`],
    { encoding: "utf8" },
  ).trim();
  return execFileSync(
    "git",
    ["ls-tree", "--name-only", `${commit}:data/characters`],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) =>
      JSON.parse(
        execFileSync("git", ["show", `${commit}:data/characters/${f}`], {
          encoding: "utf8",
        }),
      ),
    );
}
