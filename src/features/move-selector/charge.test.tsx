import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  appendDirection,
  getMotionCandidates,
  selectAttack,
  type Direction,
} from "./controller";
import { CommandNotation, MoveNotation } from "../../components/MoveNotation";
import { production } from "../../lib/frame-data/datasets";
import { inputKey } from "../../lib/frame-data/input";
import { resolveMove } from "../../lib/frame-data/resolver";
it.each([
  ["46", "[4]6"],
  ["28", "[2]8"],
])(
  "maps deliberate %s to its stored charge key without a hold timer",
  (sequence, motion) => {
    let command = "";
    for (const d of sequence) {
      command = appendDirection(command, "5", d as Direction);
      command = appendDirection(command, d as Direction, d as Direction);
    }
    expect(command).toBe(motion);
    expect(appendDirection(command, "6", "5")).toBe(motion);
    expect(getMotionCandidates(production.inputs, sequence[0])).toContain(
      motion,
    );
    expect(getMotionCandidates(production.inputs, motion)).toEqual([motion]);
  },
);
it.each(["236", "214", "623", "22", "421"])(
  "keeps directional motion %s intact",
  (motion) => {
    expect(
      [...motion].reduce((c, d) => appendDirection(c, "5", d as Direction), ""),
    ).toBe(motion);
  },
);
it("renders exactly two arrows with only the held direction yellow in candidates and history", () => {
  for (const motion of ["[4]6", "[2]8"]) {
    const html = renderToStaticMarkup(<CommandNotation command={motion} />);
    expect(html.match(/class="direction-icon/g) || []).toHaveLength(2);
    expect(html.match(/charge-direction/g) || []).toHaveLength(1);
    expect(html).toContain("（溜め）");
    for (const strength of ["L", "M", "H", "OD"] as const) {
      const input = selectAttack(
        production.inputs,
        "special",
        motion,
        motion === "[4]6" ? "P" : "K",
        strength,
      )!;
      expect(input).toBeDefined();
      expect(inputKey(input)).toBe(
        `special:${motion}:${input.button}:${strength}`,
      );
      const notation = renderToStaticMarkup(<MoveNotation input={input} />);
      expect(notation).toContain("charge-direction");
      expect(notation).toContain("溜めから");
      for (const mode of ["normal", "startup"] as const) {
        const guile = production.characters.find((c) => c.id === "guile")!;
        expect(resolveMove(guile, input, mode).status).toBe("found");
      }
    }
  }
});
