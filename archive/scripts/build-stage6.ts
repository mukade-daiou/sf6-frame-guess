import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  characterSchema,
  type Character,
  type Move,
  type MoveInput,
} from "../../src/lib/frame-data/schema";
import { inputKey } from "../../src/lib/frame-data/input";
import { validateDataset } from "../../src/lib/frame-data/loader";
const out = "archive/staging/sf6-frame-data-stage6";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, data: unknown) =>
  writeFile(p, JSON.stringify(data, null, 2) + "\n");
await mkdir(`${out}/characters`, { recursive: true });
const previous = await read("archive/staging/sf6-frame-data-stage5/review.json");
const characters: Record<string, Character> = {};
const reports: any[] = [];
for (const id of ["ken", "marisa"]) {
  const character = characterSchema.parse(
    await read(`archive/staging/sf6-frame-data-stage5/characters/${id}.json`),
  );
  const sourceReview = previous.characters.find(
    (c: any) => c.summary.characterId === id,
  );
  const reviews = sourceReview.moves.map((m: any) => ({
    ...m,
    outstanding: m.outstanding.filter(
      (s: string) => s !== "independent_whiff_total_validation",
    ),
    criteria: {
      correspondence: m.sourceCorrespondence,
      sourceMeaning: m.sourceInterpretationComplete ? "interpreted" : "pending",
      questionApplicability: Object.values(m.frames ?? {}).every((f: any) =>
        ["confirmed", "not_applicable"].includes(f.value.status),
      )
        ? "source_candidate_only"
        : "conditional_or_unknown",
      patchConsistency: "unverified",
      independentAgreement: m.sourceInterpretationComplete
        ? "optional_no_known_conflict"
        : "additional_evidence_required_for_unclear_semantics",
      coverage: "unverified",
    },
  }));
  if (id === "ken") {
    const evidence = await read(
      "archive/staging/sf6-frame-data-release/evidence/ken.json",
    );
    const row = JSON.parse(evidence.body)
      .cargoquery.map((r: any) => r.title)
      .find((r: any) => r.input === "KK");
    if (
      !row ||
      row.startup !== "11(9)" ||
      row.total !== "45" ||
      row.hitAdv !== "-" ||
      row.blockAdv !== "-"
    )
      throw new Error("Quick Dash evidence changed");
    const source = {
      ...character.source,
      url: evidence.url,
      retrievedAt: evidence.retrievedAt,
    };
    const move: Move = {
      id: "ken_quick_dash_simultaneous",
      name: "奮迅脚",
      category: "special",
      input: {
        type: "special",
        motion: "none",
        button: "K",
        strength: "none",
        buttonCombination: "LK+MK",
      },
      variant: { kind: "base", condition: null },
      source,
      frames: {
        startup: {
          status: "conditional",
          display: "11(9)",
          condition: "攻撃発生ではなく派生受付。LK/MKは11F、HKは9Fから。",
        },
        total: {
          status: "confirmed",
          display: "45",
          numeric: 45,
          provenance: "source",
          calculation: null,
        },
        hit: { status: "not_applicable", display: "-" },
        block: { status: "not_applicable", display: "-" },
      },
      notes: [
        "upstreamInput: KK",
        "通常状態から使用可能。モーションなしのLK+MK。ODではない。",
        `sourceNotes: ${row.notes}`,
        "パッチおよび入力ペアの原典対応は未確認。",
      ],
    };
    character.moves.push(move);
    reviews.push({
      characterId: id,
      moveId: move.id,
      input: move.input,
      disposition: "adopt_staging",
      source,
      sourceRow: row,
      normalizedFrames: move.frames,
      criteria: {
        correspondence: "matched_KK",
        sourceMeaning: "follow_up_window",
        questionApplicability: "conditional",
        patchConsistency: "unverified",
        independentAgreement: "not_required_without_conflict",
        coverage: "unverified",
      },
      outstanding: [
        "patch_consistency",
        "button_pair_confirmation",
        "startup_is_not_attack",
      ],
    });
  }
  characters[id] = characterSchema.parse(character);
  await save(`${out}/characters/${id}.json`, characters[id]);
  reports.push({
    characterId: id,
    recordedMoves: character.moves.length,
    verifiedMoves: 0,
    patchConfirmedMoves: 0,
    productionEligible: false,
    patchOnlyRemaining: reviews.filter(
      (m: any) =>
        m.outstanding.length === 1 && m.outstanding[0] === "patch_consistency",
    ).length,
    moves: reviews,
    inventory: sourceReview.inventory.map((r: any) =>
      id === "ken" && r.input.numpad === "KK"
        ? {
            ...r,
            disposition: "adopt",
            moveId: "ken_quick_dash_simultaneous",
            reason:
              "第6段階でモーションなしの同時押し入力を追加。未検証候補として採用。",
          }
        : r,
    ),
  });
}
const inputs = [
  ...new Map(
    Object.values(characters).flatMap((c) =>
      c.moves.map((m) => [inputKey(m.input), m.input] as const),
    ),
  ).values(),
];
const absentInputs: Record<string, string[]> = {};
for (const [id, character] of Object.entries(characters)) {
  const audit = previous.characters.find(
    (c: any) => c.summary.characterId === id,
  );
  if (!audit.summary.inventoryComplete)
    throw new Error(`Inventory incomplete: ${id}`);
  const raw = await read(`archive/staging/sf6-frame-data/raw/${id}.json`);
  const sourceCommand = (input: MoveInput) =>
    input.type === "normal"
      ? `${input.direction}${input.strength}${input.button}`
      : input.motion === "none"
        ? input.button.repeat(2)
        : input.motion +
          (input.strength === "OD"
            ? input.button.repeat(2)
            : input.strength === "none"
              ? input.button
              : input.strength + input.button);
  absentInputs[id] = inputs
    .filter(
      (i) =>
        !character.moves.some((m) => inputKey(m.input) === inputKey(i)) &&
        !raw.moves.some((m: any) => m.input.numpad === sourceCommand(i)),
    )
    .map(inputKey);
}
await save(`${out}/review-policy.json`, {
  absentInputs,
  absenceMeaning:
    "Not present in the audited source scope; current-patch absence remains unverified",
  comparisonVersion: "Ver.2.0500.001",
  gameVersion: "UNVERIFIED",
});
const dataset = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "Stage 6",
  },
  characters,
);
if (dataset.errors.length || dataset.eligible.length)
  throw new Error("Stage 6 isolation failed");
await save(`${out}/review.json`, {
  characters: reports,
  productionEligible: 0,
  developmentPlayable: 2,
  schemaPass: 2,
  criteria: {
    independentWhiffVerification:
      "Required only for conflicting or unclear source semantics, not all moves",
    patch: "UNVERIFIED",
    comparisonVersion: "Ver.2.0500.001",
  },
  unresolvedSix: reports.flatMap((c) =>
    c.moves.filter((m: any) => m.frames && !m.sourceInterpretationComplete),
  ),
  license: "CC-BY-SA-4.0",
  attribution:
    "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei (normalization)",
});
await writeFile(
  `${out}/NOTICE`,
  (await readFile("archive/staging/sf6-frame-data-stage5/NOTICE", "utf8")) +
    "\nStage 6: separate development dataset, explicit simultaneous Quick Dash input, revised review criteria. Sources remain UNVERIFIED.\n",
);
console.log(
  JSON.stringify({
    characters: reports.map((r) => ({
      id: r.characterId,
      moves: r.recordedMoves,
    })),
    productionEligible: 0,
    developmentPlayable: 2,
    schemaPass: 2,
  }),
);
