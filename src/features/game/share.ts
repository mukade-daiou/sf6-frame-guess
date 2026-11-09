import twitterText from "twitter-text";
import type { Game } from "./engine";
import { displayInput } from "../../lib/frame-data/input";
import { displayFrame } from "../../lib/frame-data/resolver";

export const GAME_URL = "https://mukade-daiou.github.io/sf6-frame-guess/";
const weight = (text: string) => twitterText.parseTweet(text).weightedLength;

export function shareText(game: Game): string {
  const correct = game.selectedId === game.target.id;
  const result =
    game.selectedId === null
      ? `ギブアップ｜正解：${game.target.nameJa}`
      : correct
        ? `正解！｜${game.target.nameJa}`
        : `不正解｜回答：${game.candidates.find((c) => c.id === game.selectedId)!.nameJa} → 正解：${game.target.nameJa}`;
  const header = `SF6 フレーム探偵\n\n${result}\n`;
  const variants = game.history.map(({ input, result }) => {
    const command = displayInput(input);
    if (
      result.status === "not_found" ||
      (result.status === "review" && result.assessment === "source_absent")
    )
      return [`${command} なし`, command];
    const frames = "frames" in result ? result.frames : null;
    if (!frames) return [command];
    const f = (key: keyof typeof frames) => displayFrame(frames[key]);
    return game.mode === "startup"
      ? [`${command} ${f("startup")}`, command]
      : [
          `${command} ${["startup", "total", "hit", "block"].map((k) => f(k as keyof typeof frames)).join("/")}`,
          `${command} ${f("startup")}/${f("block")}`,
          `${command} ${f("startup")}`,
          command,
        ];
  });
  const levels = variants.map(() => 0);
  let count = variants.length;
  const compose = () =>
    [
      header,
      ...(variants.length
        ? variants.slice(0, count).map((v, i) => v[levels[i]])
        : ["質問なし"]),
      ...(count < variants.length ? [`ほか${variants.length - count}問`] : []),
      "",
      GAME_URL,
    ].join("\n");
  while (weight(compose()) > 280) {
    const available = variants
      .map((v, i) => (i < count && levels[i] < v.length - 1 ? i : -1))
      .filter((i) => i >= 0);
    if (available.length) {
      available.sort(
        (a, b) =>
          weight(variants[b][levels[b]]) - weight(variants[a][levels[a]]) ||
          a - b,
      );
      levels[available[0]]++;
    } else if (count) count--;
    else throw new Error("必須情報が投稿上限を超えています");
  }
  const text = compose();
  return weight(`${text}\n#SF6`) <= 280 ? `${text}\n#SF6` : text;
}

export function shareUrl(game: Game): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(game))}`;
}
