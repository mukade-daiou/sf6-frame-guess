import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { validateDataset } from "../../src/lib/frame-data/loader";
import { inputKey } from "../../src/lib/frame-data/input";
import { resolveMove } from "../../src/lib/frame-data/resolver";

const baseline = "b8cdabab2313c119982b3c27551546e39dc41fd8";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const old = (p: string) =>
  JSON.parse(
    execFileSync("git", ["show", `${baseline}:${p}`], { encoding: "utf8" }),
  );
const names = readdirSync("data/characters").filter((n) => n.endsWith(".json"));
const files = Object.fromEntries(
  names.map((n) => [n, read(`data/characters/${n}`)]),
);
const previous = Object.fromEntries(
  names.map((n) => [n, old(`data/characters/${n}`)]),
);
const before = validateDataset(old("data/metadata.json"), previous);
const after = validateDataset(read("data/metadata.json"), files);
assert.deepEqual(after.errors, []);
assert.deepEqual(
  after.eligible.map((c) => c.id),
  before.eligible.map((c) => c.id),
);
const questionInputs = (dataset: typeof after) =>
  dataset.inputs.filter(
    (i) => i.type === "normal" || (i.type === "special" && i.includeSuperArts),
  );
assert.deepEqual(
  questionInputs(after).map(inputKey).sort(),
  questionInputs(before).map(inputKey).sort(),
);
const changed: string[] = [];
for (const c of after.eligible) {
  const original = before.eligible.find((x) => x.id === c.id)!;
  for (const input of questionInputs(after))
    for (const mode of ["normal", "startup"] as const) {
      const previousResult = resolveMove(original, input, mode);
      const currentResult = resolveMove(c, input, mode);
      if (previousResult.status !== currentResult.status) {
        assert.equal(c.id, "ingrid");
        assert.equal(previousResult.status, "found");
        assert.equal(currentResult.status, "not_found");
        assert(
          [
            "command:214214:K:L",
            "command:214214:K:M",
            "command:214214:K:H",
          ].includes(inputKey(input)),
        );
        changed.push(`${inputKey(input)}/${mode}`);
      }
    }
}
assert.equal(changed.length, 6);
console.log(
  JSON.stringify({
    eligible: after.eligible.length,
    inputCount: questionInputs(after).length,
    statusChanges: changed,
  }),
);
