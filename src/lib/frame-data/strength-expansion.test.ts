import { expect, it } from "vitest";
import { production } from "./datasets";
import {
  generateStrengthExpansions,
  withStrengthExpansions,
} from "./strength-expansion";
import { resolveMove } from "./resolver";
import { ask, startGame, changeMode } from "../../features/game/engine";
const character = (id: string) =>
  production.characters.find((c) => c.id === id)!;
const query = (strength: "L" | "M" | "H" | "OD", includeSuperArts = true) => ({
  type: "special" as const,
  motion: "22",
  button: "P" as const,
  strength,
  ...(includeSuperArts ? { includeSuperArts: true as const } : {}),
});
it("exposes 22P at all strengths with independent queries and shares the source frames", () => {
  const c = character("ryu"),
    source = c.moves.find(
      (m) =>
        m.input.type === "special" &&
        m.input.motion === "22" &&
        m.input.strength === "none",
    )!;
  let game = startGame(
    production,
    "normal",
    5,
    () => (production.eligible.indexOf(c) + 0.5) / 32,
  );
  for (const strength of ["L", "M", "H"] as const) {
    const result = resolveMove(c, query(strength), "normal");
    expect(result).toEqual({ status: "found", frames: source.frames });
    const next = ask(game, query(strength));
    expect(next.status).toBe("found");
    game = next.game;
    expect(ask(changeMode(game, "startup"), query(strength)).status).toBe(
      "duplicate",
    );
  }
  expect(game.history).toHaveLength(3);
  expect(ask(game, query("OD")).status).toBe("not_found");
  expect(ask(game, query("OD")).game.history).toHaveLength(4);
  expect(
    c.moves
      .filter((m) => m.strengthExpansion)
      .some((m) => m.input.strength === "OD"),
  ).toBe(false);
});
it.each(["e_honda", "blanka", "chunli", "jp", "dee_jay"])(
  "expands accepted non-22 motions without altering original frames: %s",
  (id) => {
    const c = character(id);
    for (const m of c.moves.filter((m) => m.strengthExpansion)) {
      const source = c.moves.find(
        (s) => s.id === m.strengthExpansion!.sourceMoveId,
      )!;
      expect(m.frames).toEqual(source.frames);
      expect(m.source).toEqual(source.source);
    }
    expect(c.moves.some((m) => m.strengthExpansion)).toBe(true);
    expect(withStrengthExpansions(c)).toEqual(c);
  },
);
it("preserves real missing fields and never expands held, conditional or excluded sources", () => {
  const jamie = character("jamie");
  expect(resolveMove(jamie, query("L"), "normal").status).toBe("unknown");
  expect(resolveMove(jamie, query("L"), "startup").status).toBe("found");
  for (const id of ["cviper", "jamie", "guile", "ken", "zangief"]) {
    const c = character(id);
    const omitted = new Set(
      c.moves
        .filter(
          (m) =>
            m.input.strength === "none" &&
            (m.adoption?.status !== "accepted" ||
              m.variant.kind !== "base" ||
              (m.input.type === "special" && m.input.motion === "none")),
        )
        .map((m) => m.id),
    );
    expect(
      generateStrengthExpansions(c).some((m) =>
        omitted.has(m.strengthExpansion!.sourceMoveId),
      ),
    ).toBe(false);
  }
});
it("prioritizes explicit strengths and retains ambiguous or held explicit records", () => {
  const c = structuredClone(character("ryu"));
  c.moves = c.moves.filter((m) => !m.strengthExpansion);
  const source = c.moves.find(
    (m) =>
      m.input.type === "special" &&
      m.input.motion === "22" &&
      m.input.strength === "none",
  )!;
  const explicit = {
    ...structuredClone(source),
    id: "explicit-L",
    input: { ...query("L", false) },
    frames: {
      ...source.frames,
      startup: { status: "confirmed" as const, display: "99", numeric: 99 },
    },
  };
  c.moves.push(explicit);
  let expanded = withStrengthExpansions(c);
  expect(
    expanded.moves.filter(
      (m) =>
        m.strengthExpansion && m.strengthExpansion.sourceMoveId === source.id,
    ),
  ).toHaveLength(2);
  expect(resolveMove(expanded, query("L"), "startup")).toMatchObject({
    frames: { startup: { numeric: 99 } },
  });
  c.moves.push({ ...explicit, id: "conflict" });
  expanded = withStrengthExpansions(c);
  expect(resolveMove(expanded, query("L"), "startup").status).toBe("ambiguous");
  c.moves = c.moves.filter((m) => m.id !== "conflict");
  explicit.adoption = { status: "held", basis: "test pending" };
  expanded = withStrengthExpansions(c);
  expect(resolveMove(expanded, query("L"), "startup").status).toBe("unknown");
});
it("does not turn absent OD into unknown merely due to strength none or SA coverage", () => {
  const c = structuredClone(character("ryu"));
  c.coverage.super_art!.status = "partial";
  for (const combined of [true, false])
    expect(resolveMove(c, query("OD", combined), "normal").status).toBe(
      "not_found",
    );
  c.coverage.special.status = "partial";
  expect(resolveMove(c, query("OD"), "normal").status).toBe("unknown");
  c.coverage.special.status = "unrecorded";
  expect(resolveMove(c, query("OD"), "normal").status).toBe("unknown");
  c.coverage.special.status = "complete";
  const base = c.moves.find(
    (m) =>
      m.input.type === "special" &&
      m.input.motion === "22" &&
      m.input.strength === "none",
  )!;
  c.moves.push({
    ...structuredClone(base),
    id: "held-od",
    input: query("OD", false),
    adoption: { status: "held", basis: "pending" },
    variant: { kind: "conditional", condition: "test" },
  });
  expect(resolveMove(c, query("OD"), "normal").status).toBe("unknown");
  const viper = character("cviper");
  expect(
    resolveMove(viper, { ...query("OD"), motion: "214", button: "K" }, "normal")
      .status,
  ).toBe("unknown");
});
