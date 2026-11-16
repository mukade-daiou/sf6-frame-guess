import { expect, it } from "vitest";
import twitterText from "twitter-text";
import { production } from "../../lib/frame-data/datasets";
import { answer, requestAnswer, startStreak } from "./engine";
import { GAME_URL, shareText, shareUrl } from "./share";

it("shares a running streak without leaking the unguessed target", () => {
  const game = startStreak(production, "startup", 7, () => 0);
  game.streak = production.eligible.slice(0, 3);
  const text = shareText(game);
  expect(text).toContain("連続モード\nHard｜3問連続正解");
  expect(text).toContain(
    game.streak.map((character) => character.nameJa).join(" → "),
  );
  expect(text).not.toContain("正解：" + game.target.nameJa);
  expect(text).toContain(GAME_URL);
  expect(new URL(shareUrl(game)).searchParams.get("text")).toBe(text);
  expect(twitterText.parseTweet(text).weightedLength).toBeLessThanOrEqual(280);
});

it("keeps the score and ordered character prefix, truncating a long streak with an ellipsis", () => {
  const game = startStreak(production, "normal");
  game.streak = Array.from(
    { length: 150 },
    (_, index) => production.eligible[index % production.eligible.length],
  );
  const text = shareText(game);
  expect(text).toContain("Normal｜150問連続正解");
  expect(text).toContain("正解キャラ：");
  expect(text).toContain(
    game.streak
      .slice(0, 3)
      .map((character) => character.nameJa)
      .join(" → "),
  );
  expect(text).toContain(" → …");
  expect(text).toContain(GAME_URL);
  expect(twitterText.parseTweet(text).weightedLength).toBeLessThanOrEqual(280);
});

it("retains the finished streak on defeat and supports zero correct answers", () => {
  const game = startStreak(production, "normal", 7, () => 0);
  expect(shareText(game)).toContain("0問連続正解");
  expect(shareText(game)).toContain("正解キャラ：なし");
  const otherId = game.candidates.find((c) => c.id !== game.target.id)!.id;
  const finished = answer(requestAnswer(game), otherId);
  finished.streak = production.eligible.slice(0, 2);
  expect(shareText(finished)).toContain("2問連続正解");
  expect(shareText(finished)).toContain("不正解で終了");
  expect(shareText(finished)).not.toContain("正解：" + game.target.nameJa);
});
