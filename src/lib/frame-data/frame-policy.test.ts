import { expect, it } from "vitest";
import { frameValueSchema, type FrameValue } from "./schema";
import { displayFrame, resolveMove } from "./resolver";
import { reviewDataset } from "./review-dataset";
import { ask, startGame } from "../../features/game/engine";
const range: FrameValue = {
  status: "conditional",
  display: "20~30",
  condition: "同一指標で確定した範囲（回帰テスト用の架空値）",
  range: {
    min: 20,
    max: 30,
    evidence: ["https://example.invalid/range-fixture"],
  },
};
it("rejects scalar confirmed values carrying undocumented range notation", () => {
  for (const display of ["26~", "-19~", "+3~+8", "-8~+2"])
    expect(
      frameValueSchema.safeParse({ status: "confirmed", display }).success,
    ).toBe(false);
});
it("preserves signed closed and source-only open notation", () => {
  for (const [display, min, max] of [
    ["+3~+8", 3, 8],
    ["-8~+2", -8, 2],
    ["0~0", 0, 0],
  ] as const) {
    const value = { ...range, display, range: { ...range.range!, min, max } };
    expect(frameValueSchema.safeParse(value).success).toBe(true);
    expect(displayFrame(value)).toBe(display);
  }
  for (const reference of [-19, 0, 26]) {
    const value = {
      status: "conditional" as const,
      display: `${reference}~`,
      condition: "distance",
      openRange: {
        reference,
        unspecified: "trailing" as const,
        evidence: ["https://example.invalid"],
      },
    };
    expect(frameValueSchema.safeParse(value).success).toBe(true);
    expect(displayFrame(value)).toBe(`${reference}~`);
    for (const invalid of [
      { ...value, numeric: reference },
      { ...value, display: "26~∞" },
      { ...value, openRange: { ...value.openRange, reference: Infinity } },
      { ...value, openRange: { ...value.openRange, evidence: [] } },
      { ...value, range: range.range },
    ])
      expect(frameValueSchema.safeParse(invalid).success).toBe(false);
  }
});
it("accepts only documented ordered ranges, never infers from parentheses", () => {
  expect(frameValueSchema.safeParse(range).success).toBe(true);
  expect(displayFrame(range)).toBe("20~30");
  for (const value of [
    { ...range, display: "20(30)" },
    {
      ...range,
      range: { min: 30, max: 20, evidence: ["https://example.invalid"] },
    },
    { ...range, range: { min: 20, max: 30, evidence: [] } },
    { ...range, numeric: 20 },
  ])
    expect(frameValueSchema.safeParse(value).success).toBe(false);
  expect(
    displayFrame({
      status: "conditional",
      display: "20(30)",
      condition: "未解釈",
    }),
  ).toBe("不明");
  expect(displayFrame({ status: "confirmed", display: "D" })).toBe("D");
});
it("counts a certified range once; unknowns are not consumed or marked duplicate", () => {
  let game = startGame(reviewDataset, "normal", 5, () => 0);
  game = { ...game, target: structuredClone(game.target) };
  const move = game.target.moves[0];
  move.frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  expect(ask(game, move.input).status).toBe("unknown");
  expect(ask(game, move.input).game.history).toHaveLength(0);
  move.frames.total = { ...range, provenance: "source", calculation: null };
  const next = ask(game, move.input);
  expect(next.status).toBe("review");
  expect(next.game.history).toHaveLength(1);
  expect(ask(next.game, move.input).status).toBe("duplicate");
  move.frames.total = {
    status: "conditional",
    display: "20(30)",
    condition: "未確定",
    provenance: "source",
    calculation: null,
  };
  expect(ask(game, move.input).status).toBe("unknown");
  const verified = structuredClone(game.target);
  verified.moves[0].source.verification = "verified";
  verified.moves[0].frames.total = {
    ...range,
    provenance: "source",
    calculation: null,
  };
  expect(resolveMove(verified, move.input, "normal").status).toBe("found");
});
it("uses the selected mode, standing conditions and non-attack exceptions", () => {
  const ken = reviewDataset.characters.find((c) => c.id === "ken")!;
  const find = (input: string) =>
    ken.moves.find((m) => m.notes.includes(`upstreamInput: ${input}`))!;
  expect(find("214LK").frames.hit.display).toBe("D");
  expect(find("623HK").frames.startup.display).toBe("30");
  expect(find("623HP").frames.block.display).toBe("-36");
  expect(find("KK").frames.startup.status).toBe("not_applicable");
  const game = startGame(reviewDataset, "normal", 5, () => 0);
  expect(ask(game, find("2HK").input).status).toBe("unknown");
  expect(ask({ ...game, mode: "startup" }, find("2HK").input).status).toBe(
    "review",
  );
});
