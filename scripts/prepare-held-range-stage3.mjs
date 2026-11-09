import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { applyHeldReviews } from "./held-range-review.mjs";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const review = read("staging/held-range-review.json"),
  policy = read("data/adoption-decisions.json"),
  ledger = read("staging/distance-range-candidates.json");
const dataset = Object.fromEntries(
  readdirSync("data/characters")
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const c = read(`data/characters/${f}`);
      return [c.id, c];
    }),
);
const text = readFileSync(
  "staging/held-range-stage3/companion-data.js",
  "utf8",
);
// Parse data as JSON, never execute downloaded JavaScript.
const publicData = JSON.parse(
  text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
);
const sources = [
  {
    id: "aki-guide",
    url: "https://st6-aki-laboratory.com/spcial.html",
    path: "staging/held-range-stage3/aki-guide.html",
    status: "HTTP200 本文取得",
    kind: "独自攻略解説・フレームメーター画像へのリンク",
    assessment:
      "SA2は単一-19と強度別距離の説明。強度内の距離別端点・測定相手は示されない。派生技の範囲は別入力なので転用しない。",
  },
  {
    id: "aki-specials",
    url: "https://kamigame.jp/streetfighter6/page/347497164038996719.html",
    path: "staging/held-range-stage3/aki-specials.html",
    status: "HTTP200 本文取得",
    kind: "攻略編集記事・2025-09-15更新",
    assessment:
      "蛇軽功は発生-・全体43/42の単一値。表裏別端点を含む実測表ではない。",
  },
  {
    id: "honda-guide",
    url: "https://kamigame.jp/streetfighter6/page/345071339649895161.html",
    path: "staging/held-range-stage3/honda-guide.html",
    status: "HTTP200 本文取得",
    kind: "攻略編集記事",
    assessment:
      "基本値やDR持続連携の説明。DR付与分を含む値や別通常技の数値を5HPの端点に流用しない。",
  },
  {
    id: "acqua-combo",
    url: "https://acqua-souken.com/book/combo/",
    path: "staging/held-range-stage3/acqua-combo.html",
    status: "HTTP200 本文取得",
    kind: "動画講座の書き起こし・解説",
    assessment:
      "JP前投げ後のTriglav持続+1は特定連携の一点。2026-03-17調整に関する旧連携への注意あり。入力強度/相手姿勢を固定した全域の端点表ではなく、リンク動画のフレームメーター未確認。",
  },
  {
    id: "honda-table",
    url: "https://frame-search.com/?character_name=E.Honda&lang=en-us",
    path: "staging/held-range-stage3/honda-table.html",
    status: "HTTP200 本文取得",
    kind: "公式由来データ検索・Ver.2.0401.010表記",
    assessment:
      "本田5HPは8/ヒット+1/ガード-6の単一値。距離別端点は未取得。独立実測資料ではない。",
  },
  {
    id: "companion-data",
    url: "https://raw.githubusercontent.com/mtgr18977/SF6-Companion-App/main/sf6-frame-data.js",
    path: "staging/held-range-stage3/companion-data.js",
    status: "HTTP200 本文取得",
    kind: "公開GitHubデータ・24キャラ",
    assessment:
      "別リポジトリだが原データ由来・測定条件・対象パッチ不明。単一値や別状態を収録し、独立検証とは認定しない。差分は全体更新へ使わない。",
  },
  {
    id: "sf6frame-readme",
    url: "https://raw.githubusercontent.com/prophetw/SF6Frame/main/README.md",
    path: "staging/held-range-stage3/sf6frame-readme.md",
    status: "HTTP200 本文取得",
    kind: "公開GitHub起き攻め計算器の一次ドキュメント",
    assessment:
      "持続と発生からの計算式。データ更新はscraper-puppeteer.tsによる収集。実測端点ログではなく計算結果から端点を生成しない。",
  },
  {
    id: "blanka-hitboxes",
    url: "https://www.ame-arare.com/sf6-blanka-hitboxes/",
    status:
      "Web抽出本文は閲覧可（2024-03-17表記）、通常curlは404。判定画像未確認",
    kind: "独自判定観察記事",
    assessment:
      "5HKの後半判定についての定性的説明。ヒット/ガード硬直差の端点はない。現在の画像検証結果を確認したとは扱わない。",
  },
  {
    id: "video-year2",
    url: "https://www.youtube.com/watch?v=w0CAWO76kEA",
    status: "Web取得エラー、動画本編未確認",
    kind: "検証動画候補",
    assessment: "検索断片は採用根拠にしない。",
  },
  {
    id: "video-year3",
    url: "https://www.youtube.com/watch?v=mSyhLPwy9QA",
    status: "Web Cache miss、動画本編未確認",
    kind: "持続当て検証動画候補",
    assessment: "検索断片は採用根拠にしない。",
  },
  {
    id: "reddit-ken",
    url: "https://www.reddit.com/r/StreetFighter/comments/1f6irmb/",
    status: "Web Cache miss、本文未取得",
    kind: "個人測定報告候補",
    assessment: "検索断片の+7を採用しない。",
  },
  {
    id: "ryu-reference",
    url: "https://github.com/zach-king-analytics/sf6-training/blob/main/ryu_reference.md",
    status: "Web HTTP404",
    kind: "GitHub資料候補",
    assessment: "本文未確認。",
  },
];
const groups = {
  strength: {
    label: "強度別距離範囲の未分離",
    queries: [
      "スト6 AKI SA2 弱 中 強 ガード 硬直差 検証",
      "スト6 エド SA2 弱 中 強 ガード 硬直差 距離 検証",
      "スト6 ベガ シャドウライズ 弱 中 強 発生 フレーム 検証",
    ],
    sourceIds: ["aki-guide", "companion-data"],
  },
  branch: {
    label: "表裏・別条件の未分離",
    queries: [
      "スト6 蛇軽功 全体 裏",
      "スト6 バックステップローリング ガード 持続",
    ],
    sourceIds: ["aki-guide", "aki-specials", "companion-data"],
  },
  parentheses: {
    label: "括弧・打撃段・姿勢の定義不足",
    queries: [
      "スト6 本田 立ち強P 持続 硬直差",
      "SF6 Siberian Express 81 frames",
      "SF6 Arjun 236LP spacing frames",
    ],
    sourceIds: ["honda-guide", "honda-table", "companion-data"],
  },
  endpoint: {
    label: "距離・持続依存の端点不足",
    queries: [
      "Ken 5HP meaty +7 +2 street fighter 6 frame meter",
      "スト6 キャミィ しゃがみ強P 持続 +10 +4 検証",
      "スト6 ブランカ 立ち強K 持続 硬直差",
      "JP トリグラフ 持続当て 硬直差 22 強度 検証",
      "スト6 ODヨガファイア 持続 検証",
    ],
    sourceIds: [
      "acqua-combo",
      "blanka-hitboxes",
      "video-year2",
      "video-year3",
      "reddit-ken",
      "companion-data",
    ],
  },
  correspondence: {
    label: "入力・代表状態の対応証拠不足",
    queries: [
      "github street fighter 6 frame data source hitstun active frames",
    ],
    sourceIds: ["companion-data", "sf6frame-readme", "ryu-reference"],
  },
};
const rows = review.items
  .filter((r) => r.resolution === "held")
  .map((r) => review.stage2.items.find((x) => x.key === r.key) || r)
  .filter((r) => r.resolution === "held");
if (
  rows.length !== 155 ||
  rows.filter((r) => r.group === "C").length !== 108 ||
  rows.filter((r) => r.group === "D").length !== 47
)
  throw Error("Stage3 baseline mismatch");
const aliases = { e_honda: "ehonda", dee_jay: "deejay", m_bison: "mbison" };
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, (m) =>
      /far|mid|close/i.test(m) ? "" : m.replace(/[()]/g, ""),
    )
    .replace(/[\[\]*\s]/g, "");
const items = rows.map((r) => {
  const original = r.before.before || r.before,
    field = r.field || original.field,
    character = dataset[original.characterId],
    moves = original.moveIds.map((id) =>
      character.moves.find((m) => m.id === id),
    );
  let cause =
    r.group === "D"
      ? "endpoint"
      : /[~]/.test(original.notation)
        ? "strength"
        : /[()]/.test(original.notation)
          ? "parentheses"
          : "correspondence";
  if (["aki/0/block", "ed/0/block", "m_bison/58/startup"].includes(r.key))
    cause = "strength";
  if (
    (original.characterId === "aki" &&
      [16, 18].includes(original.sourceIndex)) ||
    (original.characterId === "cammy" && original.sourceIndex === 4)
  )
    cause = "branch";
  const records =
    publicData[aliases[original.characterId] || original.characterId] || [];
  const matches = records.flatMap((m, index) =>
    normalize(m.input) === normalize(original.sourceRecord.input)
      ? [
          {
            index,
            input: m.input,
            name: m.name,
            value:
              m[
                {
                  startup: "startup",
                  hit: "onHit",
                  block: "onBlock",
                  total: "total",
                }[field]
              ] ?? null,
            notes: m.notes,
          },
        ]
      : [],
  );
  const cases = character.moves
    .filter((m) =>
      moves.some(
        (base) =>
          m.id === base.id || m.strengthExpansion?.sourceMoveId === base.id,
      ),
    )
    .filter((m) => m.input.strength !== "none")
    .map((m) => ({
      moveId: m.id,
      input: m.input,
      current: m.frames[field],
      representativeCondition:
        m.representativeCondition?.condition ??
        "通常状態・非ホールド・派生なし。既存の固定代表条件を維持",
    }));
  return {
    key: r.key,
    characterId: original.characterId,
    moveIds: original.moveIds,
    field,
    originalNotation: original.notation,
    group: r.group,
    resolution: "held",
    cause,
    availabilityChecked: true,
    searchScope:
      "原因グループ単位の新規資料探索＋公開GitHubデータの全項目対応候補照合。個別技の独立実測確認ではない",
    sourceIds: groups[cause].sourceIds,
    publicDatasetCheck: {
      characterPresent: records.length > 0,
      matches,
      assessment:
        "一致候補の単一値は端点証明にしない。別状態・強度が未分離の候補を含む。totalが欠ける場合recoveryから算出しない。由来・パッチ・測定条件不明。",
    },
    reason:
      "採用基準を満たす独立した同一条件の端点証拠が得られず保留継続。資料不足を対象外理由にしない。",
    nextEvidence: r.nextEvidence,
    measurement: {
      performed: false,
      environment:
        "SF6実機/トレーニング環境は未接続。以下は手順設計であり結果ではない",
      cases,
      opponent:
        "リュウ、通常状態、通常ヒットは立ち。ガードは原典で成立する同一姿勢に固定（下段のみしゃがみ）。対キャラ差を調べる場合は別試行",
      controls:
        "カウンター/パニカン/DR/バーンアウトはOFF。強度・溜め成立・ホールド/レベル/ストック・派生の有無は既存代表条件に固定",
      spacing:
        "画面中央の近・中・遠＋成立距離の境界。間合いを記録し、各強度を別々に試行",
      contactMethod:
        "入力履歴とフレームメーターを同時録画。コマ送りで赤い持続区間の先頭・末尾と接触位置を対応付ける。弾の飛翔と本体の持続は別に記録。判別できない場合は測定不能と記録",
      field,
      unknown:
        "この指標の同一代表条件内の端点・括弧の定義。基準値はcases.current参照",
      requiredResult:
        "最初/最後だけでなく途中の持続も走査し、通常ヒット/ガードの明示値と条件付き録画を提出。サンプルの最小最大を全条件の端点と断定しない。KDは通常硬直差にせず、全体Fは空振り試行を別収録",
    },
  };
});
review.stage3 = {
  baseline: review.stage3?.baseline ?? {
    counts: { accepted: 81, held: 155, excluded: 501 },
    decisions: policy.distanceRanges.decisions,
    datasetId: policy.datasetId,
    production: Object.fromEntries(
      Object.entries(dataset).map(([id, c]) => [
        id,
        {
          adoption: c.adoption,
          coverage: c.coverage,
          moves: c.moves.map((m) => ({
            id: m.id,
            input: m.input,
            adoption: m.adoption,
            frames: m.frames,
          })),
        },
      ]),
    ),
  },
  checkedAt: "2026-11-09",
  sources,
  groups,
  items,
  conclusion:
    "新規採用0・新規対象外0。同一条件の端点を保証する独立検証結果は取得できなかった。実測は未実施。",
};
applyHeldReviews(ledger.candidates, review);
writeFileSync(
  "staging/held-range-review.json",
  JSON.stringify(review, null, 2) + "\n",
);
writeFileSync(
  "staging/distance-range-candidates.json",
  JSON.stringify(ledger, null, 2) + "\n",
);
console.log(
  Object.fromEntries(
    Object.keys(groups).map((g) => [
      g,
      items.filter((x) => x.cause === g).length,
    ]),
  ),
);
