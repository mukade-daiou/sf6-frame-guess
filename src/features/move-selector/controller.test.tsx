import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { production } from "../../lib/frame-data/datasets";
import { inputKey, displayInput } from "../../lib/frame-data/input";
import {
  attackButtons,
  appendDirection,
  directionAt,
  isQuestionInput,
  selectAttack,
  getMotionCandidates,
  type Direction,
} from "./controller";
import {
  AttackIcon,
  DirectionIcon,
  MoveNotation,
} from "../../components/MoveNotation";
import punchIcon from "../../assets/attack-icons/punch.svg";
import barefootIcon from "../../assets/attack-icons/barefoot.svg";
import { MoveSelector } from "./MoveSelector";
import { resolveMove } from "../../lib/frame-data/resolver";
import { startGame, ask } from "../game/engine";

it("suggests unique directional prefixes from all eligible inputs without fuzzy conversion", () => {
  const inputs = [
    ...production.inputs,
    { type: "special", motion: "22", button: "P", strength: "OD" },
    { type: "special", motion: "[4]6", button: "P", strength: "L" },
    {
      type: "special",
      motion: "none",
      button: "K",
      strength: "none",
      buttonCombination: "LK+MK",
    },
  ] as const;
  const candidates = getMotionCandidates([...inputs], "2");
  expect(candidates).toContain("236");
  expect(candidates).toContain("214");
  expect(candidates).toContain("22");
  expect(candidates.length).toBe(new Set(candidates).size);
  expect(getMotionCandidates([...inputs], "23")).toEqual(
    expect.arrayContaining(["236", "360"]),
  );
  expect(getMotionCandidates([...inputs], "6")).toContain("623");
  expect(getMotionCandidates([...inputs], "236")).toEqual(
    expect.arrayContaining(["236", "360"]),
  );
  expect(getMotionCandidates([...inputs], "2366")).toEqual([]);
  expect(getMotionCandidates([...inputs], "[4]")).toEqual(["[4]6"]);
  expect(getMotionCandidates([...inputs], "none")).toEqual([]);
});

it("uses the licensed punch/barefoot assets for single attacks and both OD icons", () => {
  for (const button of ["P", "K"] as const)
    for (const strength of ["L", "M", "H", "OD"] as const) {
      const html = renderToStaticMarkup(
        <AttackIcon button={button} strength={strength} />,
      );
      expect(html.replaceAll("&#x27;", "'")).toContain(
        button === "P" ? punchIcon : barefootIcon,
      );
      expect((html.match(/<image /g) || []).length).toBe(
        strength === "OD" ? 2 : 1,
      );
      expect(html).not.toContain("<text");
    }
});

it("adopts user-selected 9F for 623 OD kick without marking its source verified", () => {
  const input = selectAttack(production.inputs, "special", "623", "K", "OD");
  expect(input).toBeDefined();
  expect(displayInput(input!)).toBe("623KK");
  for (const mode of ["normal", "startup"] as const) {
    const game = startGame(
      production,
      mode,
      5,
      () =>
        (production.eligible.findIndex((c) => c.id === "ken") + 0.5) /
        production.eligible.length,
    );
    const next = ask(game, input);
    expect(next.status).toBe("found");
    expect(next.game.history).toHaveLength(1);
    expect(next.game.history[0].result).toMatchObject({
      frames: { startup: { display: "9", numeric: 9 } },
    });
    const move = game.target.moves.find(
      (m) => inputKey(m.input) === inputKey(input!),
    )!;
    expect(move.source.verification).toBe("unverified");
    expect(move.notes.some((n) => n.includes("9(19)"))).toBe(true);
  }
});

it("maps eight fixed buttons and standing/crouching normals without simultaneous normals", () => {
  expect(attackButtons.map((b) => b.label)).toEqual([
    "弱P",
    "中P",
    "強P",
    "弱P＋中P",
    "弱K",
    "中K",
    "強K",
    "弱K＋中K",
  ]);
  for (const [direction, button, strength, label] of [
    ["5", "P", "L", "5LP"],
    ["5", "P", "H", "5HP"],
    ["2", "K", "M", "2MK"],
    ["2", "K", "H", "2HK"],
  ] as const) {
    expect(
      displayInput(
        selectAttack(production.inputs, "normal", direction, button, strength)!,
      ),
    ).toBe(label);
  }
  for (const a of attackButtons) {
    const chosen = selectAttack(
      production.inputs,
      "special",
      "236",
      a.button,
      a.strength,
    );
    expect(chosen?.button).toBe(a.button);
    expect(chosen?.strength).toBe(a.strength);
  }
  expect(
    selectAttack(production.inputs, "normal", "5", "P", "OD"),
  ).toBeUndefined();
  expect(
    selectAttack(production.inputs, "special", "", "K", "OD"),
  ).toBeUndefined();
});
it.each(["236", "214", "623", "22"])(
  "records exact %s without correcting invalid motions",
  (motion) => {
    let command = "";
    for (const d of motion) {
      command = appendDirection(command, "5", d as Direction);
      command = appendDirection(command, d as Direction, d as Direction);
    }
    expect(command).toBe(motion);
    expect(appendDirection(command, "2", "5")).toBe(command);
    expect(
      selectAttack(production.inputs, "special", "2366", "P", "L"),
    ).toBeUndefined();
  },
);
it("quantizes all eight directions and neutral consistently for pointer/touch geometry", () => {
  const positions = [
    [0, 0, "7"],
    [78, 0, "8"],
    [156, 0, "9"],
    [0, 78, "4"],
    [78, 78, "5"],
    [156, 78, "6"],
    [0, 156, "1"],
    [78, 156, "2"],
    [156, 156, "3"],
  ] as const;
  for (const [x, y, d] of positions) expect(directionAt(x, y, 156)).toBe(d);
});
it("excludes motionless/complex inputs from questions without removing the stored move", () => {
  expect(
    resolveMove(
      production.characters.find((c) => c.id === "marisa")!,
      { type: "special", motion: "214", button: "K", strength: "L" },
      "normal",
    ).status,
  ).toBe("unknown");
  const dash = production.characters
    .find((c) => c.id === "ken")!
    .moves.find(
      (m) => m.input.type === "special" && m.input.motion === "none",
    )!;
  expect(dash).toBeDefined();
  expect(isQuestionInput(dash.input)).toBe(false);
  expect(
    production.inputs.some((i) => inputKey(i) === inputKey(dash.input)),
  ).toBe(false);
  expect(
    isQuestionInput({
      type: "special",
      motion: "[4]6",
      button: "P",
      strength: "L",
    }),
  ).toBe(true);
  expect(
    isQuestionInput({
      type: "special",
      motion: "5",
      button: "K",
      strength: "OD",
    }),
  ).toBe(false);
  const html = renderToStaticMarkup(
    <MoveSelector inputs={production.inputs} onAsk={() => {}} />,
  );
  expect(html).not.toContain("<select");
  expect(html).not.toContain("KK同時押し");
});
it("uses one bold SVG rotated into eight directions and accessible original input notation", () => {
  for (const d of ["1", "2", "3", "4", "6", "7", "8", "9"] as const) {
    const html = renderToStaticMarkup(<DirectionIcon direction={d} />);
    expect(html).toContain("rotate(");
    expect(html).toContain("M12 2 2 12h6v10h8V12h6Z");
  }
  for (const i of production.inputs)
    expect(renderToStaticMarkup(<MoveNotation input={i} />)).toContain(
      i.type === "super_art"
        ? `SA${i.saLevel}：`
        : i.type === "special" && i.motion === "360"
          ? "1回転＋"
          : `aria-label="${displayInput(i)}"`,
    );
});
