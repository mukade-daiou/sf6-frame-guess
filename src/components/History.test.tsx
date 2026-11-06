import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { History } from "./History";
import { production } from "../lib/frame-data/datasets";
import { startGame, ask, changeMode } from "../features/game/engine";

it("switches all historical rows to the current mode, including unknown saved fields", () => {
  let game = startGame(
    production,
    "startup",
    5,
    () =>
      (production.eligible.findIndex((c) => c.id === "ken") + 0.5) /
      production.eligible.length,
  );
  const input = game.inputs.find(
    (i) =>
      i.type === "normal" &&
      i.direction === "2" &&
      i.button === "K" &&
      i.strength === "H",
  )!;
  game = ask(game, input).game;
  const history = game.history;
  const render = () =>
    renderToStaticMarkup(<History entries={game.history} mode={game.mode} />);
  expect(render()).not.toContain("history-mode");
  expect((render().match(/<dd>/g) || []).length).toBe(1);
  game = changeMode(game, "normal");
  expect(game.history).toBe(history);
  expect((render().match(/<dd>/g) || []).length).toBe(4);
  expect(render()).toContain("不明");
  expect(ask(game, input).status).toBe("duplicate");
  game = ask(game, {
    type: "normal",
    direction: "5",
    button: "P",
    strength: "L",
  }).game;
  expect(game.history.map((h) => h.mode)).toEqual(["startup", "normal"]);
  expect((render().match(/<dd>/g) || []).length).toBe(8);
  game = changeMode(game, "startup");
  expect((render().match(/<dd>/g) || []).length).toBe(2);
  expect(render()).not.toContain("全体F");
  expect(render()).not.toContain("ノーマル");
});
