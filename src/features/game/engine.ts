import type { Character, Mode, MoveInput } from "../../lib/frame-data/schema";
import type { Dataset } from "../../lib/frame-data/loader";
import { inputKey } from "../../lib/frame-data/input";
import { inputSchema } from "../../lib/frame-data/schema";
import { resolveMove, type Resolution } from "../../lib/frame-data/resolver";
import { resolveReviewMove } from "../../lib/frame-data/review-resolver";
import { isDisplayable } from "../../lib/frame-data/resolver";

export interface HistoryEntry {
  input: MoveInput;
  result: Resolution;
}
export interface Game {
  review?: Dataset["review"];
  phase: "question" | "answer" | "result";
  target: Character;
  candidates: Character[];
  inputs: MoveInput[];
  mode: Mode;
  limit: number;
  history: HistoryEntry[];
  selectedId: string | null;
}
export function startGame(
  dataset: Dataset,
  mode: Mode,
  limit = 5,
  random = Math.random,
): Game {
  if (dataset.eligible.length < 2)
    throw new Error(
      "採用済みで収録範囲が確定したキャラクターが2体以上必要です。",
    );
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("質問回数は1以上の整数で指定してください。");
  return {
    review: dataset.review,
    phase: "question",
    target:
      dataset.eligible[
        Math.min(
          dataset.eligible.length - 1,
          Math.max(0, Math.floor(random() * dataset.eligible.length)),
        )
      ],
    candidates: dataset.eligible,
    inputs: dataset.inputs,
    mode,
    limit,
    history: [],
    selectedId: null,
  };
}
export function ask(
  game: Game,
  raw: unknown,
): {
  game: Game;
  status:
    Resolution["status"] | "duplicate" | "invalid" | "unsupported" | "closed";
} {
  if (game.phase !== "question") return { game, status: "closed" };
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { game, status: "invalid" };
  const input = parsed.data;
  if (!game.inputs.some((i) => inputKey(i) === inputKey(input)))
    return { game, status: "unsupported" };
  if (game.history.some((h) => inputKey(h.input) === inputKey(input)))
    return { game, status: "duplicate" };
  const result = game.review
    ? resolveReviewMove(game.target, input, game.review.absentInputs)
    : resolveMove(game.target, input, game.mode);
  if (result.status === "review" && result.assessment === "ambiguous")
    return { game, status: "ambiguous" };
  if (
    result.status === "review" &&
    (result.assessment === "not_recorded" ||
      (result.frames &&
        (game.mode === "startup"
          ? [result.frames.startup]
          : Object.values(result.frames)
        ).some((v) => !isDisplayable(v))))
  )
    return { game, status: "unknown" };
  if (
    result.status !== "found" &&
    result.status !== "not_found" &&
    result.status !== "review"
  )
    return { game, status: result.status };
  const history = [...game.history, { input, result }];
  return {
    game: {
      ...game,
      history,
      phase: history.length >= game.limit ? "answer" : "question",
    },
    status: result.status,
  };
}
export function answer(game: Game, selectedId: string): Game {
  if (
    game.phase !== "answer" ||
    !game.candidates.some((c) => c.id === selectedId)
  )
    return game;
  return { ...game, phase: "result", selectedId };
}
export function isCorrect(game: Game): boolean {
  return game.phase === "result" && game.selectedId === game.target.id;
}
