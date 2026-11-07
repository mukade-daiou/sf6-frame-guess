import { expect, it } from "vitest";
import { production } from "./datasets";
import { ask, startGame } from "../../features/game/engine";
import { resolveMove } from "./resolver";
it("resolves a level-free command against the target and keeps strengths independent", () => {
  for (const id of ["ryu", "aki"]) {
    const index = production.eligible.findIndex((c) => c.id === id);
    let g = startGame(production, "normal", 5, () => (index + 0.5) / 32);
    for (const strength of ["L", "M", "H"] as const) {
      const i = {
        type: "special" as const,
        motion: "236236",
        button: "P" as const,
        strength,
        includeSuperArts: true as const,
      };
      const n = ask(g, i);
      expect(n.status).toBe("found");
      g = n.game;
      expect(ask(g, i).status).toBe("duplicate");
    }
    expect(g.history).toHaveLength(3);
  }
});
it("does not choose the first if a combined command collides and respects missing SA coverage", () => {
  const c = structuredClone(production.characters.find((c) => c.id === "ryu")!);
  const i = {
    type: "special" as const,
    motion: "236236",
    button: "P" as const,
    strength: "L" as const,
    includeSuperArts: true as const,
  };
  const m = c.moves.find(
    (m) =>
      m.input.type === "super_art" &&
      m.input.saLevel === 1 &&
      m.input.strength === "L",
  )!;
  c.moves.push({ ...m, id: "collision" });
  expect(resolveMove(c, i, "normal").status).toBe("ambiguous");
  c.coverage.super_art!.status = "partial";
  expect(resolveMove(c, { ...i, motion: "720" }, "normal").status).toBe(
    "unknown",
  );
});
