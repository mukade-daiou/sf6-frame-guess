import { expect, it } from "vitest";
import { production } from "./datasets";
import { inputKey } from "./input";
import { isMoveUsable } from "./adoption";
import { resolveMove } from "./resolver";
import { ask, startGame, changeMode } from "../../features/game/engine";
import {
  generateSuperArts,
  readSAResearch,
  adoptSAFrame,
} from "../../../scripts/super-arts";
const input = (
  saLevel: 1 | 2 | 3 = 1,
  strength: "L" | "M" | "H" = "L",
  motion = "236236",
  button: "P" | "K" = "P",
) => ({
  type: "super_art" as const,
  saLevel,
  strength,
  motion,
  button,
  adoptionBasis: "test",
});
const char = (id: string) => production.characters.find((c) => c.id === id)!;
it("keeps L/M/H independent across modes and categories despite shared frame values", () => {
  let g = startGame(
    production,
    "normal",
    5,
    () => (production.eligible.indexOf(char("ryu")) + 0.5) / 32,
  );
  for (const strength of ["L", "M", "H"] as const) {
    const n = ask(g, input(1, strength));
    expect(n.status).toBe("found");
    g = n.game;
  }
  expect(g.history).toHaveLength(3);
  expect(g.history[0].result).toEqual(g.history[1].result);
  expect(ask(changeMode(g, "startup"), input()).status).toBe("duplicate");
  expect(
    new Set([
      inputKey(input()),
      inputKey(input(2)),
      inputKey({
        type: "special",
        motion: "236236",
        button: "P",
        strength: "L",
      }),
    ]).size,
  ).toBe(3);
});
it("integrates 96 slots/288 records without CA and exposes only globally existing inputs", () => {
  expect(production.eligible).toHaveLength(32);
  expect(production.errors).toEqual([]);
  expect(
    production.characters.flatMap((c) =>
      c.moves.filter((m) => m.category === "super_art"),
    ),
  ).toHaveLength(288);
  for (const c of production.characters) {
    expect(c.coverage.super_art?.status).toBe("complete");
    expect(c.moves.filter((m) => m.category === "super_art")).toHaveLength(9);
    expect(
      c.moves
        .filter((m) => m.category === "super_art")
        .some((m) => m.name.includes("(CA)")),
    ).toBe(false);
  }
  const a = startGame(production, "normal", 5, () => 0),
    b = startGame(production, "normal", 5, () => 0.99);
  expect(a.inputs).toEqual(b.inputs);
  const rotationInputs = a.inputs.filter(
    (i) => i.type === "super_art" && i.saLevel === 3 && i.motion === "720",
  );
  expect(rotationInputs).toHaveLength(3);
  expect(rotationInputs.every((i) => i.button === "P")).toBe(true);
  expect(
    a.inputs.some(
      (i) =>
        i.type === "special" &&
        i.includeSuperArts &&
        i.motion === "720" &&
        i.button === "K",
    ),
  ).toBe(false);
  expect(
    ask(a, {
      type: "special",
      includeSuperArts: true,
      motion: "720",
      button: "K",
      strength: "H",
    }).status,
  ).toBe("unsupported");
  expect(
    a.inputs.some(
      (i) =>
        i.type === "special" &&
        i.includeSuperArts &&
        i.motion === "22" &&
        i.button === "P" &&
        i.strength === "OD",
    ),
  ).toBe(true);

  const adoptedBaseInputs = production.eligible.flatMap((c) =>
    c.moves
      .filter((m) => m.variant.kind === "base" && isMoveUsable(c, m))
      .map((m) => m.input),
  );
  for (const candidate of a.inputs) {
    const exists = adoptedBaseInputs.some((move) =>
      candidate.type === "special" && candidate.includeSuperArts
        ? move.type !== "normal" &&
          move.motion === candidate.motion &&
          move.button === candidate.button &&
          move.strength === candidate.strength
        : inputKey(move) === inputKey(candidate),
    );
    expect(exists, JSON.stringify(candidate)).toBe(true);
  }
  expect(
    resolveMove(char("ryu"), input(3, "H", "720", "K"), "normal").status,
  ).toBe("not_found");
  const partial = structuredClone(char("ryu"));
  partial.coverage.super_art!.status = "partial";
  expect(resolveMove(partial, input(3, "H", "720", "K"), "normal").status).toBe(
    "unknown",
  );
});
it("uses strength-specific values, activation dashes, source startup and unknowns", () => {
  const sa = (id: string, level: 1 | 2 | 3, s: "L" | "M" | "H") =>
    char(id).moves.find(
      (m) =>
        m.input.type === "super_art" &&
        m.input.saLevel === level &&
        m.input.strength === s,
    )!;
  expect(sa("dhalsim", 1, "H").frames.total).toMatchObject({ numeric: 133 });
  expect(sa("dhalsim", 1, "L").frames.total).toMatchObject({ numeric: 128 });
  expect(sa("guile", 1, "H").frames.startup).toMatchObject({ numeric: 7 });
  expect(sa("guile", 1, "M").frames.startup).toMatchObject({ numeric: 8 });
  expect(sa("juri", 2, "L").frames).toMatchObject({
    startup: { numeric: 1 },
    total: { numeric: 7 },
    hit: { display: "-" },
    block: { display: "-" },
  });
  expect(sa("ingrid", 2, "H").frames.startup).toMatchObject({ numeric: 1 });
  expect(sa("ingrid", 2, "H").saEvidence?.laterAttackStartup).toContain("103");
  expect(sa("jp", 2, "L").frames.startup).toMatchObject({ numeric: 1 });
  expect(sa("sagat", 2, "L").frames.hit.display).toBe("D");
  expect(sa("ryu", 1, "L").frames.hit.display).toBe("D");
  expect(adoptSAFrame(null, "block", { saType: "attack" }).status).toBe(
    "unknown",
  );
  expect(adoptSAFrame(null, "block", { saType: "activation" })).toMatchObject({
    display: "-",
  });
});
it("rejects multiple explicit sources instead of choosing the first", () => {
  const research = readSAResearch();
  const row = research.records.find((r: any) => r.id === "dhalsim:raw:7");
  expect(() =>
    generateSuperArts(
      { ...research, records: [...research.records, row] },
      "dhalsim",
    ),
  ).toThrow("Ambiguous");
});
it("prioritizes explicit strengths over a conflicting strengthless row", () => {
  const research = readSAResearch();
  const common = structuredClone(
    research.records.find((r: any) => r.id === "dhalsim:raw:7"),
  );
  common.id = "synthetic-common";
  common.strength = null;
  common.inputDetails.explicitStrengths = [];
  common.sourceValues.cargo[0].frames.startup.cleanedForComparison = "99";
  const moves = generateSuperArts(
    { ...research, records: [...research.records, common] },
    "dhalsim",
  );
  expect(
    moves
      .filter((m) => m.input.type === "super_art" && m.input.saLevel === 1)
      .every((m) => m.frames.startup.display === "10"),
  ).toBe(true);
  const c = structuredClone(char("ryu"));
  c.moves.push(
    structuredClone(c.moves.find((m) => m.category === "super_art")!),
  );
  expect(resolveMove(c, c.moves.at(-1)!.input, "normal").status).toBe(
    "ambiguous",
  );
});
