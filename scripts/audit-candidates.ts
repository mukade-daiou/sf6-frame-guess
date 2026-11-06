import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
import { inputKey, isQuestionInput } from "../src/lib/frame-data/input";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const readiness = await read(
  "archive/staging/sf6-frame-data-release/readiness.json",
);
const characters: any[] = [];
for (const file of (await readdir("staging/candidates"))
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const c = characterSchema.parse(await read(`staging/candidates/${file}`));
  const raw = await read(`archive/staging/sf6-frame-data/raw/${file}`);
  const audit = await read(
    `archive/staging/sf6-frame-data-quality/${c.id}.audit.json`,
  );
  const note = (notes: string[], prefix: string) =>
    notes.find((n) => n.startsWith(prefix))?.slice(prefix.length);
  const rows = c.moves.map((m) => ({
    moveId: m.id,
    input: m.input,
    name: m.name,
    variant: m.variant,
    unknownFields: Object.entries(m.frames)
      .filter(([, v]) => v.status === "unknown")
      .map(([k]) => k),
    uiSupported: isQuestionInput(m.input),
    sourceRows: raw.moves
      .filter(
        (r: any) =>
          (r.input.numpad === note(m.notes, "upstreamInput: ") &&
            r.name.en === note(m.notes, "upstreamName: ")) ||
          r.input.numpad === note(m.notes, "stage4OriginalInput: "),
      )
      .map((r: any) => r.id),
  }));
  const keys = c.moves
    .filter((m) => m.variant.kind === "base")
    .map((m) => inputKey(m.input));
  const sourceInventory = raw.moves.map((r: any) => ({
    id: r.id,
    input: r.input.numpad,
    name: r.name.en,
    category: r.category,
    candidates: rows
      .filter((m) => m.sourceRows.includes(r.id))
      .map((m) => m.moveId),
    priorExclusions: [
      ...audit.excluded,
      ...(audit.review?.classifiedExclusions || []),
      ...(audit.review?.applied || []).filter(
        (r: any) => r.action === "exclude",
      ),
    ].filter((e: any) => e.input === r.input.numpad && e.name === r.name.en),
  }));
  characters.push({
    id: c.id,
    name: c.nameJa,
    moves: c.moves.length,
    normals: c.moves.filter((m) => m.category === "normal").length,
    specials: c.moves.filter((m) => m.category === "special").length,
    base: c.moves.filter((m) => m.variant.kind === "base").length,
    conditional: c.moves.filter((m) => m.variant.kind !== "base").length,
    knownInputs: c.moves.length,
    unknownFields: rows.reduce((n, m) => n + m.unknownFields.length, 0),
    collisions: [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))],
    unsupported: rows.filter((m) => !m.uiSupported).map((m) => m.moveId),
    coverage: c.coverage,
    source: c.source,
    unmatchedCandidates: rows
      .filter((m) => !m.sourceRows.length)
      .map((m) => m.moveId),
    heldEvidence: readiness.unresolved.filter(
      (r: any) => r.characterId === c.id,
    ),
    rows,
    sourceInventory,
    unclassifiedSourceRows: sourceInventory.filter(
      (r: any) =>
        ["normal", "special"].includes(r.category) &&
        !r.candidates.length &&
        !r.priorExclusions.length,
    ),
  });
}
const report = {
  checkpoint: "876101d",
  candidateCharacters: characters.length,
  candidateMoves: characters.reduce((n, c) => n + c.moves, 0),
  pilots: ["ryu", "guile", "jamie", "terry"].map((id) =>
    characters.find((c) => c.id === id),
  ),
  characters,
};
await mkdir("staging/integration", { recursive: true });
await writeFile(
  "staging/integration/inventory.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    characters.map((c) => ({
      id: c.id,
      moves: c.moves,
      unknown: c.unknownFields,
      unmatched: c.unmatchedCandidates.length,
      unclassified: c.unclassifiedSourceRows.length,
      held: c.heldEvidence.length,
    })),
    null,
    2,
  ),
);
