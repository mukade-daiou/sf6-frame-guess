import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";
const root = "staging/sf6-frame-data";
const report = JSON.parse(
  await readFile(`${root}/collection-report.json`, "utf8"),
);
const base = `https://raw.githubusercontent.com/RyoSogawa/sf6-sensei/${report.upstreamRef}`;
await mkdir(`${root}/raw`, { recursive: true });
const notice = await fetch(`${base}/NOTICE`);
if (!notice.ok) throw new Error(`NOTICE ${notice.status}`);
await writeFile(`${root}/NOTICE`, await notice.text());
const rows: any[] = [],
  violations: any[] = [],
  evidence: any[] = [];
const files: Record<string, unknown> = {};
const reasons: Record<string, number> = {};
for (const summary of report.characters) {
  const id = summary.id;
  const rawPath = `${root}/raw/${id}.json`;
  let raw;
  try {
    raw = JSON.parse(await readFile(rawPath, "utf8"));
  } catch {
    const response = await fetch(
      `${base}/packages/data/src/generated/${id}.json`,
    );
    if (!response.ok) throw new Error(`${id}: ${response.status}`);
    raw = await response.json();
    await writeFile(rawPath, JSON.stringify(raw, null, 2) + "\n");
  }
  const character = JSON.parse(
    await readFile(`${root}/characters/${id}.json`, "utf8"),
  );
  const audit = JSON.parse(await readFile(`${root}/${id}.audit.json`, "utf8"));
  files[id] = character;
  const parsed = characterSchema.safeParse(character);
  if (!parsed.success) violations.push({ id, issues: parsed.error.issues });
  const nulls = Object.fromEntries(
    ["startup", "total", "hit", "block"].map((field) => [
      field,
      character.moves.filter((m: any) => m.frames[field].display === null)
        .length,
    ]),
  );
  const conditional = character.moves.reduce(
    (n: number, m: any) =>
      n +
      Object.values(m.frames).filter((v: any) => v.status === "conditional")
        .length,
    0,
  );
  for (const item of audit.excluded) {
    const reason = item.reason.split(":")[0];
    reasons[reason] = (reasons[reason] ?? 0) + 1;
  }
  const collisionKeys = new Set(
    audit.excluded
      .filter((e: any) => e.reason.startsWith("unresolved_base_collision:"))
      .map((e: any) => e.reason),
  );
  const skippedCategories = raw.moves.filter(
    (m: any) => !["normal", "special"].includes(m.category),
  ).length;
  const hitWarnings = character.moves.filter((m: any) =>
    m.notes.some((n: string) => n.startsWith("HIT VALUE WARNING")),
  ).length;
  const dates = [
    ...new Set([
      character.source.retrievedAt,
      ...character.moves.map((m: any) => m.source.retrievedAt),
    ]),
  ];
  rows.push({
    id,
    normal: audit.candidateNormals,
    special: audit.candidateSpecials,
    missing: audit.missingNormals,
    excluded: audit.excluded.length,
    skippedCategories,
    collisionKeys: collisionKeys.size,
    collisionRows: audit.excluded.filter((e: any) =>
      e.reason.startsWith("unresolved_base_collision:"),
    ).length,
    nulls,
    conditional,
    hitWarnings,
    dates,
    valid: parsed.success,
  });
  for (const m of raw.moves) {
    const name = m.name?.en ?? "";
    if (
      m.category === "special" &&
      /Gladius|Denjin|stance|charge|follow|hold|drink|windclad/i.test(
        name + " " + (m.notes?.en ?? ""),
      )
    ) {
      evidence.push({
        id,
        input: m.input?.numpad,
        name,
        notes: m.notes?.en,
        included: character.moves.some(
          (x: any) =>
            x.notes.includes(`upstreamName: ${name}`) &&
            x.notes.includes(`upstreamInput: ${m.input?.numpad}`),
        ),
        exclusions: audit.excluded.filter(
          (x: any) => x.name === name && x.input === m.input?.numpad,
        ),
      });
    }
  }
}
const dataset = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "STAGING ONLY",
  },
  files,
);
const totals = rows.reduce((t, r) => {
  for (const field of [
    "normal",
    "special",
    "excluded",
    "skippedCategories",
    "collisionKeys",
    "collisionRows",
    "conditional",
    "hitWarnings",
  ])
    t[field] = (t[field] ?? 0) + r[field];
  return t;
}, {});
const result = {
  checkedAt: new Date().toISOString(),
  collectionTime: report.generatedAt,
  upstreamRef: report.upstreamRef,
  characters: rows.length,
  moves: totals.normal + totals.special,
  totals,
  reasons,
  schemaValid: rows.filter((r) => r.valid).length,
  violations,
  loaderErrors: dataset.errors,
  eligible: dataset.eligible.length,
  rows,
  evidence,
};
await writeFile(
  `${root}/validation-report.json`,
  JSON.stringify(result, null, 2) + "\n",
);
const heading = `# キャラクター別集計\n\n生成: ${result.checkedAt}。STAGING ONLY / UNVERIFIED。\n出典: [sf6-sensei固定コミット](https://github.com/RyoSogawa/sf6-sensei/tree/${report.upstreamRef})、SuperCombo Wiki contributors。CC-BY-SA-4.0。入力の構造化・抽出・集計を実施。\n\n`;
const table = [
  "|ID|通常|必殺候補|不足通常技キー|監査除外行|対象外カテゴリ行|未解決キー/行|display null 発/全/ヒ/ガ|原典取得日 UTC（パッチではない）|Zod|",
  "|---|---:|---:|---|---:|---:|---|---|---|---|",
  ...rows.map(
    (r) =>
      `|${r.id}|${r.normal}|${r.special}|${r.missing.join(", ") || "なし"}|${r.excluded}|${r.skippedCategories}|${r.collisionKeys}/${r.collisionRows}|${Object.values(r.nulls).join("/")}|${[...new Set(r.dates.map((s: any) => s.slice(0, 10)))].join(", ")}|${r.valid ? "PASS" : "FAIL"}|`,
  ),
];
await writeFile(
  "docs/FRAME_DATA_COLLECTION_TABLES.md",
  heading + table.join("\n") + "\n",
);
const candidates = [
  "# 必殺技候補一覧（基本状態として未検証）",
  "",
  "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei。CC-BY-SA-4.0。抽出・構造化を実施。原典・固定コミットはcollection-report.jsonとNOTICE参照。",
  "",
  "|キャラ|構造化入力|原典技名|",
  "|---|---|---|",
];
for (const [id, c] of Object.entries(files) as [string, any][])
  for (const m of c.moves.filter((m: any) => m.category === "special"))
    candidates.push(
      `|${id}|${JSON.stringify(m.input)}|${m.name.replaceAll("|", "/")}|`,
    );
await writeFile(`${root}/special-candidates.md`, candidates.join("\n") + "\n");
console.log(
  JSON.stringify({ ...result, rows: undefined, evidence: undefined }, null, 2),
);
if (violations.length || dataset.errors.length) process.exitCode = 1;
