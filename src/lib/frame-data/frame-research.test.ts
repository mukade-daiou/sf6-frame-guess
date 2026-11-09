import { expect, it } from "vitest";
import { production } from "./datasets";
import { applyFrameResearch } from "../../../scripts/frame-research";
import { resolveMove } from "./resolver";
import { ask, changeMode, startGame } from "../../features/game/engine";
const char = (id: string) => production.characters.find((c) => c.id === id)!;
const query = (
  motion: string,
  button: "P" | "K",
  strength: "L" | "M" | "H" | "OD",
) => ({
  type: "special" as const,
  motion,
  button,
  strength,
  includeSuperArts: true as const,
});
it.each([
  ["ken", "ken__normal_2_K_H", "34", "8"],
  ["marisa", "marisa__normal_2_K_M", "29", "9"],
])(
  "uses the explicitly stored whiff total for %s",
  (id, moveId, total, startup) => {
    const c = char(id),
      m = c.moves.find((m) => m.id === moveId)!;
    for (const mode of ["normal", "startup"] as const)
      expect(resolveMove(c, m.input, mode)).toMatchObject({
        status: "found",
        frames: {
          total: {
            display: total,
            numeric: Number(total),
            provenance: "source",
          },
          startup: { display: startup },
        },
      });
    expect(c.source.verification).toBe("unverified");
  },
);
it("keeps newly displayable common strengths independent across modes", () => {
  const c = char("jamie");
  let game = startGame(
    production,
    "normal",
    5,
    () => (production.eligible.indexOf(c) + 0.5) / production.eligible.length,
  );
  for (const s of ["L", "M", "H"] as const) {
    const input = query("22", "P", s),
      next = ask(game, input);
    expect(next).toMatchObject({ status: "found" });
    game = next.game;
    expect(game.history.at(-1)!.result).toMatchObject({
      frames: {
        hit: { status: "not_applicable", display: "-" },
        block: { status: "not_applicable", display: "-" },
      },
    });
    expect(ask(changeMode(game, "startup"), input).status).toBe("duplicate");
  }
  expect(game.history).toHaveLength(3);
  expect(resolveMove(c, query("22", "P", "OD"), "normal").status).toBe(
    "not_found",
  );
});
it("distinguishes explicit Cargo dashes and delayed knockdown from missing values", () => {
  expect(
    resolveMove(char("alex"), query("63214", "P", "L"), "normal"),
  ).toMatchObject({
    status: "found",
    frames: {
      block: { status: "not_applicable", display: "-" },
      hit: { display: "D" },
    },
  });
  expect(
    resolveMove(char("jp"), query("214", "P", "H"), "normal"),
  ).toMatchObject({ status: "found", frames: { hit: { display: "D" } } });
  for (const id of ["akuma", "marisa", "ryu"]) {
    const input = query("236", "K", id === "akuma" ? "L" : "OD");
    expect(resolveMove(char(id), input, "normal").status).toBe("found");
    if (id !== "akuma")
      expect(resolveMove(char(id), input, "normal")).toMatchObject({
        frames: { hit: { display: "D" } },
      });
    expect(resolveMove(char(id), input, "startup").status).toBe("found");
  }
  const c = char("zangief"),
    m = c.moves.find((m) => m.id === "zangief__normal_5_P_H")!;
  for (const mode of ["normal", "startup"] as const) {
    const game = startGame(
      production,
      mode,
      5,
      () => (production.eligible.indexOf(c) + 0.5) / production.eligible.length,
    );
    expect(ask(game, m.input).status).toBe("found");
    expect(ask(game, m.input).game.history).toHaveLength(1);
    expect(m.frames.startup).toEqual({
      status: "confirmed",
      display: "16",
      numeric: 16,
    });
  }
});
it("refuses to overwrite a different known value and remains idempotent", () => {
  const c = char("ken");
  expect(applyFrameResearch(c)).toEqual(c);
  const tampered = structuredClone(c);
  tampered.moves.find((m) => m.id === "ken__normal_2_K_H")!.frames.total = {
    status: "confirmed",
    display: "999",
    numeric: 999,
    provenance: "source",
    calculation: null,
  };
  expect(() => applyFrameResearch(tampered)).toThrow("exact unknown");
  const wrongInput = structuredClone(c);
  wrongInput.moves.find((m) => m.id === "ken__normal_2_K_H")!.input = {
    type: "normal",
    direction: "5",
    button: "K",
    strength: "H",
  };
  expect(() => applyFrameResearch(wrongInput)).toThrow("evidence mismatch");
});
