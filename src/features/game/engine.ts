import type { Character, Mode, MoveInput } from "../../lib/frame-data/schema";
import type { Dataset } from "../../lib/frame-data/loader";
import { inputKey } from "../../lib/frame-data/input";
import { inputSchema } from "../../lib/frame-data/schema";
import { resolveMove, type Resolution } from "../../lib/frame-data/resolver";

export interface HistoryEntry {
  input: MoveInput;
  result: Resolution;
}
export interface Game {
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
      "収録完了・検証済みで同じバージョンのキャラクターが2体以上必要です。",
    );
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("質問回数は1以上の整数で指定してください。");
  return {
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
  const result = resolveMove(game.target, input, game.mode);
  if (result.status !== "found" && result.status !== "not_found")
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
