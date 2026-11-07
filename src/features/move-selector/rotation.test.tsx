import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  emptyRotation,
  trackRotation,
  type Direction,
  selectAttack,
  getMotionCandidates,
  rotationSuggestions,
} from "./controller";
import { MoveNotation, RotationIcon } from "../../components/MoveNotation";
import { production } from "../../lib/frame-data/datasets";
import { resolveMove, displayFrame } from "../../lib/frame-data/resolver";
const rotate = (sequence: string) =>
  [...sequence].reduce(
    (state, d) => trackRotation(state, d as Direction),
    emptyRotation(),
  );
it("matches both rotational paths while offering one canonical motion", () => {
  expect(
    getMotionCandidates(production.inputs, "6").filter((m) => m === "360"),
  ).toHaveLength(1);
  expect(rotationSuggestions("6").map((p) => p.sequence)).toEqual([
    "632147896",
    "698741236",
  ]);
  expect(rotationSuggestions("63214")).toEqual([
    { sequence: "632147896", clockwise: true },
  ]);
  expect(rotationSuggestions("69874")).toEqual([
    { sequence: "698741236", clockwise: false },
  ]);
  expect(rotationSuggestions("636")).toEqual([]);
  expect(rotationSuggestions("22")).toEqual([]);
});
it.each(["632147896", "698741236", "62486", "68426", "65352515457585956"])(
  "recognizes a full continuous or tapped turn: %s",
  (sequence) => {
    expect(rotate(sequence).complete).toBe(true);
  },
);
it.each([
  "6",
  "6363636363",
  "646464646",
  "6321478",
  "66666666",
  "69276384",
  "236",
  "214",
  "623",
  "22",
])(
  "rejects short, repeated, reversing or discontinuous turns: %s",
  (sequence) => {
    expect(rotate(sequence).complete).toBe(false);
  },
);
it("clear starts a new rotation and both completed directions use one canonical input", () => {
  expect(rotate("632147896").steps).toBe(8);
  expect(rotate("698741236").steps).toBe(-8);
  expect(trackRotation(emptyRotation(), "6").complete).toBe(false);
  expect(renderToStaticMarkup(<RotationIcon clockwise={false} />)).toContain(
    "scale(-1 1)",
  );
  expect(getMotionCandidates(production.inputs, "360")).toEqual(["360", "720"]);
  expect(getMotionCandidates(production.inputs, "3")).toContain("360");
  expect(getMotionCandidates(production.inputs, "36")).toContain("360");
  for (const strength of ["L", "M", "H", "OD"] as const) {
    const input = selectAttack(
      production.inputs,
      "special",
      "360",
      "P",
      strength,
    )!;
    expect(input).toBeDefined();
    const notation = renderToStaticMarkup(<MoveNotation input={input} />);
    expect(notation).toContain("1回転＋");
    expect(notation.match(/rotation-icon/g) || []).toHaveLength(1);
    for (const id of ["zangief", "lily"]) {
      const c = production.characters.find((c) => c.id === id)!;
      const result = resolveMove(c, input, "normal");
      expect(result.status).toBe("found");
      if (result.status === "found") {
        expect(displayFrame(result.frames.startup)).toBe("5");
        expect(displayFrame(result.frames.hit)).toBe("D");
        expect(displayFrame(result.frames.block)).toBe("-");
        expect(result.frames.total).toMatchObject({
          provenance: "source",
          display: id === "zangief" ? "61" : "60",
        });
      }
    }
  }
});
