import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
export const reviewPath = "staging/held-range-review.json";
const key = (c) => `${c.characterId}/${c.sourceIndex}/${c.field}`;
export function applyHeldReviews(candidates, reviews) {
  for (const r of reviews.items) {
    const c = candidates.find((c) => key(c) === r.key);
    if (
      !c ||
      !isDeepStrictEqual(c.sourceRecord, r.before.sourceRecord) ||
      !isDeepStrictEqual(c.moveIds, r.before.moveIds)
    )
      throw Error(`Held review source/mapping changed: ${r.key}`);
    c.reevaluation = {
      group: r.group,
      reason: r.reason,
      nextEvidence: r.nextEvidence,
      currentValues: r.currentValues,
      evidenceQuote: r.evidenceQuote,
      checkedSources: r.checkedSources,
      previousClassification: "held",
      previousReason: r.before.reason,
    };
    c.classification = r.resolution;
    c.reason = r.reason;
  }
  for (const r of reviews.stage2?.items || []) {
    const c = candidates.find((c) => key(c) === r.key);
    if (!c || !isDeepStrictEqual(c.sourceRecord, r.before.before.sourceRecord))
      throw Error(`Stage2 source changed: ${r.key}`);
    c.classification = r.resolution;
    c.reason = r.reason;
    c.reevaluation.stage2 = r;
  }
  for (const r of reviews.stage3?.items || []) {
    const c = candidates.find((c) => key(c) === r.key);
    if (!c || c.classification !== "held")
      throw Error(`Stage3 baseline changed: ${r.key}`);
    c.reevaluation.stage3 = r;
  }
  for (const r of reviews.contactTimingRollback?.candidates || []) {
    const c = candidates.find((c) => key(c) === r.key);
    if (
      !c ||
      !(
        c.classification === r.before ||
        (c.classification === "excluded" &&
          isDeepStrictEqual(c.reevaluation?.contactTimingRollback, r))
      )
    )
      throw Error(`Rollback baseline mismatch: ${r.key}`);
    c.classification = "excluded";
    c.reason = r.reason;
    c.reevaluation = { ...c.reevaluation, contactTimingRollback: r };
  }
}
export function prepareHeldReviews() {
  const policy = read("data/adoption-decisions.json"),
    ledger = read("staging/distance-range-candidates.json");
  const existing = policy.distanceRanges.heldReviewPath
    ? read(reviewPath)
    : null;
  const baseline = (
    existing?.items.map((r) => r.before) ??
    ledger.candidates.filter(
      (c) => c.classification === "held" && c.moveIds.length,
    )
  ).map((c) => {
    const before = structuredClone(c);
    before.classification = "held";
    if (before.reevaluation) before.reason = before.reevaluation.previousReason;
    delete before.reevaluation;
    return before;
  });
  if (baseline.length !== 300)
    throw Error("Expected original 300 held source fields");
  const selections = {
    "cammy/10/block": "-12~0",
    "cammy/11/block": "-14~0",
    "dee_jay/27/block": "-6~-4",
    "terry/4/block": "-8~+5",
    "terry/10/block": "-6~+2",
  };
  const items = [];
  for (const c of baseline) {
    const k = key(c),
      notes = c.sourceRecord.notes,
      field = c.field;
    const character = read(`data/characters/${c.characterId}.json`);
    const currentValues =
      existing?.items.find((r) => r.key === k)?.currentValues ??
      c.moveIds.map((moveId) => ({
        moveId,
        value: character.moves.find((m) => m.id === moveId).frames[field],
      }));
    let group = "C",
      resolution = "held",
      reason =
        "括弧・注記と現行代表条件を再確認。変動をこのフィールドの距離・接触条件へ一意に対応付けられない。",
      nextEvidence = `${c.sourceRecord.input}の${field}について、括弧内外の測定条件と同一代表条件の端点を区別した技別フレーム表・詳細注記が必要。`;
    let quote = notes;
    const sentence = (re) =>
      notes
        .split(";")
        .find((s) => re.test(s))
        ?.trim();
    const recovery = sentence(
      /(?:extra|less|fewer).*recovery.*(?:whiff|block|hit)|shorter animation.*block/i,
    );
    if (field === "total" && recovery) {
      group = "B";
      resolution = "excluded";
      quote = recovery;
      reason = `全体Fの括弧は空振り・ヒット・ガード等の回復条件差。注記「${quote}」。空振り全体Fの代表値を維持し、異なる測定条件を範囲へ混ぜない。`;
      nextEvidence =
        "解決済み。新たに空振り条件内の距離変動を示す資料が出た場合だけ再検討。";
    }
    const cancel = sentence(
      /(?:only \d+f startup when canceled|startup.*when canceled|faster.*when canceled|\df startup when chained|\df startup.*chained|slower startup when canceled)/i,
    );
    if (field === "startup" && cancel) {
      group = "B";
      resolution = "excluded";
      quote = cancel;
      reason = `発生差はキャンセル元・チェーン入力条件。「${quote}」。独立入力の距離変動ではない。`;
      nextEvidence = "解決済み。既存の独立入力代表値を維持。";
    }
    const crouch = sentence(
      /(?:worse|better).*?(?:crouch|standing)|(?:crouch|stand block).*?(?:worse|better)|hits 1f later vs. crouching|refers to disadvantage when crouching|hits whiff on crouching|hit whiffs vs. crouch|hits whiff vs. crouch|final hit whiffs on crouch|more hits connect on block vs. tall standing/i,
    );
    if (field === "block" && /[()]/.test(c.notation) && crouch) {
      group = "B";
      resolution = "excluded";
      quote = crouch;
      reason = `括弧の差は相手の姿勢・身長による接触ヒット数または判定差。「${quote}」。同一代表条件の間合い範囲へ混ぜない。`;
      nextEvidence = "解決済み。立ち相手を原則とする既存代表値を維持。";
    }
    const fixed = sentence(
      /(?:cannot.*(?:safer|extra block advantage)|always -\d+ on block|advantage.*fixed regardless)/i,
    );
    if (field === "block" && fixed) {
      group = "B";
      resolution = "excluded";
      quote = fixed;
      reason = `原典が持続当てでもガード硬直差が固定と明示。「${quote}」。今回の変動対象ではない。`;
      nextEvidence = "解決済み。原典に反する範囲は生成しない。";
    }
    if (
      field === "hit" &&
      /Wall Bounce|KD/.test(c.notation) &&
      !/[()]?\+\d+/.test(c.notation.split("KD")[0])
    ) {
      group = "B";
      resolution = "excluded";
      quote = c.notation;
      reason =
        "壁バウンド・KDの有利値で通常ヒット硬直差ではない。既存Dを維持。";
      nextEvidence = "解決済み。通常ヒット硬直差へ変換しない。";
    }
    if (
      resolution === "held" &&
      !/[()~]/.test(c.notation) &&
      (field === "hit" || field === "block") &&
      /meaty|later active|spaced|longer range/i.test(notes)
    ) {
      group = "D";
      reason = `接触タイミング・間合いの説明はあるが${field}の端点は明示されない。別技・キャンセル先の数値も転用しない。`;
      nextEvidence = `${c.sourceRecord.input}を現在の強度・状態・立ち相手に固定し、最初/最後の接触フレーム別に${field}を測定。飛び道具では近/中/遠距離を分け、通常ヒット・通常ガードだけを測る。公開の同条件測定表があれば実機測定に代用できる。`;
    }
    if (selections[k]) {
      group = "A";
      resolution = "accepted";
      quote = sentence(/spaced|farther ranges/i);
      reason = `表に明示された${c.notation}の両値と注記「${quote}」が同一強度の間合い・接触依存に対応。端点を計算せず採用。`;
      nextEvidence = "解決済み。保存Cargoの表記・注記・技IDを生成時に照合。";
    }
    if (["aki/0/block", "ed/0/block", "m_bison/58/startup"].includes(k)) {
      group = "C";
      resolution = "held";
      reason = c.reason;
      nextEvidence =
        "各L/M/H強度を別々に固定した近/中/遠距離の発生またはガード硬直差の表が必要。共通行の強度差を含む範囲のみでは採用しない。";
    }
    if (c.characterId === "aki" && [16, 18].includes(c.sourceIndex)) {
      group = "C";
      resolution = "held";
      reason = c.reason;
      nextEvidence =
        "表側・裏回りを別々に固定した空振り全体Fの距離別測定表と、発生欄が移動全体を示す理由の解説が必要。43F裏回り例外も区別する。";
    }
    const cargo = read(c.sourcePath);
    const raw = read(
      `archive/staging/sf6-frame-data/raw/${c.characterId}.json`,
    );
    const sourceMove = raw.moves.find(
      (m) => m.input.numpad === c.sourceRecord.input,
    );
    const checkedSources = [
      {
        path: c.sourcePath,
        index: c.sourceIndex,
        url: sourceMove?.source?.url ?? character.source.url,
        cargoUrl: cargo.url,
        retrievedAt: cargo.retrievedAt,
        checkedAt: "2026-11-09",
        gameVersion: "UNVERIFIED",
      },
      {
        path: "data/adoption-decisions.json",
        scope: "fixed representative conditions",
      },
    ];
    items.push({
      key: k,
      before: structuredClone(c),
      currentValues,
      group,
      resolution,
      reason,
      nextEvidence,
      evidenceQuote: quote,
      checkedSources,
    });
    if (resolution === "accepted")
      for (const current of currentValues) {
        if (
          policy.distanceRanges.decisions.some(
            (d) => d.moveId === current.moveId && d.field === field,
          )
        )
          continue;
        const display = selections[k],
          [min, max] = display.split("~").map(Number);
        policy.distanceRanges.decisions.push({
          characterId: c.characterId,
          moveId: current.moveId,
          field,
          before: current.value,
          sourceNotation: c.notation,
          variation: "distance/contact timing",
          sourcePath: c.sourcePath,
          sourceIndex: c.sourceIndex,
          sourceRecord: c.sourceRecord,
          reason,
          value: {
            status: "conditional",
            display,
            condition: "同一強度・代表条件での間合いと接触タイミング",
            range: { min, max, evidence: [character.source.url] },
          },
        });
      }
  }
  const review = {
    ...(existing?.contactTimingRollback
      ? { contactTimingRollback: existing.contactTimingRollback }
      : {}),
    ...(existing?.stage3 ? { stage3: existing.stage3 } : {}),
    ...(existing?.stage2 ? { stage2: existing.stage2 } : {}),
    baseline: {
      ...existing?.baseline,
      accepted: 75,
      held: 300,
      excluded: 362,
      production: 737,
      frameFields: 90,
      decisions:
        existing?.baseline.decisions ??
        policy.distanceRanges.decisions.slice(0, 75),
    },
    externalChecks: [
      {
        url: "https://wiki.supercombo.gg/w/Street_Fighter_6/Ed",
        checkedAt: "2026-11-09",
        result: "403 Forbidden",
      },
      {
        url: "https://wiki.supercombo.gg/w/Street_Fighter_6/Cammy/Frame_data",
        checkedAt: "2026-11-09",
        result: "Anubis Access Denied",
      },
    ],
    items,
  };
  policy.distanceRanges.heldReviewPath = reviewPath;
  if (!existing?.stage2 && !existing?.contactTimingRollback)
    policy.datasetId = "distance-held-review-2026-11-09-r1";
  applyHeldReviews(ledger.candidates, review);
  writeFileSync(reviewPath, JSON.stringify(review, null, 2) + "\n");
  writeFileSync(
    "staging/distance-range-candidates.json",
    JSON.stringify(ledger, null, 2) + "\n",
  );
  writeFileSync(
    "data/adoption-decisions.json",
    JSON.stringify(policy, null, 2) + "\n",
  );
  console.log(
    Object.fromEntries(
      ["A", "B", "C", "D"].map((g) => [
        g,
        items.filter((r) => r.group === g).length,
      ]),
    ),
  );
  console.log(
    Object.fromEntries(
      ["accepted", "held", "excluded"].map((g) => [
        g,
        items.filter((r) => r.resolution === g).length,
      ]),
    ),
  );
}
