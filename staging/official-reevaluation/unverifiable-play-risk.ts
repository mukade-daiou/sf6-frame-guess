import fs from "node:fs";
import assert from "node:assert/strict";
import { validateDataset } from "../../src/lib/frame-data/loader";
import { displayFrame, resolveMove } from "../../src/lib/frame-data/resolver";
import {
  inventoryPatterns,
  inventoryRow,
} from "../../src/features/moves/inventory";

const read = (path: string): any => JSON.parse(fs.readFileSync(path, "utf8"));
const dir = "staging/official-reevaluation/";
const files = Object.fromEntries(
  fs
    .readdirSync("data/characters")
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f, read(`data/characters/${f}`)]),
);
const dataset = validateDataset(read("data/metadata.json"), files);
assert.deepEqual(dataset.errors, []);
const comparisons = read(dir + "results-after-user-verification.json");
const comparisonCounts: Record<string, number> = {};
for (const row of comparisons)
  for (const field of Object.values(row.fields) as any[])
    comparisonCounts[field.status] = (comparisonCounts[field.status] ?? 0) + 1;
assert.deepEqual(comparisonCounts, {
  一致: 4459,
  確認不能: 570,
  条件違い: 42,
  不一致: 61,
});
const pending = read(dir + "pending-reevaluation.json");
const blank = read(dir + "blank-fields-audit.json");
const key = (r: any) => `${r.moveId}/${r.field}`;
const unknown = new Map(pending.unknown.map((r: any) => [key(r), r]));
const blanks = new Map(blank.records.map((r: any) => [key(r), r]));
// Individual decisions: the parentheses are adopted only where the original
// notes explicitly identify them as the whiff value, never by a generic rule.
const whiffCorrections: Record<string, string> = {
  blanka__normal_2_K_M: "28",
  cammy__normal_5_K_H: "34",
  dee_jay__normal_2_P_M: "24",
  dee_jay__normal_5_K_H: "40",
  e_honda__normal_2_P_H: "33",
  elena__normal_2_K_M: "29",
  elena__special_236_K_H: "62",
  elena__special_236_K_L: "52",
  elena__special_236_K_M: "58",
  elena__special_236_K_OD: "54",
  ingrid__normal_5_P_H: "35",
  ingrid__special_236_P_H: "48",
  juri__special_214_K_L: "34",
  luke__normal_2_P_M: "24",
  luke__normal_5_K_M: "29",
  luke__normal_5_P_L: "22",
  m_bison__normal_5_P_H: "41",
  yasmine__special_214_P_M: "46",
};
const selectedMedium = (id: string, field: string) =>
  (id.startsWith("jp__special_214_P_") && field === "hit") ||
  ((id.startsWith("kimberly__coverage_5__strength_") ||
    id === "kimberly__special_214_P_OD") &&
    field === "startup") ||
  (id.startsWith("sagat__super_art_2_") && field === "hit") ||
  (id.startsWith("zangief__super_art_2_") &&
    ["startup", "block"].includes(field)) ||
  (id.startsWith("jamie__super_art_1_") && field === "block") ||
  (id.startsWith("ingrid__super_art_2_") && field === "startup") ||
  (id === "manon__normal_5_K_H" && field === "hit");
const cargoCache = new Map<string, any>();
const rawCache = new Map<string, any>();
assert.equal(unknown.size, 570);
assert.equal(blanks.size, 408);
const patterns = inventoryPatterns(dataset.characters, dataset.inputs);
// MoveSelector exposes only normal inputs and the combined special/SA command.
const selectable = dataset.inputs.filter(
  (i) => i.type === "normal" || (i.type === "special" && i.includeSuperArts),
);
const records: any[] = [];
for (const comparison of comparisons) {
  const character = dataset.characters.find(
    (c) => c.id === comparison.characterId,
  )!;
  const move = character.moves.find((m) => m.id === comparison.moveId)!;
  assert(move);
  for (const [field, result] of Object.entries(comparison.fields) as [
    string,
    any,
  ][]) {
    if (result.status !== "確認不能") continue;
    const k = `${move.id}/${field}`;
    const previous: any = unknown.get(k);
    const b: any = blanks.get(k);
    assert(previous, k);
    const value = move.frames[field as keyof typeof move.frames];
    assert.equal(value.display, result.local, k);
    const playable =
      dataset.eligible.includes(character) &&
      selectable.some((input) => {
        const resolved = resolveMove(character, input, "normal");
        return resolved.status === "found" && resolved.frames === move.frames;
      });
    const hard =
      field === "startup" &&
      dataset.eligible.includes(character) &&
      selectable.some((input) => {
        const resolved = resolveMove(character, input, "startup");
        return resolved.status === "found" && resolved.frames === move.frames;
      });
    const shown = patterns.some((input) =>
      inventoryRow(character, input).records.some((m) => m.id === move.id),
    );
    const actualValue = displayFrame(value);
    const meaningful =
      actualValue !== "-" && actualValue !== "対象外" && actualValue !== "不明";
    const normalQuestion = playable && meaningful;
    const hardQuestion = hard && meaningful;
    let priority = "低";
    const upstream =
      move.notes.find((n) => n.startsWith("upstreamInput: ")) ??
      "原典入力の記載なし";
    let priorityReason =
      !normalQuestion && !hardQuestion
        ? `数値・Dとして出題されない（一覧表示 ${shown ? "あり" : "なし"}、Normal質問 ${playable ? "成立" : "不成立"}、表示 ${actualValue}）。`
        : `${upstream}、採用値 ${actualValue}。既存比較の${previous.category}だけでは誤りを示さない。詳細な正誤は未確定。`;
    if (
      (normalQuestion || hardQuestion) &&
      (previous.category === "公式行未確定" ||
        previous.category === "公式欄が複合・非単一表記" ||
        b?.classification === "判断不能" ||
        b?.classification === "指標の違い")
    ) {
      priority = "中";
      priorityReason =
        b?.reason || previous.category + "のため代表条件の対応を確認できない。";
    }
    if (
      move.id === "m_bison__special_623_P_OD" &&
      (normalQuestion || hardQuestion)
    ) {
      priority = "高";
      priorityReason =
        "原典備考はShin Bison限定とする一方、本番は通常状態の基本技として出題する。通常状態への採用の根拠が未確認。";
    }
    const whiff = field === "total" && whiffCorrections[move.id];
    if (whiff && normalQuestion) {
      priority = "高";
      priorityReason =
        "保存Cargoに空振り時の追加硬直が明記され、現行値はその追加前の値。空振り全体Fの採用規則と矛盾する。";
    }
    const bison = move.id === "m_bison__special_623_P_OD";
    const detailed =
      (normalQuestion || hardQuestion) &&
      (Boolean(whiff) || bison || selectedMedium(move.id, field));
    let judgment = normalQuestion || hardQuestion ? "未詳細調査" : "出題対象外";
    let judgmentReason: string | null = null;
    let correctionCandidate: string | null = null;
    let unresolved: string | null =
      normalQuestion || hardQuestion
        ? b?.reason || previous.category + "の対応証拠"
        : null;
    let evidence: any = null;
    if (detailed) {
      const input = move.notes
        .find((n) => n.startsWith("upstreamInput: "))
        ?.slice("upstreamInput: ".length);
      if (!cargoCache.has(character.id))
        cargoCache.set(
          character.id,
          read(
            `archive/staging/sf6-frame-data-quality/evidence/${character.id}.cargo.json`,
          ).data.cargoquery,
        );
      if (!rawCache.has(character.id))
        rawCache.set(
          character.id,
          read(`archive/staging/sf6-frame-data/raw/${character.id}.json`).moves,
        );
      const cargoRows = cargoCache
        .get(character.id)
        .flatMap((r: any, index: number) =>
          r.title.input === input
            ? [
                {
                  ref: `archive/staging/sf6-frame-data-quality/evidence/${character.id}.cargo.json#/data/cargoquery/${index}/title`,
                  ...r.title,
                },
              ]
            : [],
        );
      const rawRows = rawCache
        .get(character.id)
        .flatMap((r: any, index: number) =>
          r.input?.numpad === input
            ? [
                {
                  ref: `archive/staging/sf6-frame-data/raw/${character.id}.json#/moves/${index}`,
                  id: r.id,
                  input: r.input,
                  startup: r.startup,
                  totalFrames: r.totalFrames,
                  onHit: r.onHit,
                  onBlock: r.onBlock,
                  notes: r.notes,
                },
              ]
            : [],
        );
      const saCargoIndex = move.saEvidence?.cargoRef?.match(
        /cargoquery\/(\d+)\/title$/,
      )?.[1];
      if (cargoRows.length === 0 && saCargoIndex !== undefined) {
        const row = cargoCache.get(character.id)[Number(saCargoIndex)];
        assert(row, move.saEvidence?.cargoRef);
        cargoRows.push({ ref: move.saEvidence?.cargoRef, ...row.title });
      }
      evidence = {
        input,
        rawRows,
        cargoRows,
        officialSource: comparison.source,
        officialRows: result.officialByRow,
        officialNotes: comparison.officialNotes,
        moveNotes: move.notes,
        adoption: move.adoption,
        variant: move.variant,
        representativeCondition: move.representativeCondition ?? null,
        strengthExpansion: move.strengthExpansion ?? null,
        saEvidence: move.saEvidence ?? null,
        adoptionInput: `staging/adoption-inputs/${character.id}.json`,
        decisions: "data/adoption-decisions.json",
        rule: "docs/ADOPTION_RULES.md",
      };
      if (whiff) {
        assert(
          cargoRows.some(
            (r: any) =>
              String(r.total).includes(`(${whiff})`) && /whiff/i.test(r.notes),
          ),
          key({ moveId: move.id, field }),
        );
        judgment = "修正確定";
        correctionCandidate = whiff;
        judgmentReason =
          "同一入力のCargo括弧値と空振り追加硬直の注記が一致し、空振り全体Fの採用規則に反する現行値を特定。保存データ基準の修正案。";
        unresolved =
          "原典と公式の対象パッチはUNVERIFIED。実ゲームの現行版との差は未検証。";
      } else if (bison) {
        judgment = "修正確定";
        correctionCandidate =
          "技レコードを採用対象から除外する案（本番未変更）";
        judgmentReason =
          "原典が挑発後のShin Bison限定と明記。通常状態限定の採用規則に反する。特殊状態の値自体の誤りとは区別する。";
        unresolved =
          "対象パッチはUNVERIFIED。除外後の同一コマンドはcoverageと他の基本候補に従うため変更時に再検証する。";
      } else if (move.id.startsWith("sagat__super_art_2_")) {
        judgment = "現状維持確定";
        judgmentReason =
          "採用済みのユーザー指定はニュートラル派生。saEvidenceのHKD +4からDとする規則に合致。";
        unresolved = "実ゲームの対象版はUNVERIFIED。";
      } else if (move.id === "manon__normal_5_K_H") {
        judgment = "現状維持確定";
        judgmentReason =
          "Cargoの通常ヒット+1と一致。公式の※はPC時の注記で通常ヒット条件とは別。";
        unresolved = "対象パッチはUNVERIFIED。";
      } else if (move.id.startsWith("jamie__super_art_1_")) {
        judgment = "現状維持確定";
        judgmentReason =
          "Cargoの通常-60と一致。公式複合値の-93は下入力派生側の注記で、通常代表条件は-60。";
        unresolved = "対象パッチはUNVERIFIED。";
      } else {
        judgment = "保留";
        judgmentReason = move.id.startsWith("ingrid__super_art_2_")
          ? "原典の発動1Fと強度別攻撃発生103/68/98Fは別指標。どちらを出題するか過去の保留を維持。"
          : move.id.startsWith("jp__")
            ? "設置自体と自動攻撃のDを同一フィールドに使う根拠は未確定。"
            : move.id.startsWith("kimberly__")
              ? "19Fが消失・再出現・操作可能時点のどれを表すか確定していない。"
              : "その場・移動・ホールドと多段接続の測定条件を特定できない。";
        unresolved = move.id.startsWith("ingrid__")
          ? "0ストック・弱中強それぞれで発動と攻撃発生を区別し、採用指標を決定。"
          : move.id.startsWith("jp__")
            ? "非OD各強度とOD弱中で設置後無入力・自動攻撃時のヒット結果を測定し、設置と攻撃の代表条件を決定。"
            : move.id.startsWith("kimberly__")
              ? "非ホールドの弱中強・ODで消失、再出現、操作可能Fを測定。"
              : "SA2その場・非ホールド、相手と接触段を固定し発生・ガード硬直差を測定。";
      }
    }
    records.push({
      characterId: character.id,
      moveId: move.id,
      sourceMoveId:
        move.strengthExpansion?.sourceMoveId ??
        move.saEvidence?.researchRecordId ??
        move.id,
      field,
      current: value.display,
      frameStatus: value.status,
      reason: previous.reason,
      category: previous.category,
      normalQuestion,
      hardQuestion,
      normalHistory: playable,
      hardHistory: hard,
      inventoryDisplay: shown,
      display: actualValue,
      priority,
      priorityReason,
      detailed,
      judgment,
      judgmentReason,
      correctionCandidate,
      unresolved,
      evidence,
      blankAudit: b
        ? {
            classification: b.classification,
            reason: b.reason,
            expansionSource: b.expansionSource,
          }
        : null,
      comparisonRef: `${dir}results-after-user-verification.json`,
      priorRiskRef: `${dir}play-risk-audit.json`,
    });
  }
}
assert.equal(records.length, 570);
assert.equal(new Set(records.map(key)).size, 570);
assert.equal(
  records.filter((r) => r.normalQuestion || r.hardQuestion).length,
  255,
);
assert.equal(
  records.filter((r) => !r.normalQuestion && !r.hardQuestion).length,
  315,
);
assert(
  records
    .filter((r) => r.detailed)
    .every(
      (r) => r.evidence.rawRows.length > 0 && r.evidence.cargoRows.length > 0,
    ),
);
assert(records.filter((r) => r.priority === "高").every((r) => r.detailed));
const bison = dataset.eligible.find((c) => c.id === "m_bison")!;
const bisonCommand = selectable.find(
  (i) =>
    i.type === "special" &&
    i.includeSuperArts &&
    i.motion === "623" &&
    i.button === "P" &&
    i.strength === "OD",
)!;
assert(bisonCommand);
assert(
  dataset.eligible.some(
    (c) =>
      c.id !== "m_bison" &&
      resolveMove(c, bisonCommand, "normal").status === "found",
  ),
);
assert.equal(resolveMove(bison, bisonCommand, "normal").status, "found");
assert.equal(resolveMove(bison, bisonCommand, "startup").status, "found");
const hypotheticalBison = structuredClone(bison);
hypotheticalBison.moves.find(
  (m) => m.id === "m_bison__special_623_P_OD",
)!.adoption!.status = "excluded";
assert.equal(
  resolveMove(hypotheticalBison, bisonCommand, "normal").status,
  "not_found",
);
assert.equal(
  resolveMove(hypotheticalBison, bisonCommand, "startup").status,
  "not_found",
);
const count = (items: string[]) =>
  Object.fromEntries(
    [...new Set(items)].map((x) => [x, items.filter((y) => x === y).length]),
  );
const details = records.filter((r) => r.detailed);
const output = {
  ...(fs.existsSync(dir + "unverifiable-play-risk.json") &&
  read(dir + "unverifiable-play-risk.json").startupIndicatorReview
    ? {
        startupIndicatorReview: read(dir + "unverifiable-play-risk.json")
          .startupIndicatorReview,
      }
    : {}),
  baseline: "3a460ff687453b719a474afb9864746d30fa5117",
  patch: "UNVERIFIED",
  status: "実施した照合による優先度。詳細未調査の正誤は未確定",
  methodology:
    "実際のloader・resolver・MoveSelector・inventoryを使用。質問成立と数値・D表示を分ける。既存分類と原典注記に基づく優先度で、低優先度は正確性の保証ではない。高リスクは個別根拠を確認し、未詳細調査は正誤確定ではない。",
  counts: {
    numericOrD: records.filter((r) => r.normalQuestion || r.hardQuestion)
      .length,
    notNumericOrD: records.filter((r) => !r.normalQuestion && !r.hardQuestion)
      .length,
    priority: count(records.map((r) => r.priority)),
    detailed: details.length,
    detailedJudgment: count(details.map((r) => r.judgment)),
    notDetailed: records.length - details.length,
    playableNotDetailed: records.filter(
      (r) => (r.normalQuestion || r.hardQuestion) && !r.detailed,
    ).length,
    playableOriginalFields: new Set(
      records
        .filter((r) => r.normalQuestion || r.hardQuestion)
        .map((r) => `${r.characterId}/${r.sourceMoveId}/${r.field}`),
    ).size,
    playableOriginalMoves: new Set(
      records
        .filter((r) => r.normalQuestion || r.hardQuestion)
        .map((r) => `${r.characterId}/${r.sourceMoveId}`),
    ).size,
  },
  records,
};
fs.writeFileSync(
  dir + "unverifiable-play-risk.json",
  JSON.stringify(output, null, 2) + "\n",
);
console.log(output.counts);
