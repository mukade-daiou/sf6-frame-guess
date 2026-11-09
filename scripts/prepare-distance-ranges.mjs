import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const policy = read("data/adoption-decisions.json");
const decisions = [];
const candidates = [];
const fields = {
  startup: "startup",
  total: "total",
  hit: "hitAdv",
  block: "blockAdv",
};
for (const file of readdirSync("data/characters").filter((f) =>
  f.endsWith(".json"),
)) {
  const character = read(`data/characters/${file}`);
  const sourcePath = `archive/staging/sf6-frame-data-quality/evidence/${file.replace(".json", ".cargo.json")}`;
  const source = read(sourcePath);
  for (const [
    sourceIndex,
    { title: row },
  ] of source.data.cargoquery.entries()) {
    for (const [field, key] of Object.entries(fields)) {
      const notation = row[key]
        ?.replace(/<[^>]*>/g, "")
        .replace(/'/g, "")
        .trim();
      if (!notation?.includes("~")) continue;
      const moves = character.moves.filter(
        (m) =>
          !m.strengthExpansion &&
          m.notes.includes(`upstreamInput: ${row.input}`) &&
          m.adoption?.status === "accepted",
      );
      const accepted =
        character.id === "jp" &&
        ((["214K", "214KK"].includes(row.input) && field === "startup") ||
          (["236HK", "236MK"].includes(row.input) &&
            ["hit", "block"].includes(field)) ||
          (["236LK", "236KK"].includes(row.input) && field === "block"));
      const excluded = /\b(?:KD|HKD)\b/.test(notation);
      const classification =
        accepted && moves.length ? "accepted" : excluded ? "excluded" : "held";
      const reason =
        classification === "accepted"
          ? "原典注記が長距離での弾到達時間・硬直差の変動を明示。"
          : classification === "excluded"
            ? "KD/HKDのダウン後有利値は今回の通常硬直差の範囲化対象外。"
            : "変動条件と各入力への適用範囲を確定できず現在値を維持。";
      candidates.push({
        characterId: character.id,
        sourcePath,
        sourceIndex,
        field,
        notation,
        classification,
        reason,
        sourceRecord: row,
      });
      if (classification !== "accepted") continue;
      for (const move of moves)
        decisions.push({
          characterId: character.id,
          moveId: move.id,
          field,
          before:
            policy.distanceRanges?.decisions.find(
              (d) =>
                d.characterId === character.id &&
                d.moveId === move.id &&
                d.field === field,
            )?.before ?? move.frames[field],
          sourceNotation: notation,
          variation: "distance/projectile travel time",
          sourcePath,
          sourceIndex,
          sourceRecord: row,
          reason,
          value: {
            status: "conditional",
            display: notation,
            condition: "距離・弾の到達時間による変動",
            openRange: {
              reference: Number(notation.slice(0, -1)),
              unspecified: "trailing",
              evidence: [move.source.url],
            },
          },
        });
    }
  }
}
policy.datasetId = "distance-ranges-2026-11-09-r1";
policy.distanceRanges = {
  ledgerPath: "staging/distance-range-candidates.json",
  decisions,
};
writeFileSync(
  "data/adoption-decisions.json",
  JSON.stringify(policy, null, 2) + "\n",
);
writeFileSync(
  "staging/distance-range-candidates.json",
  JSON.stringify({ candidates }, null, 2) + "\n",
);
console.log({ decisions: decisions.length, candidates: candidates.length });
