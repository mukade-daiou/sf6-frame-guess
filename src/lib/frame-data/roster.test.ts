import { expect, it } from "vitest";
import { production } from "./datasets";
import { startGame, ask } from "../../features/game/engine";
import { resolveMove } from "./resolver";
import { inputKey } from "./input";
import decisions from "../../../data/adoption-decisions.json";
it("preserves the reviewed roster and equally selects only complete scopes, keeping held inputs unknown", () => {
  expect(production.errors).toEqual([]);
  expect(production.characters.map((c) => c.id).sort()).toEqual(
    decisions.characters.map((c) => c.id).sort(),
  );
  expect(production.eligible.map((c) => c.id).sort()).toEqual(
    decisions.characters
      .filter((c) => c.sourceInventoryComplete)
      .map((c) => c.id)
      .sort(),
  );
  const partial = production.characters.filter(
    (c) => c.coverage.special.status === "partial",
  );
  expect(partial).toEqual([]);
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
      (m) =>
        m.adoption?.status === "held" &&
        !game.target.moves.some(
          (base) =>
            base.variant.kind === "base" &&
            base.adoption?.status === "accepted" &&
            inputKey(base.input) === inputKey(m.input),
        ),
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
