import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
// @ts-expect-error Local JavaScript converter is independently tested with node:test.
import { convertReviewed, fingerprint } from "./quality-converter.mjs";
const root = "staging/sf6-frame-data",
  out = "staging/sf6-frame-data-quality";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, value: unknown) =>
  writeFile(p, JSON.stringify(value, null, 2) + "\n");
const manifest = await read(`${root}/collection-report.json`);
const { decisions } = await read(`${out}/review-decisions.json`);
const observations = await read(`${out}/source-semantic-observations.json`);
await mkdir(`${out}/characters`, { recursive: true });
await copyFile(`${root}/NOTICE`, `${out}/NOTICE`);
const collisions: any[] = [],
  missing: any[] = [],
  changes: any[] = [],
  reviews: any[] = [],
  counts: any[] = [],
  validation: any[] = [];
const processed: Record<string, unknown> = {};
for (const { id } of manifest.characters) {
  const raw = await read(`${root}/raw/${id}.json`),
    before = await read(`${root}/characters/${id}.json`),
    audit = await read(`${root}/${id}.audit.json`);
  const result = convertReviewed(raw, decisions),
    again = convertReviewed(raw, decisions);
  if (JSON.stringify(result) !== JSON.stringify(again))
    throw new Error(`Non-deterministic conversion: ${id}`);
  const after = result.character;
  processed[id] = after;
  const parsed = characterSchema.safeParse(after);
  validation.push({
    id,
    valid: parsed.success,
    issues: parsed.success ? [] : parsed.error.issues,
  });
  await save(`${out}/characters/${id}.json`, after);
  await save(`${out}/${id}.audit.json`, {
    ...result.audit,
    review: result.review,
  });
  const keys = [
    ...new Set(
      audit.excluded
        .filter((e: any) => e.reason.startsWith("unresolved_base_collision:"))
        .map((e: any) => e.reason.split(":").slice(1).join(":")),
    ),
  ];
  for (const key of keys) {
    const entries = audit.excluded.filter(
      (e: any) => e.reason === `unresolved_base_collision:${key}`,
    );
    const remains = result.audit.excluded.some(
      (e: any) => e.reason === `unresolved_base_collision:${key}`,
    );
    const adopted = after.moves.find(
      (m: any) =>
        `${m.input.type}:${m.input.direction ?? m.input.motion}:${m.input.button}:${m.input.strength}` ===
        key,
    );
    const classification =
      id === "arjun"
        ? "exact_duplicate"
        : id === "jamie"
          ? "drink_level"
          : id === "blanka"
            ? "super_install"
            : id === "mai"
              ? "flame_stock"
              : id === "m_bison"
                ? "installed_mine"
                : id === "juri"
                  ? "fuha_stock"
                  : id === "dee_jay"
                    ? "super_gauge_condition"
                    : "hold_level_not_resolved";
    const originals = raw.moves.filter((m: any) =>
      entries.some(
        (e: any) => e.input === m.input?.numpad && e.name === m.name?.en,
      ),
    );
    collisions.push({
      characterId: id,
      inputKey: key,
      classification,
      baselineRows: entries.length,
      result: adopted
        ? "adopted_unique_base"
        : remains
          ? "unresolved"
          : "no_confirmed_initial_state",
      adoptedName: adopted?.name ?? null,
      cause: classification,
      records: originals.map((m: any) => ({
        input: m.input.numpad,
        name: m.name.en,
        fingerprint: fingerprint(m),
        evidence: m.notes.en,
        url: m.source.url,
      })),
      urls: [...new Set(originals.map((m: any) => m.source.url))],
    });
  }
  for (const move of before.moves) {
    const original = raw.moves.find(
      (m: any) =>
        move.notes.includes(`upstreamInput: ${m.input?.numpad}`) &&
        move.notes.includes(`upstreamName: ${m.name?.en}`),
    );
    for (const field of ["startup", "total", "hit", "block"])
      if (move.frames[field].display === null) {
        const upstreamField = {
          startup: "startup",
          total: "totalFrames",
          hit: "onHit",
          block: "onBlock",
        }[field]!;
        const observation =
          original &&
          observations.find(
            (o: any) =>
              o.fingerprint === fingerprint(original) && o.field === field,
          );
        const next = after.moves.find((m: any) => m.id === move.id);
        missing.push({
          characterId: id,
          input: move.input,
          name: move.name,
          field,
          upstreamField,
          upstreamValue: original?.[upstreamField] ?? null,
          classification:
            observation?.classification ??
            "upstream_missing_original_not_yet_confirmed",
          sourceDisplay: observation?.sourceDisplay ?? null,
          disposition: !next
            ? "move_excluded"
            : next.frames[field].status === "not_applicable"
              ? "corrected_not_applicable"
              : "retained_unknown",
          cause: observation
            ? "Matched source input and notes; semantic dash may be restored, numerical additions require patch confirmation."
            : "No matching original row certified; preserve unknown.",
          urls: observation?.urls ?? [original?.source.url ?? raw.source.url],
          evidence: original?.notes?.en ?? null,
        });
      }
  }
  for (const move of before.moves) {
    const next = after.moves.find((m: any) => m.id === move.id);
    if (!next || JSON.stringify(next) !== JSON.stringify(move))
      changes.push({
        characterId: id,
        input: move.input,
        name: move.name,
        action: next ? "modified" : "removed",
        before: move,
        after: next ?? null,
      });
  }
  for (const move of after.moves) {
    if (!before.moves.some((m: any) => m.id === move.id))
      changes.push({
        characterId: id,
        input: move.input,
        name: move.name,
        action: "added",
        before: null,
        after: move,
      });
    reviews.push({
      characterId: id,
      input: move.input,
      name: move.name,
      status: "unverified",
      patch: "UNVERIFIED",
      cause:
        "Field meanings and initial-state availability not fully certified",
      urls: [move.source.url],
      outstanding: [
        "patch_consistency",
        "hit_advantage_semantics",
        "whiff_total_semantics",
      ],
      decisions: result.review.applied.filter(
        (d: any) =>
          d.input ===
          move.notes
            .find((n: string) => n.startsWith("upstreamInput: "))
            ?.slice(15),
      ),
    });
  }
  counts.push({
    id,
    before: before.moves.length,
    after: after.moves.length,
    missingNormals: result.audit.missingNormals,
    appliedReviews: result.review.applied.length,
  });
}
const summary = {
  schemaVersion: "1.0.0",
  upstreamRef: manifest.upstreamRef,
  license: "CC-BY-SA-4.0",
  before: counts.reduce((s, r) => s + r.before, 0),
  after: counts.reduce((s, r) => s + r.after, 0),
  baselineCollisionKeys: collisions.length,
  adoptedCollisionKeys: collisions.filter(
    (c) => c.result === "adopted_unique_base",
  ).length,
  remainingCollisionKeys: collisions.filter(
    (c) => c.result !== "adopted_unique_base",
  ).length,
  baselineMissingFields: missing.length,
  nullsFilled: missing.filter(
    (m) => m.disposition === "corrected_not_applicable",
  ).length,
  dReplacements: reviews.length,
  quarantinedHitFields: 0,
  schemaPass: validation.filter((v) => v.valid).length,
  schemaFail: validation.filter((v) => !v.valid).length,
  productionEligible: 0,
  reproducible: true,
  counts,
};
summary.dReplacements = 0;
const dataset = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "quality staging",
  },
  processed,
);
summary.productionEligible = dataset.eligible.length;
Object.assign(summary, { loaderErrors: dataset.errors });
for (const { id } of counts) {
  const c = await read(`${out}/characters/${id}.json`);
  summary.dReplacements += c.moves.filter(
    (m: any) =>
      m.frames.hit.display === "D" &&
      m.notes.some((n: string) => n.startsWith("qualityReview: restored")),
  ).length;
  summary.quarantinedHitFields += c.moves.filter(
    (m: any) =>
      m.frames.hit.status === "unknown" &&
      m.notes.some((n: string) => n.startsWith("qualityReview: Numeric")),
  ).length;
}
await save(`${out}/quality-report.json`, {
  summary,
  collisions,
  missing,
  changes,
  reviews,
  validation,
});
const table = [
  "# 未解決46キーの調査結果",
  "",
  "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei / CC-BY-SA-4.0。原典レコードを調査し、抽出・分類を追加。",
  "",
  "|キャラ|入力キー|分類|結果|原典|",
  "|---|---|---|---|---|",
  ...collisions.map(
    (c) =>
      `|${c.characterId}|${c.inputKey}|${c.classification}|${c.result}|[source](${c.urls[0]})|`,
  ),
];
await writeFile(
  "docs/FRAME_DATA_QUALITY_COLLISIONS.md",
  table.join("\n") + "\n",
);
console.log(JSON.stringify(summary, null, 2));
if (summary.schemaFail) process.exitCode = 1;
if (dataset.errors.length) process.exitCode = 1;
