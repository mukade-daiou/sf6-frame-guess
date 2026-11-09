import { expect, it } from "vitest";
import { production } from "../../lib/frame-data/datasets";
import { inventoryPatterns, inventoryRow, recordStatus } from "./inventory";
import { inputKey } from "../../lib/frame-data/input";
import { renderToStaticMarkup } from "react-dom/server";
import MovesPage, { Frames } from "./MovesPage";
const patterns = inventoryPatterns(production.characters, production.inputs);
it("keeps unique stable union inputs and every saved record including all SA levels", () => {
  expect(new Set(patterns.map(inputKey)).size).toBe(patterns.length);
  for (const c of production.characters) {
    const ids = new Set(
      patterns.flatMap((i) => inventoryRow(c, i).records.map((m) => m.id)),
    );
    expect(ids.size).toBe(c.moves.length);
  }
  expect(patterns.slice(0, 6).map((i) => i.strength + i.button)).toEqual([
    "LP",
    "MP",
    "HP",
    "LK",
    "MK",
    "HK",
  ]);
  expect(
    inventoryPatterns([...production.characters].reverse(), production.inputs),
  ).toEqual(patterns);
  expect(
    new Set(
      patterns.filter((i) => i.type === "super_art").map((i) => i.saLevel),
    ),
  ).toEqual(new Set([1, 2, 3]));
});
it("retains excluded frames, held and conditional records alongside a basic record", () => {
  const ken = production.characters.find((c) => c.id === "ken")!;
  const m = ken.moves.find((m) => m.adoption?.status === "excluded")!;
  const p = patterns.find((i) =>
    inventoryRow(ken, i).records.some((r) => r.id === m.id),
  )!;
  const row = inventoryRow(ken, p);
  expect(row.records).toContain(m);
  expect(recordStatus(m)).toBe("除外");
  expect(row.primary?.frames).toEqual(m.frames);
  const numericExcluded = production.characters
    .flatMap((c) => c.moves)
    .find(
      (m) =>
        m.adoption?.status === "excluded" &&
        Object.values(m.frames).some(
          (f) => f.status === "confirmed" && /[0-9]/.test(f.display || ""),
        ),
    )!;
  const cells = renderToStaticMarkup(
    <table>
      <tbody>
        <tr>
          <Frames move={numericExcluded} />
        </tr>
      </tbody>
    </table>,
  );
  expect((cells.match(/<td /g) || []).length).toBe(4);
  for (const f of Object.values(numericExcluded.frames))
    if (f.status === "confirmed") expect(cells).toContain(f.display!);
  const clone = structuredClone(ken),
    base = clone.moves[0];
  clone.moves.push({
    ...structuredClone(base),
    id: "held-copy",
    adoption: { status: "held", basis: "test" },
    variant: { kind: "conditional", condition: "distance" },
  });
  const multi = inventoryRow(clone, base.input);
  expect(multi.records).toHaveLength(2);
  expect(multi.primary?.id).toBe(base.id);
  clone.moves.push({ ...structuredClone(base), id: "second-basic" });
  expect(inventoryRow(clone, base.input).status).toBe("複数候補");
  clone.moves = [
    {
      ...structuredClone(base),
      variant: { kind: "conditional", condition: "distance" },
    },
  ];
  expect(inventoryRow(clone, base.input).status).toBe("条件付き");
});
it("distinguishes absence from incomplete scope without changing game data", () => {
  const c = structuredClone(production.characters[0]);
  const input = {
    type: "special" as const,
    motion: "999999",
    button: "P" as const,
    strength: "L" as const,
    includeSuperArts: true as const,
  };
  expect(inventoryRow(c, input).status).toBe("技なし");
  c.coverage.special.status = "partial";
  expect(inventoryRow(c, input).status).toBe("不明");
});
it("renders seven columns and saved excluded values in their regular frame cells", () => {
  const html = renderToStaticMarkup(<MovesPage />);
  expect(html).toContain("技データ一覧");
  expect(html).toContain("対象外");
  expect((html.match(/scope="col"/g) || []).length).toBe(7);
  const c = production.characters.find((c) => c.id === "dee_jay")!;
  const m = c.moves.find((m) => m.id === "dee_jay__held_special_22_P_OD")!;
  const row = inventoryRow(c, {
    type: "special",
    motion: "22",
    button: "P",
    strength: "OD",
    includeSuperArts: true,
  });
  expect(row.status).toBe("除外");
  expect(row.primary?.frames).toEqual(m.frames);
});
