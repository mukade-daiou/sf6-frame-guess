import fs from "node:fs";
import assert from "node:assert/strict";
import { format } from "prettier";

const root = "staging/official-reevaluation/";
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const previous = read(root + "pending-reevaluation.json").unknown.filter(
  (r) => r.category === "公式欄が空欄またはダッシュ",
);
const comparisons = read(root + "results-after-additional-kd.json");
const result = previous.map((item) => {
  const comparison = comparisons.find((r) => r.moveId === item.moveId);
  assert(comparison);
  const field = comparison.fields[item.field];
  assert.equal(field.status, "確認不能");
  const character = read(`data/characters/${comparison.characterId}.json`);
  const move = character.moves.find((m) => m.id === item.moveId);
  assert(move);
  const corrected =
    /^aki__special_236_K_(L|M|H|OD)$/.test(item.moveId) &&
    item.field === "startup";
  const sunflare =
    item.moveId === "ingrid__coverage_6" && item.field === "startup";
  const armor =
    /^marisa__special_214_K_/.test(item.moveId) && item.field === "startup";
  const edHit = item.moveId === "ed__special_236_K_H" && item.field === "hit";
  assert.equal(
    move.frames[item.field].display,
    sunflare
      ? "47"
      : corrected
        ? "-"
        : armor
          ? item.moveId.endsWith("_OD")
            ? "1"
            : "3"
          : edHit
            ? "D"
            : field.local,
  );
  const official = read(
    `staging/official-verification/sources/${comparison.characterId}.json`,
  );
  const rows = comparison.sourceRows.map((n) =>
    official.rows.find((r) => r.row === n),
  );
  assert(rows.length && rows.every(Boolean));
  assert(
    rows.every((r) => !r[item.field] || /^[-―–ー]$/.test(r[item.field].trim())),
  );
  let classification = "判断不能";
  let reason =
    "公式欄に数値がない。技・条件・派生の意味から欄が適用対象外か、値の省略かは追加証拠が必要。";
  let priority = "通常";
  const id = item.moveId;
  const base = id.split("__strength_")[0];
  if (
    item.field === "startup" &&
    /^(aki__special_236_K_|blanka__special_22_P_none|chunli__special_214_P_none|ryu__special_22_P_none|dee_jay__special_\[2\]8_K_L)/.test(
      id,
    )
  ) {
    classification = "指標の違い";
    reason =
      "公式の発生欄は空欄。保存行では移動・構え・設置・強化発動の動作で、現在の数値を通常の攻撃判定発生と同一視できない。個別の値の意味を原典で確認する必要がある。";
    priority = "高：出題指標の確認";
  } else if (
    item.field === "startup" &&
    /^(blanka|guile|jamie|juri|yasmine)__super_art_2_/.test(id)
  ) {
    classification = "指標の違い";
    reason =
      "現行採用規則で非攻撃発動SAの発動値を保持している。公式の攻撃発生欄は空欄であり、発動1Fと攻撃判定発生は別指標。";
    priority = "高：出題指標の確認";
  } else if (
    ["hit", "block"].includes(item.field) &&
    /^(aki__special_236_K_|chunli__special_214_P_none|ryu__special_22_P_none|dee_jay__special_\[2\]8_K_L)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "公式行は移動・構え・強化動作で、当該動作自体の攻撃ヒット／ガード硬直差は成立しない。派生技は別条件。";
  } else if (
    ["hit", "block"].includes(item.field) &&
    /^(blanka|guile|jamie|juri|yasmine)__super_art_2_/.test(id)
  ) {
    classification = "該当なし";
    reason =
      "現行採用規則が非攻撃発動系SAとして扱う対象で、発動そのもののヒット／ガード硬直差は成立しない。";
  } else if (
    item.field === "block" &&
    /^(zangief__coverage_1[6-9]|alex__special_63214_P_|blanka__special_236_K_)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "保存行と技名から投げ技のガード硬直差は成立しない。投げ失敗・派生攻撃は別条件。";
  } else if (id.startsWith("dee_jay__normal_2_K_M") && item.field === "hit") {
    classification = "判断不能";
    reason =
      "公式備考はパニッシュカウンター時のダウンを記載する。通常ヒット値と混同する可能性があるため、現行Dの根拠と代表条件を再点検する。";
    priority = "高：通常ヒットとPCの確認";
  } else if (
    item.field === "startup" &&
    id.startsWith("zangief__super_art_2_")
  ) {
    classification = "判断不能";
    reason =
      "公式の対応行は空欄。入力・ホールドや派生行との関係を確認する必要があり、比較処理の不具合は未確定。";
    priority = "高：公式行マッピング確認";
  }
  if (corrected) {
    classification = "該当なし";
    reason =
      "Cargo・公式の全体時間と対応し、ODも原典備考に同じ側に移動する版の動作全体42Fと明記。成立時点の独立根拠がなく発生は-に修正。以前の比較値は履歴として保持。";
    priority = "修正済み";
  }
  if (
    classification === "判断不能" &&
    item.field === "startup" &&
    /^marisa__special_214_K_/.test(id)
  ) {
    classification = "公式未掲載";
    reason = id.includes("_OD")
      ? "公式発生欄は空欄。備考に1–28Fのアーマー受付と自動反撃があり、ユーザー指定で主要機能の成立1Fを採用。比較処理の不具合は確認されていない。"
      : "公式発生欄は空欄。備考に3–28Fのアーマー受付と自動反撃があり、ユーザー指定で主要機能の成立3Fを採用。比較処理の不具合は確認されていない。";
    priority = "修正済み";
  }
  if (
    classification === "判断不能" &&
    item.field === "block" &&
    id === "ed__special_236_K_H"
  ) {
    classification = "該当なし";
    reason =
      "公式備考とCargo双方が地上の相手には当たらないと明記。地上ガード時の硬直差は成立しない。";
  }
  if (
    classification === "判断不能" &&
    item.field === "hit" &&
    id === "ed__special_236_K_H"
  ) {
    classification = "公式未掲載";
    reason =
      "Cargoの通常強236HKはKD +51(+63)。ユーザー指定により空中ヒット後KDをDに修正。公式ヒット欄は空欄。";
    priority = "修正済み";
  }
  if (
    classification === "判断不能" &&
    ((item.field === "hit" && id === "guile__super_art_1_H") ||
      (/^dhalsim__super_art_2_[LMH]$/.test(id) &&
        ["hit", "block"].includes(item.field)))
  ) {
    classification = "公式未掲載";
    reason =
      "対応する通常原典行にヒット結果KDまたはガード値を記載し、本番のD／数値の由来を確認。公式対応行の同欄は空欄で、公式値の一致確認はできない。接触高さや多段条件・版は未検証。";
  }
  if (classification === "判断不能") {
    const unresolved = [
      [
        /^aki__special_214_P_M/,
        "毒溜まりの接触で毒状態になるが、接触によるヒット硬直・ヒット扱いが保存表だけでは確定しない。",
      ],
      [
        /^arjun__special_63214_P_/,
        "公式属性は上でガード欄が空。リカバリアブルダメージの特殊な成立条件があり、ガード可能性を示す独立根拠が必要。",
      ],
      [
        /^dee_jay__special_/,
        "フェイントであることは原典にあるが、固有の成立時点を発生Fとして採用できるかを示す記載がない。",
      ],
      [
        /^dhalsim__super_art_2_/,
        "Lv1非ホールドと空中・地上接触、複数弾の各条件におけるヒット／ガード結果の対応が不明。",
      ],
      [
        /^ed__special_236_K_H/,
        "地上に当たらず空中接触のみ。原典のKD後有利Fと公式空欄を通常条件として扱うかが未確定。",
      ],
      [
        /^guile__super_art_1_/,
        "上方向SAの接触高さと原典KD条件、公式の空欄との対応が不足。",
      ],
      [
        /^ingrid__super_art_2_/,
        "発動と後続の強度別飛び道具を分離し、公式行が示す段・発射条件の対応を確認する必要がある。",
      ],
      [
        /^jp__special_214_P_/,
        "空中ポータルの設置と派生・時間経過による攻撃を分け、元動作の通常hit/blockの意味を確認する必要がある。",
      ],
      [
        /^jp__special_22_K_/,
        "当身成立と後続爆弾が別条件であり、通常hit/blockと原典の対象欄の関係が確定しない。",
      ],
      [
        /^jp__super_art_2_/,
        "発動1Fと後続飛び道具の個別接触条件を分離し、公式空欄の意味を確認する必要がある。",
      ],
      [
        /^kimberly__/,
        "消失・再出現と追加入力可能時点を区別し、数字が主要機能の成立を表すか確認する必要がある。",
      ],
      [
        /^marisa__special_214_K_/,
        "構えと当身・派生の開始を分ける必要がある。無敵開始は原則採用せず、当身受付開始であることを明確にする必要がある。",
      ],
      [
        /^sagat__super_art_2_/,
        "初段と方向入力で変化する自動派生後のヒット結果を同じ欄として比較できるか未確認。",
      ],
      [
        /^yasmine__special_214_P_L/,
        "原典は移動フェイントと記載するが、効果成立時点または主要機能の成立を示す値がない。",
      ],
      [
        /^zangief__super_art_2_/,
        "その場・移動・ホールドと多段接続で行や終了条件が異なる可能性があり、公式空欄と原典値の対応を決められない。",
      ],
    ];
    reason = unresolved.find(([pattern]) => pattern.test(id))?.[1] || reason;
  }
  if (
    classification === "判断不能" &&
    item.field === "hit" &&
    /^jp__special_214_K_/.test(id)
  ) {
    classification = "公式未掲載";
    reason =
      "Cargo・rawは通常状態の飛び道具コマンド投げで地上ヒットする技と明記し、本番はD。対応する公式行のヒット欄は空欄。共通強度の元値とODを別に確認。";
  }
  if (
    classification === "判断不能" &&
    item.field === "block" &&
    id === "aki__special_214_P_M"
  ) {
    classification = "該当なし";
    reason =
      "原典は毒溜まりの接触効果はガード不可と明記。公式備考も接触による毒状態とし、通常ガード硬直差は存在しない。";
  }
  if (sunflare) {
    classification = "公式未掲載";
    reason =
      "非ホールド時ストック増加47Fを採用済み。公式発生欄は空欄で備考が47Fを明記。欄同士の比較が確認不能を返すのは想定どおりで、不具合は確認されていない。";
    priority = "修正済み";
  }
  if (
    classification === "判断不能" &&
    item.field === "block" &&
    /^(jamie__held_special_63214_K_|zangief__special_22_K_H)/.test(id)
  ) {
    classification = "該当なし";
    reason =
      "公式属性は投げでガード欄は空。ジェイミーはLv3の投げ、ザンギエフは当身成立後に投げ判定となるため通常ガード硬直差を持たない。";
  }
  if (
    classification === "判断不能" &&
    item.field === "hit" &&
    /^(dee_jay__normal_2_K_M|guile__special_\[4\]6_P_OD)$/.test(id)
  ) {
    classification = "公式未掲載";
    reason = id.startsWith("dee_jay")
      ? "ユーザー確認の通常KD・PC時HKDに対し、公式の通常ヒット欄は空欄。Dは維持。"
      : "保存Cargoの通常KDをDとして採用しているが、対応する公式通常ヒット欄は空欄。";
  }
  if (
    classification === "判断不能" &&
    ["hit", "block"].includes(item.field) &&
    /^(blanka__special_22_P_none|kimberly__special_214_P_OD|kimberly__coverage_5)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "原典と公式備考は人形の設置または消失・再出現と、それ以降の攻撃を区別している。元動作自体の通常ヒット／ガード硬直差はない。";
  }
  if (
    classification === "判断不能" &&
    ["hit", "block"].includes(item.field) &&
    /^(dee_jay__special_\[4\]6_P_L|yasmine__special_214_P_L|ingrid__coverage_6)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "保存rawがフェイントまたはストック補充と記載し、公式通常hit/block欄は空欄。元動作自体には攻撃の硬直差がない。";
  }
  if (
    classification === "判断不能" &&
    item.field === "startup" &&
    id === "ingrid__coverage_6"
  ) {
    classification = "比較処理の問題";
    reason =
      "公式発生欄は空だが公式備考に47F目のストック増加を明記。非攻撃効果の成立時点は採用可能であり、欄だけを比較すると備考の候補を拾えない。採用値は別途検討。";
    priority = "高：成立時点の採用判断";
  }
  if (
    classification === "判断不能" &&
    item.field === "startup" &&
    /^(jamie__special_22_P_none|kimberly__special_22_K_)/.test(id)
  ) {
    classification = "指標の違い";
    reason =
      "公式備考にストックまたは酔いLvの増加時点がある。原典値と成立時点の1F計数差を確認し、採用可能な効果成立時点と攻撃発生を区別する。";
    priority = "高：成立時点の1F差";
  }
  if (
    classification === "判断不能" &&
    item.field === "block" &&
    /^(alex__special_623_K_[LM]|jp__special_214_K_|lily__coverage_2[6-9])/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "保存rawは投げまたは空中投げと明記し、公式の通常ガード欄は空。通常ガード硬直差は成立しない。";
  }
  if (
    classification === "判断不能" &&
    ["hit", "block"].includes(item.field) &&
    /^(cammy__special_236_P_|dee_jay__special_214_K_none|dee_jay__special_236_K_L|elena__special_236_P_|jamie__special_22_P_none|kimberly__special_22_K_|kimberly__special_236_K_|luke__special_236_K_|m_bison__special_\[2\]8_K_|yasmine__special_236_K_)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "保存rawと公式備考は移動・補充・構え自体と追加攻撃を分けている。非攻撃の元動作に通常ヒット／ガード硬直差はない。";
  }
  if (
    classification === "判断不能" &&
    item.field === "startup" &&
    /^(cammy__special_236_P_|dee_jay__special_214_K_none|elena__special_236_P_|kimberly__special_236_K_|luke__special_236_K_|m_bison__special_\[2\]8_K_|yasmine__special_236_K_)/.test(
      id,
    )
  ) {
    classification = "指標の違い";
    reason =
      "原典に記載された追加入力・派生可能時点と公式の元動作欄は別指標。非攻撃の成立時点は採用可能だが、入力受付時点を成立時点として扱うかは個別判断が必要。";
    priority = "高：発生指標の意味を確認";
  }
  if (id === "dee_jay__normal_2_K_M" && item.field === "hit") {
    reason =
      "ユーザー確認：通常KD・PC時HKD。現行Dを維持。公式欄が空の理由は未確認。";
    priority = "通常";
  }
  if (
    classification === "判断不能" &&
    item.field === "block" &&
    /^(e_honda__special_63214_K_|lily__special_63214_P_|manon__special_63214_P_|manon__super_art_3_|lily__super_art_3_|zangief__far_63214_K_|zangief__super_art_[13]_)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "投げの成立を扱う通常版の公式欄と原典を照合。通常ガードの硬直差は成立しない。";
  }
  if (
    classification === "判断不能" &&
    ["hit", "block"].includes(item.field) &&
    /^(e_honda__special_22_K_none|e_honda__special_236_K_|marisa__special_214_K_)/.test(
      id,
    )
  ) {
    classification = "該当なし";
    reason =
      "原典の非攻撃強化・移動・構え自体のヒット／ガード欄は対象外。追加入力や当身後の反撃は別条件。";
  }
  if (
    classification === "判断不能" &&
    item.field === "startup" &&
    /^(e_honda__special_22_K_none|e_honda__special_236_K_)/.test(id) &&
    field.local !== "-"
  ) {
    classification = "指標の違い";
    reason =
      "原典と公式備考は強化または移動中の派生成立条件を示す。非攻撃の成立時点はユーザー指定により採用可能だが、表示値そのものがどの成立時点を表すかは引き続き要確認。";
  }
  return {
    characterId: comparison.characterId,
    moveId: id,
    expansionSource: base,
    field: item.field,
    input: move.input,
    current: move.frames[item.field].display,
    previousComparisonValue: field.local,
    officialRows: rows.map((r) => ({
      row: r.row,
      name: r.name,
      value: r[item.field] ?? null,
      notes: r.notes,
      startup: r.startup,
      active: r.active,
      recovery: r.recovery,
      hit: r.hit,
      block: r.block,
    })),
    localEvidence: comparison.localConditionEvidence,
    classification,
    reason,
    priority,
    source: `staging/official-verification/sources/${comparison.characterId}.json`,
    currentPatch: "UNVERIFIED",
  };
});
assert.equal(result.length, 408);
assert.equal(
  new Set(result.map((r) => `${r.characterId}/${r.moveId}/${r.field}`)).size,
  408,
);
const counts = Object.fromEntries(
  ["該当なし", "指標の違い", "公式未掲載", "比較処理の問題", "判断不能"].map(
    (c) => [c, result.filter((r) => r.classification === c).length],
  ),
);
const output = {
  basis: "pending-reevaluation.json の公式欄空欄・ダッシュ408件",
  scope:
    "保存済み公式行と本番値を全件機械照合。明示的に判断できた技群のみ分類し、それ以外は判断不能。",
  counts,
  records: result,
};
fs.writeFileSync(
  root + "blank-fields-audit.json",
  await format(JSON.stringify(output), { parser: "json" }),
);
console.log(
  JSON.stringify(
    {
      counts,
      high: result
        .filter((r) => r.priority.startsWith("高"))
        .map((r) => [r.moveId, r.field, r.current]),
    },
    null,
    2,
  ),
);
