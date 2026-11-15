import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
  mkdtemp,
  mkdir,
  writeFile,
  readdir,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  normalize,
  frame,
  compareSources,
  classify,
  scan,
} from "../scripts/lib/source-scan.mjs";
const fixture = JSON.parse(
  await readFile("tests/fixtures/source-scan/ryu.json", "utf8"),
);
const normalized = (s) => [normalize(s, "ryu")];
const changes = (mutate) => {
  const x = structuredClone(fixture);
  mutate(x);
  return compareSources(normalized(fixture), normalized(x));
};
test("unchanged and reordered official rows have identical values", () => {
  assert.ok(
    changes((x) => {
      x.rows.reverse();
      x.rows.forEach((r, i) => (r.row = i + 99));
    }).every((e) => e.state === "unchanged"),
  );
});
test("frame, name, input and conditional text changes retain official identity", () => {
  for (const mutate of [
    (r) => (r.startup = "8"),
    (r) => (r.name = "renamed"),
    (r) => (r.commandText = "new input"),
    (r) => (r.notes = "空振り時硬直2F増加"),
  ]) {
    const e = changes((x) => mutate(x.rows[0])).filter(
      (e) => e.state !== "unchanged",
    );
    assert.equal(e.length, 1);
    assert.equal(e[0].kind, "move_changed");
  }
});
test("new and removed moves and characters are detected", () => {
  assert.ok(
    changes((x) => x.rows.pop()).some((e) => e.kind === "move_removed"),
  );
  assert.ok(
    changes((x) =>
      x.rows.push({ ...x.rows[0], officialId: "new", name: "new" }),
    ).some((e) => e.kind === "move_added"),
  );
  assert.equal(
    compareSources([], normalized(fixture))[0].kind,
    "character_added",
  );
  assert.equal(
    compareSources(normalized(fixture), [])[0].kind,
    "character_removed",
  );
});
test("unique input matches a renamed row without official ID; duplicates remain unmatched", () => {
  const a = structuredClone(fixture);
  a.rows = a.rows.slice(0, 1);
  delete a.rows[0].officialId;
  const b = structuredClone(a);
  b.rows[0].name = "new";
  assert.equal(
    compareSources(normalized(a), normalized(b))[0].kind,
    "move_changed",
  );
  a.rows.push(structuredClone(a.rows[0]));
  b.rows.push(structuredClone(b.rows[0]));
  assert.ok(
    compareSources(normalized(a), normalized(b)).every(
      (e) => e.state === "unmatched",
    ),
  );
});
test("unknown, not applicable, ranges, KD/HKD and conditional values stay distinct", () => {
  assert.deepEqual(
    ["", "-", "5", "5~9", "KD", "HKD", "5(8)"].map((s) => frame(s).status),
    [
      "unknown",
      "not_applicable",
      "numeric",
      "range",
      "special",
      "special",
      "conditional",
    ],
  );
});
test("manual correction reasons survive as needs_review", () => {
  const events = changes((x) => (x.rows[0].startup = "8"));
  const production = [
    {
      id: "ryu",
      moves: [
        {
          id: "m",
          name: "立ち弱P",
          category: "normal",
          adoption: { status: "accepted" },
        },
      ],
    },
  ];
  const result = classify(events, production, {
    correction: { moveId: "m", reason: "retained evidence" },
  });
  assert.equal(
    result.find((e) => e.kind === "move_changed").state,
    "needs_review",
  );
  assert.equal(
    result.find((e) => e.kind === "move_changed").retainedDecisions[0].decision
      .reason,
    "retained evidence",
  );
});
test("scan artifacts are reproducible, isolated, and failed/partial retrieval never means no change", async () => {
  const root = await mkdtemp(join(tmpdir(), "sf6-scan-"));
  try {
    const base = join(root, "input");
    await mkdir(base);
    await writeFile(join(base, "ryu.json"), JSON.stringify(fixture));
    const inventory = {
      complete: true,
      characters: [{ id: "ryu", file: "ryu.json" }],
    };
    await writeFile(join(base, "inventory.json"), JSON.stringify(inventory));
    const opts = {
      baseline: base,
      incoming: base,
      output: join(root, "runs"),
      production: [],
      policy: {},
    };
    const first = await scan(opts),
      second = await scan(opts);
    assert.notEqual(first.root, second.root);
    assert.deepEqual(first.events, second.events);
    assert.deepEqual((await readdir(first.root)).sort(), [
      "context.json",
      "diff.json",
      "manifest.json",
      "normalized.json",
      "raw",
      "report.md",
    ]);
    assert.equal(
      await readFile(join(base, "ryu.json"), "utf8"),
      JSON.stringify(fixture),
    );
    await writeFile(
      join(base, "inventory.json"),
      JSON.stringify({
        complete: false,
        characters: [{ id: "ryu", url: fixture.url }],
      }),
    );
    const failed = await scan({
      ...opts,
      fetcher: async () => new Response("Forbidden", { status: 403 }),
    });
    assert.equal(failed.manifest.status, "partial_or_failed");
    assert.ok(failed.events.some((e) => e.state === "source_error"));
    assert.ok(!failed.events.some((e) => e.kind === "character_removed"));
    assert.ok(failed.manifest.inputs.every((i) => i.hash));
    await writeFile(join(base, "inventory.json"), JSON.stringify(inventory));
    await writeFile(
      join(base, "ryu.json"),
      JSON.stringify({ ...fixture, complete: false }),
    );
    const partial = await scan(opts);
    assert.equal(partial.manifest.status, "partial_or_failed");
    assert.ok(partial.manifest.inputs.every((i) => i.status === "partial"));
    assert.ok(
      !partial.events.some(
        (e) => e.kind === "move_removed" || e.kind === "character_removed",
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
