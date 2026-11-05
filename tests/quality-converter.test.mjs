import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { convert } from "../scripts/collect-supercombo.mjs";
import { convertReviewed, fingerprint } from "../scripts/quality-converter.mjs";
const reviews = JSON.parse(
  await readFile(
    new URL(
      "../staging/sf6-frame-data-quality/review-decisions.json",
      import.meta.url,
    ),
    "utf8",
  ),
).decisions;
const raw = async (id) =>
  JSON.parse(
    await readFile(
      new URL(`../staging/sf6-frame-data/raw/${id}.json`, import.meta.url),
      "utf8",
    ),
  );
test("reviewed same-input Flame/Mine/SA2/stock variants do not replace ordinary moves", async () => {
  for (const [id, suffix] of [
    ["mai", "(Flame)"],
    ["m_bison", "(Mine)"],
    ["blanka", "(SA2)"],
    ["juri", "(1 Stock)"],
  ]) {
    const result = convertReviewed(await raw(id), reviews);
    assert(!result.character.moves.some((m) => m.name.endsWith(suffix)));
    assert(result.character.moves.some((m) => m.category === "special"));
    assert(result.review.applied.some((d) => d.action === "exclude"));
  }
});
test("Ryu Denjin enhanced Hadoken/Hashogeki are excluded, acquisition move retained", async () => {
  const c = convertReviewed(await raw("ryu"), reviews).character;
  assert(
    !c.moves.some((m) => /^Denjin Charge (Hadoken|Hashogeki)/.test(m.name)),
  );
  assert(c.moves.some((m) => m.name === "Denjin Charge"));
});
test("Jamie DL0 jab is selected using explicit notes; uncertified DL2/3 specials quarantined", async () => {
  const c = convertReviewed(await raw("jamie"), reviews).character;
  assert(
    c.moves
      .find(
        (m) =>
          m.input.type === "normal" &&
          m.input.direction === "5" &&
          m.input.button === "P" &&
          m.input.strength === "L",
      )
      .notes.includes("upstreamName: Stand LP (DL0)"),
  );
  assert(
    !c.moves.some(
      (m) => m.category === "special" && /\(DL[1-4]\)/.test(m.name),
    ),
  );
});
test("hold Gladius variants are explicitly excluded; unheld versions retained", async () => {
  const r = convertReviewed(await raw("marisa"), reviews);
  assert.equal(r.character.moves.filter((m) => m.name === "Gladius").length, 4);
  assert(!r.character.moves.some((m) => m.name.includes("(Hold)")));
  assert.equal(
    r.audit.excluded.filter((e) => e.name === "Gladius (Hold)").length,
    4,
  );
});
test("only exact duplicate source records are merged; Arjun sweep recovered", async () => {
  const r = convertReviewed(await raw("arjun"), reviews);
  assert.equal(
    r.character.moves.filter(
      (m) =>
        m.input.type === "normal" &&
        m.input.direction === "2" &&
        m.input.button === "K" &&
        m.input.strength === "H",
    ).length,
    1,
  );
  assert(r.review.applied.some((d) => d.action === "merge_exact_duplicate"));
});
test("different unknown records with same input remain unresolved", async () => {
  const r = await raw("ryu");
  const m = r.moves.find(
    (m) => m.category === "normal" && m.input.numpad === "5LP",
  );
  r.moves = [m, { ...m, notes: { en: "different condition" } }];
  const result = convertReviewed(r, []);
  assert.equal(result.character.moves.length, 0);
  assert.equal(result.audit.excluded.length, 2);
});
test("D is textual without numeric; a large positive number is never converted to D", async () => {
  const r = await raw("ryu");
  const m = r.moves.find((m) => m.input.numpad === "2HK");
  r.moves = [{ ...m, onHit: "D" }];
  assert.deepEqual(convert(r).character.moves[0].frames.hit, {
    status: "confirmed",
    display: "D",
  });
  r.moves[0].onHit = 40;
  assert.equal(convert(r).character.moves[0].frames.hit.numeric, 40);
  assert.equal(
    convertReviewed(r, []).character.moves[0].frames.hit.display,
    "+40",
  );
});
test("not_applicable differs from unknown; missing total is not calculated", async () => {
  const r = await raw("ryu");
  const m = r.moves.find((m) => m.input.numpad === "2HK");
  r.moves = [{ ...m, onHit: "-", onBlock: null, totalFrames: null }];
  const f = convertReviewed(r, []).character.moves[0].frames;
  assert.equal(f.hit.status, "not_applicable");
  assert.equal(f.block.status, "unknown");
  assert.deepEqual(f.total, {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  });
  const actual = convertReviewed(
    await raw("ryu"),
    reviews,
  ).character.moves.find((m) => m.notes.includes("upstreamInput: 22P"));
  assert.deepEqual(actual.frames.hit, {
    status: "not_applicable",
    display: "-",
  });
  assert.deepEqual(actual.frames.block, {
    status: "not_applicable",
    display: "-",
  });
});
test("explicit source KD semantics are restored, source value preserved in notes", async () => {
  const r = convertReviewed(await raw("ryu"), reviews).character.moves.find(
    (m) =>
      m.input.type === "normal" &&
      m.input.direction === "2" &&
      m.input.button === "K" &&
      m.input.strength === "H",
  );
  assert.deepEqual(r.frames.hit, { status: "confirmed", display: "D" });
  assert(r.notes.some((n) => n.includes("original onHit=40")));
});
test("conversion is repeatable, canonical fingerprints ignore property order, changed source fails closed", async () => {
  const r = await raw("mai");
  assert.deepEqual(convertReviewed(r, reviews), convertReviewed(r, reviews));
  const d = reviews.find((d) => d.characterId === "mai");
  assert.equal(fingerprint({ a: 1, b: 2 }), fingerprint({ b: 2, a: 1 }));
  const m = r.moves.find((m) => fingerprint(m) === d.fingerprint);
  m.startup += 1;
  assert.throws(() => convertReviewed(r, reviews), /Stale reviews/);
});
