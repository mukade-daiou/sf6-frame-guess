import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { characterSchema } from "./schema";
import { displayFrame, resolveMove } from "./resolver";

describe("compound startup corrections", () => {
  it.each([
    ["rashid", "rashid__special_236_K_none__strength_L", "17"],
    ["rashid", "rashid__special_236_K_none__strength_M", "17"],
    ["rashid", "rashid__special_236_K_none__strength_H", "17"],
    ["rashid", "rashid__special_236_K_OD", "17"],
    ["ed", "ed__special_236_K_L", "16"],
    ["ed", "ed__special_236_K_M", "20"],
    ["ed", "ed__special_236_K_H", "17"],
    ["jp", "jp__special_236_K_L", "22~"],
    ["jp", "jp__special_236_K_M", "26~"],
    ["jp", "jp__special_236_K_H", "26~"],
  ])("resolves %s %s in both modes", (id, moveId, expected) => {
    const c = characterSchema.parse(
      JSON.parse(readFileSync(`data/characters/${id}.json`, "utf8")),
    );
    const move = c.moves.find((m) => m.id === moveId)!;
    expect(move).toBeDefined();
    for (const mode of ["normal", "startup"] as const) {
      const result = resolveMove(c, move.input, mode);
      expect(result.status).toBe("found");
      if (result.status === "found")
        expect(displayFrame(result.frames.startup)).toBe(expected);
    }
  });
});
