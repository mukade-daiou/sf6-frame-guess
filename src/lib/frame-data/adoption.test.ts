import { expect, it } from "vitest";
import ken from "../../../data/characters/ken.json";
import marisa from "../../../data/characters/marisa.json";
import metadata from "../../../data/metadata.json";
import { validateDataset } from "./loader";
import { resolveMove } from "./resolver";
import { startGame, ask, answer, isCorrect } from "../../features/game/engine";
const data = () => validateDataset(metadata, { ken, marisa });
it("adopts 63 source-matched moves without falsely verifying the source or patch", () => {
  const d = data();
  expect(d.errors).toEqual([]);
  expect(d.eligible).toHaveLength(2);
  expect(
    d.characters.map(
      (c) =>
        c.moves.filter(
          (m) => m.category !== "super_art" && !m.strengthExpansion,
        ).length,
    ),
  ).toEqual([33, 30]);
  expect(d.review).toBeUndefined();
  for (const c of d.characters) {
    expect(c.adoption?.status).toBe("accepted");
    expect(c.source.verification).toBe("unverified");
    expect(c.gameVersion).toBe("UNVERIFIED");
    expect(c.moves.every((m) => m.source.verification === "unverified")).toBe(
      true,
    );
  }
  const extra = structuredClone(d.characters[0]);
  extra.id = "future-character";
  expect(
    validateDataset(metadata, { ken, marisa, extra }).eligible,
  ).toHaveLength(3);
});
it("distinguishes dataset absence from unknown frames, held moves and missing coverage", () => {
  const d = data(),
    c = d.characters[0];
  const absent = {
    type: "special",
    motion: "214",
    button: "P",
    strength: "L",
  } as const;
  expect(resolveMove(c, absent, "normal").status).toBe("not_found");
  const unknown = c.moves.find((m) => m.notes.includes("upstreamInput: 2HK"))!;
  // Explicit missing-value fixture; the production 2HK total is now researched.
  unknown.frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  expect(resolveMove(c, unknown.input, "normal").status).toBe("unknown");
  expect(resolveMove(c, unknown.input, "startup").status).toBe("found");
  const game = startGame(d, "normal", 5, () => 0);
  expect(ask(game, unknown.input).game.history).toHaveLength(0);
  expect(ask(game, absent).game.history).toHaveLength(1);
  c.coverage.special.status = "partial";
  expect(resolveMove(c, absent, "normal").status).toBe("unknown");
  const move = c.moves[0];
  move.adoption!.status = "held";
  expect(resolveMove(c, move.input, "normal").status).toBe("unknown");
  move.adoption!.status = "accepted";
  move.variant = {
    kind: "conditional",
    condition: "normal-state availability pending",
  };
  expect(resolveMove(c, move.input, "normal").status).toBe("unknown");
});
it.each(["normal", "startup"] as const)(
  "finishes the ordinary game in %s mode for either character",
  (mode) => {
    for (const random of [0, 0.999]) {
      let game = startGame(data(), mode, 5, () => random);
      for (const input of game.inputs) {
        if (game.phase !== "question") break;
        game = ask(game, input).game;
      }
      expect(game.history).toHaveLength(5);
      expect(
        game.history.every(
          (h) => h.result.status === "found" || h.result.status === "not_found",
        ),
      ).toBe(true);
      expect(game.phase).toBe("answer");
      expect(isCorrect(answer(game, game.target.id))).toBe(true);
      expect(
        isCorrect(
          answer(
            game,
            game.candidates.find((c) => c.id !== game.target.id)!.id,
          ),
        ),
      ).toBe(false);
      expect(startGame(data(), mode).history).toHaveLength(0);
    }
  },
);
