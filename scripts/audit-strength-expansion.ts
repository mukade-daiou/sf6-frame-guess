import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { characterSchema } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
import { inputKey } from "../src/lib/frame-data/input";
import { applyConditionalSpecials } from "./conditional-specials";
import { applyFrameResearch } from "./frame-research";
import { applyDistanceRanges } from "./distance-ranges";
import { applyCompoundStartup } from "./compound-startup";
import { applyKdHkdCorrections } from "./kd-hkd-corrections";
import { restoreWhiffTotalCorrections } from "./whiff-total-corrections";
import {
  auditStrengthless,
  generateStrengthExpansions,
  withStrengthExpansions,
} from "../src/lib/frame-data/strength-expansion";
const decisions = JSON.parse(
  readFileSync("data/adoption-decisions.json", "utf8"),
);
const characters = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) =>
    characterSchema.parse(
      JSON.parse(readFileSync(`data/characters/${f}`, "utf8")),
    ),
  );
const rows = characters.flatMap(auditStrengthless);
let originals = 0;
const beforeFiles: Record<string, unknown> = {};
if (process.argv.includes("--check"))
  for (const current of characters) {
    const c = restoreWhiffTotalCorrections(current);
    const old = JSON.parse(
      execFileSync(
        "git",
        [
          "show",
          `${decisions.commonSpecialStrengths.protectionRef}:data/characters/${c.id}.json`,
        ],
        { encoding: "utf8" },
      ),
    );
    beforeFiles[c.id] = old;
    originals += old.moves.length;
    if (
      !isDeepStrictEqual(
        c.moves.filter((m) => !m.strengthExpansion),
        applyKdHkdCorrections(
          applyCompoundStartup(
            applyDistanceRanges(
              applyFrameResearch(applyConditionalSpecials(old)),
            ),
          ),
        ).moves,
      ) ||
      !isDeepStrictEqual(c.coverage, old.coverage)
    )
      throw new Error(`Original data changed: ${c.id}`);
    if (
      !isDeepStrictEqual(
        c.moves.filter((m) => m.strengthExpansion),
        generateStrengthExpansions(c),
      )
    )
      throw new Error(`Expansion differs: ${c.id}`);
    if (!isDeepStrictEqual(withStrengthExpansions(c), c))
      throw new Error(`Not idempotent: ${c.id}`);
  }
// Excluded state-specific expansions remain in the dataset as historical records.
const generated = characters.flatMap((c) =>
  c.moves.filter((m) => m.strengthExpansion),
);
const metadata = JSON.parse(readFileSync("data/metadata.json", "utf8"));
const uiKeys = (files: Record<string, unknown>) =>
  validateDataset(metadata, files)
    .inputs.filter(
      (i) =>
        i.type === "normal" || (i.type === "special" && i.includeSuperArts),
    )
    .map(inputKey);
const beforeKeys = uiKeys(beforeFiles),
  afterKeys = uiKeys(Object.fromEntries(characters.map((c) => [c.id, c])));
const addedQuestionKeys = afterKeys.filter((k) => !beforeKeys.includes(k));
const summary = {
  characters: characters.length,
  sourceRows: rows.length,
  expandableSources: rows.filter((r) => r.classification === "expandable")
    .length,
  classifications: Object.fromEntries(
    [...new Set(rows.map((r) => r.classification))].map((k) => [
      k,
      rows.filter((r) => r.classification === k).length,
    ]),
  ),
  generatedInputs: generated.length,
  excludedGeneratedInputs: generated.filter(
    (m) => m.adoption?.status === "excluded",
  ).length,
  explicitStrengthOverlaps: rows
    .filter((r) => r.classification === "expandable")
    .flatMap((r) => r.strengths)
    .filter((s) => s.explicitMoveIds.length).length,
  generatedOD: generated.filter((m) => m.input.strength === "OD").length,
  originalRecordsVerified: originals,
  totalRecords: characters.reduce((n, c) => n + c.moves.length, 0),
  beforeGlobalQuestionInputs: beforeKeys.length,
  afterGlobalQuestionInputs: afterKeys.length,
  addedGlobalQuestionInputs: addedQuestionKeys.length,
};
mkdirSync("staging/strength-expansion", { recursive: true });
writeFileSync(
  "staging/strength-expansion/audit.json",
  JSON.stringify(
    {
      summary,
      auditedCharacters: characters.map((c) => ({
        id: c.id,
        strengthlessRows: rows.filter((r) => r.characterId === c.id).length,
        generatedInputs: generated.filter((m) =>
          c.moves.some((s) => s.id === m.strengthExpansion?.sourceMoveId),
        ).length,
      })),
      rows,
      addedQuestionKeys,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
