import { describe, expect, it } from "vitest";
import alpha from "../../data/fixtures/characters/fixture-1.json";
import beta from "../../data/fixtures/characters/fixture-2.json";
import metadata from "../../data/fixtures/metadata.json";
import { characterSchema, frameValueSchema } from "./schema";
import type { MoveInput } from "./schema";
import { displayInput, inputKey } from "./input";
import { validateDataset } from "./loader";
import { displayFrame, resolveMove } from "./resolver";

const character = () => characterSchema.parse(structuredClone(alpha));
const normal: MoveInput = {
  type: "normal",
  direction: "5",
  button: "P",
  strength: "L",
};
describe("structured commands", () => {
  it("generates every normal direction/button/strength combination", () => {
    for (const direction of ["5", "2"] as const)
      for (const button of ["P", "K"] as const)
        for (const strength of ["L", "M", "H"] as const)
          expect(
            displayInput({ type: "normal", direction, button, strength }),
          ).toBe(`${direction}${strength}${button}`);
  });
  it("generates special, charge, OD and strengthless commands", () => {
    for (const motion of [
      "236",
      "214",
      "623",
      "421",
      "22",
      "[4]6",
      "[2]8",
      "360",
    ]) {
      for (const button of ["P", "K"] as const)
        for (const strength of ["L", "M", "H", "OD", "none"] as const) {
          const input: MoveInput = {
            type: "special",
            motion,
            button,
            strength,
          };
          expect(displayInput(input)).toBe(
            motion +
              (strength === "OD"
                ? button.repeat(2)
                : strength === "none"
                  ? button
                  : strength + button),
          );
          expect(inputKey(input)).toBe(
            `special:${motion}:${button}:${strength}`,
          );
        }
    }
    expect(inputKey(normal)).not.toBe(
      inputKey({ type: "special", motion: "5", button: "P", strength: "L" }),
    );
  });
});
describe("resolver", () => {
  it("finds a move and distinguishes verified absence from incomplete coverage", () => {
    const c = character();
    expect(resolveMove(c, normal, "normal").status).toBe("found");
    const absent: MoveInput = {
      type: "special",
      motion: "999",
      button: "K",
      strength: "OD",
    };
    expect(resolveMove(c, absent, "normal").status).toBe("not_found");
    c.coverage.special.status = "partial";
    expect(resolveMove(c, absent, "normal").status).toBe("unknown");
  });
  it("does not choose between multiple base moves; ignores enhanced variants", () => {
    const c = character();
    const enhanced = structuredClone(c.moves[0]);
    enhanced.id = "enhanced";
    enhanced.variant = { kind: "conditional", condition: "powered up" };
    c.moves.push(enhanced);
    expect(resolveMove(c, normal, "normal").status).toBe("found");
    enhanced.variant = { kind: "base", condition: null };
    expect(resolveMove(c, normal, "normal").status).toBe("ambiguous");
  });
  it("respects display mode and never fills missing total frames", () => {
    const c = character();
    c.moves[0].frames.total = {
      status: "unknown",
      display: null,
      provenance: null,
      calculation: null,
    };
    expect(resolveMove(c, normal, "normal").status).toBe("unknown");
    expect(resolveMove(c, normal, "startup").status).toBe("found");
    expect(c.moves[0].frames.total.display).toBeNull();
    c.moves[0].source.verification = "unverified";
    expect(resolveMove(c, normal, "startup").status).toBe("unknown");
  });
  it("treats conditional values as unresolved; accepts explicit not-applicable values", () => {
    const c = character();
    c.moves[0].frames.hit = {
      status: "conditional",
      display: "+4",
      condition: "close range",
      numeric: 4,
    };
    expect(resolveMove(c, normal, "normal").status).toBe("unknown");
    c.moves[0].frames.hit = { status: "not_applicable", display: "-" };
    expect(resolveMove(c, normal, "normal").status).toBe("found");
  });
});
describe("validation and display", () => {
  it("preserves zero, negative, D, ranges, conditions, unknown and not applicable", () => {
    for (const display of ["0", "-6", "+4", "D", "10-12", "-"])
      expect(displayFrame({ status: "confirmed", display })).toBe(display);
    expect(
      displayFrame({ status: "conditional", display: "+4", condition: "先端" }),
    ).toBe("不明");
    expect(displayFrame({ status: "unknown", display: null })).toBe("不明");
    expect(displayFrame({ status: "not_applicable", display: null })).toBe(
      "対象外",
    );
    expect(
      frameValueSchema.safeParse({
        status: "confirmed",
        display: "D",
        numeric: 0,
      }).success,
    ).toBe(false);
  });
  it("rejects malformed data and mixed patches", () => {
    const c = character();
    c.moves[0].source.gameVersion = "other";
    expect(validateDataset(metadata, { c }).characters).toHaveLength(0);
    expect(
      validateDataset(metadata, { broken: {} }).errors.length,
    ).toBeGreaterThan(0);
    expect(() =>
      validateDataset({ ...metadata, schemaVersion: "2" }, {}),
    ).toThrow();
  });
  it("excludes incomplete/unverified characters; adds JSON records without hardcoded ids", () => {
    const c = character();
    c.id = "brand-new";
    const data = validateDataset(metadata, { alpha, beta, c });
    expect(data.eligible).toHaveLength(3);
    c.coverage.normal.status = "partial";
    expect(validateDataset(metadata, { c }).eligible).toHaveLength(0);
    c.coverage.normal.status = "complete";
    c.source.verification = "unverified";
    expect(validateDataset(metadata, { c }).eligible).toHaveLength(0);
  });
  it("detects duplicate character ids, move ids and ambiguous inputs", () => {
    const c = character();
    expect(validateDataset(metadata, { a: c, b: c }).errors.join()).toContain(
      "duplicate character",
    );
    c.moves.push(structuredClone(c.moves[0]));
    expect(validateDataset(metadata, { c }).errors.join()).toContain(
      "duplicate move",
    );
    c.moves.at(-1)!.id = "different-id";
    expect(validateDataset(metadata, { c }).errors.join()).toContain(
      "ambiguous base input",
    );
  });
  it("derives candidates from all eligible characters, excludes conditional-only moves", () => {
    const c = character();
    c.moves[0].variant = { kind: "conditional", condition: "stance" };
    const data = validateDataset(metadata, { c, beta });
    expect(data.inputs.some((i) => inputKey(i) === inputKey(normal))).toBe(
      true,
    );
    const only = validateDataset(metadata, { c });
    expect(only.inputs.some((i) => inputKey(i) === inputKey(normal))).toBe(
      false,
    );
  });
});
