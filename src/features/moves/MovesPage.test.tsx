import { afterEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { production } from "../../lib/frame-data/datasets";
import MovesPage from "./MovesPage";

const selection = vi.hoisted(() => ({ filter: "すべて" }));
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) =>
      react.useState(initial === "すべて" ? selection.filter : initial),
  };
});
vi.mock("../../lib/frame-data/datasets", async (importOriginal) => {
  const { production } =
    await importOriginal<typeof import("../../lib/frame-data/datasets")>();
  const character = structuredClone(production.characters[0]);
  const base = character.moves[0];
  character.moves = [
    {
      ...base,
      id: "fixture-basic",
      adoption: { status: "accepted", basis: "test" },
      variant: { kind: "base", condition: null },
    },
    ...(["excluded", "held", "accepted"] as const).map((status) => ({
      ...structuredClone(base),
      id: `fixture-${status}`,
      adoption: { status, basis: "test" },
      variant: { kind: "conditional" as const, condition: "test condition" },
    })),
  ];
  return { production: { ...production, characters: [character], inputs: [] } };
});

afterEach(() => {
  selection.filter = "すべて";
  production.characters[0].moves = production.characters[0].moves.filter(
    (m) => m.id !== "fixture-second-basic",
  );
});

function displayedIds() {
  const html = renderToStaticMarkup(<MovesPage />);
  return [...html.matchAll(/ID: (fixture-[a-z-]+)<br\s*\/>/g)].map(
    (match) => match[1],
  );
}

it("renders the primary once and retains each distinct saved record in order", () => {
  expect(displayedIds()).toEqual([
    "fixture-basic",
    "fixture-excluded",
    "fixture-held",
    "fixture-accepted",
  ]);
});

it.each([
  ["採用", ["fixture-basic"]],
  ["除外", ["fixture-excluded"]],
  ["保留", ["fixture-held"]],
  ["条件付き", ["fixture-accepted"]],
  ["無し", []],
  ["複数候補", []],
])("renders only matching records once with the %s filter", (filter, ids) => {
  selection.filter = filter as string;
  expect(displayedIds()).toEqual(ids);
});

it("retains all candidates when there is no unique primary, including filtered views", () => {
  const character = production.characters[0];
  character.moves.push({ ...character.moves[0], id: "fixture-second-basic" });
  const all = [
    "fixture-basic",
    "fixture-excluded",
    "fixture-held",
    "fixture-accepted",
    "fixture-second-basic",
  ];
  expect(displayedIds()).toEqual(all);
  selection.filter = "複数候補";
  expect(displayedIds()).toEqual(all);
  selection.filter = "採用";
  expect(displayedIds()).toEqual(["fixture-basic", "fixture-second-basic"]);
});
