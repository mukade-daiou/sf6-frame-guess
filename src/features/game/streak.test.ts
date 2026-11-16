import { expect, it } from "vitest";
import alpha from "../../data/fixtures/characters/fixture-1.json";
import beta from "../../data/fixtures/characters/fixture-2.json";
import metadata from "../../data/fixtures/metadata.json";
import { validateDataset } from "../../lib/frame-data/loader";
import {
  answer,
  ask,
  changeMode,
  continueStreak,
  giveUp,
  isCorrect,
  requestAnswer,
  startGame,
  startStreak,
} from "./engine";

function roster(count: number) {
  const dataset = validateDataset(metadata, {
    alpha: structuredClone(alpha),
    beta: structuredClone(beta),
  });
  dataset.eligible = Array.from({ length: count }, (_, index) => ({
    ...dataset.eligible[index % dataset.eligible.length],
    id: `character-${index}`,
    nameJa: `キャラ${index}`,
  }));
  return dataset;
}

it("only enables an endless sequence with at least 11 characters", () => {
  expect(() => startStreak(roster(10), "normal")).toThrow("11体以上");
  expect(startStreak(roster(11), "normal").runMode).toBe("streak");
  expect(startGame(roster(2), "normal").runMode).toBe("single");
});

it("automatically clears per-question state and excludes the last ten correct answers", () => {
  const dataset = roster(11);
  let game = startStreak(dataset, "normal", 7, () => 0);
  const sequence: string[] = [];
  for (let index = 0; index < 35; index++) {
    expect(game.phase).toBe("question");
    expect(game.history).toHaveLength(0);
    expect(game.selectedId).toBeNull();
    expect(game.streak.map((character) => character.id)).toEqual(sequence);
    expect(sequence.slice(-10)).not.toContain(game.target.id);
    sequence.push(game.target.id);
    const answered = answer(requestAnswer(game), game.target.id);
    expect(isCorrect(answered)).toBe(true);
    game = continueStreak(answered, dataset, () => 0);
    expect(game.streak).toHaveLength(index + 1);
    expect(game.limit).toBe(7);
    expect(game.candidates).toBe(dataset.eligible);
  }
  expect(new Set(sequence.slice(0, 11)).size).toBe(11);
  expect(sequence[11]).toBe(sequence[0]);
});

it("preserves the difficulty and ends on a wrong answer or a give-up", () => {
  const dataset = roster(12);
  const initial = startStreak(dataset, "normal", 4, () => 0);
  expect(changeMode(initial, "startup").mode).toBe("startup");
  expect(continueStreak(initial, dataset)).toBe(initial);

  const result = answer(requestAnswer(initial), initial.target.id);
  let next = continueStreak(result, dataset, () => 0);
  expect(changeMode(next, "startup")).toBe(next);
  expect(next.streak).toHaveLength(1);
  expect(ask(next, next.inputs[0]).game.history).toHaveLength(1);
  const wrongId = next.candidates.find((c) => c.id !== next.target.id)!.id;
  const wrong = answer(requestAnswer(next), wrongId);
  expect(isCorrect(wrong)).toBe(false);
  expect(continueStreak(wrong, dataset)).toBe(wrong);
  expect(wrong.streak).toHaveLength(1);
  next = continueStreak(result, dataset, () => 0);
  const givenUp = giveUp(requestAnswer(next));
  expect(continueStreak(givenUp, dataset)).toBe(givenUp);
  expect(givenUp.streak).toHaveLength(1);
});
