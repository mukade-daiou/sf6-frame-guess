import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { History } from "./History";
import { production } from "../lib/frame-data/datasets";
import { startGame, ask, changeMode } from "../features/game/engine";
import { Frames } from "../features/moves/MovesPage";

it("shows knockdowns in Japanese in history while preserving other values and the inventory notation", () => {
  let game = startGame(production, "normal", 5, () => 0);
  const input = game.inputs.find((i) => i.type === "normal")!;
  game = ask(game, input).game;
  const entry = game.history[0];
  if (!entry || entry.result.status !== "found")
    throw new Error("Expected a found move");
  const frames = entry.result.frames;
  frames.startup = { status: "confirmed", display: "4" };
  frames.total = {
    status: "not_applicable",
    display: null,
    provenance: null,
    calculation: null,
  };
  frames.hit = { status: "confirmed", display: "D" };
  frames.block = { status: "unknown", display: null };
  const html = renderToStaticMarkup(
    <History entries={[entry]} mode="normal" />,
  );
  expect(html).toContain("<dd>4</dd>");
  expect(html).toContain("<dd>対象外</dd>");
  expect(html).toContain("<dd>ダウン</dd>");
  expect(html).toContain("<dd>不明</dd>");
  const move = { ...game.target.moves[0], frames };
  expect(
    renderToStaticMarkup(
      <table>
        <tbody>
          <tr>
            <Frames move={move} />
          </tr>
        </tbody>
      </table>,
    ),
  ).toContain(">D</td>");
});

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
  game = { ...game, target: structuredClone(game.target) };
  game.target.moves.find((m) => m.id === "ken__normal_2_K_H")!.frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
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
  expect(render().indexOf('aria-label="5LP"')).toBeLessThan(
    render().indexOf('aria-label="2HK"'),
  );
  expect((render().match(/<dd>/g) || []).length).toBe(8);
  game = changeMode(game, "startup");
  expect((render().match(/<dd>/g) || []).length).toBe(2);
  expect(render()).not.toContain("全体F");
  expect(render()).not.toContain("Normal");
  expect(render()).not.toContain("Hard");
});
