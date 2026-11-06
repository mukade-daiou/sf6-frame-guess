import { expect, it } from "vitest";
import { production } from "./datasets";
import { startGame, ask } from "../../features/game/engine";
import { resolveMove } from "./resolver";
it("preserves 32 characters and equally selects only complete scopes, keeping held inputs unknown", () => {
  expect(production.errors).toEqual([]);
  expect(production.characters).toHaveLength(32);
  expect(production.eligible).toHaveLength(26);
  const partial = production.characters.filter(
    (c) => c.coverage.special.status === "partial",
  );
  expect(partial.map((c) => c.id).sort()).toEqual([
    "akuma",
    "blanka",
    "dhalsim",
    "ed",
    "ingrid",
    "rashid",
  ]);
  for (const c of partial) {
    expect(production.eligible).not.toContain(c);
    expect(
      resolveMove(
        c,
        { type: "special", motion: "360", button: "P", strength: "L" },
        "startup",
      ).status,
    ).toBe("unknown");
  }
  for (let i = 0; i < production.eligible.length; i++) {
    const game = startGame(
      production,
      "startup",
      5,
      () => (i + 0.5) / production.eligible.length,
    );
    expect(game.target.id).toBe(production.eligible[i].id);
    expect(game.inputs).toEqual(production.inputs);
    expect(game.target.source.verification).toBe("unverified");
    for (const m of game.target.moves.filter(
      (m) => m.adoption?.status === "held",
    ))
      expect(resolveMove(game.target, m.input, "startup").status).toBe(
        "unknown",
      );
    let g = game;
    for (const input of g.inputs) {
      if (g.phase !== "question") break;
      g = ask(g, input).game;
    }
    expect(g.history).toHaveLength(5);
  }
});
