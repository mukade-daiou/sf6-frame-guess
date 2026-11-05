import { expect, it } from "vitest";
import alpha from "../../data/fixtures/characters/fixture-1.json";
import beta from "../../data/fixtures/characters/fixture-2.json";
import metadata from "../../data/fixtures/metadata.json";
import { validateDataset } from "../../lib/frame-data/loader";
import { inputKey } from "../../lib/frame-data/input";
import { answer, ask, isCorrect, startGame } from "./engine";

const dataset = () =>
  validateDataset(metadata, {
    alpha: structuredClone(alpha),
    beta: structuredClone(beta),
  });
it("consumes found/absent questions, prevents duplicates, enters answer after five, checks answer, replays", () => {
  const data = dataset();
  let game = startGame(data, "normal", 5, () => 0);
  const first = game.inputs[0];
  game = ask(game, first).game;
  expect(game.history).toHaveLength(1);
  expect(ask(game, first).status).toBe("duplicate");
  expect(ask(game, first).game).toBe(game);
  expect(answer(game, game.target.id)).toBe(game);
  const absent = data.inputs.find(
    (i) => !game.target.moves.some((m) => inputKey(m.input) === inputKey(i)),
  )!;
  const response = ask(game, absent);
  expect(response.status).toBe("not_found");
  game = response.game;
  for (const input of data.inputs.slice(1, 4)) game = ask(game, input).game;
  expect(game.history).toHaveLength(5);
  expect(game.phase).toBe("answer");
  expect(ask(game, data.inputs[6]).status).toBe("closed");
  expect(answer(game, "invalid")).toBe(game);
  expect(isCorrect(answer(game, game.target.id))).toBe(true);
  expect(isCorrect(answer(game, beta.id))).toBe(false);
  const replay = startGame(data, "startup", 3, () => 0.99);
  expect(replay.history).toHaveLength(0);
  expect(replay.phase).toBe("question");
  expect(replay.mode).toBe("startup");
  expect(replay.limit).toBe(3);
  expect(replay.target.id).toBe(beta.id);
});
it("does not consume invalid, unsupported, unknown or ambiguous questions", () => {
  let game = startGame(dataset(), "normal", 5, () => 0);
  expect(ask(game, { type: "normal", strength: "OD" }).status).toBe("invalid");
  expect(
    ask(game, { type: "special", motion: "999", button: "P", strength: "L" })
      .status,
  ).toBe("unsupported");
  game.target.moves[0].frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  expect(ask(game, game.inputs[0]).status).toBe("unknown");
  expect(ask(game, game.inputs[0]).game.history).toHaveLength(0);
  expect(ask({ ...game, mode: "startup" }, game.inputs[0]).status).toBe(
    "found",
  );
  game.target.moves.push({ ...game.target.moves[0], id: "duplicate" });
  expect(ask(game, game.inputs[0]).status).toBe("ambiguous");
  expect(ask(game, game.inputs[0]).game.history).toHaveLength(0);
});
it("rejects fewer than two eligible characters and invalid limits", () => {
  const data = dataset();
  data.eligible = data.eligible.slice(0, 1);
  expect(() => startGame(data, "normal")).toThrow();
  expect(() => startGame(dataset(), "normal", 0)).toThrow();
});
