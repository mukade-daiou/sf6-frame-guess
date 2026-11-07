import type { Character, Move } from "./schema";
import { isQuestionInput } from "./input";

export const commonStrengthRule =
  "ユーザー指定: 強度未指定の採用済み基本必殺技の共通値をL/M/Hのゲーム用代表値へ展開。実性能一致を保証せず、ODは生成しない。";
export function auditStrengthless(character: Character) {
  const originals = character.moves.filter((m) => !m.strengthExpansion);
  return originals
    .filter(
      (m) =>
        m.category === "special" &&
        m.input.type === "special" &&
        m.input.strength === "none",
    )
    .map((m) => {
      if (m.input.type !== "special") throw new Error("Unexpected input");
      const input = m.input;
      const status = m.adoption?.status;
      const classification =
        status === "excluded"
          ? "excluded"
          : input.motion === "none"
            ? "simultaneous"
            : status === "held"
              ? "held"
              : m.variant.kind !== "base"
                ? "conditional"
                : status === "accepted" &&
                    isQuestionInput({ ...input, strength: "L" })
                  ? "expandable"
                  : "unaccepted_or_unsupported";
      const strengths = (["L", "M", "H"] as const).map((strength) => ({
        strength,
        explicitMoveIds: originals
          .filter(
            (p) =>
              p.category === "special" &&
              p.input.type === "special" &&
              p.input.motion === input.motion &&
              p.input.button === input.button &&
              p.input.strength === strength,
          )
          .map((p) => p.id),
      }));
      return {
        characterId: character.id,
        sourceMoveId: m.id,
        motion: input.motion,
        button: input.button,
        status,
        variant: m.variant,
        classification,
        strengths,
      };
    });
}
export function generateStrengthExpansions(character: Character): Move[] {
  return auditStrengthless(character)
    .filter((row) => row.classification === "expandable")
    .flatMap((row) => {
      const source = character.moves.find((m) => m.id === row.sourceMoveId)!;
      if (source.input.type !== "special")
        throw new Error("Expected special source");
      const input = source.input;
      return row.strengths
        .filter((s) => s.explicitMoveIds.length === 0)
        .map(({ strength }) => ({
          ...structuredClone(source),
          id: `${source.id}__strength_${strength}`,
          input: { ...input, strength },
          adoption: { status: "accepted" as const, basis: commonStrengthRule },
          notes: [
            ...source.notes,
            commonStrengthRule,
            `strengthSourceMoveId: ${source.id}`,
          ],
          strengthExpansion: {
            sourceMoveId: source.id,
            basis: commonStrengthRule,
          },
        }));
    });
}
export function withStrengthExpansions(character: Character): Character {
  return {
    ...character,
    moves: [
      ...character.moves.filter((m) => !m.strengthExpansion),
      ...generateStrengthExpansions(character),
    ],
  };
}
