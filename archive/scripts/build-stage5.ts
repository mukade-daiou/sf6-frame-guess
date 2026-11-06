import { readFile, writeFile, mkdir } from "node:fs/promises";
import { characterSchema, type Character } from "../../src/lib/frame-data/schema";
import { validateDataset } from "../../src/lib/frame-data/loader";
// @ts-expect-error Independently tested source interpretation rules.
import { interpretField, classifyRow } from "./stage5-rules.mjs";
// @ts-expect-error Existing source cleaner.
import { cleanSource } from "./stage4-rules.mjs";
const out = "archive/staging/sf6-frame-data-stage5";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, value: unknown) =>
  writeFile(p, JSON.stringify(value, null, 2) + "\n");
await mkdir(`${out}/characters`, { recursive: true });
await mkdir(`${out}/evidence`, { recursive: true });
const stage4 = await read("archive/staging/sf6-frame-data-release/readiness.json");
const reports: any[] = [],
  characters: Record<string, Character> = {};
for (const id of ["ken", "marisa"]) {
  const raw = await read(`archive/staging/sf6-frame-data/raw/${id}.json`);
  const character = await read(
    `staging/candidates/${id}.json`,
  );
  const evidence = await read(
    `archive/staging/sf6-frame-data-release/evidence/${id}.json`,
  );
  const sourceRows = JSON.parse(evidence.body).cargoquery.map(
    (r: any) => r.title,
  );
  const wikiEvidence = await read(`${out}/evidence/wiki_${id}.json`);
  const wikiText = JSON.parse(wikiEvidence.body).parse.wikitext["*"];
  const moves: any[] = [];
  for (const move of character.moves) {
    const previous = stage4.priority
      .find((c: any) => c.id === id)
      .moves.find((m: any) => m.id === move.id);
    const original = raw.moves.find(
      (m: any) =>
        m.input.numpad === previous.upstreamInput &&
        move.notes.includes(`upstreamName: ${m.name.en}`),
    );
    const possible = sourceRows.filter(
      (r: any) => r.input === previous.upstreamInput,
    );
    const exact = possible.filter(
      (r: any) => cleanSource(r.notes) === cleanSource(original.notes.en),
    );
    const row =
      exact.length === 1
        ? exact[0]
        : possible.length === 1
          ? possible[0]
          : null;
    const fields = row
      ? Object.fromEntries(
          ["startup", "total", "hit", "block"].map((f) => [
            f,
            interpretField(id, previous.upstreamInput, f, row, wikiText),
          ]),
        )
      : null;
    if (fields)
      for (const [field, review] of Object.entries(fields))
        move.frames[field] = (review as any).value;
    move.notes.push(
      "Stage 5: source interpretation only; patch and independent whiff-total validation pending.",
    );
    const outstanding = [
      "patch_consistency",
      "independent_whiff_total_validation",
    ];
    if (move.input.strength === "OD")
      outstanding.push("od_low_medium_pair_confirmation");
    if (!row) outstanding.push("source_correspondence");
    if (
      fields &&
      Object.values(fields).some((f: any) => !f.interpretationResolved)
    )
      outstanding.push("source_field_condition");
    if (
      fields &&
      Object.values(fields).some((f: any) => f.value.status === "conditional")
    )
      outstanding.push("game_question_condition");
    moves.push({
      characterId: id,
      moveId: move.id,
      input: move.input,
      upstreamInput: previous.upstreamInput,
      name: move.name,
      disposition: "adopt_staging",
      before: previous.frames,
      frames: fields,
      source: {
        url: evidence.url,
        retrievedAt: evidence.retrievedAt,
        gameVersion: "UNVERIFIED",
        attribution: "SuperCombo Wiki contributors",
        license: "CC-BY-SA-4.0",
      },
      supplementalSource: {
        url: wikiEvidence.url,
        retrievedAt: wikiEvidence.retrievedAt,
        revision: JSON.parse(wikiEvidence.body).parse.revid,
        gameVersion: "UNVERIFIED",
      },
      sourceRow: row,
      sourceCorrespondence: row ? "matched" : "unresolved",
      correspondenceMethod:
        exact.length === 1
          ? "input_and_notes"
          : row
            ? "unique_input_row"
            : null,
      sourceInterpretationComplete:
        !!fields &&
        Object.values(fields).every((f: any) => f.interpretationResolved),
      verified: false,
      patchConfirmed: false,
      targetGameVersion: "UNVERIFIED",
      comparisonVersion: "Ver.2.0500.001",
      outstanding,
    });
  }
  const inventory = raw.moves.map((r: any, index: number) => {
    const candidate = moves.find(
      (m) =>
        m.upstreamInput === r.input.numpad &&
        character.moves
          .find((c: any) => c.id === m.moveId)
          ?.notes.includes(`upstreamName: ${r.name.en}`),
    );
    return {
      characterId: id,
      sourceIndex: index,
      moveId: candidate?.moveId ?? r.id,
      input: r.input,
      name: r.name,
      category: r.category,
      ...classifyRow(r, candidate),
      source: r.source,
      sourceNotes: r.notes?.en ?? null,
    };
  });
  const parsed = characterSchema.parse(character);
  const seen = new Set<string>();
  const liveInventory = sourceRows.map((r: any, index: number) => {
    const signature = JSON.stringify(r);
    if (seen.has(signature))
      return {
        sourceIndex: index,
        input: r.input,
        disposition: "duplicate",
        row: r,
      };
    seen.add(signature);
    const possible = raw.moves.filter((m: any) => m.input.numpad === r.input);
    const exact = possible.filter(
      (m: any) => cleanSource(m.notes?.en) === cleanSource(r.notes),
    );
    const original =
      exact.length === 1
        ? exact[0]
        : possible.length === 1
          ? possible[0]
          : null;
    const classification = original
      ? inventory[raw.moves.indexOf(original)]
      : null;
    if (
      !classification &&
      (/^j\./.test(r.input) || r.input === "214214P~4/5/6")
    )
      return {
        sourceIndex: index,
        input: r.input,
        disposition: "out_of_scope",
        reason: "原典入力が明示する空中技またはスーパーアーツ派生。",
        row: r,
      };
    return {
      sourceIndex: index,
      input: r.input,
      disposition: classification?.disposition ?? "unmatched_source",
      reason: classification?.reason ?? "固定原典への対応未確定。",
      row: r,
    };
  });
  characters[id] = parsed;
  await save(`${out}/characters/${id}.json`, parsed);
  const summary = {
    characterId: id,
    recordedMoves: moves.length,
    sourceCorrespondence: moves.filter(
      (m) => m.sourceCorrespondence === "matched",
    ).length,
    sourceInterpretationComplete: moves.filter(
      (m) => m.sourceInterpretationComplete,
    ).length,
    verifiedMoves: 0,
    patchConfirmedMoves: 0,
    patchOnlyRemaining: moves.filter(
      (m) =>
        m.outstanding.length === 1 && m.outstanding[0] === "patch_consistency",
    ).length,
    resolvedCompositeFields: moves
      .flatMap((m) => Object.values(m.frames ?? {}))
      .filter((f: any) => /[()]/.test(f.original) && f.interpretationResolved)
      .length,
    sourceRows: inventory.length,
    liveSourceRows: liveInventory.length,
    inventoryComplete: [...inventory, ...liveInventory].every(
      (r: any) =>
        !["unmatched_source", "condition_unresolved"].includes(r.disposition),
    ),
    coverageComplete: false,
    productionEligible: false,
    schemaPass: true,
  };
  reports.push({ summary, moves, inventory, liveInventory });
}
const dataset = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "Stage 5",
  },
  characters,
);
const report = {
  schemaVersion: "1.0.0",
  comparisonVersion: "Ver.2.0500.001",
  targetGameVersion: "UNVERIFIED",
  patchConfirmation: "not_confirmed",
  productionEligible: dataset.eligible.length,
  loaderErrors: dataset.errors,
  attribution:
    "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei (normalization)",
  license: "CC-BY-SA-4.0",
  evidenceReused: "staging/sf6-frame-data-release/evidence",
  characters: reports,
};
await save(`${out}/review.json`, report);
await writeFile(
  `${out}/NOTICE`,
  (await readFile("archive/staging/sf6-frame-data-release/NOTICE", "utf8")) +
    "\nStage 5: source-row inventory and conditional-frame interpretation. Original strings retained in review.json. All sources remain unverified.\n",
);
const table = [
  "# ケン・マリーザ62候補の技別照合",
  "",
  "原典表記・条件・取得時刻はreview.jsonに保存。全技パッチ未確認、verified技0。",
  "",
  "|キャラ|入力|技|原典対応|原典の条件解釈|残件|",
  "|---|---|---|---|---|---|",
  ...reports.flatMap((c) =>
    c.moves.map(
      (m: any) =>
        `|${m.characterId}|${m.upstreamInput}|${m.name}|${m.sourceCorrespondence}|${m.sourceInterpretationComplete ? "完了" : "保留あり"}|${m.outstanding.join(", ")}|`,
    ),
  ),
];
await writeFile("archive/docs/FRAME_DATA_STAGE5_MOVES.md", table.join("\n") + "\n");
console.log(
  JSON.stringify(
    reports.map((r) => r.summary),
    null,
    2,
  ),
);
if (dataset.errors.length) throw new Error(dataset.errors.join("\n"));
