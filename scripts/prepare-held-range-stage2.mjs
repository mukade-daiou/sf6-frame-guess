import { readFileSync, writeFileSync } from "node:fs";
import { applyHeldReviews } from "./held-range-review.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const policy = read("data/adoption-decisions.json"),
  review = read(policy.distanceRanges.heldReviewPath),
  ledger = read("staging/distance-range-candidates.json");
const previous = review.stage2;
const targets = review.items.filter(
  (r) => r.group === "C" && r.resolution === "held",
);
if (targets.length !== 134) throw Error("Expected stage1 C134");
const slugs = {
  dhalsim: "dhalsim",
  luke: "luke",
  e_honda: "honda",
  blanka: "blanka",
  arjun: "arjun",
  aki: "aki",
  ed: "ed",
  m_bison: "vega",
  zangief: "zangief",
  mai: "mai",
};
const sources = Object.entries(slugs).map(([id, slug]) => ({
  id,
  path: `staging/held-range-stage2/${slug}.html`,
  url: `https://shoryu.site/character/${slug}`,
  checkedAt: "2026-11-09",
  status: 200,
  gameVersion: "UNVERIFIED",
  independence: "SuperCombo-derived presentation; not independent verification",
}));
const excluded = {
  "aki/4/hit":
    "括弧はKD +38~45のダウン後有利値。通常ヒット+2の距離範囲ではない。",
  "aki/8/hit": "括弧はKD +38~45のダウン後有利値。通常ヒット+3と混ぜない。",
  "blanka/38/startup":
    "原典が括弧の41を下降打撃の発生と明示。上昇1段目8Fと別の打撃段を連続範囲へ混ぜない。",
  "juri/16/hit":
    "通常ヒット+5と持続2〜4FのKD/空中KDの混在。KD端点を通常硬直差へ転用しない。",
  "ken/43/startup":
    "最初2持続は空中の相手だけに当たり、括弧は地上相手の成立時点。地上/空中条件を混ぜない。",
  "ken/45/startup":
    "初期持続は空中のみ、次は立ち相手のみ。既存のユーザー指定9F代表条件を維持。",
  "ken/46/startup":
    "最初3持続は空中のみ。地上/空中の成立時点を範囲として結合しない。",
  "ken/48/startup":
    "最初2持続は空中のみ。地上/空中の成立時点を範囲として結合しない。",
  "ken/43/hit":
    "注記がしゃがみ相手に1F良いと明示。姿勢差であり同一代表条件の範囲ではない。",
  "ken/45/hit": "注記がしゃがみ相手に3F良いと明示。立ち/しゃがみの別条件。",
  "ken/48/hit": "注記がしゃがみ相手に1F良いと明示。立ち/しゃがみの別条件。",
  "manon/1/startup":
    "最初持続は空中の相手のみ。地上/空中の成立時点を混ぜない。",
  "manon/2/startup":
    "最初持続はしゃがみ相手に当たらない。立ち/しゃがみ・中段成立時点の別条件。",
  "manon/2/hit":
    "しゃがみ相手で1F良いという明示条件。通常の立ち相手との差を範囲化しない。",
  "terry/3/startup":
    "最初7持続が空中のみ。地上成立30Fと空中成立23Fを混ぜない。",
  "terry/5/startup": "最初持続が地上相手に当たらない。地上/空中の成立時点差。",
  "terry/7/startup":
    "2段技の括弧22Fは中段となる打撃段の発生。1段目10Fと測定対象が違う。",
  "terry/8/startup":
    "追加打撃のある別入力。括弧22Fは中段打撃の成立時点で初段10Fの距離変動ではない。",
  "manon/0/block":
    "ガード時の最終打撃がしゃがみ相手に空振りする条件。姿勢と接触段数の差。",
  "ryu/6/block":
    "しゃがみ相手には初段しか当たらない別条件。立ち相手の代表値と混ぜない。",
  "ryu/11/block":
    "しゃがみ相手には初段しか当たらない別条件。立ち相手の代表値と混ぜない。",
  "ryu/21/hit":
    "壁バウンド後の有利値。通常ヒット硬直差への数値変換は対象外でDを維持。",
};
const items = [];
for (const r of targets) {
  const c = r.before,
    character = read(`data/characters/${c.characterId}.json`),
    field = c.field;
  const rawPath = `archive/staging/sf6-frame-data/raw/${c.characterId}.json`,
    raw = read(rawPath);
  const raws = raw.moves.flatMap((m, index) =>
    m.input.numpad === c.sourceRecord.input
      ? [{ index, name: m.name.en, category: m.category, source: m.source }]
      : [],
  );
  const source = sources.find((s) => s.id === c.characterId);
  let priority = /[()~]/.test(c.notation) ? 3 : 4,
    reason =
      "追加の技別条件表が必要。単一値や括弧だけから距離範囲を確定しない。",
    nextEvidence = r.nextEvidence,
    resolution = "held",
    group = "C";
  if (source?.id === "luke") {
    const html = readFileSync(source.path, "utf8");
    if (!html.includes("</html>"))
      throw Error(`Incomplete source: ${source.path}`);
  }
  if (["aki/0/block", "ed/0/block", "m_bison/58/startup"].includes(r.key)) {
    priority = 4;
    reason =
      "追加の公開本文も共通強度行の表記・強度別配置/速度/軌道を維持。各強度内の範囲は分離されていない。";
  }
  if (c.characterId === "aki" && [16, 18].includes(c.sourceIndex)) {
    priority = 3;
    reason =
      "追加資料も表裏・43F例外を含む記載。裏回り条件の全体と表側代表値を合成せず、移動全体を発生へ転用しない。";
  }
  if (["arjun", "blanka", "e_honda", "zangief"].includes(c.characterId)) {
    priority = 4;
    reason =
      "公開本文と保存表記・注記を照合。括弧条件の新しい定義や同一代表条件の端点は得られず、共通由来の再掲載だけでは確定しない。";
  }
  if (excluded[r.key]) {
    priority = 2;
    resolution = "excluded";
    reason = excluded[r.key];
    nextEvidence = "解決済み。別測定条件を含む値は距離範囲へ取り込まない。";
  }
  const mapped = character.moves.filter((m) => c.moveIds.includes(m.id));
  const actualRef = `${c.sourcePath}#/data/cargoquery/${c.sourceIndex}/title`;
  if (
    mapped.length &&
    mapped.every((m) => m.saEvidence && m.saEvidence.cargoRef !== actualRef)
  ) {
    priority = 2;
    resolution = "excluded";
    reason =
      "SA生成のsaEvidence.cargoRefと保存SA inventoryを照合。この共通入力行は採用SAの原典行ではなくCA等の別条件行。対象入力文字列の一致だけでは採用しない。";
    nextEvidence = "解決済み。通常SAの明示原典参照を優先。";
  }
  if (r.key === "dhalsim/15/block") {
    priority = 5;
    group = "D";
    reason =
      "距離依存は注記で明示されるが、端点とODボタン組み合わせ内の条件は未記載。単一-3から末尾~は新作しない。";
    nextEvidence =
      "LP+MPのOD条件と立ち相手を固定し、近/中/遠で通常ガード硬直差を実測するか、同条件の端点測定資料を入手。";
  }
  if (r.key === "luke/9/startup") {
    priority = 1;
    resolution = "accepted";
    reason =
      "保存10(27)と公開Pale Rider本文を照合。相手到達または27Fで攻撃が出る距離依存で、通常版に10/27の両端が明記される。";
    nextEvidence = "解決済み。CA行とは区別し通常SA3の3強度へ適用。";
    const html = readFileSync(source.path, "utf8");
    for (const text of [
      "Pale Rider</div>",
      "10(27)",
      "active frames occur upon reaching the opponent or on frame 27 (whichever occurs first)",
    ])
      if (!html.includes(text)) throw Error("Luke public evidence mismatch");
    for (const move of mapped) {
      if (move.saEvidence.cargoRef !== actualRef)
        throw Error("Luke source row mismatch");
      if (
        !policy.distanceRanges.decisions.some(
          (d) => d.moveId === move.id && d.field === field,
        )
      )
        policy.distanceRanges.decisions.push({
          characterId: c.characterId,
          moveId: move.id,
          field,
          before: move.frames[field],
          sourceNotation: c.notation,
          variation: "distance/arrival timing",
          sourcePath: c.sourcePath,
          sourceIndex: c.sourceIndex,
          sourceRecord: c.sourceRecord,
          reason,
          additionalEvidence: {
            path: source.path,
            url: source.url,
            requiredText: [
              "Pale Rider</div>",
              "10(27)",
              "active frames occur upon reaching the opponent or on frame 27 (whichever occurs first)",
            ],
            meaning: "Pale Rider startup 10(27); reach opponent or frame 27",
            gameVersion: "UNVERIFIED",
          },
          value: {
            status: "conditional",
            display: "10~27",
            condition: "通常SA3・同一強度の相手到達距離",
            range: {
              min: 10,
              max: 27,
              evidence: [source.url, move.source.url],
            },
          },
        });
    }
  }
  const original = previous?.items.find((x) => x.key === r.key);
  items.push({
    key: r.key,
    priority,
    priorityBasis: [
      "",
      "既存資料と公開本文の1点照合",
      "入力・派生・原典対応の整理",
      "技解説による括弧条件の確認",
      "複数資料で条件を分離",
      "公開端点不足・実測資料が必要",
    ][priority],
    before: original?.before ?? structuredClone(r),
    moveIds: c.moveIds,
    field,
    currentValues: original?.currentValues ?? r.currentValues,
    resolution,
    group,
    reason,
    nextEvidence,
    checkedSources: [
      { path: c.sourcePath, index: c.sourceIndex },
      { path: rawPath, records: raws },
      ...(source ? [source] : []),
    ],
    sourceComparison: source
      ? "公開本文を取得。対象の表記・条件に新たな説明があるか確認。パッチ不明・独立検証ではない。"
      : "保存rawの入力・技名・状態と生成の代表条件を再照合。追加公開資料は未取得。",
    inspected: true,
  });
}
review.stage2 = {
  baseline: previous?.baseline ?? {
    accepted: 80,
    held: 180,
    excluded: 477,
    production: 737,
    decisions: policy.distanceRanges.decisions.slice(0, 80),
  },
  items,
  sources,
  unavailable: [
    {
      url: "https://www.streetfighter.com/6/buckler/ja-JP/characters/luke/frame",
      status: "Web tool inaccessible; ordinary curl HTTP403",
    },
    {
      url: "https://www.streetfighter.com/6/buckler/ja-JP/characters/mai/frame",
      status: "Web tool inaccessible",
    },
    {
      url: "https://www.streetfighter.com/6/buckler/ja-JP/characters/ehonda/frame",
      status: "Web tool inaccessible",
    },
    { url: "https://shoryu.site/character/bison", status: "HTTP404" },
    {
      url: "https://shoryu.site/character/mbison",
      status: "HTTP404; correct slug vega discovered by search",
    },
  ],
  checkedAt: "2026-11-09",
};
for (const d of policy.distanceRanges.decisions.slice(80))
  if (d.additionalEvidence)
    d.additionalEvidence.requiredText = [
      "Pale Rider</div>",
      "10(27)",
      "active frames occur upon reaching the opponent or on frame 27 (whichever occurs first)",
    ];
policy.datasetId = "distance-held-stage2-2026-11-09-r1";
applyHeldReviews(ledger.candidates, review);
writeFileSync(
  "staging/held-range-review.json",
  JSON.stringify(review, null, 2) + "\n",
);
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
    ["accepted", "held", "excluded"].map((s) => [
      s,
      items.filter((x) => x.resolution === s).length,
    ]),
  ),
);
