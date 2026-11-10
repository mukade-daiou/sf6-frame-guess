import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { characterSchema } from "./schema";
import { displayFrame, resolveMove } from "./resolver";

describe("approved whiff totals", () => {
  const policy = JSON.parse(
    readFileSync("data/adoption-decisions.json", "utf8"),
  );
  it("resolves all 53 values in Normal without changing Hard startup", () => {
    const decisions = policy.whiffTotalCorrections.decisions;
    expect(decisions).toHaveLength(53);
    for (const d of decisions) {
      const c = characterSchema.parse(
        JSON.parse(
          readFileSync(`data/characters/${d.characterId}.json`, "utf8"),
        ),
      );
      const move = c.moves.find((m) => m.id === d.moveId)!;
      const normal = resolveMove(c, move.input, "normal");
      const hard = resolveMove(c, move.input, "startup");
      expect(normal.status, d.moveId).toBe("found");
      expect(hard.status, d.moveId).toBe("found");
      if (normal.status === "found" && hard.status === "found") {
        expect(displayFrame(normal.frames.total)).toBe(d.value.display);
        expect(hard.frames.startup).toEqual(move.frames.startup);
      }
    }
  });
});
