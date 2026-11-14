import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { commands, total } from "../staging/official-verification/compare.mjs";
import { restoreCompoundStartup } from "./research-projection.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const dir = "staging/official-verification";
test("Official comparison leaves all local production character data byte-identical", () => {
  const baseline = read(`${dir}/local-baseline.json`);
  for (const [file, hash] of Object.entries(baseline.files)) {
    const raw = readFileSync("data/characters/" + file, "utf8");
    const parsed = JSON.parse(raw);
    assert.equal(
      raw,
      JSON.stringify(parsed, null, 2) + "\n",
      `${file}: unexpected serialization`,
    );
    assert.equal(
      createHash("sha256")
        .update(JSON.stringify(restoreCompoundStartup(parsed), null, 2) + "\n")
        .digest("hex"),
      hash,
      file,
    );
  }
});
test("Every accepted local record has exactly four classified fields and preserved official evidence", () => {
  const historical = read(
    "staging/official-reevaluation/results-after-risk-fixes.json",
  );
  const exclusions = read("data/adoption-decisions.json")
    .specialStateExclusions.filter((r) => r.afterStrengthExpansion)
    .map((r) => r.moveId);
  const results = historical.filter((r) => !exclusions.includes(r.moveId));
  assert.equal(historical.length - results.length, exclusions.length);
  const characters = readdirSync("data/characters")
    .filter((f) => f.endsWith(".json"))
    .map((f) => read("data/characters/" + f));
  const expected = characters.flatMap((c) =>
    c.moves.filter((m) => m.adoption.status === "accepted").map((m) => m.id),
  );
  assert.deepEqual(results.map((r) => r.moveId).sort(), expected.sort());
  for (const result of results) {
    assert.deepEqual(Object.keys(result.fields), [
      "startup",
      "total",
      "hit",
      "block",
    ]);
    const source = read(`${dir}/sources/${result.characterId}.json`);
    assert.match(source.url, /\/ja-jp\//);
    assert.equal(source.control, "CLASSIC");
    assert.match(source.controlEvidence, /frame_movelist_active/);
    for (const field of Object.values(result.fields)) {
      assert.ok(
        ["一致", "不一致", "条件違い", "確認不能"].includes(field.status),
      );
      if (["一致", "不一致"].includes(field.status))
        assert.ok(result.sourceRows.length > 0);
    }
    for (const index of result.sourceRows) {
      const row = source.rows.find((r) => r.row === index);
      assert.ok(row);
      if (result.input.type === "normal") {
        assert.ok(row.name.startsWith(result.name));
        continue;
      }
      if (result.characterId === "akuma" && index === 68) {
        assert.match(result.mappingReason, /追加入力なし/);
        continue;
      }
      assert.ok(
        commands(row).some(
          (q) =>
            q.motion === result.input.motion.replace(/[\[\]]/g, "") &&
            q.button === result.input.button &&
            q.charge === result.input.motion.includes("[") &&
            (result.input.strength === "OD"
              ? q.strength === "OD"
              : q.strength !== "OD") &&
            (q.strength === "none" ||
              q.strength === result.input.strength ||
              result.input.strength === "none"),
        ),
        result.moveId + " row " + index,
      );
    }
  }
});
test("Whiff totals include explicit whiff recovery and reject hit-only continuations", () => {
  const ryu = read(`${dir}/sources/ryu.json`);
  assert.equal(
    total(ryu.rows.find((r) => r.name.startsWith("しゃがみ中P"))).value,
    24,
  );
  assert.equal(
    total(ryu.rows.find((r) => r.name.startsWith("立ち中P"))).value,
    22,
  );
  assert.equal(total(ryu.rows.find((r) => r.name === "弱 波動拳")).value, 47);
  const chunli = read(`${dir}/sources/chunli.json`);
  assert.equal(total(chunli.rows.find((r) => r.name === "OD 天昇脚")), null);
});
test("Official names resolve only reviewed baseline records and retain unresolved names", () => {
  const baseline = read(`${dir}/name-baseline.json`);
  const official = read("staging/move-names/official.json");
  const names = read("src/features/moves/japanese-names.json");
  assert.equal(baseline.unresolved.length, 130);
  assert.equal(Object.keys(official.entries).length, 125);
  assert.equal(official.unresolved.length, 5);
  for (const [id, entry] of Object.entries(official.entries)) {
    assert.ok(baseline.unresolved.some((r) => r.moveId === id));
    assert.equal(names[entry.characterId][id], entry.name);
    const s = read(`${dir}/sources/${entry.characterId}.json`);
    assert.equal(entry.sourceUrl, s.url);
    assert.deepEqual(
      entry.officialNames,
      entry.sourceRows.map((i) => s.rows.find((r) => r.row === i).name),
    );
    for (const index of entry.sourceRows) {
      const row = s.rows.find((r) => r.row === index);
      assert.ok(
        commands(row).some(
          (q) =>
            q.motion === entry.input.motion.replace(/[\[\]]/g, "") &&
            q.button === entry.input.button &&
            (entry.input.strength === "OD"
              ? q.strength === "OD"
              : q.strength !== "OD") &&
            (q.strength === "none" ||
              q.strength === entry.input.strength ||
              entry.input.strength === "none"),
        ),
        id,
      );
    }
  }
  for (const entry of official.unresolved)
    assert.equal(names[entry.characterId][entry.moveId], undefined);
});
