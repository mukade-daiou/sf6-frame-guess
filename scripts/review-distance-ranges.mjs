import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { applyHeldReviews } from "./held-range-review.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const policy = read("data/adoption-decisions.json"),
  prior = policy.distanceRanges.decisions;
const coverage = read("staging/coverage-audit/review.json"),
  candidates = [],
  characters = [],
  decisions = [...prior];
const clean = (s) =>
  (s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/'/g, "")
    .trim();
// Each endpoint is explicitly written in the saved table or its meaty/spacing note.
const selections = {
  "aki/214HP": { block: "-4~+4" },
  "aki/5MP": { hit: "+3~+7", block: "-3~+1" },
  "aki/236LP": { hit: "+1~+3", block: "-8~-6" },
  "aki/236PP": { block: "-14~-11" },
  "alex/5HP": { hit: "+4~+8", block: "-3~+1" },
  "alex/5MP": { hit: "+4~+7", block: "0~+3" },
  "chunli/2HK": { block: "-9~-4" },
  "cviper/214LP": { hit: "+2~+5", block: "-4~-1" },
  "cviper/214MP": { hit: "+1~+4", block: "-3~0" },
  "cviper/236HK": { block: "-2~+2" },
  "cviper/236KK": { block: "-4~-1" },
  "dee_jay/5HP": { hit: "+3~+8", block: "-4~+1" },
  "dhalsim/63214HP": { block: "-4~-2" },
  "e_honda/22P": { hit: "+3~+7", block: "-3~+1" },
  "e_honda/2HP": { hit: "+3~+5", block: "-3~-1" },
  "ed/236P": { hit: "+3~+14", block: "-5~+6" },
  "ed/236PP": { block: "-2~+10" },
  "ingrid/2MP": { hit: "+6~+9", block: "-1~+2" },
  "ingrid/5MP": { hit: "+1~+5", block: "0~+4" },
  "jamie/214HP": { block: "-3~+5" },
  "jamie/214LP": { block: "-6~+2" },
  "jamie/214MP": { block: "-6~+2" },
  "jamie/214PP": { block: "-1~+7" },
  "jamie/5HP": { hit: "+1~+3", block: "-3~-1" },
  "juri/5HK": { hit: "+2~+5", block: "-3~0" },
  "juri/5LP": { hit: "+5~+8", block: "-2~+1" },
  "juri/5MP": { hit: "+7~+10", block: "+2~+5" },
  "kimberly/2HP": { hit: "+3~+8", block: "-2~+3" },
  "lily/236HK": { block: "-8~+4" },
  "lily/236LK": { block: "-8~+4" },
  "lily/236MK": { block: "-8~+4" },
  "lily/236KK": { block: "-8~+4" },
  "luke/2MP": { hit: "+5~+7", block: "+1~+3" },
  "luke/5HK": { hit: "+2~+8", block: "-5~+1" },
  "m_bison/5HP": { hit: "+5~+7", block: "+1~+3" },
  "mai/214LP": { hit: "+3~+9", block: "-4~+2" },
  "m_bison/[2]8KK": { startup: "16~47" },
  "ryu/236HK": { block: "-3~+5" },
  "ryu/236LK": { block: "-11~-7" },
  "ryu/236MK": { block: "-8~-2" },
  "sagat/236HK": { block: "-5~+5" },
  "sagat/236LK": { block: "-8~+2" },
  "sagat/236MK": { block: "-7~+3" },
  "terry/2MP": { block: "-1~+3" },
  "yasmine/2LP": { hit: "+4~+6", block: "-1~+1" },
};
for (const file of readdirSync("data/characters").filter((f) =>
  f.endsWith(".json"),
)) {
  const c = read(`data/characters/${file}`),
    audit = coverage.characters.find((x) => x.id === c.id),
    sourcePath = audit.cargoPath,
    source = read(sourcePath),
    raw = read(audit.rawPath),
    rows = [];
  for (const [
    sourceIndex,
    { title: row },
  ] of source.data.cargoquery.entries()) {
    const rawIndices = raw.moves.flatMap((r, i) =>
      r.input.numpad === row.input &&
      (clean(r.notes?.en) === clean(row.notes) ||
        (c.id === "e_honda" &&
          /^214(?:LP|MP|HP|PP)$/.test(row.input) &&
          !row.notes.startsWith("Deals extra damage")) ||
        source.data.cargoquery.filter((x) => x.title.input === row.input)
          .length === 1)
        ? [i]
        : [],
    );
    const mappedIds = audit.rows
      .filter((r) => rawIndices.includes(r.index))
      .flatMap((r) => r.moveIds);
    const moves = c.moves.filter(
      (m) =>
        !m.strengthExpansion &&
        m.adoption?.status === "accepted" &&
        m.variant.kind === "base" &&
        (mappedIds.includes(m.id) ||
          m.saEvidence?.cargoRef ===
            `${sourcePath}#/data/cargoquery/${sourceIndex}/title` ||
          (m.notes.includes(`upstreamInput: ${row.input}`) &&
            (!m.notes.some((n) => n.startsWith("upstreamName: ")) ||
              rawIndices.some((i) =>
                m.notes.includes(`upstreamName: ${raw.moves[i].name.en}`),
              )))),
    );
    rows.push({
      sourceIndex,
      input: row.input,
      rawIndices,
      moveIds: moves.map((m) => m.id),
      reviewed: true,
    });
    for (const [field, key] of Object.entries({
      startup: "startup",
      total: "total",
      hit: "hitAdv",
      block: "blockAdv",
    })) {
      const notation = clean(row[key]);
      const relevantNote =
        field === "hit" || field === "block"
          ? /meaty|advantage.{0,100}(range|spac)|(?:range|spac).{0,100}advantage/i.test(
              row.notes,
            )
          : field === "startup"
            ? /startup.{0,100}(range|distan|travel)|(?:range|distan|travel).{0,100}startup/i.test(
                row.notes,
              )
            : /(?:total|duration).{0,100}distan|distan.{0,100}(?:total|duration)/i.test(
                row.notes,
              );
      if (!/[~()]/.test(notation) && !relevantNote) continue;
      const old = prior.filter(
        (d) =>
          d.characterId === c.id &&
          d.sourceIndex === sourceIndex &&
          d.field === field,
      );
      const chosen = selections[`${c.id}/${row.input}`]?.[field];
      let classification = "held",
        reason =
          "注記と条件を確認済み。今回の標準条件での端点または片側表記が明示されないため、計算・推測せず現在値を保持。";
      if (!moves.length) {
        classification = "excluded";
        reason =
          "原典対応と採用判断を照合。本番採用基本技に対応しない条件版・派生・対象外行。";
      } else if (notation === "-" || notation.includes("{{{")) {
        classification = "excluded";
        reason =
          "該当指標は対象外または未記載。別項目の注記から範囲を作らない。";
      } else if (field === "hit" && /^(?:KD|HKD)\b/.test(notation)) {
        classification = "excluded";
        reason = "KD/HKD・ダウン後有利値。Dを通常硬直差へ変換しない。";
      } else if (old.length || chosen) {
        classification = "accepted";
        reason =
          old[0]?.reason ||
          "同一入力の距離・持続接触タイミング依存を注記が明示。表・括弧・注記に書かれた端点のみを採用。";
      } else if (/hold|charg|follow.up|stance|level|stock/i.test(row.notes)) {
        classification = "excluded";
        reason =
          "ホールド・レベル・強化・派生入力条件を含む表記。既存代表条件を維持。";
      }
      if (c.id === "m_bison" && row.input === "[2]8K" && field === "startup") {
        classification = "held";
        reason =
          "通常版共通範囲はL/M/Hの軌道差を含み、各強度の距離依存端点を分離できない。";
      }
      if (c.id === "aki" && ["236HK", "236KK"].includes(row.input)) {
        classification = "held";
        reason =
          "括弧は表裏の移動条件。裏回りの距離依存全体と表側全体を連続範囲へ混ぜず、発生への全体値転用もしない。";
      }
      if (c.id === "arjun" && /^623/.test(row.input) && field === "total") {
        classification = "excluded";
        reason =
          "接触時に持続が終了し固定23F回復へ移る条件。括弧の接触時全体を空振り全体へ混ぜない。";
      }
      if (
        ["aki", "ed"].includes(c.id) &&
        row.input === "214214P" &&
        field === "block"
      ) {
        classification = "held";
        reason =
          "3強度の共通原典行。注記は強度別配置・弾速差を明示するが、各強度内の距離依存によるガード変動範囲を明示的に分離していない。推測せず既存代表値を維持。";
      }
      candidates.push({
        characterId: c.id,
        sourcePath,
        sourceIndex,
        field,
        notation,
        classification,
        reason,
        sourceRecord: row,
        moveIds: moves.map((m) => m.id),
        reviewed: true,
      });
      if (classification !== "accepted" || old.length) continue;
      for (const m of moves) {
        if (decisions.some((d) => d.moveId === m.id && d.field === field))
          continue;
        const [min, max] = chosen.split("~").map(Number);
        decisions.push({
          characterId: c.id,
          moveId: m.id,
          field,
          before: m.frames[field],
          sourceNotation: notation,
          variation: "distance/contact timing",
          sourcePath,
          sourceIndex,
          sourceRecord: row,
          reason,
          value: {
            status: "conditional",
            display: chosen,
            condition: "同一入力の距離または持続接触タイミング",
            range: { min, max, evidence: [m.source.url] },
          },
        });
      }
    }
  }
  characters.push({
    characterId: c.id,
    sourcePath,
    sourceRows: rows.length,
    rows,
  });
  for (const m of c.moves.filter(
    (m) =>
      !m.strengthExpansion &&
      m.adoption?.status === "accepted" &&
      m.variant.kind === "base",
  )) {
    if (!rows.some((r) => r.moveIds.includes(m.id)))
      throw new Error(`Unmapped adopted move: ${m.id}`);
  }
}
if (policy.distanceRanges.heldReviewPath) {
  applyHeldReviews(candidates, read(policy.distanceRanges.heldReviewPath));
} else {
  policy.datasetId = "distance-ranges-2026-11-09-r4";
}
policy.distanceRanges = { ...policy.distanceRanges, decisions };
writeFileSync(
  "data/adoption-decisions.json",
  JSON.stringify(policy, null, 2) + "\n",
);
writeFileSync(
  "staging/distance-range-candidates.json",
  JSON.stringify({ characters, candidates }, null, 2) + "\n",
);
console.log({
  decisions: decisions.length,
  candidates: candidates.length,
  production: candidates.filter((x) => x.moveIds.length).length,
  counts: Object.fromEntries(
    Object.entries(Object.groupBy(candidates, (x) => x.classification)).map(
      ([k, v]) => [k, v.length],
    ),
  ),
});
