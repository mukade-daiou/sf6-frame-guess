import { expect, it } from "vitest";
import alpha from "../../data/fixtures/characters/fixture-1.json";
import beta from "../../data/fixtures/characters/fixture-2.json";
import metadata from "../../data/fixtures/metadata.json";
import { validateDataset } from "../../lib/frame-data/loader";
import { inputKey } from "../../lib/frame-data/input";
import {
  answer,
  ask,
  isCorrect,
  startGame,
  changeMode,
  requestAnswer,
} from "./engine";

const dataset = () =>
  validateDataset(metadata, {
    alpha: structuredClone(alpha),
    beta: structuredClone(beta),
  });
it.each([0, 2, 4])(
  "allows an early final answer after %i questions without changing the count or target",
  (count) => {
    let game = startGame(dataset(), "normal", 5, () => 0);
    for (const input of game.inputs.slice(0, count))
      game = ask(game, input).game;
    expect(game.history).toHaveLength(count);
    const ended = requestAnswer(game);
    expect(ended.phase).toBe("answer");
    expect(ended.history).toBe(game.history);
    expect(ended.target).toBe(game.target);
    expect(ended.mode).toBe(game.mode);
    expect(ask(ended, game.inputs[count]).status).toBe("closed");
    expect(requestAnswer(ended)).toBe(ended);
    const result = answer(ended, ended.target.id);
    expect(isCorrect(result)).toBe(true);
    expect(result.history).toHaveLength(count);
    expect(isCorrect(answer(ended, beta.id))).toBe(false);
    expect(requestAnswer(result)).toBe(result);
  },
);
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
it("keeps the target, count and immutable question-time mode/results while switching modes", () => {
  let game = startGame(dataset(), "normal", 2, () => 0);
  const first = game.inputs[0];
  game.target.moves[0].frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  expect(ask(game, first).status).toBe("unknown");
  const switched = changeMode(game, "startup");
  expect(switched.target).toBe(game.target);
  expect(switched.history).toBe(game.history);
  game = ask(switched, first).game;
  const saved = JSON.stringify(game.history);
  game = changeMode(game, "normal");
  expect(game.history[0].mode).toBe("startup");
  expect(ask(game, first).status).toBe("duplicate");
  game.target.moves[0].frames.startup.display = "999";
  expect(JSON.stringify(game.history)).toBe(saved);
  game = ask(game, game.inputs[1]).game;
  expect(game.history.map((h) => h.mode)).toEqual(["startup", "normal"]);
  const changedAnswer = changeMode(game, "startup");
  expect(changedAnswer.phase).toBe("answer");
  expect(changedAnswer.history).toBe(game.history);
  expect(changedAnswer.mode).toBe("startup");
  const result = answer(changedAnswer, changedAnswer.target.id);
  const changedResult = changeMode(result, "normal");
  expect(changedResult.phase).toBe("result");
  expect(changedResult.selectedId).toBe(result.selectedId);
  expect(changedResult.history).toBe(result.history);
  expect(changedResult.mode).toBe("normal");
});
