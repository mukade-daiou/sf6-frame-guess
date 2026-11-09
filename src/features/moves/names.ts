import names from "./japanese-names.json";
import type { Move } from "../../lib/frame-data/schema";
export function japaneseMoveName(characterId: string, move: Move): string {
  return (
    (names as Record<string, Record<string, string>>)[characterId]?.[move.id] ||
    move.name
  );
}
