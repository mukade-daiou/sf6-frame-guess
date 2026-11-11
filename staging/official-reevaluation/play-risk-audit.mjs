import fs from "node:fs";
import assert from "node:assert/strict";
import { format } from "prettier";

const dir = "staging/official-reevaluation/";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const old = read(dir + "pending-reevaluation.json");
const latest = read(dir + "results-after-sa3.json");
const actual = read(dir + "results-after-user-verification.json");
const policy = read("data/adoption-decisions.json");
const key = (r) => `${r.characterId}/${r.moveId}/${r.field}`;
const mismatch = latest.flatMap((r) =>
  Object.entries(r.fields)
    .filter(([, v]) => v.status === "不一致")
    .map(([field, v]) => ({ ...r, field, comparison: v })),
);
assert.equal(mismatch.length, 63);
assert.equal(new Set(mismatch.map(key)).size, 63);
const priorityHigh = new Set([
  "alex__normal_5_P_M/total",
  "arjun__special_236_P_H/total",
  "arjun__special_236_P_OD/total",
  "dee_jay__special_[4]6_P_OD/total",
  "marisa__special_214_P_M/total",
  "rashid__special_214_P_OD/total",
  "ryu__normal_2_P_H/total",
  "ryu__special_214_P_OD/total",
  "akuma__special_623_P_OD/block",
  "dhalsim__special_63214_K_H/block",
  "jamie__held_special_623_K_L/block",
  "mai__special_623_K_H/block",
  "rashid__special_236_P_OD/block",
  "ryu__special_623_P_H/block",
  "terry__special_623_P_L/block",
  "yasmine__special_214_P_M/hit",
  "zangief__special_22_K_H/startup",
]);
const external = {
  "alex__normal_5_P_M/total": [
    {
      url: "https://shoryu.site/character/alex",
      finding:
        "5MPに24(25/27)と空振り硬直+2を併記し、保存原典と同じ内部矛盾。文言が同一で独立測定とは扱えない。",
      version: "UNVERIFIED",
    },
  ],
  "ryu__normal_2_P_H/total": [
    {
      url: "https://robkof.com/sf6-frame-data/?character=ryu",
      finding:
        "2HPの発生9・持続6・硬直21を掲載。基準版・元データの独立性は未確認で、公式硬直22の対象版を特定できない。",
      version: "UNVERIFIED",
    },
  ],
  "ryu__special_623_P_H/block": [
    {
      url: "https://robkof.com/sf6-frame-data/?character=ryu",
      finding: "623HPのガード-39を掲載。収録データの由来と版が未確認。",
      version: "UNVERIFIED",
    },
    {
      url: "https://dood.gg/ko/%EC%8A%A4%ED%8A%B8%EB%A6%AC%ED%8A%B8%20%ED%8C%8C%EC%9D%B4%ED%84%B0%206/ryu/frames/",
      finding:
        "623HPのガード-36を掲載。公式と同値だが元資料や版の独立性は未確認。",
      version: "UNVERIFIED",
    },
  ],
  "zangief__special_22_K_H/startup": [
    {
      url: "https://shoryu.site/character/zangief",
      finding:
        "6–55F受付と記載。保存Cargoと文言が一致し、独立測定とは扱えない。",
      version: "UNVERIFIED",
    },
    {
      url: "https://robkof.com/sf6-frame-data/?character=zangief",
      finding:
        "22HKのstartup 6を掲載するが出典・対象版・公式の5との定義差は未確認。",
      version: "UNVERIFIED",
    },
  ],
};
const rawCache = new Map();
const result = mismatch.map((r) => {
  const previous = old.records.find((x) => key(x) === key(r));
  assert(previous, key(r));
  const character = read(`data/characters/${r.characterId}.json`);
  const move = character.moves.find((m) => m.id === r.moveId);
  assert(move && move.adoption.status === "accepted", key(r));
  const correction = (
    policy.whiffTotalCorrections.additionalDecisions || []
  ).find(
    (d) =>
      d.characterId === r.characterId &&
      d.moveId === r.moveId &&
      d.field === r.field,
  );
  const user = policy.userConfirmedFrames.decisions.find(
    (d) =>
      d.characterId === r.characterId &&
      d.moveId === r.moveId &&
      d.field === r.field,
  );
  const maintained = policy.userConfirmedFrames.unchangedConfirmations.find(
    (d) =>
      d.characterId === r.characterId &&
      d.moveId === r.moveId &&
      d.field === r.field,
  );
  const currentResult = actual.find(
    (x) => x.characterId === r.characterId && x.moveId === r.moveId,
  )?.fields[r.field];
  assert(currentResult);
  assert.equal(
    move.frames[r.field].display,
    user
      ? user.value.display
      : correction
        ? correction.value.display
        : r.comparison.local,
    key(r),
  );
  assert.equal(currentResult.local, move.frames[r.field].display);
  if (user) assert.equal(currentResult.status, "一致");
  if (maintained) {
    assert.equal(currentResult.status, "不一致");
    assert.equal(maintained.reportedValue, currentResult.local);
  }
  assert.equal(r.comparison.local, previous.current, key(r));
  if (correction)
    assert.notEqual(
      Number(correction.value.display),
      Number(r.comparison.official),
      key(r),
    );
  const high = priorityHigh.has(`${r.moveId}/${r.field}`);
  const medium =
    !high &&
    (r.moveId.includes("super_art") ||
      (r.field === "total" && !/空中・着地/.test(previous.group)));
  const priority = high ? "高" : medium ? "中" : "低";
  if (high) {
    const source = read(previous.previousLedger).records.find(
      (x) => key(x) === key(r),
    );
    assert(
      source &&
        source.input &&
        source.rawPath &&
        source.cargoPath &&
        source.officialPath &&
        source.official.length,
      key(r),
    );
    for (const rr of source.raw) {
      if (!rawCache.has(source.rawPath))
        rawCache.set(source.rawPath, read(source.rawPath));
      assert.equal(rawCache.get(source.rawPath).moves[rr.index].id, rr.id);
    }
    const cargo = read(source.cargoPath);
    for (const row of source.cargo)
      assert.equal(cargo.data.cargoquery[row.index].title.input, row.input);
    const official = read(source.officialPath);
    for (const row of source.official)
      assert.equal(
        official.rows.find((x) => x.row === row.row)?.name,
        row.name,
      );
  }
  return {
    characterId: r.characterId,
    moveId: r.moveId,
    name: move.name,
    input: move.input,
    variant: move.variant,
    field: r.field,
    current: move.frames[r.field].display,
    previousValue: r.comparison.local,
    proposedCorrection: user
      ? user.value.display
      : correction
        ? correction.value.display
        : null,
    comparisonStatusNow: currentResult.status,
    userConfirmation: user
      ? {
          reportedValue: user.value.display,
          basis: user.basis,
          ...user.measurement,
        }
      : maintained
        ? {
            reportedValue: maintained.reportedValue,
            basis: maintained.basis,
            ...maintained.measurement,
          }
        : null,
    official: r.comparison.official,
    priority,
    priorityReason: high
      ? "通常条件で使用される技または出題に直接影響するため優先。差が1Fでも除外しない。"
      : medium
        ? "SAまたは特殊な終了条件を持つ技。"
        : "空中・着地・多段・距離または相手条件に依存。",
    normalOrHard: r.field === "startup" ? "Normal・Hard" : "Normal",
    detailed: high,
    classification:
      user || correction ? "修正確定" : maintained ? "現状維持" : "保留",
    classificationBasis: user
      ? "ユーザーによるゲーム内確認値を採用。詳細な測定条件とゲーム版は未報告。"
      : maintained
        ? "ユーザー確認値と現行値が一致。保存公式とは不一致のまま、理由は未確定。"
        : correction
          ? "保存Cargoの括弧内と空振り追加3Fが一致し、空振り全体の採用規則に反する旧値を修正した。公式値は異なり版・条件は未確定。"
          : high
            ? "保存raw・Cargo・公式行・現行入力を再照合。対象版と同一測定条件の独立証拠が不足。公式との差または原典との一致だけでは決定できない。"
            : "既存保留を継承。今回の優先詳細検証対象外。",
    previousReason: previous.previousReason,
    unresolved:
      user || maintained
        ? "ユーザー確認時のゲームバージョン・相手・距離・接触段は未報告。公式資料の対象パッチも未確認。"
        : previous.unresolved,
    source: previous.previousLedger,
    rawRows: previous.rawRows.map((x) => x.ref),
    cargoRows: previous.cargoRows.map((x) => x.ref),
    officialRows: previous.officialRows.map((x) => x.ref),
    external: external[`${r.moveId}/${r.field}`] || [],
    patch: "UNVERIFIED",
  };
});
assert.equal(result.filter((r) => r.detailed).length, 17);
const count = (items) =>
  items.reduce((acc, x) => ((acc[x] = (acc[x] || 0) + 1), acc), {});
const conditions = [];
const actualCounts = count(
  actual.flatMap((r) => Object.values(r.fields).map((v) => v.status)),
);
assert.deepEqual(actualCounts, {
  一致: 4459,
  確認不能: 570,
  条件違い: 42,
  不一致: 61,
});
for (const r of latest)
  for (const [field, v] of Object.entries(r.fields))
    if (v.status === "条件違い")
      conditions.push({
        characterId: r.characterId,
        moveId: r.moveId,
        field,
        current: v.local,
        official: v.official,
        reason: v.reason,
      });
assert.equal(conditions.length, 42);
const output = {
  baseline: "148d6dabf0792b4477051a3f9034a6007b075ed3",
  datasetId: read("data/metadata.json").datasetId,
  priorities: count(result.map((r) => r.priority)),
  detailedJudgments: count(
    result.filter((r) => r.detailed).map((r) => r.classification),
  ),
  remainingNotDetailed: result.filter((r) => !r.detailed).length,
  comparison: {
    ...actualCounts,
    caveat:
      "保存済み比較処理を一時コピーで再実行した集計。発生欄が空の修正は確認不能。最新パッチとの比較ではない。",
  },
  access: [
    {
      url: "https://www.streetfighter.com/6/ja-jp/character/ryu/frame",
      result: "403 Forbidden",
    },
    {
      url: "https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data",
      result: "403 Forbidden",
    },
    {
      url: "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261013",
      result: "403 Forbidden",
    },
  ],
  conditions,
  records: result,
};
fs.writeFileSync(
  dir + "play-risk-audit.json",
  await format(JSON.stringify(output), { parser: "json" }),
);
console.log(
  JSON.stringify({
    priorities: output.priorities,
    detailed: output.detailedJudgments,
    remaining: output.remainingNotDetailed,
    conditions: conditions.length,
  }),
);
