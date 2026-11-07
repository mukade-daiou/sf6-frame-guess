import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
test("only the nine authorized frame fields differ from stage B", () => {
  const changes = [];
  let count = 0;
  for (const f of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${f}`;
    const before = JSON.parse(
      execFileSync(
        "git",
        ["show", `f51c4e29e2661d4292895964df76bce31f264895:${path}`],
        { encoding: "utf8" },
      ),
    );
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(after.moves.length, before.moves.length);
    assert.deepEqual(after.coverage, before.coverage);
    for (const old of before.moves) {
      const m = after.moves.find((m) => m.id === old.id);
      assert.ok(m);
      count++;
      assert.deepEqual(m.source, old.source);
      for (const field of ["startup", "total", "hit", "block"])
        if (
          JSON.stringify(m.frames[field]) !== JSON.stringify(old.frames[field])
        )
          changes.push(`${after.id}:${m.id}:${field}`);
      if (old.category !== "super_art") assert.deepEqual(m, old);
    }
  }
  const expected = ["aki", "ed", "sagat"].flatMap((id) =>
    ["L", "M", "H"].map(
      (s) =>
        `${id}:${id}__super_art_2_${s}:${id === "sagat" ? "hit" : "block"}`,
    ),
  );
  assert.deepEqual(changes.sort(), expected.sort());
  assert.equal(count, 1196);
});
