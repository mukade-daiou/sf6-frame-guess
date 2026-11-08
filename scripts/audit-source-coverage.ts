import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
import { isQuestionInput } from "../src/lib/frame-data/input";
import { excludedInputReason } from "./source-scope";
import { applyConditionalSpecials } from "./conditional-specials";

const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const out = "staging/coverage-audit";
await mkdir(out, { recursive: true });
const characters = [];
for (const file of (await readdir("staging/adoption-inputs"))
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const c = applyConditionalSpecials(
    characterSchema.parse(await read(`staging/adoption-inputs/${file}`)),
  );
  const rawPath = `archive/staging/sf6-frame-data/raw/${file}`;
  const raw = await read(rawPath);
  const cargoPath = `archive/staging/sf6-frame-data-quality/evidence/${c.id}.cargo.json`;
  const cargo = await read(cargoPath);
  const rows = raw.moves.map((r: any, index: number) => {
    const input = r.input.numpad;
    const notes = r.notes?.en || "";
    const matches = c.moves.filter(
      (m) =>
        m.notes.includes(`coverageSourceRow: ${index}`) ||
        ((m.notes.includes(`upstreamInput: ${input}`) ||
          m.notes.includes(`stage4OriginalInput: ${input}`)) &&
          (!m.notes.some((n) => n.startsWith("upstreamName: ")) ||
            m.notes.includes(`upstreamName: ${r.name.en}`))),
    );
    let classification: string, reason: string;
    if (!["normal", "special"].includes(r.category)) {
      classification = "out_of_scope";
      reason = `category: ${r.category}`;
    } else if (r.category === "normal" && !/^[52][LMH][PK]$/.test(input)) {
      classification = "out_of_scope";
      reason =
        "Command/aerial/hold/target normal, outside the twelve standing/crouching normals.";
    } else if (excludedInputReason(input)) {
      classification = "out_of_scope";
      reason = excludedInputReason(input)!;
    } else if (matches.length) {
      if (matches.every((m) => m.adoption?.status === "excluded")) {
        classification = "out_of_scope";
        reason = "Explicit individual adoption exclusion (Speedy Maracas).";
      } else {
        classification = matches.every(
          (m) => m.adoption?.status === "held" || m.variant.kind !== "base",
        )
          ? "held"
          : matches.some((m) => isQuestionInput(m.input))
            ? "recorded"
            : "recorded_ui_unsupported";
        reason =
          "Explicit source-input/source-row mapping; source variants remain distinct in the inventory.";
      }
    } else if (/j\.|against wall/.test(input)) {
      classification = "out_of_scope";
      reason = "Air/wall-only move.";
    } else if (/~/.test(input)) {
      classification = "out_of_scope";
      reason = "Follow-up input.";
    } else if (
      /\[(?:[LMH]?[PK]|PP|KK)\]|\{(?:[PK]|PP|KK)\}/.test(input) ||
      /\(hold\)/i.test(input)
    ) {
      classification = "out_of_scope";
      reason = "Held-button version, not the non-held base.";
    } else if (
      /Stock|stock|DL[234]|Air Current|Bomb|Detonation|Backturn|^W\./.test(
        input,
      ) ||
      /\(SA2\)|\(DL[234]\)|\(\d Stock\)|\(Flame\)|\(Mine\)|Denjin Charge|\(Counter\)/.test(
        r.name.en,
      ) ||
      /Dark Ingrid only|Shin Bison only|Requires summoning the Monoid|during SA2|Occurs automatically upon reaching Drink Level 4/.test(
        notes,
      )
    ) {
      classification = "out_of_scope";
      reason =
        "Explicit stock/install/backturn/projectile/other prerequisite; original condition retained.";
    } else if (/^(?:236(?:MPHP|LKHK|MKHK)|214MPHP)$/.test(input)) {
      classification = "out_of_scope";
      reason = "Explicit alternate OD pair; outside LP+MP / LK+MK policy.";
    } else if (c.id === "guile" && input === "PP") {
      classification = "out_of_scope";
      reason = "Sonic Break requires Solid Puncher (SA2).";
    } else if (c.id === "zangief" && input === "PPP") {
      classification = "out_of_scope";
      reason =
        "OD Double Lariat requires three punches, outside the selected weak+medium pair; not the PP move.";
    } else if (c.id === "ingrid" && input === "214236HP/HK") {
      classification = "out_of_scope";
      reason = "Three-bar super, incorrectly categorized special upstream.";
    } else if (c.id === "kimberly" && /236K.*\(close\)/.test(input)) {
      classification = "out_of_scope";
      reason =
        "Automatic Arc Step follow-up after Sprint, not a separate direct input.";
    } else if (/KKK|2KK or 3KK|5\/6KK|^6\[6\]$/.test(input)) {
      classification = "input_unsupported";
      reason =
        "In-scope source input requires an explicit triple-button, multi-direction/no-button model; retained in source, not reinterpreted as OD.";
    } else {
      classification = "unresolved";
      reason =
        "Generic unsupported-input exclusions are not evidence of an out-of-scope move.";
    }
    return {
      index,
      sourceId: r.id,
      input,
      name: r.name.en,
      category: r.category,
      classification,
      reason,
      moveIds: matches.map((m) => m.id),
      source: r.source || raw.source,
    };
  });
  const cargoOnly = (cargo.data?.cargoquery || [])
    .filter(
      (r: any) => !raw.moves.some((m: any) => m.input.numpad === r.title.input),
    )
    .map((r: any) => ({
      input: r.title.input,
      source: cargoPath,
      classification: "supplemental_source_review",
      data: r.title,
    }));
  // These source-only rows must be explicitly reviewed; never infer raw completeness from row counts.
  const reviews = await read(`${out}/supplemental-decisions.json`);
  for (const row of cargoOnly) {
    const review = reviews.find(
      (d: any) => d.characterId === c.id && d.input === row.input,
    );
    if (review)
      Object.assign(row, {
        classification: review.classification,
        reason: review.reason,
      });
  }
  const unresolved = rows.filter((r: any) =>
    ["unresolved", "input_unsupported"].includes(r.classification),
  );
  const unreviewedSupplemental = cargoOnly.filter(
    (r: any) => r.classification === "supplemental_source_review",
  );
  characters.push({
    id: c.id,
    rawPath,
    cargoPath,
    coverage: c.coverage,
    sourceRows: rows.length,
    rows,
    cargoOnly,
    unresolved: unresolved.length + unreviewedSupplemental.length,
    sourceInventoryComplete:
      !unresolved.length && !unreviewedSupplemental.length,
  });
}
const report = {
  basis:
    "Saved SuperCombo-derived raw inventory and saved Cargo evidence; not official/current-patch verification.",
  characters,
};
await writeFile(`${out}/review.json`, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--check")) {
  const decisions = await read("data/adoption-decisions.json");
  for (const c of characters) {
    const d = decisions.characters.find((d: any) => d.id === c.id);
    if (d.sourceInventoryComplete !== c.sourceInventoryComplete)
      throw new Error(`Stale source coverage: ${c.id}`);
    if (!c.sourceInventoryComplete && c.coverage.special.status === "complete")
      throw new Error(`False complete: ${c.id}`);
  }
}
console.log(
  characters.map((c) => ({
    id: c.id,
    rows: c.sourceRows,
    unresolved: c.unresolved,
    missing: c.rows
      .filter((r: any) => r.classification === "unresolved")
      .map((r: any) => r.input),
  })),
);
