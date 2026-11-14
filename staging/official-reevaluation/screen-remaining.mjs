import fs from "node:fs";
import assert from "node:assert/strict";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const previousScreen = read(
  "staging/official-reevaluation/remaining-screen.json",
);
const prior = read("staging/official-reevaluation/unverifiable-play-risk.json");
const rows = prior.records.filter(
  (r) => (r.normalQuestion || r.hardQuestion) && !r.detailed,
);
assert.equal(rows.length, 209);
const confirmations = {
  ed__special_236_K_L: "45",
  ed__special_236_K_M: "49",
};
const screened = rows.map((r) => {
  const move = read(`data/characters/${r.characterId}.json`).moves.find(
    (m) => m.id === r.moveId,
  );
  assert(move);
  const notes = move.notes.filter((n) => n.startsWith("upstreamNotes:"));
  const text = notes.join(" ");
  const reported = r.field === "total" ? confirmations[r.moveId] : undefined;
  if (reported) assert.equal(move.frames.total.display, reported);
  return {
    characterId: r.characterId,
    moveId: r.moveId,
    field: r.field,
    current: r.current,
    sourceMoveId: r.sourceMoveId,
    flags: {
      whiff:
        /whiff/i.test(text) && /extra|additional|more|faster|less/i.test(text),
      specialState: /\b(?:shin|install|enhanced|powered|stock)\b/i.test(text),
      strengthODHold: /\b(?:strength|button|hold|held|OD)\b/i.test(text),
    },
    notes,
    ...(reported
      ? {
          judgment: "現状維持確定",
          userConfirmation: {
            basis: "ユーザーによるゲーム内確認",
            condition: "空振り全体F",
            reportedValue: reported,
            gameVersion: null,
            opponent: null,
            distance: null,
            holdCondition: null,
          },
          unresolved:
            "測定時のゲーム版・相手・距離・ホールド条件は未報告。Cargoの括弧表記との差の原因は未確定。",
        }
      : {}),
  };
});
const bison = read("data/characters/m_bison.json")
  .moves.filter(
    (m) =>
      m.adoption.status === "accepted" &&
      m.notes.some((n) => /shin bison/i.test(n)),
  )
  .map((m) => m.id);
// Extend the existing ledger; the earlier 209-field keyword screen is retained.
const currentComparison = read(
  "staging/official-reevaluation/results-after-risk-fixes.json",
);
const policy = read("data/adoption-decisions.json");
const blankAudit = read(
  "staging/official-reevaluation/blank-fields-audit.json",
);
const groups = new Map();
const target = screened.filter((r) => r.judgment !== "現状維持確定");
assert.equal(target.length, 207);
const sourceCache = new Map();
const historicalCharacter = (id) => {
  const c = read(`data/characters/${id}.json`);
  for (const d of policy.parentStartupDecisions || []) {
    if (d.characterId !== id) continue;
    const m = c.moves.find((m) => m.id === d.moveId);
    assert.deepEqual(m.frames.startup, d.value);
    m.frames.startup = d.before;
  }
  return c;
};
const loadCharacter = (id) => {
  if (!sourceCache.has(id))
    sourceCache.set(id, {
      character: historicalCharacter(id),
      raw: read(`archive/staging/sf6-frame-data/raw/${id}.json`).moves,
      cargo: read(
        `archive/staging/sf6-frame-data-quality/evidence/${id}.cargo.json`,
      ).data.cargoquery,
    });
  return sourceCache.get(id);
};
const conditions = new Map();
const detail = (ids, field, cause, reason, evidenceNeeded) => {
  for (const id of ids)
    conditions.set(`${id}/${field}`, {
      classification: "要詳細調査",
      cause,
      reason,
      evidenceNeeded,
    });
};
detail(
  ["aki__special_236_K_H", "aki__special_236_K_OD"],
  "total",
  "距離・同側/裏回り",
  "同側・裏回りで全体が異なる原典表記。採用スカラーと遠距離代表条件の対応を明示する必要がある。",
  "同側/裏回り、距離、追加操作なしの代表条件と表の43/42が対応する根拠。推算しない。",
);
detail(
  ["e_honda__special_[2]8_K_OD"],
  "total",
  "ホールド・全体範囲",
  "Cargo全体56~60とLK/MKホールドで滞空延長の注記。56を使うOD弱中・非ホールド条件との対応が未記録。",
  "OD弱中のどのボタンを保持するか、非ホールドで56になるかを確認。",
);
detail(
  ["e_honda__super_art_2_L"],
  "total",
  "空振り終了条件",
  "Cargo61(81)と相手通過時の回復移行・非通過空振りの注記がある。61の終了条件を特定できない。",
  "括弧81の条件と、通常距離で空振り・相手通過なしの全体Fを明示する資料又は測定。",
);
detail(
  ["luke__normal_5_P_H"],
  "total",
  "括弧条件不明",
  "Cargo全体35(34)。備考は括弧34がヒット・ガード・空振りのどれかを明示しない。",
  "35/34それぞれの条件を直接示す根拠。",
);
detail(
  ["kimberly__special_214_P_OD"],
  "total",
  "空中・キャンセル終了条件",
  "Cargo45(33)は空中再出現後の行動と着地回復の条件を伴う。45の無入力終了条件を確定できない。",
  "派生なしの着地・通常復帰と33のキャンセル条件を区別した記録。発生19の保留とは別フィールド。",
);
detail(
  ["zangief__super_art_2_L"],
  "total",
  "ホールド・接続条件",
  "原典はボタンホールド版とガード/空中ヒット時の自動ホールド版を区別。171を非ホールド空振り全体とする対応が未確定。",
  "その場・非ホールド・空振りの終了条件と171の対応。既存の発生/ガード保留の証拠取得時に同時記録。",
);
detail(
  ["dhalsim__super_art_2_L"],
  "block",
  "軌道・接触条件",
  "強度で弾軌道が異なり、上昇中/地上の複数接触・ホールド版がある。共通原典-4の代表接触条件が未確定。",
  "非ホールド・立ち相手・代表距離での各強度の接触段。SA共通値採用そのものを誤変換とはしない。",
);
detail(
  ["jamie__special_22_P_none"],
  "startup",
  "効果成立の時点差",
  "原典startup48と保存公式の酔いLv上昇49Fが異なる。攻撃発生ではなく効果成立の指標であり、版/計数差は未解決。",
  "非ホールドの最初の酔いLv上昇Fを版と起点を固定して確認。",
);
detail(
  ["ryu__special_22_P_none"],
  "startup",
  "効果成立の時点差",
  "CargoはDenjin取得50Fを明記、保存公式備考は51F。数値差を版差や誤りと断定しない。",
  "通常状態・非派生のストック取得Fを同じ版・計数起点で確認。",
);
detail(
  ["kimberly__special_22_K_none", "kimberly__special_22_K_OD"],
  "startup",
  "効果成立の時点差",
  "原典startup42に対して公式備考はストック増加43F。通常1個補充とOD3個補充を区別する必要がある。",
  "各版の初期ストックと補充成立F。通常2以下/OD1以下、設置なしで確認。",
);
detail(
  [
    "cammy__special_236_P_none",
    "cammy__special_236_P_OD",
    "dee_jay__special_214_K_none",
    "dee_jay__special_[2]8_K_L",
    "e_honda__special_236_K_none",
    "e_honda__special_236_K_OD",
    "elena__special_236_P_L",
    "elena__special_236_P_M",
    "elena__special_236_P_H",
    "elena__special_236_P_OD",
    "luke__special_236_K_none",
    "luke__special_236_K_OD",
    "kimberly__special_236_K_none",
    "kimberly__special_236_K_OD",
    "yasmine__special_236_K_none",
    "yasmine__special_236_K_OD",
    "m_bison__special_[2]8_K_none",
  ],
  "startup",
  "派生受付・代表指標",
  "原典の発生表記は派生受付/空中行動可能等を含む。どの主要機能・派生を基準にするかが未確定で、強度やODの別条件を単一値へ落とす妥当性を確認する必要がある。",
  "原典備考と公式備考に記録された受付開始/終了、派生別時点、計数起点を整理して採用指標を明示。現行数字の一律置換はしない。",
);
conditions.get("yasmine__special_236_K_OD/startup").reason +=
  " 特に原典23~・受付24-46と保存公式の派生受付18-45は単純な1F差ではなく、OD代表条件の対応が必要。";
conditions.get("e_honda__special_236_K_OD/startup").reason +=
  " 原典13(11)と公式13/11はいずれも派生種類別の受付で、最速一律11へ変える根拠にはならない。";
// These entries have scalar totals but describe conditional animation endings;
// a scalar alone does not prove that the listed endpoint is the whiff endpoint.
detail(
  [
    "cammy__super_art_1_L",
    "ed__super_art_1_L",
    "juri__special_623_P_OD",
    "jamie__held_special_623_K_L",
    "jamie__held_special_623_K_M",
    "jamie__held_special_623_K_H",
    "jamie__held_special_623_K_OD",
    "dee_jay__special_214_P_L",
    "dee_jay__special_214_P_M",
    "dee_jay__special_214_P_H",
    "dee_jay__special_214_P_OD",
  ],
  "total",
  "ヒット派生・全体終了条件",
  "原典にヒット時だけの追加動作/ヒット・ガードでの完走差があるが、表の全体値の終了条件を明記する根拠は不足。採用値が誤りと確定したわけではない。",
  "表の全体が派生を含まない空振り動作と対応する資料又は無入力空振り測定。既存固定DL2等の条件は保持。",
);
const flatPolicy = [];
function indexPolicy(value, path = "") {
  if (path === "/parentStartupDecisions") return;
  if (!value || typeof value !== "object") return;
  if (value.moveId) flatPolicy.push({ path, value });
  for (const [k, v] of Object.entries(value))
    if (typeof v === "object") indexPolicy(v, `${path}/${k}`);
}
indexPolicy(policy);
const normalize = (s) =>
  String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
for (const r of target) {
  const { character, raw, cargo } = loadCharacter(r.characterId);
  const m = character.moves.find((m) => m.id === r.moveId);
  const sourceId =
    m.strengthExpansion?.sourceMoveId || m.saEvidence?.researchRecordId || m.id;
  const key = `${r.characterId}/${sourceId}/${r.field}`;
  const comparison = currentComparison.find((x) => x.moveId === m.id);
  assert(comparison && comparison.fields[r.field].local === r.current);
  assert.equal(m.frames[r.field].display, r.current);
  const exclusion = policy.specialStateExclusions?.find(
    (x) => x.moveId === m.id,
  );
  assert.equal(m.adoption.status, exclusion ? "excluded" : "accepted");
  r.screeningGroup = key;
  if (groups.has(key)) {
    const g = groups.get(key);
    assert.equal(g.current, r.current, key);
    g.members.push({
      moveId: m.id,
      input: m.input,
      current: r.current,
      normalQuestion: prior.records.find(
        (x) => x.moveId === m.id && x.field === r.field,
      ).normalQuestion,
      hardQuestion: prior.records.find(
        (x) => x.moveId === m.id && x.field === r.field,
      ).hardQuestion,
    });
    continue;
  }
  const upstreamInput = m.notes
    .find((n) => n.startsWith("upstreamInput: "))
    ?.slice(15);
  const upstreamNotes = m.notes
    .find((n) => n.startsWith("upstreamNotes: "))
    ?.slice(15);
  let cargoIndices = [];
  let rawIndices = [];
  const cargoRef =
    m.saEvidence?.cargoRef || m.representativeCondition?.cargoRef;
  const rawRef = m.saEvidence?.rawRef || m.representativeCondition?.rawRef;
  if (cargoRef) cargoIndices = [Number(cargoRef.match(/cargoquery\/(\d+)/)[1])];
  else {
    const candidates = cargo.flatMap((c, i) =>
      c.title.input === upstreamInput ? [i] : [],
    );
    const exact = candidates.filter(
      (i) =>
        upstreamNotes !== undefined &&
        normalize(cargo[i].title.notes) === normalize(upstreamNotes),
    );
    cargoIndices = exact.length ? exact : candidates;
  }
  if (rawRef) rawIndices = [Number(rawRef.match(/moves\/(\d+)/)[1])];
  else {
    const candidates = raw.flatMap((x, i) =>
      x.input.numpad === upstreamInput ? [i] : [],
    );
    const exact = candidates.filter(
      (i) =>
        upstreamNotes !== undefined &&
        normalize(raw[i].notes?.en) === normalize(upstreamNotes),
    );
    rawIndices = exact.length ? exact : candidates;
  }
  const selectedCargo = cargoIndices.map((i) => ({
    ref: `archive/staging/sf6-frame-data-quality/evidence/${r.characterId}.cargo.json#/data/cargoquery/${i}/title`,
    ...cargo[i].title,
  }));
  const selectedRaw = rawIndices.map((i) => ({
    ref: `archive/staging/sf6-frame-data/raw/${r.characterId}.json#/moves/${i}`,
    id: raw[i].id,
    input: raw[i].input,
    startup: raw[i].startup,
    active: raw[i].active,
    recovery: raw[i].recovery,
    totalFrames: raw[i].totalFrames,
    onHit: raw[i].onHit,
    onBlock: raw[i].onBlock,
    notes: raw[i].notes,
  }));
  assert(selectedRaw.length && selectedCargo.length, key);
  const notes = selectedCargo.map((x) => x.notes || "").join(" ");
  const notation = selectedCargo.map(
    (x) =>
      x[
        {
          startup: "startup",
          total: "total",
          hit: "hitAdv",
          block: "blockAdv",
        }[r.field]
      ],
  );
  let decision = conditions.get(
    `${m.strengthExpansion?.sourceMoveId || m.id}/${r.field}`,
  );
  if (/Dark Ingrid only/i.test(notes))
    decision = {
      classification: "修正候補",
      cause: "特殊状態専用の基本技採用・強度展開",
      reason:
        "raw/CargoがDark Ingrid限定と明記する一方、通常状態の基本技としてaccepted/baseでL/M/Hに展開されている。明示した例外は採用規則・判断に見つからない。数値の転記自体とは別の採用条件矛盾。",
      evidenceNeeded:
        "Dark Ingrid状態の成立条件と既存例外の有無を最終確認し、元技と展開先を採用対象外にする案の影響を確認。別の通常版の数値は推測しない。",
    };
  if (!decision && (cargoIndices.length !== 1 || rawIndices.length !== 1))
    decision = {
      classification: "要詳細調査",
      cause: "原典行の条件対応",
      reason:
        "入力一致の原典行が一意でない、又は対応を特定できない。基本/強化/派生版の曖昧な選択はしない。",
      evidenceNeeded:
        "保存原典の技名・状態・備考と採用入力を一意に対応付ける。",
    };
  if (!decision) {
    let reason;
    if (r.field === "hit")
      reason =
        "KD/HKD表記をDとして保持。備考のPC・空中・投げ条件は通常ヒット値と区別し、数値有利Fへ再変換していない。";
    else if (r.field === "startup" && m.saEvidence)
      reason =
        "既存SA規則どおり表の発生/発動を保持。複合暗転や後続攻撃・強化効果の注記は別指標で、無条件の合算や後続値への置換をしていない。";
    else if (r.field === "startup")
      reason =
        "効果成立・姿勢変化・アーマー受付・設置出現又は承認済み距離範囲として、保存原典/公式備考と既存の個別規則の対応が成立。後続攻撃の発生と混ぜない。";
    else
      reason =
        "同一入力・通常/承認済み代表条件の全体表記を保持。備考のガード・ヒット・アーマー・接触段の別条件を空振りへ加減する明示的根拠はなく、今回の範囲で新しい条件矛盾を認めない。";
    decision = {
      classification: "追加疑義なし",
      cause: "原典表記・条件整合",
      reason,
      evidenceNeeded: null,
    };
  }
  const matchedPolicy = flatPolicy
    .filter(
      (x) =>
        x.value.characterId === r.characterId &&
        [m.id, m.strengthExpansion?.sourceMoveId].includes(x.value.moveId),
    )
    .map((x) => ({
      ref: `data/adoption-decisions.json#${x.path}`,
      field: x.value.field || null,
      reason: x.value.reason || x.value.basis || null,
    }));
  const b = blankAudit.records.find(
    (x) => x.moveId === m.id && x.field === r.field,
  );
  const g = {
    key,
    characterId: r.characterId,
    sourceMoveId: sourceId,
    field: r.field,
    current: r.current,
    ...decision,
    priority:
      decision.classification === "修正候補"
        ? "高"
        : decision.classification === "要詳細調査"
          ? "中"
          : "低",
    members: [
      {
        moveId: m.id,
        input: m.input,
        current: r.current,
        normalQuestion: prior.records.find(
          (x) => x.moveId === m.id && x.field === r.field,
        ).normalQuestion,
        hardQuestion: prior.records.find(
          (x) => x.moveId === m.id && x.field === r.field,
        ).hardQuestion,
      },
    ],
    proposedCorrection:
      decision.classification === "修正候補"
        ? "通常状態の出題から元技/強度展開先を除外する案。値の修正案ではない。"
        : null,
    evidence: {
      raw: selectedRaw,
      cargo: selectedCargo,
      notation,
      adoption: m.adoption,
      variant: m.variant,
      representativeCondition: m.representativeCondition || null,
      strengthExpansion: m.strengthExpansion || null,
      saEvidence: m.saEvidence || null,
      adoptionInput: `staging/adoption-inputs/${r.characterId}.json`,
      policy: matchedPolicy,
      rules: "docs/ADOPTION_RULES.md",
      comparison: {
        ref: "staging/official-reevaluation/results-after-risk-fixes.json",
        field: comparison.fields[r.field],
        mappingReason: comparison.mappingReason,
        officialNotes: comparison.officialNotes,
      },
      priorAudit: {
        ref: "staging/official-reevaluation/unverifiable-play-risk.json",
        moveId: m.id,
        field: r.field,
      },
      blankAudit: b
        ? {
            ref: "staging/official-reevaluation/blank-fields-audit.json",
            classification: b.classification,
            reason: b.reason,
          }
        : null,
    },
  };
  g.conditionSignals = {
    parentheses: notation.some((x) => /[()]/.test(x || "")),
    compoundStartup: selectedCargo.some((x) => /[+]/.test(x.startup || "")),
    knockdown: selectedCargo.some((x) => /\b(?:KD|HKD)\b/.test(x.hitAdv || "")),
    hold: /\b(?:hold|held|charg(?:e|ed|ing))\b/i.test(notes),
    followup: /follow.up|cancel/i.test(notes),
    enhancedState: /only|install|enhanced|stock|crest|flame|mine|DL[0-4]/i.test(
      notes,
    ),
    distance: /distance|range|trajectory|cross.up|steer/i.test(notes),
    whiffRecovery:
      /whiff/i.test(notes) && /recovery|total|animation/i.test(notes),
  };
  g.mappingCheck = {
    rawCargoInputAgreement: selectedRaw.every((x) =>
      selectedCargo.some((c) => c.input === x.input.numpad),
    ),
    rawCargoNotesAgreement: selectedRaw.every((x) =>
      selectedCargo.some((c) => normalize(c.notes) === normalize(x.notes?.en)),
    ),
    commonStrengths: m.strengthExpansion
      ? "ユーザー指定の共通値展開。個別強度性能の独立検証ではない。"
      : m.saEvidence?.strengthBasis || "明示原典入力",
    scope:
      "入力・状態は上記選択原典と採用注記を照合。条件語は別フィールドの条件か、今回の指標を変える条件かを区別。",
  };
  if (!g.mappingCheck.rawCargoNotesAgreement)
    g.mappingCheck.differenceReview =
      "保存raw/Cargoの備考差を点検。今回の差はModern操作・間合い/判定・ダメージ等の追記で、対象フィールドの条件を覆す新しい矛盾ではない。元全文は両方保持。";
  if (!g.mappingCheck.rawCargoInputAgreement)
    g.mappingCheck.inputDifferenceReview =
      "Ingrid SA1のraw入力は(0 Stock)接尾辞付き、Cargoは接尾辞なし。既存saEvidenceの固定rawRef/cargoRefと非ホールド・0ストック採用に基づく対応を再利用し、別条件へ一般化しない。";
  g.evidence.officialSource = `staging/official-verification/sources/${r.characterId}.json`;
  g.priorityRank =
    g.classification === "修正候補"
      ? 1
      : g.cause === "効果成立の時点差"
        ? 2
        : g.classification === "要詳細調査"
          ? 3
          : 4;
  groups.set(key, g);
}
assert.equal(groups.size, 127);
assert.equal(new Set(target.map((r) => `${r.moveId}/${r.field}`)).size, 207);
assert.equal(
  [...groups.values()].reduce((n, g) => n + g.members.length, 0),
  207,
);
const targetKeys = new Set(target.map((r) => `${r.moveId}/${r.field}`));
for (const r of prior.startupIndicatorReview?.records || [])
  assert(!targetKeys.has(`${r.moveId}/${r.field}`));
assert.equal(currentComparison.length * 4, 5128);
for (const r of target) {
  r.screeningClassification = groups.get(r.screeningGroup).classification;
}
const counts = (gs, weight) =>
  gs.reduce(
    (a, g) => (
      (a[g.classification] = (a[g.classification] || 0) + weight(g)),
      a
    ),
    {},
  );
const screening207 = {
  basis:
    "除外前5128欄と既存209欄を照合しユーザー確認済みエド2欄を除外。先行7発生欄とは重複しない。分類はスクリーニング時点の履歴として保持。",
  fieldCount: 207,
  sourceFieldCount: 127,
  patch: "UNVERIFIED",
  caveat:
    "追加疑義なしは今回の条件スクリーニングで新しい矛盾を見つけなかった意味。正確性/独立測定の認定ではない。",
  sourceCounts: counts([...groups.values()], () => 1),
  expandedCounts: counts([...groups.values()], (g) => g.members.length),
  groups: [...groups.values()],
};
screening207.nextBatch = {
  priority: 1,
  sourceMoveId: "ingrid__special_214214_K_none",
  sourceFields: 4,
  expandedFields: 12,
  currentValues: { startup: "27", total: "58", hit: "D", block: "-15" },
  task: "Dark Ingrid限定技が通常状態で出題される採用条件を最優先で詳細確認。共通元1技と展開先3入力の除外案を作り、値そのものの一括置換は行わない。",
  completion:
    "保存原典の限定状態と採用例外の有無を確認し、通常状態の可否・対象ID・出題影響・必要な生成/履歴監査の変更を整理。実装は別途承認後。",
  following:
    "効果成立Fが原典と公式で1F異なる4元フィールド/10欄を、同版・計数起点・ストック成立の定義から確認。自動+1しない。",
};
const output = {
  screening207,
  scope:
    "前回の未詳細調査のうち数値・Dとして出題される209フィールド。文字列検索は候補抽出であり、フラグは誤りの判定ではない。",
  count: screened.length,
  bisonAcceptedShinMentions: bison,
  findings: [
    {
      id: "ed__special_236_K_L/total",
      judgment: "現状維持確定",
      finding:
        "Cargo 45(43)の43候補は採用しない。ユーザーのゲーム内確認では空振り全体45F。ゲーム版・相手・距離・ホールド条件は未報告。",
      source:
        "archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#/data/cargoquery/10/title",
    },
    {
      id: "ed__special_236_K_M/total",
      judgment: "現状維持確定",
      finding:
        "Cargo 49(48)の48候補は採用しない。ユーザーのゲーム内確認では空振り全体49F。ゲーム版・相手・距離・ホールド条件は未報告。",
      source:
        "archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#/data/cargoquery/11/title",
    },
    {
      id: "ken__normal_5_K_H/total",
      finding: "空振り追加2Fは現行38に反映済み。修正候補ではない。",
    },
    {
      id: "blanka__special_22_P_none__strength_L/startup",
      finding:
        "原典の設置と後続効果の指標差。既存の中優先度で、空振り追加硬直の誤採用は示さない。",
    },
  ],
  records: screened,
};
// Detailed reviews supplement the historical screening; regeneration must retain them.
if (previousScreen.conditionalValueReview) {
  output.conditionalValueReview = previousScreen.conditionalValueReview;
  const reviewGroups = screening207.groups.filter(
    (g) =>
      g.classification === "要詳細調査" &&
      !["派生受付・代表指標", "効果成立の時点差"].includes(g.cause),
  );
  assert.deepEqual(
    output.conditionalValueReview.groupKeys,
    reviewGroups.map((g) => g.key),
  );
  assert.equal(reviewGroups.length, 19);
  assert.equal(
    reviewGroups.reduce((n, g) => n + g.members.length, 0),
    29,
  );
  for (const key of output.conditionalValueReview.groupKeys) {
    const previous = previousScreen.screening207.groups.find(
      (g) => g.key === key,
    );
    const current = screening207.groups.find((g) => g.key === key);
    assert(previous?.detailedReview && current, key);
    assert.equal(current.current, previous.detailedReview.current, key);
    assert.deepEqual(current.members, previous.members, key);
    assert.deepEqual(current.evidence, previous.evidence, key);
    current.detailedReview = previous.detailedReview;
    const official = read(current.evidence.officialSource);
    const phases = current.evidence.comparison.field.officialByRow.map(
      ({ row }) => {
        const index = official.rows.findIndex((r) => r.row === row);
        assert(index >= 0, key);
        const r = official.rows[index];
        return {
          ref: `${current.evidence.officialSource}#/rows/${index}`,
          row,
          startup: r.startup,
          active: r.active,
          recovery: r.recovery,
          block: r.block,
        };
      },
    );
    if (previous.detailedReview.officialPhases)
      assert.deepEqual(phases, previous.detailedReview.officialPhases, key);
    current.detailedReview.officialPhases = phases;
  }
  for (const [unit, weight] of [
    ["source", () => 1],
    ["production", (g) => g.members.length],
  ]) {
    const actual = { 修正確定: 0, 現状維持: 0, 保留: 0 };
    for (const g of reviewGroups) {
      assert(Object.hasOwn(actual, g.detailedReview.judgment), g.key);
      actual[g.detailedReview.judgment] += weight(g);
    }
    assert.deepEqual(actual, output.conditionalValueReview.counts[unit]);
  }
}
if (previousScreen.followupIndicatorReview) {
  output.followupIndicatorReview = previousScreen.followupIndicatorReview;
  const targets = screening207.groups.filter(
    (g) => g.cause === "派生受付・代表指標",
  );
  assert.deepEqual(
    targets.map((g) => g.key),
    output.followupIndicatorReview.groupKeys,
  );
  assert.equal(targets.length, 17);
  assert.equal(
    targets.reduce((n, g) => n + g.members.length, 0),
    31,
  );
  const counts = {
    source: { 修正確定: 0, 現状維持: 0, 保留: 0 },
    production: { 修正確定: 0, 現状維持: 0, 保留: 0 },
  };
  for (const g of targets) {
    const old = previousScreen.screening207.groups.find((x) => x.key === g.key);
    assert(old?.followupReview, g.key);
    assert.deepEqual(g.evidence, old.evidence, g.key);
    assert.deepEqual(g.members, old.members, g.key);
    assert.equal(g.current, old.followupReview.current, g.key);
    g.followupReview = old.followupReview;
    for (const e of g.followupReview.officialEvidence) {
      const [path, pointer] = e.ref.split("#");
      const row = pointer
        .split("/")
        .slice(1)
        .reduce((v, k) => v[k], read(path));
      assert.equal(row.row, e.row);
      assert.equal(row.notes, e.notes);
    }
    assert(Object.hasOwn(counts.source, g.followupReview.judgment));
    counts.source[g.followupReview.judgment]++;
    counts.production[g.followupReview.judgment] += g.members.length;
  }
  assert.deepEqual(counts, output.followupIndicatorReview.counts);
}
if (previousScreen.effectTimingReview) {
  output.effectTimingReview = previousScreen.effectTimingReview;
  const targets = screening207.groups.filter(
    (g) => g.cause === "効果成立の時点差",
  );
  assert.deepEqual(
    targets.map((g) => g.key),
    output.effectTimingReview.groupKeys,
  );
  assert.equal(targets.length, 4);
  assert.equal(
    targets.reduce((n, g) => n + g.members.length, 0),
    10,
  );
  const counts = {
    source: { 修正確定: 0, 現状維持: 0, 保留: 0 },
    production: { 修正確定: 0, 現状維持: 0, 保留: 0 },
  };
  for (const g of targets) {
    const old = previousScreen.screening207.groups.find((x) => x.key === g.key);
    assert(old?.effectTimingReview, g.key);
    assert.deepEqual(g.evidence, old.evidence, g.key);
    assert.deepEqual(g.members, old.members, g.key);
    assert.equal(g.current, old.effectTimingReview.current, g.key);
    g.effectTimingReview = old.effectTimingReview;
    for (const e of g.effectTimingReview.officialEvidence) {
      const [path, pointer] = e.ref.split("#");
      const row = pointer
        .split("/")
        .slice(1)
        .reduce((v, k) => v[k], read(path));
      assert.equal(row.row, e.row);
      assert.equal(row.notes, e.notes);
    }
    assert(Object.hasOwn(counts.source, g.effectTimingReview.judgment));
    counts.source[g.effectTimingReview.judgment]++;
    counts.production[g.effectTimingReview.judgment] += g.members.length;
  }
  assert.deepEqual(counts, output.effectTimingReview.counts);
}
const darkExclusions = (policy.specialStateExclusions || []).filter(
  (x) => x.characterId === "ingrid" && x.afterStrengthExpansion,
);
if (darkExclusions.length) {
  assert.equal(darkExclusions.length, 4);
  const characters = fs
    .readdirSync("data/characters")
    .filter((n) => n.endsWith(".json"))
    .map((n) => read(`data/characters/${n}`));
  const accepted = characters.flatMap((c) =>
    c.moves.filter((m) => m.adoption.status === "accepted"),
  );
  const acceptedIds = new Set(accepted.map((m) => m.id));
  const retained = currentComparison.filter((r) => acceptedIds.has(r.moveId));
  assert.deepEqual(
    retained.map((r) => r.moveId).sort(),
    [...acceptedIds].sort(),
  );
  for (const r of retained)
    for (const [field, value] of Object.entries(r.fields))
      assert.equal(
        (field === "startup"
          ? policy.parentStartupDecisions?.find((d) => d.moveId === r.moveId)
              ?.before.display
          : undefined) ??
          accepted.find((m) => m.id === r.moveId).frames[field].display,
        value.local,
      );
  const excluded = currentComparison.filter((r) => !acceptedIds.has(r.moveId));
  assert.deepEqual(
    excluded.map((r) => r.moveId).sort(),
    darkExclusions.map((d) => d.moveId).sort(),
  );
  assert(
    excluded.every((r) =>
      Object.values(r.fields).every((f) => f.status === "確認不能"),
    ),
  );
  const statusCounts = {};
  for (const r of retained)
    for (const f of Object.values(r.fields))
      statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
  output.darkIngridExclusion = {
    datasetId: "dark-ingrid-exclusion-2026-11-14-r1",
    judgment: "修正確定・採用除外を反映済み",
    basis:
      "raw/CargoのDark Ingrid onlyと通常状態の採用規則を照合。個別例外なし。フレーム値ではなく採用状態のみ変更。",
    rules: "docs/ADOPTION_RULES.md",
    decisionPath: "data/adoption-decisions.json#/specialStateExclusions",
    ids: darkExclusions.map((d) => d.moveId),
    evidence: darkExclusions.map(
      (d) => `${d.sourcePath}#/data/cargoquery/${d.sourceIndex}/title`,
    ),
    preservedFrames: { startup: "27", total: "58", hit: "D", block: "-15" },
    before: { records: 1298, accepted: 1282, comparedFields: 5128 },
    after: {
      records: characters.reduce((n, c) => n + c.moves.length, 0),
      accepted: accepted.length,
      comparedFields: retained.length * 4,
      statusCounts,
    },
    questionResult:
      "Normal/HardともIngridの214214K L/M/Hは技なし。共通入力候補はSagat SA2により維持。",
    screeningScope: {
      historicalFields: 207,
      excludedFields: 12,
      remainingFields: 195,
      remainingSourceFields: 123,
      correctionCandidates: 0,
      detailedInvestigationFields: 70,
      noAdditionalConcernFields: 125,
    },
    patch: "UNVERIFIED",
    verification:
      "生成再現・全レコード差分・履歴投影・出題影響は既存検査で確認。実行結果はFRAME_DATA_ACCURACY_PLAN.md参照。",
  };
  screening207.nextBatch.resolution =
    "今回のユーザー承認により共通元とL/M/Hを非採用化。旧スクリーニング分類は履歴として保持。";
}
if (previousScreen.parentStartupRule)
  output.parentStartupRule = previousScreen.parentStartupRule;
if (previousScreen.releaseAudit)
  output.releaseAudit = previousScreen.releaseAudit;
fs.writeFileSync(
  "staging/official-reevaluation/remaining-screen.json",
  JSON.stringify(output, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    count: screened.length,
    flags: Object.fromEntries(
      ["whiff", "specialState", "strengthODHold"].map((k) => [
        k,
        screened.filter((r) => r.flags[k]).length,
      ]),
    ),
    bison,
  }),
);
