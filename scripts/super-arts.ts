import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  moveSchema,
  type Move,
  type FrameValue,
} from "../src/lib/frame-data/schema";

export const researchPath = "staging/sa-research/inventory.json";
export function readSAResearch() {
  const inventory = JSON.parse(readFileSync(researchPath, "utf8"));
  if (inventory.records.length !== 199)
    throw new Error("SA research inventory incomplete");
  for (const r of inventory.records) {
    const bytes = readFileSync(r.sourceRef.path);
    if (createHash("sha256").update(bytes).digest("hex") !== r.sourceRef.sha256)
      throw new Error(`SA source changed: ${r.id}`);
    const row = JSON.parse(bytes.toString()).moves[
      Number(r.sourceRef.jsonPointer.split("/").at(-1))
    ];
    if (JSON.stringify(row) !== JSON.stringify(r.originalRecord))
      throw new Error(`SA source mismatch: ${r.id}`);
    for (const c of r.cargo.candidates) {
      const saved = JSON.parse(readFileSync(r.cargo.path, "utf8"));
      const index = Number(c.jsonPointer.split("/").at(-2));
      if (
        JSON.stringify(saved.data.cargoquery[index].title) !==
        JSON.stringify(c.record)
      )
        throw new Error(`Cargo mismatch: ${r.id}`);
    }
  }
  return inventory;
}
const unknown = (): FrameValue => ({ status: "unknown", display: null });
export function adoptSAFrame(
  text: string | null,
  field: string,
  r: any,
): FrameValue {
  if (!text || text.includes("{{{"))
    return r.saType === "activation" && field !== "startup"
      ? { status: "not_applicable", display: "-" }
      : unknown();
  if (text === "-") return { status: "not_applicable", display: "-" };
  if (field === "hit" && /\b(?:HKD|KD)\b/.test(text))
    return /\d/.test(text) ? { status: "confirmed", display: "D" } : unknown();
  const numeric = /^([+-]?\d+)(?:\s*\(.*\))?$/.exec(text);
  if (numeric)
    return {
      status: "confirmed",
      display: numeric[1],
      numeric: Number(numeric[1]),
    };
  // Preserve a directly saved scalar for the pre/post-freeze notation. No sums.
  if (
    field === "startup" &&
    /^\d+\+\d+$/.test(text) &&
    typeof r.originalRecord.startup === "number"
  )
    return {
      status: "confirmed",
      display: String(r.originalRecord.startup),
      numeric: r.originalRecord.startup,
    };
  return unknown();
}
export function generateSuperArts(inventory: any, characterId: string): Move[] {
  const rows = inventory.records.filter(
    (r: any) =>
      r.characterId === characterId &&
      r.baseStatus.startsWith("base") &&
      r.edition === "normal",
  );
  const moves: Move[] = [];
  for (const saLevel of [1, 2, 3] as const) {
    const group = rows.filter((r: any) => r.saLevel === saLevel);
    if (!group.length) throw new Error(`Missing SA${saLevel}: ${characterId}`);
    for (const strength of ["L", "M", "H"] as const) {
      const explicit = group.filter((r: any) =>
        r.inputDetails.explicitStrengths.includes(strength),
      );
      const shared = group.filter(
        (r: any) => !r.inputDetails.explicitStrengths.length,
      );
      const candidates = explicit.length ? explicit : shared;
      if (candidates.length !== 1)
        throw new Error(
          `Ambiguous SA strength: ${characterId}/${saLevel}/${strength}`,
        );
      const r = candidates[0];
      const basis = r.strength
        ? "explicit"
        : r.inputDetails.explicitStrengths.length
          ? "explicit_group"
          : "user_common";
      const adoptionBasis =
        basis === "user_common"
          ? "SA-D1: 原典共通値を各強度のゲーム用代表値へ採用。実性能の同一性を保証しない。"
          : "原典の明示的な対象強度を優先。";
      const frames = Object.fromEntries(
        ["startup", "total", "hit", "block"].map((f) => [
          f,
          adoptSAFrame(
            r.sourceValues.cargo[0].frames[f].cleanedForComparison,
            f,
            r,
          ),
        ]),
      );
      const total = {
        ...frames.total,
        provenance: frames.total.status === "confirmed" ? "source" : null,
        calculation: null,
      };
      const origins = Object.fromEntries(
        Object.entries(frames).map(([f, v]) => [
          f,
          v.status === "unknown"
            ? "unresolved"
            : !r.sourceValues.cargo[0].frames[f].cleanedForComparison &&
                r.saType === "activation"
              ? "activation_missing_rule"
              : "source",
        ]),
      );
      moves.push(
        moveSchema.parse({
          id: `${characterId}__super_art_${saLevel}_${strength}`,
          name: r.name.en,
          category: "super_art",
          input: {
            type: "super_art",
            saLevel,
            motion: r.motion,
            button: r.buttonType,
            strength,
            adoptionBasis,
          },
          variant: { kind: "base", condition: null },
          frames: { ...frames, total },
          adoption: { status: "accepted", basis: adoptionBasis },
          source: {
            ...r.source,
            attribution: "SuperCombo Wiki contributors",
            license: r.originalRecord.source.license,
          },
          notes: [
            adoptionBasis,
            `upstreamInput: ${r.inputNotation}`,
            `upstreamNotes: ${r.originalRecord.notes?.en || "None"}`,
            "startup compound notation uses saved raw scalar, never computed; freeze definition remains unverified.",
          ],
          saEvidence: {
            researchRecordId: r.id,
            rawRef: `${r.sourceRef.path}#${r.sourceRef.jsonPointer}`,
            cargoRef: `${r.cargo.path}#${r.cargo.candidates[0].jsonPointer}`,
            strengthBasis: basis,
            sourceNotation: Object.fromEntries(
              Object.entries(r.sourceValues.cargo[0].frames).map(
                ([f, v]: [string, any]) => [f, v.cleanedForComparison],
              ),
            ),
            frameOrigins: origins,
            laterAttackStartup: r.frameMeaning,
          },
        }),
      );
    }
  }
  return moves;
}
export function classifySARows(inventory: any) {
  return inventory.records.map((r: any) => ({
    id: r.id,
    characterId: r.characterId,
    saLevel: r.saLevel,
    classification:
      r.baseStatus.startsWith("base") && r.edition === "normal"
        ? "adopted"
        : "excluded",
    reason:
      r.baseStatus.startsWith("base") && r.edition === "normal"
        ? "SA-D1/D4 ground base"
        : r.conditions.join(", "),
  }));
}
