import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

test("only Focus Force representative startups differ from stage 16", () => {
  let records = 0;
  const changed = [];
  for (const file of readdirSync("data/characters").filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `data/characters/${file}`;
    const before = JSON.parse(
      execFileSync(
        "git",
        ["show", `1ec74b47703591438588ace22f2d344ccd8507d0:${path}`],
        { encoding: "utf8" },
      ),
    );
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(after.moves.length, before.moves.length);
    for (const [i, move] of after.moves.entries()) {
      records++;
      const old = before.moves[i];
      if (JSON.stringify(move) === JSON.stringify(old)) continue;
      changed.push(move.id);
      assert.equal(after.id, "cviper");
      assert.match(
        move.id,
        /^cviper__held_special_214_K_(?:OD|none(?:__strength_[LMH])?)$/,
      );
      const od = move.input.strength === "OD";
      assert.deepEqual(move.frames.startup, {
        status: "confirmed",
        display: od ? "20" : "23",
        numeric: od ? 20 : 23,
      });
      assert.ok(
        move.notes.some((n) =>
          n.includes(`"startup":"${od ? "10+10" : "13+10"}"`),
        ),
      );
      const normalized = structuredClone(move);
      normalized.frames.startup = old.frames.startup;
      normalized.notes = normalized.notes.filter(
        (n) => !n.startsWith("2026-11-09ユーザー指定:"),
      );
      assert.deepEqual(normalized, old, `Other fields changed: ${move.id}`);
    }
    assert.deepEqual({ ...after, moves: [] }, { ...before, moves: [] });
  }
  assert.equal(records, 1298);
  assert.equal(changed.length, 5); // Shared source plus four independent question inputs.
});
