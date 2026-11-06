import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { reviewDataset } from "./review-dataset";
import { resolveReviewMove } from "./review-resolver";
import { resolveMove } from "./resolver";
import { inputSchema, type MoveInput } from "./schema";
import { inputKey } from "./input";
import { validateDataset } from "./loader";
import { startGame, ask, answer, isCorrect } from "../../features/game/engine";
import { History } from "../../components/History";
import { MoveSelector } from "../../features/move-selector/MoveSelector";

const dash: MoveInput = {
  type: "special",
  motion: "none",
  button: "K",
  strength: "none",
  buttonCombination: "LK+MK",
};
it("keeps simultaneous input explicit, unique and distinct from OD", () => {
  expect(inputSchema.safeParse(dash).success).toBe(true);
  expect(inputKey(dash)).not.toBe(
    inputKey({ type: "special", motion: "5", button: "K", strength: "OD" }),
  );
  for (const input of [
    { ...dash, buttonCombination: undefined },
    { ...dash, strength: "OD" },
    { ...dash, motion: "236" },
    { ...dash, button: "P" },
  ])
    expect(inputSchema.safeParse(input).success).toBe(false);
  expect(
    renderToStaticMarkup(<MoveSelector inputs={[dash]} onAsk={() => {}} />),
  ).not.toContain("同時押し（モーションなし）");
  expect(
    startGame(reviewDataset, "normal").inputs.some(
      (i) => inputKey(i) === inputKey(dash),
    ),
  ).toBe(false);
});
it("does not relax production validation or alter source verification", () => {
  expect(reviewDataset.errors).toEqual([]);
  expect(reviewDataset.eligible).toHaveLength(2);
  const production = validateDataset(
    reviewDataset.metadata,
    Object.fromEntries(reviewDataset.characters.map((c) => [c.id, c])),
  );
  expect(production.eligible).toEqual([]);
  expect(production.review).toBeUndefined();
  for (const c of reviewDataset.characters) {
    expect(c.source.verification).toBe("unverified");
    expect(c.coverage.special.status).toBe("partial");
    expect(resolveMove(c, c.moves[0].input, "normal").status).toBe("unknown");
  }
});
it.each(["normal", "startup"] as const)(
  "plays five review questions and both answer outcomes in %s mode",
  (mode) => {
    for (const random of [0, 0.999]) {
      let game = startGame(reviewDataset, mode, 5, () => random);
      expect(game.target.id).toBe(random ? "marisa" : "ken");
      for (const input of reviewDataset.inputs
        .filter((i) => i.type === "normal" && i.direction === "5")
        .slice(0, 5)) {
        const result = ask(game, input);
        expect(result.status).toBe("review");
        game = result.game;
      }
      expect(game.history).toHaveLength(5);
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
      expect(startGame(reviewDataset, mode).history).toEqual([]);
      const html = renderToStaticMarkup(
        <History entries={game.history} mode={mode} />,
      );
      expect(html).toContain("未検証");
      expect(html.includes("全体F")).toBe(mode === "normal");
    }
  },
);
it("separates audited-source absence, missing data, conditional values and OD pairing", () => {
  const ken = structuredClone(
    reviewDataset.characters.find((c) => c.id === "ken")!,
  );
  const policy = reviewDataset.review!.absentInputs;
  const absent = reviewDataset.inputs.find((i) =>
    policy.ken.includes(inputKey(i)),
  )!;
  const absentResult = resolveReviewMove(ken, absent, policy);
  expect(absentResult.status === "review" && absentResult.assessment).toBe(
    "source_absent",
  );
  const missing = resolveReviewMove(
    ken,
    { type: "special", motion: "999", button: "P", strength: "L" },
    policy,
  );
  expect(missing.status === "review" && missing.assessment).toBe(
    "not_recorded",
  );
  const conditional = resolveReviewMove(ken, dash, policy);
  expect(
    conditional.status === "review" && conditional.frames?.startup.status,
  ).toBe("not_applicable");
  const od = ken.moves.find((m) => m.input.strength === "OD")!;
  const odResult = resolveReviewMove(ken, od.input, policy);
  expect(odResult.status === "review" && odResult.reason).toContain(
    "対応は未確認",
  );
  const move = ken.moves[0];
  move.frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  const unknownResult = resolveReviewMove(ken, move.input, policy);
  const game = startGame(reviewDataset, "normal");
  const html = renderToStaticMarkup(
    <History
      mode={game.mode}
      entries={[
        { input: move.input, result: unknownResult, mode: game.mode },
        { input: dash, result: conditional, mode: game.mode },
      ]}
    />,
  );
  expect(html).toContain("不明");
  expect(html).not.toContain("11(9)");
  ken.moves.push({ ...move, id: "duplicate" });
  const collision = resolveReviewMove(ken, move.input, policy);
  expect(collision.status === "review" && collision.assessment).toBe(
    "ambiguous",
  );
});

it("records missing review data without asserting absence and refuses collisions", () => {
  let game = startGame(reviewDataset, "normal", 5, () => 0);
  game = { ...game, target: structuredClone(game.target) };
  const move = game.target.moves[0];
  game.target.moves = game.target.moves.filter((m) => m.id !== move.id);
  const missing = ask(game, move.input);
  expect(missing.status).toBe("unknown");
  expect(missing.game.history).toHaveLength(0);
  game.target.moves.push(move, { ...move, id: "collision" });
  expect(ask(game, move.input).status).toBe("ambiguous");
  expect(ask(game, move.input).game.history).toHaveLength(0);
});
