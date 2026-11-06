import test from "node:test";
import assert from "node:assert/strict";
import { reviewOD, compareDisplay } from "../scripts/stage4-rules.mjs";
import { readFileSync } from "node:fs";
import { convert } from "../scripts/collect-supercombo.mjs";

test("OD selects only low+medium, including alternative notation", () => {
  assert.deepEqual(reviewOD("214LPMP or 214LPHP"), {
    status: "selected_explicit_pair",
    normalized: "214PP",
  });
  assert.equal(reviewOD("236MPHP").status, "excluded_button_pair");
  assert.equal(reviewOD("236LKMK").normalized, "236KK");
  assert.equal(reviewOD("236KK").status, "pending_pair_confirmation");
  assert.equal(reviewOD("236[PP]").status, "not_od_or_unsupported");
  assert.equal(reviewOD("236LP").status, "not_od_or_unsupported");
});
test("source comparison keeps knockdown, conditional and unknown distinct", () => {
  assert.equal(
    compareDisplay({ status: "confirmed", display: "D" }, "KD +40"),
    "knockdown_marker_equal",
  );
  assert.equal(
    compareDisplay({ status: "confirmed", display: "40" }, "KD +40"),
    "different_or_conditional",
  );
  assert.equal(
    compareDisplay({ status: "unknown", display: null }, "-"),
    "unknown_preserved",
  );
  assert.equal(
    compareDisplay({ status: "not_applicable", display: "-" }, "-"),
    "equal",
  );
  assert.equal(
    compareDisplay({ status: "confirmed", display: "34" }, "34(40)"),
    "different_or_conditional",
  );
});

test("Terry and Sagat low+medium rows produce one OD candidate without high-pair variants", () => {
  for (const id of ["terry", "sagat"]) {
    const raw = JSON.parse(
      readFileSync(`archive/staging/sf6-frame-data/raw/${id}.json`, "utf8"),
    );
    const selected = raw.moves.filter(
      (m) =>
        m.category === "special" &&
        reviewOD(m.input.numpad).status === "selected_explicit_pair",
    );
    assert.equal(selected.length, 1);
    const normalized = selected.map((m) => ({
      ...m,
      input: { ...m.input, numpad: reviewOD(m.input.numpad).normalized },
    }));
    const result = convert({ ...raw, moves: normalized }).character;
    assert.equal(result.moves.length, 1);
    assert.equal(result.moves[0].input.strength, "OD");
    assert.match(
      result.moves[0].name,
      id === "terry" ? /Quick Burn/ : /Low Tiger Shot/,
    );
    assert.equal(result.source.verification, "unverified");
  }
});
