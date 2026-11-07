import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
import { resolveMove } from "../src/lib/frame-data/resolver";
import { readSAResearch, generateSuperArts } from "./super-arts";
import { withStrengthExpansions } from "../src/lib/frame-data/strength-expansion";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, v: unknown) =>
  writeFile(p, JSON.stringify(v, null, 2) + "\n");
const out = "staging/verification";
await mkdir(out, { recursive: true });
const decisions = await read("data/adoption-decisions.json");
const saResearch = decisions.superArts ? readSAResearch() : null;
// Recompute against the actual inputs before trusting a saved complete flag.
execFileSync(
  "node_modules/.bin/tsx",
  ["scripts/audit-source-coverage.ts", "--check"],
  { stdio: "pipe" },
);
const coverageAudit = await read("staging/coverage-audit/review.json");
const metadata = {
  schemaVersion: "1.0.0",
  kind: "production",
  datasetId: decisions.datasetId,
  gameVersion: decisions.gameVersion,
  label: decisions.label,
  updatePolicy: "manual",
};
const files: Record<string, Character> = {};
for (const d of decisions.characters) {
  const c = characterSchema.parse(await read(d.candidatePath));
  if (c.id !== d.id) throw new Error(`Character mismatch: ${d.id}`);
  const audited = coverageAudit.characters.find((row: any) => row.id === c.id);
  if (!audited || audited.sourceInventoryComplete !== d.sourceInventoryComplete)
    throw new Error(`Run source coverage audit and review decisions: ${d.id}`);
  const normals = new Set(
    c.moves
      .filter((m) => m.category === "normal" && m.variant.kind === "base")
      .map((m) => JSON.stringify(m.input)),
  );
  if (normals.size !== 12)
    throw new Error(`Normal coverage incomplete: ${d.id}`);
  c.adoption = { status: "accepted", basis: d.basis };
  c.coverage.normal.status = "complete";
  c.coverage.special.status = d.sourceInventoryComplete
    ? "complete"
    : "partial";
  for (const m of c.moves)
    m.adoption = {
      status: d.excludedMoveIds?.includes(m.id)
        ? "excluded"
        : m.variant.kind !== "base" || d.heldMoveIds.includes(m.id)
          ? "held"
          : "accepted",
      basis: d.excludedMoveIds?.includes(m.id)
        ? "ユーザー指定の対象外入力。原典・フレーム値は保持し、技なしは採用範囲に限定する。"
        : "原典対応・通常状態の候補として採用。ODは弱＋中を基本とする。出典のverificationは独立に保持。",
    };
  if (saResearch) {
    c.moves.push(...generateSuperArts(saResearch, c.id));
    c.coverage.super_art = { status: "complete", verification: "unverified" };
  }
  files[c.id] = characterSchema.parse(
    decisions.commonSpecialStrengths?.enabled ? withStrengthExpansions(c) : c,
  );
}
const dataset = validateDataset(metadata, files);
if (
  dataset.errors.length ||
  dataset.eligible.length !==
    decisions.characters.filter((d: any) => d.sourceInventoryComplete).length
)
  throw new Error(JSON.stringify(dataset.errors));
const report = {
  datasetId: decisions.datasetId,
  eligible: dataset.eligible.map((c) => c.id),
  schemaPass: dataset.characters.length,
  errors: dataset.errors,
  characters: dataset.characters.map((c) => ({
    id: c.id,
    moves: c.moves.length,
    sourceVerification: c.source.verification,
    coverage: c.coverage,
    normalPlayable: c.moves.filter(
      (m) => resolveMove(c, m.input, "normal").status === "found",
    ).length,
    startupPlayable: c.moves.filter(
      (m) => resolveMove(c, m.input, "startup").status === "found",
    ).length,
    unknownFields: c.moves.flatMap((m) =>
      Object.entries(m.frames)
        .filter(([, v]) => v.status === "unknown")
        .map(([field]) => ({ moveId: m.id, field })),
    ),
  })),
  policy:
    "Source reliability is separate from adoption; absence is relative to this source-based adopted dataset; updates are manual.",
};
await save(`${out}/release.json`, report);
if (process.argv.includes("--write") || process.argv.includes("--check")) {
  await mkdir("data/characters", { recursive: true });
  const existing = (await readdir("data/characters")).filter((p) =>
    p.endsWith(".json"),
  );
  if (existing.length) {
    const differs =
      JSON.stringify(await read("data/metadata.json")) !==
        JSON.stringify(metadata) ||
      existing.length !== Object.keys(files).length;
    let changed = differs;
    for (const [id, c] of Object.entries(files))
      if (
        !existing.includes(`${id}.json`) ||
        JSON.stringify(await read(`data/characters/${id}.json`)) !==
          JSON.stringify(c)
      )
        changed = true;
    if (changed) {
      if (process.argv.includes("--check"))
        throw new Error("Snapshot differs from adoption inputs/decisions");
      const previous = await read("data/metadata.json");
      if (
        !process.argv.includes("--update") ||
        previous.datasetId === metadata.datasetId ||
        existing.some((name) => !files[name.slice(0, -5)])
      )
        throw new Error(
          "Frozen snapshot differs: explicit --update, a new datasetId and preservation of existing characters are required",
        );
      for (const [id, c] of Object.entries(files))
        await save(`data/characters/${id}.json`, c);
      await save("data/metadata.json", metadata);
    }
  } else {
    if (process.argv.includes("--check")) throw new Error("No snapshot exists");
    for (const [id, c] of Object.entries(files))
      await save(`data/characters/${id}.json`, c);
    await save("data/metadata.json", metadata);
  }
}
console.log(JSON.stringify(report, null, 2));
