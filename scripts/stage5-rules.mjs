import { cleanSource } from "./stage4-rules.mjs";

// Deliberately specific to reviewed source rows, not a general frame calculator.
const totals = {
  "ken:2MP": [
    "22(24)",
    "24",
    /2f extra recovery on whiff/,
    "空振り時24F、接触時22F。原典注記に空振り時2F追加と明記。",
  ],
  "ken:5HK": [
    "36(38)",
    "38",
    /2 extra recovery frames on whiff/,
    "空振り時38F、接触時36F。原典注記に空振り時2F追加と明記。",
  ],
  "marisa:5MP": [
    "25(27)",
    "27",
    /2f extra recovery on whiff/,
    "空振り時27F、接触時25F。原典注記に空振り時2F追加と明記。",
  ],
  "marisa:214K": [
    "54(144)",
    "54",
    /extended an extra 90f by holding/,
    "非ホールド・反撃なし・派生なし54F、最大ホールド144F。原典注記に90F延長と明記。",
  ],
  "marisa:214KK": [
    "57(87)",
    "57",
    /extended an extra 30f by holding/,
    "非ホールド・反撃なし・派生なし57F、最大ホールド87F。原典注記に30F延長と明記。",
  ],
};

export function interpretField(characterId, input, field, row, wikiText = "") {
  const column = {
    startup: "startup",
    total: "total",
    hit: "hitAdv",
    block: "blockAdv",
  }[field];
  const original = cleanSource(row[column]);
  const notes = cleanSource(row.notes);
  const extra =
    field === "total" ? { provenance: "source", calculation: null } : {};
  function result(value, condition, resolved) {
    return {
      original,
      value: { ...value, ...extra },
      condition,
      interpretationResolved: resolved,
      patchConfirmed: false,
    };
  }
  const known = totals[`${characterId}:${input}`];
  if (
    field === "total" &&
    known &&
    original === known[0] &&
    known[2].test(notes)
  )
    return result(
      { status: "confirmed", display: known[1], numeric: Number(known[1]) },
      known[3],
      true,
    );
  if (original === "-")
    return result(
      { status: "not_applicable", display: "-" },
      "原典に適用対象外を明記。",
      true,
    );
  if (!original || original.includes("{{{"))
    return result(
      { status: "unknown", display: null },
      "原典の値なし。",
      false,
    );
  if (field === "hit" && /^(?:H?KD)\s+[+-]?\d+$/.test(original))
    return result(
      { status: "confirmed", display: "D" },
      "原典のKD/HKDをダウン表示Dへ変換。ダウン後有利Fを通常硬直差として扱わない。",
      true,
    );
  if (/^[+-]?\d+$/.test(original)) {
    if (field === "startup" && characterId === "marisa" && input === "214KK")
      return result(
        {
          status: "conditional",
          display: original,
          numeric: Number(original),
          condition: "構えの開始に関する1F。攻撃判定の発生とは区別。",
        },
        "Wiki本文にFull Body Armor開始1Fを明記。出題に自動適用しない。",
        wikiText.includes("1-28(58)f"),
      );
    if (field === "total" && /extra recovery on whiff/.test(notes))
      return result(
        {
          status: "conditional",
          display: original,
          numeric: Number(original),
          condition:
            "原典に空振り追加硬直あり。total欄が追加分を含むか未確定。",
        },
        "空振り全体Fの対応未確定。",
        false,
      );
    return result(
      { status: "confirmed", display: original, numeric: Number(original) },
      "原典の単一値。パッチ・空振り全体Fの独立検証を意味しない。",
      true,
    );
  }
  let condition = "原典の複合表記。各数値の適用条件を未確定のまま保持。";
  let resolved = false;
  if (
    characterId === "ken" &&
    /^623[LMH]K$/.test(input) &&
    field === "startup" &&
    /only hit airborne/.test(notes)
  ) {
    condition =
      "括弧外は空中相手にのみ当たる最初の発生。括弧内は地上相手に当たる発生。相手状態を指定する出題条件がないため自動選択しない。";
    resolved = true;
  }
  if (
    characterId === "ken" &&
    input === "623KK" &&
    field === "startup" &&
    /only hit standing opponents/.test(notes)
  ) {
    condition =
      "初期判定は空中限定、次の3Fは立ち限定。その後しゃがみに当たる。9(19)の19がどの区切りに対応するか追加確認が必要。";
  }
  if (
    ((characterId === "ken" && /^623[MH]K$/.test(input)) ||
      (characterId === "ken" && input === "623KK") ||
      (characterId === "marisa" && /^623(?:[LMH]P|PP)$/.test(input))) &&
    ["hit", "block"].includes(field) &&
    /crouching opponents/.test(notes)
  ) {
    condition =
      "括弧内はしゃがみ相手、括弧外は立ち相手。相手状態を指定する出題条件がないため複合値を保持。";
    if (input === "623PP" && field === "hit")
      condition =
        "壁到達時はHKD+138 Wall Splat、それ以外はKD+70 Tumble。壁距離を指定しない出題には単一値を適用しない。";
    resolved = true;
  }
  if (
    characterId === "ken" &&
    input === "623HP" &&
    field === "block" &&
    /3rd hit whiffs vs. crouch block/.test(notes)
  ) {
    condition =
      "立ちガード-36、しゃがみガードは3段目が空振りして-38。相手状態未指定のため自動選択しない。";
    resolved = true;
  }
  if (
    characterId === "ken" &&
    input === "214HK" &&
    ["hit", "block"].includes(field) &&
    /2nd and 3rd hits whiff on crouching/.test(notes)
  ) {
    condition =
      field === "hit"
        ? "立ちヒットはKD+36、しゃがみヒットは-38。2・3段目がしゃがみに空振りする。KDと通常硬直差を統合しない。"
        : "立ちガード-12、しゃがみガード-42。2・3段目がしゃがみに空振りする。";
    resolved = true;
  }
  if (characterId === "marisa" && input === "214K" && field === "startup") {
    condition =
      "原典3(8)。3Fはアーマー開始、8Fは派生受付。直接攻撃の発生として扱わない。";
    resolved =
      wikiText.includes("3-28(118)f") && /follow-ups after 8f/.test(notes);
  }
  if (characterId === "marisa" && input === "236KK" && field === "hit") {
    condition =
      "Wall Splat。原典注記では壁から遠いほどダウン有利が増える。50(68)の各距離条件は未確定。";
  }
  if (characterId === "ken" && input === "2HK" && field === "total")
    condition =
      "原典34(37)。ガード時は固定27Fの硬直という注記はあるが、括弧内が空振り全体Fかは未確定。計算補完しない。";
  return result(
    { status: "conditional", display: original, condition },
    condition,
    resolved,
  );
}

export function classifyRow(row, candidate) {
  const input = row.input.numpad;
  if (candidate)
    return {
      disposition: "adopt",
      reason: "既存対象候補。値・入力・パッチの検証結果は別途参照。",
    };
  if (row.category === "special" && input === "KK")
    return {
      disposition: "unsupported_input",
      reason:
        "通常状態から使う奮迅脚は対象範囲に含む。モーションなしの二ボタン入力を現行スキーマで表せない。ODへ統合しない。",
    };
  if (
    /Counter/.test(row.name.en) &&
    /Automatically triggers counterattack/.test(row.notes?.en ?? "")
  )
    return {
      disposition: "out_of_scope",
      reason: "アーマー吸収後の自動反撃。構え開始技と区別。",
    };
  if (/[~>]/.test(input))
    return { disposition: "out_of_scope", reason: "派生技・構え中限定技。" };
  if (/\[[LMH]?[PK]+\]/.test(input))
    return { disposition: "out_of_scope", reason: "ホールド版。" };
  if (!["normal", "special"].includes(row.category))
    return {
      disposition: "out_of_scope",
      reason: "通常技・地上必殺技以外のカテゴリ。",
    };
  if (row.category === "normal")
    return {
      disposition: "out_of_scope",
      reason: "立ち・しゃがみの基本12通常技以外。",
    };
  if (/^j\./.test(input))
    return { disposition: "out_of_scope", reason: "空中必殺技。" };
  return {
    disposition: "unmatched_source",
    reason: "採用候補との対応未確定。",
  };
}
