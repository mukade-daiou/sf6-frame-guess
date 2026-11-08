import { expect, it } from "vitest";
import { production } from "./datasets";
import {
  applyConditionalSpecials,
  conditionalFrame,
} from "../../../scripts/conditional-specials";
import { resolveMove } from "./resolver";
import { inputKey } from "./input";
import { ask, startGame, changeMode } from "../../features/game/engine";
const char = (id: string) => production.characters.find((c) => c.id === id)!;
it("uses 23F for each normal Focus strength in both modes without generalizing compound startup", () => {
  const c = char("cviper");
  for (const strength of ["L", "M", "H"] as const) {
    for (const mode of ["normal", "startup"] as const)
      expect(resolveMove(c, query("214", "K", strength), mode)).toMatchObject({
        status: "found",
        frames: {
          startup: { display: "23", numeric: 23 },
          total: { display: "70" },
          hit: { display: "D" },
          block: { display: "-16" },
        },
      });
  }
  expect(conditionalFrame("13+10", "startup", true)).toEqual({
    status: "confirmed",
    display: "13+10",
  });
});
it("rejects an existing basic input instead of silently selecting a representative", () => {
  const c = structuredClone(char("jamie"));
  const m = c.moves.find((m) => m.id === "jamie__held_special_236_P_L")!;
  delete m.representativeCondition;
  c.moves.push({ ...structuredClone(m), id: "conflicting-existing-base" });
  expect(() => applyConditionalSpecials(c)).toThrow("input collision");
});
const query = (
  motion: string,
  button: "P" | "K",
  strength: "L" | "M" | "H" | "OD",
) => ({
  type: "special" as const,
  motion,
  button,
  strength,
  includeSuperArts: true as const,
});
it("excludes Maracas without asserting universal absence of 22PP", () => {
  const c = char("dee_jay");
  const m = c.moves.find((m) => m.id === "dee_jay__held_special_22_P_OD")!;
  expect(m.adoption?.status).toBe("excluded");
  expect(m.notes.some((n) => n.includes("upstreamInput: 22PP"))).toBe(true);
  expect(resolveMove(c, query("22", "P", "OD"), "normal").status).toBe(
    "not_found",
  );
  expect(resolveMove(char("jp"), query("22", "P", "OD"), "normal").status).toBe(
    "found",
  );
});
it("selects DL2 instead of DL4 and keeps all Jamie input keys unique", () => {
  const c = char("jamie");
  const selected = c.moves.filter((m) => m.representativeCondition);
  expect(
    selected.filter((m) =>
      m.representativeCondition!.condition.includes("Lv.2"),
    ),
  ).toHaveLength(16);
  expect(
    selected.filter((m) =>
      m.representativeCondition!.condition.includes("Lv.3"),
    ),
  ).toHaveLength(5);
  const keys = c.moves
    .filter(
      (m) => m.variant.kind === "base" && m.adoption?.status !== "excluded",
    )
    .map((m) => inputKey(m.input));
  expect(new Set(keys).size).toBe(keys.length);
  const l = c.moves.find((m) => m.id === "jamie__held_special_236_P_L")!;
  expect(l.frames).toMatchObject({
    startup: { display: "13" },
    total: { display: "38" },
    hit: { display: "-1" },
    block: { display: "-6" },
  });
  for (const m of selected)
    expect(resolveMove(c, m.input, "normal").status).toBe("found");
});
it.each([
  ["jamie", "63214", "K", "8"],
  ["cviper", "214", "K", "23"],
])(
  "keeps shared normal strengths independent for %s",
  (id, motion, button, startup) => {
    const c = char(id);
    let g = startGame(
      production,
      "normal",
      5,
      () => (production.eligible.indexOf(c) + 0.5) / 32,
    );
    for (const s of ["L", "M", "H"] as const) {
      const i = query(motion, button as "K", s);
      const result = ask(g, i);
      expect(result.status).toBe("found");
      g = result.game;
      expect(result.game.history.at(-1)!.result).toMatchObject({
        frames: { startup: { display: startup } },
      });
      expect(ask(changeMode(g, "startup"), i).status).toBe("duplicate");
    }
    expect(g.history).toHaveLength(3);
  },
);
it("uses the approved OD startup sum while retaining the source expression", () => {
  const c = char("cviper");
  const result = resolveMove(c, query("214", "K", "OD"), "normal");
  expect(result).toMatchObject({
    status: "found",
    frames: {
      startup: { display: "20", numeric: 20 },
      total: { display: "67" },
      hit: { display: "D" },
      block: { display: "-16" },
    },
  });
  const m = c.moves.find((m) => m.id === "cviper__held_special_214_K_OD")!;
  expect(m.representativeCondition?.condition).toContain("19F");
  expect(m.source.verification).toBe("unverified");
  expect(m.notes.some((n) => n.includes('"startup":"10+10"'))).toBe(true);
});
