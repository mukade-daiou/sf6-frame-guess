import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const japanese = (s) =>
  typeof s === "string" && /[\u3040-\u30ff\u3400-\u9fff]/.test(s);
const dictionary = read("staging/move-names/translations.json");
const supplemental = read("staging/move-names/supplemental.json");
const rows = readFileSync("staging/move-names/ja-names.tsv", "utf8")
  .trim()
  .split("\n")
  .map((s) => s.split("\t"));
const names = {},
  unresolved = [];
let translated = 0,
  alreadyJapanese = 0;
const prefixes = {
  HP: "強",
  HK: "強",
  MP: "中",
  MK: "中",
  LP: "弱",
  LK: "弱",
  OD: "OD",
};
for (const f of readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const c = read(`data/characters/${f}`);
  names[c.id] = {};
  for (const m of c.moves) {
    if (japanese(m.name)) {
      alreadyJapanese++;
      continue;
    }
    const prefix = /^(HP|LP|MP|HK|LK|MK|OD) /.exec(m.name);
    const short = m.name.replace(/^(HP|LP|MP|HK|LK|MK|OD) /, "");
    const base = short.replace(/ \([^)]*\)$/, "").replace(/ Lv\.1$/, "");
    const input = m.notes
      .find((n) => n.startsWith("upstreamInput: "))
      ?.slice(15);
    const candidates = [
      ...new Set(
        rows
          .filter((r) => r[0] === c.id && r[1] === input && japanese(r[2]))
          .map((r) => r[2]),
      ),
    ];
    const value =
      dictionary[c.id]?.[short] ||
      dictionary[c.id]?.[base] ||
      supplemental[c.id]?.[base]?.name ||
      (candidates.length === 1 ? candidates[0] : null);
    if (!japanese(value)) {
      unresolved.push({
        characterId: c.id,
        moveId: m.id,
        name: m.name,
        input,
        reason:
          "No unambiguous Japanese name in saved upstream sources; '-' is not a translation",
      });
      continue;
    }
    const suffix = short
      .slice(base.length)
      .replace(/DL(\d)/g, "酔いLv.$1")
      .replace(/Stock/g, "ストック")
      .replace(/Backward/g, "後方")
      .replace(/attack/g, "攻撃")
      .replace(/L\/M/g, "弱・中");
    names[c.id][m.id] =
      (prefix ? `${prefixes[prefix[1]]}・` : "") +
      value +
      (short === base || dictionary[c.id]?.[short] ? "" : suffix);
    translated++;
  }
}
const source = {
  revision: "a0b4105fb368c308699ec0757ee6e4182e5a9d1c",
  url: "https://github.com/RyoSogawa/sf6-sensei/tree/a0b4105fb368c308699ec0757ee6e4182e5a9d1c/packages/data/src",
  retrievedOn: "2026-11-09",
  verification: "community mapping, not official verification",
  supplementalSources: supplemental,
  translated,
  alreadyJapanese,
  unresolved,
};
const output = JSON.stringify(names, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync("src/features/moves/japanese-names.json", "utf8") !== output)
    throw Error("Move-name mapping differs");
} else {
  writeFileSync("src/features/moves/japanese-names.json", output);
  writeFileSync(
    "staging/move-names/source-summary.json",
    JSON.stringify(source, null, 2) + "\n",
  );
}
console.log(
  JSON.stringify({
    translated,
    alreadyJapanese,
    unresolved: unresolved.length,
  }),
);
