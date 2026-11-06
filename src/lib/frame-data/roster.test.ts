import { expect, it } from "vitest";
import { production } from "./datasets";
import { startGame, ask } from "../../features/game/engine";
import { resolveMove } from "./resolver";
it("loads all 32 equally selectable characters and keeps held inputs unknown", () => {
  expect(production.errors).toEqual([]);
  expect(production.eligible).toHaveLength(32);
  for (let i = 0; i < 32; i++) {
    const game = startGame(production, "startup", 5, () => (i + 0.5) / 32);
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
