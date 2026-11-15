import { readFileSync } from "node:fs";
import { restoreReviewedUpdates } from "../../scripts/compound-startup-projection.mjs";
const policy = JSON.parse(readFileSync("data/adoption-decisions.json", "utf8"));
export function readHistoricalJson(path) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  return path.startsWith("data/characters/")
    ? restoreReviewedUpdates(value, policy)
    : value;
}
