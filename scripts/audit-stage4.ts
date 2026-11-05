import { readFile, writeFile, mkdir } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
// @ts-expect-error Independently tested JavaScript rules.
import { reviewOD, cleanSource, compareDisplay } from "./stage4-rules.mjs";
// @ts-expect-error Existing independently tested converter.
import { convertReviewed } from "./quality-converter.mjs";
// @ts-expect-error Existing independently tested converter.
import { convert } from "./collect-supercombo.mjs";

const out = "staging/sf6-frame-data-release";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, data: unknown) =>
  writeFile(p, JSON.stringify(data, null, 2) + "\n");
await mkdir(`${out}/evidence`, { recursive: true });
await mkdir(`${out}/candidates`, { recursive: true });
const quality = await read(
  "staging/sf6-frame-data-quality/quality-report.json",
);
const decisions = (
  await read("staging/sf6-frame-data-quality/review-decisions.json")
).decisions;
const refresh = process.argv.includes("--fetch");
async function probe(id: string, url: string) {
  const path = `${out}/evidence/${id}.json`;
  if (!refresh) return read(path);
  const retrievedAt = new Date().toISOString();
  let record;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    record = {
      url,
      retrievedAt,
      status: response.status,
      body: await response.text(),
    };
  } catch (error) {
    record = { url, retrievedAt, status: null, body: "", error: String(error) };
  }
  await save(path, record);
  return record;
}
const ids = quality.summary.counts.map((c: any) => c.id);
const evidence: Record<string, any> = {};
const investigate = [
  ...new Set([
    "ken",
    "marisa",
    "terry",
    "sagat",
    ...quality.missing
      .filter((m: any) => m.disposition === "retained_unknown")
      .map((m: any) => m.characterId),
    "cviper",
    "dee_jay",
    "jamie",
  ]),
];
for (const id of investigate) {
  const saved = await read(
    `staging/sf6-frame-data-quality/evidence/${id}.cargo.json`,
  );
  evidence[id] = await probe(id as string, saved.url);
}
const probes = [];
for (const [id, url] of Object.entries({
  official_marisa:
    "https://www.streetfighter.com/6/ja-jp/character/marisa/frame",
  official_ken: "https://www.streetfighter.com/6/ja-jp/character/ken/frame",
  patch_20261013:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261013",
  patch_20261016:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261016",
  history: "https://frame-search.com/history",
  alternative_ken: "https://frame-search.com/?lang=en-us&character_name=Ken",
  alternative_marisa:
    "https://frame-search.com/?lang=en-us&character_name=Marisa",
})) {
  const p = await probe(id, url);
  probes.push({
    id,
    url,
    status: p.status,
    retrievedAt: p.retrievedAt,
    displayedVersions: [...new Set(p.body.match(/Ver\.\d+\.\d+\.\d+/g) ?? [])],
  });
}
function rows(id: string) {
  try {
    return (
      JSON.parse(evidence[id].body).cargoquery?.map((r: any) => r.title) ?? []
    );
  } catch {
    return [];
  }
}
const candidates: Record<string, any> = {},
  od: any[] = [],
  reproduction: any[] = [],
  priority: any[] = [];
for (const id of ids) {
  const raw = await read(`staging/sf6-frame-data/raw/${id}.json`);
  const previous = await read(
    `staging/sf6-frame-data-quality/characters/${id}.json`,
  );
  const rebuilt = convertReviewed(raw, decisions).character;
  reproduction.push({
    id,
    equal: JSON.stringify(previous) === JSON.stringify(rebuilt),
    schemaPass: characterSchema.safeParse(previous).success,
  });
  candidates[id] = previous;
  for (const move of raw.moves.filter((m: any) => m.category === "special")) {
    const result = reviewOD(move.input.numpad);
    if (result.status === "not_od_or_unsupported") continue;
    od.push({
      characterId: id,
      input: move.input.numpad,
      name: move.name.en,
      ...result,
      source: move.source,
      patch: "UNVERIFIED",
    });
    if (result.status === "selected_explicit_pair") {
      const converted = convert({
        ...raw,
        moves: [
          { ...move, input: { ...move.input, numpad: result.normalized } },
        ],
      }).character.moves;
      for (const added of converted) {
        added.notes.push(
          `stage4OriginalInput: ${move.input.numpad}`,
          "OD rule: LP+MP / LK+MK; patch unverified",
        );
        previous.moves.push(added);
      }
    }
  }
  if (["ken", "marisa"].includes(id)) {
    const sourceRows = rows(id);
    priority.push({
      id,
      normalCount: previous.moves.filter((m: any) => m.category === "normal")
        .length,
      specialCount: previous.moves.filter((m: any) => m.category === "special")
        .length,
      rawSpecialDisposition: raw.moves
        .filter((m: any) => m.category === "special")
        .map((m: any) => ({
          input: m.input.numpad,
          name: m.name.en,
          candidate: previous.moves.some(
            (p: any) =>
              p.notes.includes(`upstreamInput: ${m.input.numpad}`) &&
              p.notes.includes(`upstreamName: ${m.name.en}`),
          ),
          notes: m.notes.en,
        })),
      moves: previous.moves.map((m: any) => {
        const input = m.notes
          .find((n: string) => n.startsWith("upstreamInput: "))
          ?.slice(15);
        const original = raw.moves.find(
          (r: any) =>
            r.input.numpad === input &&
            m.notes.includes(`upstreamName: ${r.name.en}`),
        );
        const matches = sourceRows.filter(
          (r: any) =>
            r.input === input &&
            cleanSource(r.notes) === cleanSource(original?.notes?.en),
        );
        const unique = [
          ...new Map(matches.map((r: any) => [JSON.stringify(r), r])).values(),
        ] as any[];
        return {
          id: m.id,
          name: m.name,
          input: m.input,
          upstreamInput: input,
          frames: m.frames,
          source: m.source,
          sourceMatches: unique,
          comparison:
            unique.length === 1
              ? Object.fromEntries(
                  Object.entries({
                    startup: "startup",
                    total: "total",
                    hit: "hitAdv",
                    block: "blockAdv",
                  }).map(([field, column]) => [
                    field,
                    compareDisplay(m.frames[field], unique[0][column]),
                  ]),
                )
              : null,
          status: "unverified",
          outstanding: [
            "patch_consistency",
            "initial_state",
            "whiff_total_semantics",
            ...(m.input.strength === "OD" ? ["od_pair_confirmation"] : []),
          ],
        };
      }),
    });
  }
  if (!characterSchema.safeParse(previous).success)
    throw new Error(`Invalid ${id}`);
  await save(`${out}/candidates/${id}.json`, previous);
}
const unresolved = quality.collisions
  .filter((c: any) => c.result !== "adopted_unique_base")
  .map((c: any) => ({
    ...c,
    currentSourceRows: rows(c.characterId).filter((r: any) =>
      c.records.some((m: any) => m.input === r.input),
    ),
    disposition: "held_unverified",
    patch: "UNVERIFIED",
  }));
const missing = quality.missing
  .filter((m: any) => m.disposition === "retained_unknown")
  .map((m: any) => {
    const strength =
      m.input.strength === "OD"
        ? m.input.button.repeat(2)
        : m.input.strength === "none"
          ? m.input.button
          : m.input.strength + m.input.button;
    const input = (m.input.direction ?? m.input.motion) + strength;
    return {
      ...m,
      currentSourceRows: rows(m.characterId).filter(
        (r: any) => r.input === input,
      ),
      stage4Disposition: "unknown_preserved",
      patch: "UNVERIFIED",
    };
  });
const dataset = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "Stage 4 candidates",
  },
  candidates,
);
const report = {
  generatedAt: new Date().toISOString(),
  license: "CC-BY-SA-4.0",
  attribution:
    "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei (normalization)",
  upstreamRef: quality.summary.upstreamRef,
  targetPatch: "UNVERIFIED",
  productionEligible: dataset.eligible.length,
  loaderErrors: dataset.errors,
  reproduction,
  probes,
  unresolved,
  missing,
  od,
  priority,
  summary: {
    characters: ids.length,
    candidates: Object.values(candidates).reduce(
      (s, c) => s + c.moves.length,
      0,
    ),
    unresolvedKeys: unresolved.length,
    unknownFields: missing.length,
    explicitODSelected: od.filter((r) => r.status === "selected_explicit_pair")
      .length,
    explicitODExcluded: od.filter((r) => r.status === "excluded_button_pair")
      .length,
    genericODPending: od.filter((r) => r.status === "pending_pair_confirmation")
      .length,
  },
};
await save(`${out}/readiness.json`, report);
await writeFile(
  `${out}/NOTICE`,
  (await readFile("staging/sf6-frame-data-quality/NOTICE", "utf8")) +
    "\nStage 4: explicit low+medium OD selection, source comparisons and readiness audit. All candidates remain unverified.\n",
);
console.log(
  JSON.stringify(
    {
      ...report.summary,
      productionEligible: report.productionEligible,
      schemaPass: reproduction.filter((r) => r.schemaPass).length,
      reproducible: reproduction.every((r) => r.equal),
      loaderErrors: dataset.errors,
    },
    null,
    2,
  ),
);
if (
  dataset.errors.length ||
  reproduction.some((r) => !r.equal || !r.schemaPass)
)
  process.exitCode = 1;
