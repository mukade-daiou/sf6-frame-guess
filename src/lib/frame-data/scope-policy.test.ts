import { expect, it } from "vitest";
import { excludedInputReason } from "../../../scripts/source-scope";
import { production } from "./datasets";
import { resolveMove } from "./resolver";
import { inputKey } from "./input";
import { ask, answer, isCorrect, startGame } from "../../features/game/engine";
it("uses the saved no-input Hooligan startup in both modes", () => {
  const c = production.eligible.find((x) => x.id === "cammy")!;
  for (const suffix of [
    "none__strength_L",
    "none__strength_M",
    "none__strength_H",
    "OD",
  ]) {
    const m = c.moves.find((x) => x.id === `cammy__special_236_P_${suffix}`)!;
    expect(m.frames.startup).toMatchObject({
      status: "confirmed",
      numeric: 50,
      display: "50",
    });
    for (const mode of ["normal", "startup"] as const) {
      expect(resolveMove(c, m.input, mode)).toMatchObject({
        status: "found",
        frames: { startup: { numeric: 50 } },
      });
      const game = { ...startGame(production, mode, 1), target: c };
      const result = ask(game, m.input);
      expect(result.status).toBe("found");
      expect(result.game.history[0].result).toMatchObject({
        frames: { startup: { numeric: 50 } },
      });
      expect(isCorrect(answer(result.game, c.id))).toBe(true);
    }
  }
});
it("uses the no-input automatic Demon Low Slash startup from the parent start", () => {
  const c = production.eligible.find((c) => c.id === "akuma")!;
  const moves = c.moves.filter((m) => m.id.startsWith("akuma__special_236_K_"));
  expect(moves).toHaveLength(5);
  for (const m of moves) {
    expect(m.frames.startup).toMatchObject({
      status: "confirmed",
      display: "53",
      numeric: 53,
    });
    if (m.input.type === "special" && m.input.strength !== "none")
      for (const mode of ["normal", "startup"] as const)
        expect(resolveMove(c, m.input, mode)).toMatchObject({
          status: "found",
          frames: { startup: { numeric: 53 } },
        });
  }
});
it("separates parent startup absence from stock effects and attacking parents", () => {
  for (const c of production.eligible)
    for (const m of c.moves.filter(
      (m) => m.frames.startup.display === "なし",
    )) {
      expect(m.frames.startup.status).toBe("not_applicable");
      expect("numeric" in m.frames.startup).toBe(false);
      if (m.input.type === "special" && m.input.strength !== "none")
        expect(resolveMove(c, m.input, "startup").status).toBe("found");
    }
  for (const [id, startup] of [
    ["ryu__special_22_P_none", 50],
    ["jamie__special_22_P_none", 48],
    ["kimberly__special_22_K_none", 42],
    ["kimberly__special_22_K_OD", 42],
    ["dee_jay__special_214_K_OD", 8],
  ] as const) {
    const move = production.characters
      .flatMap((c) => c.moves)
      .find((m) => m.id === id)!;
    expect(move.frames.startup).toMatchObject({ numeric: startup });
  }
});
it.each([
  "PP",
  "KK",
  "2PP",
  "4KK",
  "6KK",
  "5/6KK",
  "2KK or 3KK",
  "6KKK",
  "4 or 6 + PPP/KKK",
  "6[6]",
])("excludes non-OD simultaneous / triple / Run input %s", (input) =>
  expect(excludedInputReason(input)).toBeTruthy(),
);
it.each(["236PP", "214KK", "360+PP", "63214KK (Far)", "5LP"])(
  "retains ordinary and OD input %s",
  (input) => expect(excludedInputReason(input)).toBeNull(),
);
it("keeps excluded source records but removes them from question inputs and absence checks", () => {
  const excluded = production.characters.flatMap((c) =>
    c.moves
      .filter((m) => m.adoption?.status === "excluded")
      .map((m) => ({ c, m })),
  );
  expect(excluded).toHaveLength(14);
  for (const { c, m } of excluded) {
    expect(m.source.verification).toBe("unverified");
    if (
      !m.id.startsWith("ingrid__special_214214_K_none") &&
      !["dee_jay__held_special_22_P_OD", "m_bison__special_623_P_OD"].includes(
        m.id,
      )
    )
      expect(
        production.inputs.some((i) => inputKey(i) === inputKey(m.input)),
      ).toBe(false);
    expect(resolveMove(c, m.input, "normal").status).toBe("not_found");
  }
});
it("retains Dark Ingrid records but resolves shared 214214K as absent", () => {
  const c = production.eligible.find((c) => c.id === "ingrid")!;
  expect(
    c.moves.filter((m) => m.id.startsWith("ingrid__special_214214_K_none")),
  ).toHaveLength(4);
  for (const strength of ["L", "M", "H"] as const) {
    const input = {
      type: "special",
      motion: "214214",
      button: "K",
      strength,
      includeSuperArts: true,
    } as const;
    expect(production.inputs.some((i) => inputKey(i) === inputKey(input))).toBe(
      true,
    );
    for (const mode of ["normal", "startup"] as const)
      expect(resolveMove(c, input, mode).status).toBe("not_found");
  }
});
it("excludes Shin Bison's Psycho Burst while retaining the shared input", () => {
  const bison = production.eligible.find((c) => c.id === "m_bison")!;
  const input = {
    type: "special",
    motion: "623",
    button: "P",
    strength: "OD",
    includeSuperArts: true,
  } as const;
  expect(production.inputs.some((i) => inputKey(i) === inputKey(input))).toBe(
    true,
  );
  expect(resolveMove(bison, input, "normal").status).toBe("not_found");
  expect(resolveMove(bison, input, "startup").status).toBe("not_found");
});
it("selects far-distance values with explicitly different HK behavior", () => {
  const c = production.characters.find((c) => c.id === "zangief")!;
  for (const [strength, startup, total] of [
    ["L", 55, 96],
    ["M", 55, 96],
    ["H", 10, 61],
    ["OD", 54, 95],
  ] as const) {
    const input = {
      type: "special",
      motion: "63214",
      button: "K",
      strength,
    } as const;
    const result = resolveMove(c, input, "normal");
    expect(result.status).toBe("found");
    if (result.status === "found")
      expect(result.frames).toMatchObject({
        startup: { numeric: startup },
        total: { numeric: total, provenance: "source" },
        hit: { display: "D" },
        block: { status: "not_applicable" },
      });
  }
});
