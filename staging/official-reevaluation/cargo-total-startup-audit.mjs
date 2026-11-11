import fs from "node:fs";
import { format } from "prettier";

const base = "archive/staging/sf6-frame-data-quality/evidence/";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const records = [];
for (const file of fs
  .readdirSync(base)
  .filter((f) => f.endsWith(".cargo.json"))) {
  const char = file.replace(/\.cargo\.json$/, "");
  const path = `data/characters/${char}.json`;
  if (!fs.existsSync(path)) continue;
  const moves = read(path).moves;
  const cargo = read(base + file);
  const rawPath = `archive/staging/sf6-frame-data/raw/${char}.json`;
  const raw = read(rawPath).moves;
  for (const [index, entry] of cargo.data.cargoquery.entries()) {
    const row = entry.title;
    if (!/\btotal\b/i.test(row.startup || "")) continue;
    const matches = moves.filter((m) =>
      (m.notes || []).includes(`upstreamInput: ${row.input}`),
    );
    const rawMatches = raw
      .map((m, i) => ({ m, i }))
      .filter(
        ({ m }) => m.input?.numpad?.toUpperCase() === row.input.toUpperCase(),
      );
    const jamieBack =
      char === "jamie" && row.input === "4PPPKKK"
        ? raw
            .map((m, i) => ({ m, i }))
            .filter(
              ({ m }) =>
                m.name?.en === "Back Taunt" &&
                m.category === "taunt" &&
                m.notes?.en === row.notes &&
                String(m.totalFrames) === row.total,
            )
        : [];
    const exactTaunt =
      rawMatches.length > 0 &&
      rawMatches.every(({ m }) => m.category === "taunt") &&
      !moves.some((m) => m.category === "taunt");
    const scopedOut =
      (char === "blanka" && ["4KKK", "6KKK"].includes(row.input)) ||
      (char === "jp" && row.input === "236[K]") ||
      (char === "rashid" && row.input === "6KK~KK");
    const confirmed =
      matches.length === 1 && char === "aki" && [16, 19, 21].includes(index)
        ? "採用済み技と対応"
        : matches.length === 1 &&
            char === "rashid" &&
            index === 52 &&
            matches[0].adoption.status === "excluded"
          ? "非採用技と対応"
          : exactTaunt ||
              jamieBack.length === 1 ||
              (scopedOut && rawMatches.length === 1)
            ? "収録対象外"
            : "対応不明";
    records.push({
      characterId: char,
      sourcePath: base + file,
      sourceIndex: index,
      input: row.input,
      startup: row.startup,
      total: row.total,
      notes: row.notes,
      classification: confirmed,
      rawCandidates: [...rawMatches, ...jamieBack].map(({ m, i }) => ({
        ref: `${rawPath}#/moves/${i}`,
        id: m.id,
        input: m.input?.numpad,
        name: m.name?.en,
        category: m.category,
        notes: m.notes?.en,
      })),
      scopeEvidence:
        jamieBack.length === 1
          ? "Cargoは4PPPKKK、rawは5PPPKKKと入力表記が矛盾するが、raw名Back Taunt・発言全文・全体608Fが一致。入力矛盾は未解決、挑発カテゴリは対象外。"
          : scopedOut
            ? "docs/ADOPTION_RULES.md §2：3ボタン・ホールド版・派生は原則対象外。raw技名と入力を確認。"
            : exactTaunt
              ? "保存rawの全同一入力候補がtaunt、本番技種はnormal/special/super_art。"
              : null,
      matches: matches.map((m) => ({
        moveId: m.id,
        name: m.name,
        adoption: m.adoption,
        startup: m.frames.startup,
        total: m.frames.total,
        variant: m.variant,
        strengthExpansion: m.strengthExpansion || null,
      })),
      review: matches.length
        ? "原典入力の一致候補。状態・条件は別途確認"
        : "入力注記の完全一致なし。未採用と断定しない",
    });
  }
}
const output = {
  description:
    "Cargo発生欄にtotalを含む全保存行と、本番のupstreamInput完全一致候補。未一致は未対応であり不採用の証明ではない。",
  totalRows: records.length,
  matchedRows: records.filter((r) => r.matches.length).length,
  classifications: Object.fromEntries(
    ["採用済み技と対応", "非採用技と対応", "収録対象外", "対応不明"].map(
      (c) => [c, records.filter((r) => r.classification === c).length],
    ),
  ),
  records,
};
fs.writeFileSync(
  "staging/official-reevaluation/cargo-total-startup-audit.json",
  await format(JSON.stringify(output), { parser: "json" }),
);
console.log(
  JSON.stringify({
    totalRows: output.totalRows,
    matchedRows: output.matchedRows,
    classifications: output.classifications,
  }),
);
