// Explicit user policy application to saved sources. Default is a dry run.
import { readFile, writeFile } from "node:fs/promises";
import { excludedInputReason } from "./source-scope";
import { characterSchema } from "../src/lib/frame-data/schema";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const decisions = await read("data/adoption-decisions.json");
const audit = await read("staging/coverage-audit/review.json");
const changes: unknown[] = [];
for (const d of decisions.characters) {
  const c = await read(d.candidatePath);
  const scope = audit.characters.find((row: any) => row.id === d.id);
  d.sourceInventoryComplete = scope.sourceInventoryComplete;
  d.excludedMoveIds = [
    ...new Set(
      scope.rows
        .filter((r: any) => excludedInputReason(r.input))
        .flatMap((r: any) => r.moveIds),
    ),
  ];
  for (const m of c.moves)
    if (d.excludedMoveIds.includes(m.id)) {
      m.adoption = {
        status: "excluded",
        basis:
          "User excludes three-button, non-OD two-button special inputs and buttonless Run; source values retained.",
      };
    }
  if (!["ken", "marisa"].includes(c.id))
    c.coverage.special.status = scope.sourceInventoryComplete
      ? "complete"
      : "partial";
  if (c.id === "zangief") {
    const rawPath = "archive/staging/sf6-frame-data/raw/zangief.json";
    const raw = await read(rawPath);
    const cargo = await read(
      "archive/staging/sf6-frame-data-quality/evidence/zangief.cargo.json",
    );
    const close = cargo.data.cargoquery.find(
      (r: any) => r.title.input === "63214HK or 63214K (Close)",
    ).title;
    if (
      !close.notes.includes(
        "close proximity with LK/MK or from any range with HK",
      )
    )
      throw new Error("Missing explicit LK/MK versus HK mapping evidence");
    for (const strength of ["L", "M", "H", "OD"]) {
      const sourceInput =
        strength === "H"
          ? close.input
          : strength === "OD"
            ? "63214KK (Far)"
            : "63214K (Far)";
      const index = raw.moves.findIndex(
        (r: any) => r.input.numpad === sourceInput,
      );
      const source = raw.moves[index];
      const row = cargo.data.cargoquery.find(
        (r: any) => r.title.input === sourceInput,
      ).title;
      const numeric = (text: string) => {
        const n = /^([+-]?\d+)(?:\([^)]*\))?$/.exec(text);
        if (!n) throw new Error(`Ambiguous source value: ${text}`);
        return { status: "confirmed", display: n[1], numeric: Number(n[1]) };
      };
      const move = {
        id: `zangief__far_63214_K_${strength}`,
        name: source.name.en,
        category: "special",
        input: { type: "special", motion: "63214", button: "K", strength },
        variant: { kind: "base", condition: null },
        frames: {
          startup: numeric(row.startup),
          total: {
            ...numeric(row.total),
            provenance: "source",
            calculation: null,
          },
          hit: { status: "confirmed", display: "D" },
          block: { status: "not_applicable", display: "-" },
        },
        notes: [
          `upstreamInput: ${sourceInput}`,
          `upstreamName: ${source.name.en}`,
          `coverageSourceRow: ${index}`,
          `coverageSource: ${rawPath}`,
          `sourceNotation: ${JSON.stringify(row)}`,
          `strengthMappingEvidence: ${close.notes}`,
          "User standard: far distance. LP/MK notation is not inferred: source explicitly limits LK/MK close Suplex to proximity and states HK uses Suplex from any range. LK/MK use Far Express; HK retains its always-Suplex performance. Parenthesis-external representative values follow existing policy.",
        ],
        source: {
          ...c.source,
          url: source.source.url,
          retrievedAt: source.source.fetchedAt,
        },
        adoption: {
          status: "accepted",
          basis:
            "User-selected far-distance standard; explicit source button mapping.",
        },
      };
      if (!c.moves.some((m: any) => m.id === move.id)) c.moves.push(move);
    }
  }
  characterSchema.parse(c);
  changes.push({
    characterId: c.id,
    sourceInventoryComplete: d.sourceInventoryComplete,
    excludedMoveIds: d.excludedMoveIds,
    moves: c.moves.length,
  });
  if (process.argv.includes("--write"))
    await writeFile(d.candidatePath, JSON.stringify(c, null, 2) + "\n");
}
decisions.datasetId = "scope-policy-2026-11-07-r1";
decisions.scopePolicy = {
  excluded: [
    "three-button inputs",
    "non-OD two-button special inputs",
    "buttonless Run",
  ],
  distance: "far",
  basis:
    "User instructions after stage 14; original records and evidence retained.",
};
if (process.argv.includes("--write")) {
  await writeFile(
    "data/adoption-decisions.json",
    JSON.stringify(decisions, null, 2) + "\n",
  );
  await writeFile(
    "staging/coverage-audit/policy-changes.json",
    JSON.stringify(changes, null, 2) + "\n",
  );
}
console.log(JSON.stringify(changes, null, 2));
