import { expect, it } from "vitest";
import { excludedInputReason } from "../../../scripts/source-scope";
import { production } from "./datasets";
import { resolveMove } from "./resolver";
import { inputKey } from "./input";
it.each([
  "PP",
  "KK",
  "2PP",
  "4KK",
  "6KK",
  "5/6KK",
  "2KK or 3KK",
  "6KKK",
  "4 or 6 + PPP/KKK",
  "6[6]",
])("excludes non-OD simultaneous / triple / Run input %s", (input) =>
  expect(excludedInputReason(input)).toBeTruthy(),
);
it.each(["236PP", "214KK", "360+PP", "63214KK (Far)", "5LP"])(
  "retains ordinary and OD input %s",
  (input) => expect(excludedInputReason(input)).toBeNull(),
);
it("keeps excluded source records but removes them from question inputs and absence checks", () => {
  const excluded = production.characters.flatMap((c) =>
    c.moves
      .filter((m) => m.adoption?.status === "excluded")
      .map((m) => ({ c, m })),
  );
  expect(excluded).toHaveLength(9);
  for (const { c, m } of excluded) {
    expect(m.source.verification).toBe("unverified");
    if (m.id !== "dee_jay__held_special_22_P_OD")
      expect(
        production.inputs.some((i) => inputKey(i) === inputKey(m.input)),
      ).toBe(false);
    expect(resolveMove(c, m.input, "normal").status).toBe("not_found");
  }
});
it("selects far-distance values with explicitly different HK behavior", () => {
  const c = production.characters.find((c) => c.id === "zangief")!;
  for (const [strength, startup, total] of [
    ["L", 55, 96],
    ["M", 55, 96],
    ["H", 10, 61],
    ["OD", 54, 95],
  ] as const) {
    const input = {
      type: "special",
      motion: "63214",
      button: "K",
      strength,
    } as const;
    const result = resolveMove(c, input, "normal");
    expect(result.status).toBe("found");
    if (result.status === "found")
      expect(result.frames).toMatchObject({
        startup: { numeric: startup },
        total: { numeric: total, provenance: "source" },
        hit: { display: "D" },
        block: { status: "not_applicable" },
      });
  }
});
