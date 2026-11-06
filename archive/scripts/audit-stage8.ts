import { readFile, writeFile, mkdir } from "node:fs/promises";
import { characterSchema, type Character } from "../../src/lib/frame-data/schema";
import { inputKey } from "../../src/lib/frame-data/input";
import { validateDataset } from "../../src/lib/frame-data/loader";
const out = "archive/staging/sf6-frame-data-stage8";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, v: unknown) =>
  writeFile(p, JSON.stringify(v, null, 2) + "\n");
const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
function parseRows(html: string) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].flatMap((match) => {
    const name = match[1].match(/--move-name:'([^']+)'/)?.[1];
    if (!name) return [];
    const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)]
      .slice(0, 4)
      .map((m) => clean(m[1]));
    if (cells.length !== 4) return [];
    return [
      {
        name: name.trim(),
        startup: cells[0],
        recovery: cells[1],
        hit: cells[2],
        block: cells[3],
        text: clean(match[1]),
      },
    ];
  });
}
await mkdir(out, { recursive: true });
const stage7 = await read("archive/staging/sf6-frame-data-stage7/review.json");
const characters: Record<string, Character> = {},
  reports = [];
for (const id of ["ken", "marisa"]) {
  const c = characterSchema.parse(
    await read(`archive/staging/sf6-frame-data-stage7/characters/${id}.json`),
  );
  characters[id] = c;
  const raw = await read(`archive/staging/sf6-frame-data/raw/${id}.json`);
  const normalEvidence = await read(
    `archive/staging/sf6-frame-data-release/evidence/alternative_${id}.json`,
  );
  const page1 = await read(`${out}/evidence/browser_${id}_1.json`),
    page2 = await read(`${out}/evidence/browser_${id}_2.json`);
  if (
    !page1.nav.includes(id === "ken" ? "/ 34" : "/ 32") ||
    !page2.nav.includes(id === "ken" ? "21~34" : "21~32")
  )
    throw new Error(`Incomplete pagination: ${id}`);
  const normalRows = [
    ...new Map(parseRows(normalEvidence.body).map((r) => [r.name, r])).values(),
  ];
  const specials = [...parseRows(page1.table), ...parseRows(page2.table)];
  const used = new Set<string>();
  const moves = c.moves.map((m) => {
    const old = stage7.characters
      .find((r: any) => r.characterId === id)
      .moves.find((r: any) => r.moveId === m.id);
    const original = raw.moves.find(
      (r: any) =>
        r.input.numpad === old.upstreamInput &&
        (m.notes.includes(`upstreamName: ${r.name.en}`) ||
          old.upstreamInput === "KK"),
    );
    let expected = "";
    if (m.input.type === "normal")
      expected = `${m.input.direction === "5" ? "Standing" : "Crouching"} ${{ L: "Light", M: "Medium", H: "Heavy" }[m.input.strength]} ${m.input.button === "P" ? "Punch" : "Kick"}`;
    else if (old.upstreamInput === "KK") expected = "Quick Dash";
    else
      expected = `${m.input.strength === "none" ? "" : m.input.strength + " "}${original.name.en}${original.name.en === "Dimachaerus" ? "(1)" : ""}`;
    const pool =
      m.input.type === "normal" || old.upstreamInput === "KK"
        ? normalRows
        : specials;
    const matches = pool.filter((r) => r.name === expected);
    const row = matches.length === 1 ? matches[0] : null;
    if (row && pool === specials) used.add(row.name);
    const comparison = Object.fromEntries(
      (["startup", "hit", "block"] as const).map((field) => {
        const sourceDisplay = row?.[field].replace(/ Punish$/, "") ?? null;
        const value = m.frames[field];
        return [
          field,
          {
            candidate: value,
            sourceDisplay,
            result: !row
              ? "unmatched"
              : value.status === "unknown"
                ? "candidate_unknown_preserved"
                : sourceDisplay === value.display ||
                    (sourceDisplay !== null &&
                      value.display !== null &&
                      /^[+-]?\d+$/.test(sourceDisplay) &&
                      /^[+-]?\d+$/.test(value.display) &&
                      Number(sourceDisplay) === Number(value.display))
                  ? "display_agrees"
                  : "different_or_semantic_exception",
          },
        ];
      }),
    );
    return {
      characterId: id,
      moveId: m.id,
      input: m.input,
      sourceInput: old.upstreamInput,
      expectedFrameSearchName: expected,
      matched: !!row,
      frameSearchRow: row,
      comparison,
      totalComparison:
        "not_compared: recovery column is not uniformly whiff total; no calculation added",
      frameSearchEvidence:
        pool === specials
          ? [
              { url: page1.url, retrievedAt: page1.retrievedAt },
              { url: page2.url, retrievedAt: page2.retrievedAt },
            ]
          : [
              {
                url: normalEvidence.url,
                retrievedAt: normalEvidence.retrievedAt,
              },
            ],
      candidateSource: m.source,
      inputPair:
        m.input.strength === "OD" || old.upstreamInput === "KK"
          ? "unverified_generic_PP_KK_is_insufficient"
          : "not_applicable",
      patchConsistency: "unverified",
      targetPatch: "Ver.2.0500.001 (provisional)",
      requiredEvidence: [
        ...Object.entries(m.frames)
          .filter(([, value]) => value.status === "unknown")
          .map(([field]) => ({
            fact: `unknown_${field}`,
            method:
              field === "total"
                ? "同じ対象版で、標準条件の空振り動作開始から再行動可能までをフレームメーターで記録する。接触時・ガード時の硬直欄や全体Fの一律計算を代用しない。"
                : field === "startup"
                  ? "対象版の立ち相手にLK+MKで発動し、初期の空中限定判定と立ち相手に初めて当たる判定を入力履歴・フレームメーター付きで記録する。"
                  : "対象版で両者の開始位置を画面中央に固定し、通常ヒットの最終状態（ダウン／壁やられ）を動画で確認する。壁距離の括弧表記だけからDや範囲へ変換しない。",
          })),
        {
          fact: "target_patch_frame_values",
          method:
            "当該版と確認できるゲーム本体のバージョン表示と同じセッションの入力履歴・フレームメーター、または版と変更履歴が対応する技別表を保存する。数値だけの一致では認定しない。",
        },
        ...(m.input.strength === "OD" || old.upstreamInput === "KK"
          ? [
              {
                fact: "low_medium_pair_performance",
                method: `クラシック・初期状態・標準条件で${m.input.button === "P" ? "LP+MP" : "LK+MK"}を実際に入力し、入力履歴・発動技名・フレームメーターを同時記録する。PP/KK表記だけの資料を代用しない。`,
              },
            ]
          : []),
      ],
    };
  });
  const inventory = specials.map((row) => ({
    name: row.name,
    disposition: used.has(row.name)
      ? "candidate_matched"
      : /Charged|Quick Dash|Aerial|\(2\)|counter|Tonitrus|Procella|Enfold|Kazekama|Kasai|Gorai|Senka/i.test(
            row.name,
          )
        ? "out_of_scope_held_air_followup_or_counter"
        : "unresolved",
    row,
  }));
  const keys = c.moves.map((m) => inputKey(m.input));
  reports.push({
    characterId: id,
    recorded: c.moves.length,
    counterpartMatches: moves.filter((m) => m.matched).length,
    duplicateKeys: keys.filter((k, i) => keys.indexOf(k) !== i),
    normalKeys: c.moves.filter((m) => m.category === "normal").length,
    sourceSpecialRows: specials.length,
    sourceRowsClassified: inventory.every(
      (r) => r.disposition !== "unresolved",
    ),
    coverageMeaning:
      "Only sampled version-labelled frame-search tables and pinned SuperCombo inventory checked; game-patch coverage remains unverified",
    moves,
    inventory,
  });
}
const checked = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "Stage 8 audit",
  },
  characters,
);
const newsEvidence = await read(`${out}/evidence/steam_official_news.json`);
const news = JSON.parse(newsEvidence.body).appnews.newsitems;
const announcements = news
  .filter((n: any) =>
    new Date(n.date * 1000).toISOString().startsWith("2026-10"),
  )
  .map((n: any) => ({
    title: n.title,
    date: new Date(n.date * 1000).toISOString(),
    url: n.url,
    gid: n.gid,
  }));
const report = {
  targetPatch: "Ver.2.0500.001 (provisional, unchanged)",
  patchConfirmed: false,
  productionEligible: checked.eligible.length,
  schemaPass: checked.characters.length,
  loaderErrors: checked.errors,
  unknownFieldsReleaseDecision:
    "Allowed: unknown fields do not imply missing moves; preserve unknown and do not consume a question. Coverage and source verification still required.",
  sourceLineage: [
    {
      source: "frame-search",
      origin:
        "Guide explicitly says data sourced from Capcom official information",
      independentGameMeasurement: "not_established",
    },
    {
      source: "sf6-sensei",
      origin: "SuperCombo normalized data at pinned commit",
      independentOfSuperCombo: false,
    },
    {
      source: "Update Tracker",
      origin: "Summaries link official changes",
      independentGameMeasurement: "not_established",
    },
    {
      source: "SuperCombo",
      origin: "Cargo database and wiki contributors",
      independenceFromOfficialNumbers: "not_established",
    },
  ],
  steamOfficialAnnouncements: announcements,
  patchNumberInOfficialNews: news.some((n: any) =>
    (n.contents + n.title).includes("2.0500.001"),
  ),
  candidatesChanged: false,
  updatePolicy: "manual_and_frozen",
  characters: reports,
  license:
    "CC-BY-SA-4.0 (existing candidate data); third-party evidence retained for audit, not imported as production data",
};
await save(`${out}/review.json`, report);
await writeFile(
  `${out}/NOTICE`,
  (await readFile("archive/staging/sf6-frame-data-stage7/NOTICE", "utf8")) +
    "\nStage 8: comparison and source-dependency audit only. Candidate values unchanged. Third-party evidence is not assigned a guessed licence.\n",
);
console.log(
  JSON.stringify(
    {
      schemaPass: report.schemaPass,
      productionEligible: report.productionEligible,
      characters: reports.map(({ moves, inventory, ...summary }) => summary),
    },
    null,
    2,
  ),
);
if (checked.errors.length || checked.eligible.length)
  throw new Error("Unexpected validation or eligibility");
