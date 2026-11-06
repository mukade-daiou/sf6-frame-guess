import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { interpretField, classifyRow } from "../scripts/stage5-rules.mjs";
const row = (id, input, match = () => true) =>
  JSON.parse(
    JSON.parse(
      readFileSync(
        `archive/staging/sf6-frame-data-release/evidence/${id}.json`,
        "utf8",
      ),
    ).body,
  )
    .cargoquery.map((r) => r.title)
    .find((r) => r.input === input && match(r));

test("whiff total is selected only for the reviewed row and explicit whiff note", () => {
  for (const [id, input, expected] of [
    ["ken", "2MP", 24],
    ["ken", "5HK", 38],
    ["marisa", "5MP", 27],
  ]) {
    const source = row(id, input);
    const result = interpretField(id, input, "total", source);
    assert.equal(result.value.numeric, expected);
    assert.equal(result.interpretationResolved, true);
    assert.equal(result.patchConfirmed, false);
    assert.equal(
      interpretField(id, input, "total", { ...source, notes: "" }).value.status,
      "conditional",
    );
  }
  assert.equal(
    interpretField("ken", "2HK", "total", row("ken", "2HK"))
      .interpretationResolved,
    false,
  );
});
test("Scutum non-held totals and automatic counters stay separate", () => {
  for (const [input, expected] of [
    ["214K", 54],
    ["214KK", 57],
  ]) {
    const source = row("marisa", input, (r) => r.notes.startsWith("Stance"));
    assert.equal(
      interpretField("marisa", input, "total", source).value.numeric,
      expected,
    );
    assert.equal(
      interpretField("marisa", input, "total", { ...source, total: "99(999)" })
        .value.status,
      "conditional",
    );
    assert.equal(
      classifyRow(
        {
          category: "special",
          input: { numpad: input },
          name: { en: "Scutum (Counter)" },
          notes: { en: "Automatically triggers counterattack" },
        },
        null,
      ).disposition,
      "out_of_scope",
    );
  }
  assert.equal(
    classifyRow({ category: "special", input: { numpad: "KK" } }, null)
      .disposition,
    "unsupported_input",
  );
});
test("opponent posture and wall conditions cannot become unconditional numeric advantage", () => {
  const hp = interpretField("ken", "623HP", "block", row("ken", "623HP"));
  assert.equal(hp.value.status, "conditional");
  assert.equal(hp.value.numeric, undefined);
  assert.equal(hp.interpretationResolved, true);
  const wall = interpretField("marisa", "236KK", "hit", row("marisa", "236KK"));
  assert.equal(wall.value.status, "conditional");
  assert.equal(wall.interpretationResolved, false);
  assert.equal(
    interpretField("ken", "623KK", "startup", row("ken", "623KK"))
      .interpretationResolved,
    false,
  );
});
test("saved Stage 5 conversion is reproducible and never promotes unverified sources", () => {
  const paths = [
    "review.json",
    "characters/ken.json",
    "characters/marisa.json",
  ].map((p) => `archive/staging/sf6-frame-data-stage5/${p}`);
  const before = paths.map((p) => readFileSync(p, "utf8"));
  execFileSync("node_modules/.bin/tsx", ["archive/scripts/build-stage5.ts"]);
  assert.deepEqual(
    paths.map((p) => readFileSync(p, "utf8")),
    before,
  );
  for (const p of paths.slice(1)) {
    const character = JSON.parse(readFileSync(p, "utf8"));
    assert.equal(character.source.verification, "unverified");
    assert.equal(character.gameVersion, "UNVERIFIED");
    assert.equal(character.coverage.special.status, "partial");
  }
});
