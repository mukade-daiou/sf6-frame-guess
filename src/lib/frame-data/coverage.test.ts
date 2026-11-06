import { expect, it } from "vitest";
import alpha from "../../data/fixtures/characters/fixture-1.json";
import beta from "../../data/fixtures/characters/fixture-2.json";
import metadata from "../../data/fixtures/metadata.json";
import { characterSchema } from "./schema";
import { validateDataset } from "./loader";
import { resolveMove } from "./resolver";
it("keeps verified coverage separate from per-field completeness using fictional fixtures", () => {
  const c = characterSchema.parse(structuredClone(alpha));
  c.moves[0].frames.total = {
    status: "unknown",
    display: null,
    provenance: null,
    calculation: null,
  };
  const data = validateDataset(metadata, { c, beta });
  expect(data.errors).toEqual([]);
  expect(data.eligible).toHaveLength(2);
  expect(c.coverage.normal.status).toBe("complete");
  expect(resolveMove(c, c.moves[0].input, "normal").status).toBe("unknown");
  expect(resolveMove(c, c.moves[0].input, "startup").status).toBe("found");
});
