import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  trackRotation,
  emptyRotation,
  rotationSuggestions,
  appendDirection,
  getMotionCandidates,
} from "./controller";
import { CommandNotation, MoveNotation } from "../../components/MoveNotation";
import { production } from "../../lib/frame-data/datasets";
it("requires two full signed turns, supports either direction/start and neutral, preserves 360", () => {
  for (const seq of [
    "63214789632147896",
    "69874123698741236",
    "21478963214789632",
    "653525154575859565352515457585956",
  ]) {
    const r = [...seq].reduce(
      (s, d) => trackRotation(s, d as any, 2),
      emptyRotation(),
    );
    expect(r.complete).toBe(true);
  }
  for (const seq of [
    "632147896",
    "6363636363636363",
    "6666666666",
    "63214789698741236",
  ])
    expect(
      [...seq].reduce((s, d) => trackRotation(s, d as any, 2), emptyRotation())
        .complete,
    ).toBe(false);
  expect(
    [..."632147896"].reduce(
      (s, d) => trackRotation(s, d as any),
      emptyRotation(),
    ).complete,
  ).toBe(true);
  expect(rotationSuggestions("6", 2)).toHaveLength(2);
  expect(
    getMotionCandidates(production.inputs, "6", "super_art", 3).filter(
      (m) => m === "720",
    ),
  ).toHaveLength(1);
});
it("preserves charge SA notation and renders dedicated double-rotation/level labels", () => {
  let command = "";
  for (const d of "4646") command = appendDirection(command, "5", d as any);
  expect(command).toBe("[4]646");
  expect(renderToStaticMarkup(<CommandNotation command={command} />)).toContain(
    "charge-direction",
  );
  const input = production.inputs.find(
    (i) => i.type === "super_art" && i.motion === "720",
  )!;
  const markup = renderToStaticMarkup(<MoveNotation input={input} />);
  expect(markup).toContain("2回転");
  expect(markup).toContain("SA3");
});
