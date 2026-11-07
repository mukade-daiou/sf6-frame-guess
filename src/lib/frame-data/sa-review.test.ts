import { expect, it } from "vitest";
import { production } from "./datasets";
import { ask, startGame, changeMode } from "../../features/game/engine";
import { resolveMove } from "./resolver";
import { readSAResearch, generateSuperArts } from "../../../scripts/super-arts";
it.each([
  ["aki", "block", "-19", "-19~"],
  ["ed", "block", "+65", "+65~"],
  ["sagat", "hit", "D", "HKD ~"],
])(
  "applies explicit user values with independent Normal questions: %s",
  (id, field, display, original) => {
    const c = production.eligible.find((c) => c.id === id)!;
    let g = startGame(
      production,
      "normal",
      5,
      () => (production.eligible.indexOf(c) + 0.5) / 32,
    );
    for (const strength of ["L", "M", "H"]) {
      const m = c.moves.find(
        (m) =>
          m.input.type === "super_art" &&
          m.input.saLevel === 2 &&
          m.input.strength === strength,
      )!;
      expect(m.frames[field as "hit" | "block"].display).toBe(display);
      expect(m.saEvidence?.sourceNotation[field]).toBe(original);
      expect(m.saEvidence?.frameOrigins[field]).toBe("user_representative");
      expect(m.saEvidence?.frameDecisions?.[0].sourceNotation).toBe(
        id === "sagat" ? "HKD +4" : original,
      );
      expect(m.source.verification).toBe("unverified");
      expect(m.source.gameVersion).toBe("UNVERIFIED");
      expect(resolveMove(c, m.input, "startup").status).toBe("found");
      const n = ask(g, m.input);
      expect(n.status).toBe("found");
      g = n.game;
      expect(ask(changeMode(g, "startup"), m.input).status).toBe("duplicate");
    }
    expect(g.history).toHaveLength(3);
  },
);
it("records activation template placeholders as a display rule, not source values", () => {
  const research = readSAResearch();
  const modified = structuredClone(research);
  const r = modified.records.find((r: any) => r.id === "juri:raw:2");
  r.sourceValues.cargo[0].frames.total.cleanedForComparison = "{{{total}}}";
  const m = generateSuperArts(modified, "juri")[3];
  expect(m.frames.total.display).toBe("-");
  expect(m.saEvidence?.frameOrigins.total).toBe("activation_missing_rule");
});
it("rejects stale user decisions when the supporting notation changes", () => {
  const research = readSAResearch();
  research.frameDecisions[0].sourceNotation = "-20~";
  expect(() => generateSuperArts(research, "aki")).toThrow("evidence mismatch");
});
it("distinguishes missing coverage, conditional-only, unsupported and immutable history", () => {
  const base = production.eligible.find((c) => c.id === "aki")!;
  const m = base.moves.find(
    (m) => m.input.type === "super_art" && m.input.saLevel === 2,
  )!;
  const c = structuredClone(base);
  c.coverage.super_art!.status = "unrecorded";
  c.moves = c.moves.filter((x) => x.id !== m.id);
  expect(resolveMove(c, m.input, "normal").status).toBe("unknown");
  c.coverage.super_art!.status = "complete";
  c.moves.push({
    ...structuredClone(m),
    variant: { kind: "conditional", condition: "test only" },
  });
  expect(resolveMove(c, m.input, "normal").status).toBe("unknown");
  const game = structuredClone(
    startGame(
      production,
      "normal",
      5,
      () => (production.eligible.indexOf(base) + 0.5) / 32,
    ),
  );
  expect(ask(game, { ...m.input, motion: "111111111" }).status).toBe(
    "unsupported",
  );
  const asked = ask(game, m.input).game;
  game.target.moves.find((x) => x.id === m.id)!.frames.block = {
    status: "unknown",
    display: null,
  };
  expect(asked.history[0].result).toMatchObject({
    frames: { block: { display: "-19" } },
  });
});
