import { expect, it } from "vitest";
import { production } from "../../lib/frame-data/datasets";
import { sortCharactersForDisplay } from "./character-order";

it("displays the launch roster from Luke followed by additions, without changing draw order", () => {
  const before = [...production.characters];
  const sorted = sortCharactersForDisplay(production.characters);
  const ids = sorted.map((c) => c.id);
  expect(ids).toHaveLength(32);
  expect(new Set(ids).size).toBe(32);
  expect(ids.slice(0, 4)).toEqual(["luke", "jamie", "manon", "kimberly"]);
  expect(ids.slice(16, 23)).toEqual([
    "zangief",
    "dhalsim",
    "rashid",
    "aki",
    "ed",
    "akuma",
    "m_bison",
  ]);
  expect(ids.slice(-6)).toEqual([
    "sagat",
    "cviper",
    "alex",
    "ingrid",
    "yasmine",
    "arjun",
  ]);
  expect(sorted).not.toBe(production.characters);
  expect(production.characters).toEqual(before);
});

it("keeps unlisted characters in their original relative order after the known roster", () => {
  const characters = [
    { id: "future-b" },
    { id: "ken" },
    { id: "future-a" },
    { id: "luke" },
  ];
  expect(sortCharactersForDisplay(characters).map((c) => c.id)).toEqual([
    "luke",
    "ken",
    "future-b",
    "future-a",
  ]);
});
