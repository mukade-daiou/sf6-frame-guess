// Deterministic synthetic data generator. Never substitutes for SF6 research.
import { mkdirSync, writeFileSync } from "node:fs";
import type { Character, Move, MoveInput } from "../src/lib/frame-data/schema";
const gameVersion = "fixture-v1-NOT-SF6";
const source = {
  url: "https://example.invalid/synthetic-fixture",
  retrievedAt: "2026-01-01T00:00:00Z",
  gameVersion,
  kind: "community" as const,
  attribution: "Synthetic test data; not actual SF6 frame data.",
  license: "CC0-1.0 (synthetic fixture only)",
  verification: "verified" as const,
};
const frame = (display: string) => ({
  status: "confirmed" as const,
  display,
  ...(/^[+-]?\d+$/.test(display) ? { numeric: Number(display) } : {}),
});
const normalInputs: MoveInput[] = ["5", "2"].flatMap((direction) =>
  ["P", "K"].flatMap((button) =>
    ["L", "M", "H"].map(
      (strength) =>
        ({ type: "normal", direction, button, strength }) as MoveInput,
    ),
  ),
);
const specials: MoveInput[] = [
  ...["236", "214", "623", "421", "22", "[4]6", "[2]8"].flatMap((motion) =>
    ["P", "K"].flatMap((button) =>
      ["L", "M", "H", "OD"].map(
        (strength) =>
          ({ type: "special", motion, button, strength }) as MoveInput,
      ),
    ),
  ),
  { type: "special", motion: "360", button: "P", strength: "none" },
];
mkdirSync("src/data/fixtures/characters", { recursive: true });
writeFileSync(
  "src/data/fixtures/metadata.json",
  JSON.stringify(
    {
      schemaVersion: "1.0.0",
      kind: "fixture",
      gameVersion,
      label: "架空Fixture・SF6実データではありません",
    },
    null,
    2,
  ) + "\n",
);
for (const [index, name] of ["アルファ", "ベータ", "ガンマ"].entries()) {
  const inputs = [
    ...normalInputs,
    ...specials.filter((_, i) => i % 3 === index),
  ];
  const moves: Move[] = inputs.map((input, i) => ({
    id: `move-${i}`,
    name: `架空技 ${i + 1}`,
    category: input.type,
    input,
    variant: { kind: "base", condition: null },
    frames: {
      startup: frame(String(4 + ((i + index) % 12))),
      total: {
        ...frame(String(20 + i + index)),
        provenance: "source",
        calculation: null,
      },
      hit: frame(i % 4 === 0 ? "D" : `+${index + (i % 5)}`),
      block: frame(i === 0 ? "0" : String(-2 - index - (i % 7))),
    },
    notes: ["テスト専用の架空値"],
    source,
  }));
  const character: Character = {
    id: `fixture-${index + 1}`,
    nameJa: `テスト${name}`,
    nameEn: `Fixture ${index + 1}`,
    gameVersion,
    source,
    coverage: {
      normal: { status: "complete", verification: "verified" },
      special: { status: "complete", verification: "verified" },
    },
    moves,
  };
  writeFileSync(
    `src/data/fixtures/characters/${character.id}.json`,
    JSON.stringify(character, null, 2) + "\n",
  );
}
