import type { Character, Move, MoveInput } from "../../lib/frame-data/schema";
import { inputKey, isQuestionInput } from "../../lib/frame-data/input";
import { resolveMove } from "../../lib/frame-data/resolver";
export type MoveStatus =
  "技あり" | "技なし" | "除外" | "保留" | "条件付き" | "不明" | "複数候補";
export const recordStatus = (m: Move): MoveStatus =>
  m.adoption?.status === "excluded"
    ? "除外"
    : m.adoption?.status === "held"
      ? "保留"
      : m.variant.kind === "conditional"
        ? "条件付き"
        : m.adoption?.status === "accepted"
          ? "技あり"
          : "不明";
export function inventoryPatterns(
  characters: Character[],
  questions: MoveInput[],
): MoveInput[] {
  const patterns = new Map<string, MoveInput>();
  const add = (i: MoveInput) => {
    const key = inputKey(i),
      previous = patterns.get(key);
    if (!previous || JSON.stringify(i) < JSON.stringify(previous))
      patterns.set(key, i);
  };
  questions
    .filter(
      (i) =>
        i.type === "normal" || (i.type === "special" && i.includeSuperArts),
    )
    .forEach(add);
  for (const c of characters)
    for (const m of c.moves) {
      const i = m.input;
      add(
        i.type === "special" && isQuestionInput(i)
          ? { ...i, includeSuperArts: true }
          : i,
      );
    }
  const group = (i: MoveInput) =>
    i.type === "normal"
      ? i.direction === "5"
        ? 0
        : 1
      : i.type === "super_art"
        ? 3
        : i.motion === "none" || i.strength === "none"
          ? 4
          : 2;
  const strengths = ["L", "M", "H", "OD", "none"];
  return [...patterns.values()].sort(
    (a, b) =>
      group(a) - group(b) ||
      (a.type === "super_art" ? a.saLevel : 0) -
        (b.type === "super_art" ? b.saLevel : 0) ||
      (a.type !== "normal" ? a.motion : "").localeCompare(
        b.type !== "normal" ? b.motion : "",
        "en",
        { numeric: true },
      ) ||
      a.button.localeCompare(b.button, "en") * -1 ||
      strengths.indexOf(a.strength) - strengths.indexOf(b.strength) ||
      inputKey(a).localeCompare(inputKey(b)),
  );
}
export function inventoryRow(
  c: Character,
  input: MoveInput,
): { status: MoveStatus; records: Move[]; primary?: Move } {
  const records = c.moves.filter((m) =>
    input.type === "special" && input.includeSuperArts
      ? m.input.type !== "normal" &&
        m.input.motion === input.motion &&
        m.input.button === input.button &&
        m.input.strength === input.strength
      : inputKey(m.input) === inputKey(input),
  );
  const basic = records.filter(
    (m) => m.adoption?.status === "accepted" && m.variant.kind === "base",
  );
  if (basic.length > 1) return { status: "複数候補", records };
  if (basic.length === 1)
    return { status: "技あり", records, primary: basic[0] };
  if (records.length === 1)
    return { status: recordStatus(records[0]), records, primary: records[0] };
  if (records.length > 1) return { status: "複数候補", records };
  return {
    status:
      resolveMove(c, input, "normal").status === "not_found"
        ? "技なし"
        : "不明",
    records,
  };
}
