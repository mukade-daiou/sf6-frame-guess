import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  characterSchema,
  type Character,
  type FrameValue,
} from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
import { isDisplayable } from "../src/lib/frame-data/resolver";
const out = "staging/sf6-frame-data-stage7";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, v: unknown) =>
  writeFile(p, JSON.stringify(v, null, 2) + "\n");
await mkdir(`${out}/characters`, { recursive: true });
const old = await read("staging/sf6-frame-data-stage5/review.json");
const reports: any[] = [],
  files: Record<string, Character> = {};
for (const id of ["ken", "marisa"]) {
  const raw = await read(`staging/sf6-frame-data/raw/${id}.json`);
  const c = characterSchema.parse(
    await read(`staging/sf6-frame-data-stage6/characters/${id}.json`),
  );
  const reviews = [];
  for (const m of c.moves) {
    const prior = old.characters
      .find((c: any) => c.summary.characterId === id)
      .moves.find((r: any) => r.moveId === m.id);
    const input = prior?.upstreamInput ?? "KK";
    const before = structuredClone(m.frames);
    const decisions: any[] = [];
    function set(
      field: keyof typeof m.frames,
      value: FrameValue,
      reason: string,
    ) {
      Object.assign(m.frames, {
        [field]:
          field === "total"
            ? { ...value, provenance: "source", calculation: null }
            : value,
      });
      decisions.push({
        field,
        original: prior?.frames?.[field]?.original ?? before[field].display,
        normalized: value,
        reason,
      });
    }
    const scalar = (n: number): FrameValue => ({
      status: "confirmed",
      display: String(n),
      numeric: n,
    });
    const d: FrameValue = { status: "confirmed", display: "D" };
    for (const field of ["startup", "total", "hit", "block"] as const)
      if (m.frames[field].status === "conditional")
        set(
          field,
          { status: "unknown", display: null },
          "標準条件での単一値・同一指標の確定範囲を認定できない。元表記は監査に保持。",
        );
    const row = prior?.sourceRow;
    const rawMove = raw.moves.find(
      (r: any) =>
        r.input.numpad === input &&
        (m.notes.includes(`upstreamName: ${r.name.en}`) || input === "KK"),
    );
    if (
      id === "ken" &&
      ["214LK", "214MK"].includes(input) &&
      /^KD \+\d+\(\+\d+\)$/.test(prior.frames.hit.original) &&
      /KD Adv\./.test(row.notes)
    )
      set(
        "hit",
        d,
        "第1ヒットの接続でダウン後有利が異なるが、いずれもKD。出題はダウンDであり、有利Fの範囲を推定しない。",
      );
    if (
      id === "ken" &&
      input === "214HK" &&
      /2nd and 3rd hits whiff on crouching/.test(row.notes)
    ) {
      set("hit", d, "立ち相手はKD。しゃがみヒットの-38を混在させない。");
      set("block", scalar(-12), "立ちガード。しゃがみの-42は対象外。");
    }
    if (
      id === "ken" &&
      /^623[LMH]K$/.test(input) &&
      /only hit airborne/.test(row.notes)
    ) {
      const source = prior.frames.startup.original;
      const expected: Record<string, [string, number]> = {
        "623LK": ["18(21)", 21],
        "623MK": ["23(25)", 25],
        "623HK": ["28(30)", 30],
      };
      if (source === expected[input][0])
        set(
          "startup",
          scalar(expected[input][1]),
          "地上の立ち相手に当たる最初の発生。初期の空中限定判定を除く。注記に基づく技別選択。",
        );
    }
    if (
      id === "ken" &&
      ["623MK", "623HK", "623KK"].includes(input) &&
      /better hit\/block advantage vs. crouching/.test(row.notes)
    ) {
      set(
        "hit",
        scalar(input === "623KK" ? 1 : 3),
        "立ち相手の通常ヒット。しゃがみの括弧内を除く。",
      );
      set(
        "block",
        scalar(input === "623MK" ? -8 : input === "623HK" ? 1 : -9),
        "立ち相手の通常ガード。",
      );
    }
    if (
      id === "ken" &&
      input === "623HP" &&
      /3rd hit whiffs vs. crouch block/.test(row.notes)
    )
      set(
        "block",
        scalar(-36),
        "立ちガードでは3段目まで当たる。しゃがみの-38は対象外。",
      );
    if (
      id === "marisa" &&
      /^623(?:[LMH]P|PP)$/.test(input) &&
      /hits 1f later vs. crouching/.test(row.notes)
    ) {
      set(
        "block",
        scalar(input === "623PP" ? 4 : 3),
        "立ちガード。しゃがみに1F遅く当たる括弧内は対象外。",
      );
      set(
        "hit",
        d,
        "画面中央で壁に到達しない通常ヒットはKD。壁到達時の別性能・ダウン後有利Fは出題対象外。",
      );
    }
    if (id === "marisa" && ["214K", "214KK"].includes(input))
      set(
        "startup",
        { status: "not_applicable", display: "-" },
        "構え移行は攻撃ではない。3/1はアーマー開始、8は派生受付であり攻撃発生へ流用しない。",
      );
    if (id === "ken" && input === "KK")
      set(
        "startup",
        { status: "not_applicable", display: "-" },
        "奮迅脚自体は非攻撃。11(9)は派生受付で、派生なしの攻撃発生には適用対象外。",
      );
    m.notes.push(
      "Stage 7 standard: base state, standing target unless inapplicable, midscreen, normal hit/block, no hold/follow-up; total is whiff.",
    );
    reviews.push({
      characterId: id,
      moveId: m.id,
      input: m.input,
      upstreamInput: input,
      source: m.source,
      sourceRow: row ?? null,
      before,
      after: m.frames,
      decisions,
      sourceProperties: rawMove?.properties ?? [],
      exception: rawMove?.properties?.includes("low")
        ? "下段は立ちガード不成立のため、ガード時はしゃがみガードを使用。"
        : null,
      normalDisplayable: Object.values(m.frames).every(isDisplayable),
      startupDisplayable: isDisplayable(m.frames.startup),
      patchConfirmed: false,
      inputPairConfirmed:
        m.input.strength === "OD" || input === "KK" ? false : null,
    });
  }
  files[id] = characterSchema.parse(c);
  await save(`${out}/characters/${id}.json`, files[id]);
  reports.push({
    characterId: id,
    moves: reviews,
    summary: {
      recorded: c.moves.length,
      normalDisplayable: reviews.filter((r) => r.normalDisplayable).length,
      startupDisplayable: reviews.filter((r) => r.startupDisplayable).length,
      patchConfirmed: 0,
      productionEligible: false,
    },
  });
}
const checked = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "Stage 7",
  },
  files,
);
if (checked.errors.length || checked.eligible.length)
  throw new Error("Unverified data must remain excluded");
await save(
  `${out}/review-policy.json`,
  await read("staging/sf6-frame-data-stage6/review-policy.json"),
);
await save(`${out}/review.json`, {
  standard:
    "通常状態・原則立ち・画面中央・通常ヒット/ガード・非ホールド・派生なし。全体Fは空振り。",
  updatePolicy: "frozen_until_explicit_user_update",
  targetPatch: "UNVERIFIED",
  comparisonPatch: "Ver.2.0500.001",
  schemaPass: 2,
  productionEligible: 0,
  developmentPlayable: 2,
  characters: reports,
});
await writeFile(
  `${out}/NOTICE`,
  (await readFile("staging/sf6-frame-data-stage6/NOTICE", "utf8")) +
    "\nStage 7: standard-condition selection; unknowns preserved; no inferred ranges. All sources remain unverified.\n",
);
console.log(
  JSON.stringify(
    reports.map((r) => ({ id: r.characterId, ...r.summary })),
    null,
    2,
  ),
);
