import type { Character, MoveInput } from "./schema";
import type { Resolution } from "./resolver";
import { inputKey } from "./input";

// This resolver exposes source candidates for review. It never changes verification.
export function resolveReviewMove(
  character: Character,
  input: MoveInput,
  absentInputs: Record<string, string[]>,
): Resolution {
  const key = inputKey(input);
  const matches = character.moves.filter(
    (m) => m.variant.kind === "base" && inputKey(m.input) === key,
  );
  if (matches.length > 1)
    return {
      status: "review",
      frames: null,
      assessment: "ambiguous",
      reason: "同一入力の候補が複数あり、選択できません。",
    };
  if (!matches.length) {
    if (
      input.type === "special" &&
      input.strength !== "OD" &&
      character.moves.some(
        (m) =>
          m.input.type === "special" &&
          m.input.motion === input.motion &&
          m.input.button === input.button &&
          m.input.strength === "none",
      )
    )
      return {
        status: "review",
        frames: null,
        assessment: "not_recorded",
        reason: "強度なしの原典入力と個別ボタンの対応は未確定です。",
      };
    const absent = absentInputs[character.id]?.includes(key) ?? false;
    return {
      status: "review",
      frames: null,
      assessment: absent ? "source_absent" : "not_recorded",
      reason: absent
        ? "調査した原典の対象範囲には技なし。現行パッチでの不存在は未確認。"
        : "入力に対応するデータが未収録です。技の不存在を意味しません。",
    };
  }
  return {
    status: "review",
    frames: matches[0].frames,
    assessment: "recorded",
    reason:
      input.type === "special" && input.strength === "OD"
        ? "未検証の原典候補。ODは弱＋中で入力する仕様ですが、原典PP/KKの数値との対応は未確認です。"
        : "未検証の原典候補。条件付き値・不明値は確定していません。",
  };
}
