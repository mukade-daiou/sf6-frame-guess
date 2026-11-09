import { expect, it } from "vitest";
import twitterText from "twitter-text";
import { production } from "../../lib/frame-data/datasets";
import { startGame } from "./engine";
import { shareText, shareUrl, GAME_URL } from "./share";

it("shares all outcomes and zero through five questions using the current mode", () => {
  for (const mode of ["normal", "startup"] as const)
    for (let n = 0; n <= 5; n++)
      for (const outcome of ["correct", "wrong", "giveup"]) {
        const game = startGame(production, mode);
        game.selectedId =
          outcome === "giveup"
            ? null
            : outcome === "correct"
              ? game.target.id
              : game.candidates.find((c) => c.id !== game.target.id)!.id;
        game.history = Array.from({ length: n }, (_, i) => ({
          input: {
            type: "special",
            motion: "236",
            button: "P",
            strength: (["L", "M", "H", "OD", "L"] as const)[i],
          },
          mode: mode === "normal" ? "startup" : "normal",
          result:
            i === 1
              ? { status: "not_found" }
              : {
                  status: "found",
                  frames: {
                    startup: {
                      status: "conditional",
                      display: "26~",
                      condition: "arrival",
                      openRange: {
                        reference: 26,
                        unspecified: "trailing",
                        evidence: [GAME_URL],
                      },
                    },
                    total: {
                      status: "confirmed",
                      display: "47",
                      numeric: 47,
                      provenance: "source",
                      calculation: null,
                    },
                    hit: { status: "confirmed", display: "D" },
                    block: { status: "confirmed", display: "-5", numeric: -5 },
                  },
                },
        }));
        const text = shareText(game);
        const expected =
          outcome === "giveup"
            ? `ギブアップ｜正解：${game.target.nameJa}`
            : outcome === "correct"
              ? `正解！｜${game.target.nameJa}`
              : `不正解｜回答：${game.candidates.find((c) => c.id === game.selectedId)!.nameJa} → 正解：${game.target.nameJa}`;
        expect(text).toContain(`SF6 フレーム探偵\n\n${expected}\n\n`);
        expect(text).toContain(game.target.nameJa);
        expect(text).toContain(GAME_URL);
        expect(text).toContain(
          outcome === "giveup"
            ? "ギブアップ"
            : outcome === "correct"
              ? "正解"
              : "不正解",
        );
        if (outcome === "wrong")
          expect(text).toContain(
            game.candidates.find((c) => c.id === game.selectedId)!.nameJa,
          );
        if (!n) expect(text).toContain("質問なし");
        else
          expect(text).toContain(
            mode === "normal" ? "236LP 26~/47/D/-5" : "236LP 26~",
          );
        if (n > 1) expect(text).toContain("236MP なし");
        if (mode === "startup") expect(text).not.toContain("/47");
        expect(twitterText.parseTweet(text).weightedLength).toBeLessThanOrEqual(
          280,
        );
        expect(new URL(shareUrl(game)).searchParams.get("text")).toBe(text);
      }
});

it("shortens long histories while preserving order and mandatory information", () => {
  const game = startGame(production, "normal");
  game.history = Array.from({ length: 5 }, (_, i) => ({
    input: {
      type: "special",
      motion: "236236",
      button: "P",
      strength: (["L", "M", "H", "OD", "L"] as const)[i],
    },
    mode: "normal",
    result: {
      status: "found",
      frames: Object.fromEntries(
        ["startup", "total", "hit", "block"].map((k) => [
          k,
          { status: "confirmed", display: "12345678901234567890" },
        ]),
      ) as any,
    },
  }));
  const text = shareText(game);
  expect(twitterText.parseTweet(text).weightedLength).toBeLessThanOrEqual(280);
  expect(text.match(/236236/g)).toHaveLength(5);
  expect(text.indexOf("236236LP")).toBeLessThan(text.indexOf("236236MP"));
  expect(text).toContain(GAME_URL);
  game.target = { ...game.target, nameJa: "名".repeat(100) };
  const omitted = shareText(game);
  expect(omitted).toContain(game.target.nameJa);
  expect(omitted).toMatch(/ほか\d問/);
  expect(twitterText.parseTweet(omitted).weightedLength).toBeLessThanOrEqual(
    280,
  );
});
