import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { applyConditionalSpecials } from "./conditional-specials";
import { applyFrameResearch } from "./frame-research";
import {
  readSAResearch,
  generateSuperArts,
  classifySARows,
} from "./super-arts";
const inventory = readSAResearch();
const decisions = JSON.parse(
  readFileSync("data/adoption-decisions.json", "utf8"),
);
const ids = [
  ...new Set<string>(inventory.records.map((r: any) => r.characterId)),
];
const pilot = process.argv.includes("--pilot");
const rows = [];
for (const id of pilot
  ? ["ryu", "dhalsim", "juri", "ingrid", "zangief", "guile"]
  : ids) {
  const moves = generateSuperArts(inventory, id);
  if (moves.length !== 9) throw new Error(`SA inputs incomplete: ${id}`);
  if (process.argv.includes("--check")) {
    const c = JSON.parse(readFileSync(`data/characters/${id}.json`, "utf8"));
    const original = JSON.parse(
      execFileSync(
        "git",
        [
          "show",
          `${decisions.superArts.protectionRef}:data/characters/${id}.json`,
        ],
        { encoding: "utf8" },
      ),
    );
    if (
      !isDeepStrictEqual(
        c.moves.filter(
          (m: any) => m.category !== "super_art" && !m.strengthExpansion,
        ),
        applyFrameResearch(applyConditionalSpecials(original)).moves,
      )
    )
      throw new Error(`Original records changed: ${id}`);
    if (
      !isDeepStrictEqual(
        c.moves.filter((m: any) => m.category === "super_art"),
        moves,
      )
    )
      throw new Error(`SA snapshot differs: ${id}`);
    if (c.coverage.super_art?.status !== "complete")
      throw new Error(`SA coverage missing: ${id}`);
  }
  rows.push({
    id,
    baseSlots: 3,
    inputRecords: moves.length,
    common: moves.filter((m) => m.saEvidence?.strengthBasis === "user_common")
      .length,
    unknown: moves.flatMap((m) =>
      Object.entries(m.frames)
        .filter(([, v]) => v.status === "unknown")
        .map(([field]) => ({ moveId: m.id, field })),
    ),
  });
}
const result = {
  pilot,
  characters: rows,
  sourceRows: classifySARows(inventory),
  adoptedSourceRows: classifySARows(inventory).filter(
    (r: any) => r.classification === "adopted",
  ).length,
  excludedSourceRows: classifySARows(inventory).filter(
    (r: any) => r.classification === "excluded",
  ).length,
  baseSlots: rows.length * 3,
  inputRecords: rows.length * 9,
  originalRecordsPreserved: process.argv.includes("--check"),
};
mkdirSync("staging/sa-integration", { recursive: true });
writeFileSync(
  `staging/sa-integration/${pilot ? "pilot" : "coverage"}.json`,
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    characters: rows.length,
    inputRecords: result.inputRecords,
    originalRecordsPreserved: result.originalRecordsPreserved,
  }),
);
