import { expect, it } from "vitest";
import { production } from "./datasets";
import { applyConditionalSpecials } from "../../../scripts/conditional-specials";
import { resolveMove } from "./resolver";
import { inputKey } from "./input";
import { ask, startGame, changeMode } from "../../features/game/engine";
const char = (id: string) => production.characters.find((c) => c.id === id)!;
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
  ["cviper", "214", "K", "13+10"],
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
it("uses separate OD Focus Force Lv1 evidence and retains its fixed startup expression", () => {
  const c = char("cviper");
  const result = resolveMove(c, query("214", "K", "OD"), "normal");
  expect(result).toMatchObject({
    status: "found",
    frames: {
      startup: { display: "10+10" },
      total: { display: "67" },
      hit: { display: "D" },
      block: { display: "-16" },
    },
  });
  const m = c.moves.find((m) => m.id === "cviper__held_special_214_K_OD")!;
  expect(m.representativeCondition?.condition).toContain("19F");
  expect(m.source.verification).toBe("unverified");
});
