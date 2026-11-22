import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import {
  characterSchema,
  inputSchema,
  type Character,
} from "../src/lib/frame-data/schema";
import { inputKey, isQuestionInput } from "../src/lib/frame-data/input";
import { digest } from "./reviewed-updates";
import { excludedInputReason } from "./source-scope";
// @ts-ignore shared official normalization
import { normalize } from "./lib/source-scan.mjs";

export function approvedCharacterNames(
  names: any,
  id: string,
): { nameJa: string; nameEn: string } {
  if (
    !names ||
    Object.keys(names).sort().join(",") !== "nameEn,nameJa" ||
    [names.nameJa, names.nameEn].some(
      (n) => typeof n !== "string" || !n.trim() || n !== n.trim() || n === id,
    )
  )
    throw new Error(
      "Explicit approved Japanese and English character names required",
    );
  return { nameJa: names.nameJa, nameEn: names.nameEn };
}

// Proposals only: no raw/Cargo references are manufactured for official rows.
export function officialCandidate(
  source: any,
  id: string,
  version: string,
  retrievedAt: string,
  names?: { nameJa: string; nameEn: string },
) {
  const normalized = normalize(source, id);
  const url = new URL(source.url);
  const officialSlug =
    (
      {
        akuma: "gouki_akuma",
        dee_jay: "deejay",
        e_honda: "ehonda",
        m_bison: "vega_mbison",
      } as Record<string, string>
    )[id] ?? id;
  if (
    url.hostname !== "www.streetfighter.com" ||
    url.pathname !== `/6/ja-jp/character/${officialSlug}/frame`
  )
    throw new Error("Official character identity mismatch");
  if (
    source.gameVersion &&
    source.gameVersion !== "UNVERIFIED" &&
    source.gameVersion !== version
  )
    throw new Error("Official game version mismatch");
  const evidence = {
    url: source.url,
    retrievedAt,
    gameVersion: version,
    kind: "official",
    attribution: "CAPCOM",
    license: "Official frame data; rights retained by CAPCOM",
    verification: "unverified",
  };
  const rows = normalized.moves.map((row: any) => {
    const normal = /^(立ち|しゃがみ)(弱|中|強)(P|K)/.exec(row.name);
    const level = /^SA([123])/.exec(row.name);
    // This official command normal uses a motion in the game's command tab.
    const stomping =
      id === "zangief" &&
      row.section === "特殊技" &&
      row.name === "ストンピング（1段目）" &&
      row.commandText.trim() === "中" &&
      row.raw.commandImages
        .map((url: string) => url.split("/").at(-1))
        .join(" ") === "key-d.png key-d.png key-plus.png icon_kick_m.png";
    const category =
      row.section === "通常技"
        ? "normal"
        : row.section === "必殺技" || stomping
          ? "special"
          : row.section === "スーパーアーツ"
            ? "super_art"
            : null;
    const excluded =
      (!category &&
        ["特殊技", "通常投げ", "共通システム"].includes(row.section)) ||
      (!stomping &&
        /ホールド|派生|段目|空中|ジャンプ|CA|コンボ/.test(
          row.name + row.commandText,
        ));
    let inputs: any[] = [];
    if (category === "normal" && normal)
      inputs = [
        {
          type: "normal",
          direction: normal[1] === "立ち" ? "5" : "2",
          button: normal[3],
          strength: ({ 弱: "L", 中: "M", 強: "H" } as any)[normal[2]],
        },
      ];
    else if (category !== "normal")
      for (const q of row.commands) {
        if (q.unknown.length || !q.motion || !q.button) continue;
        if (
          row.raw.commandImages.filter((u: string) =>
            /\/icon_(?:punch|kick)/.test(u),
          ).length > 2 &&
          !row.raw.commandImages.some((u: string) => u.endsWith("/key-or.png"))
        )
          continue;
        if (
          q.strength === "OD" &&
          !["l", "m"].every((s) =>
            row.raw.commandImages.some((url: string) =>
              url.endsWith(
                `/icon_${q.button === "P" ? "punch" : "kick"}_${s}.png`,
              ),
            ),
          )
        )
          continue;
        const motion = q.charge
          ? q.motion.replace(/^([2486])/, "[$1]")
          : q.motion;
        for (const strength of q.strength === "none"
          ? ["L", "M", "H"]
          : [q.strength]) {
          const input = {
            type: category,
            motion,
            button: q.button,
            strength,
            ...(level
              ? {
                  saLevel: Number(level[1]),
                  adoptionBasis: "Official normal SA strength input",
                }
              : {}),
          };
          if (category === "super_art" && !level) continue;
          if (
            inputSchema.safeParse(input).success &&
            !excludedInputReason(`${motion}${q.button}${strength}`) &&
            isQuestionInput(input as any)
          )
            inputs.push(input);
        }
      }
    const uncertain =
      // Only known non-frame annotations are harmless; mixed or unknown notes
      // still require review. Preserve all source text verbatim below.
      row.notes
        .split(/\r?\n/)
        .some(
          (line: string) =>
            line.trim() &&
            ![
              "連打キャンセル対応",
              "強制立ち効果",
              "ハイジャンプキャンセル可能",
            ].includes(line.trim()),
        ) ||
      /Lv|レベル|ストック|電刃|飲酒|設置|[（(].*(?:状態|限定)/.test(
        row.name + row.commandText,
      ) ||
      (!inputs.length && !excluded);
    const classification = excluded
      ? "excluded"
      : uncertain
        ? "held"
        : "accepted";
    const value = (f: string) => {
      const v = row.frames[f];
      return v.status === "numeric"
        ? {
            status: "confirmed",
            display:
              stomping && f === "hit" && v.value > 0 ? `+${v.value}` : v.raw,
            numeric: v.value,
          }
        : v.status === "not_applicable"
          ? { status: "not_applicable", display: "-" }
          : v.status === "special"
            ? { status: "confirmed", display: "D" }
            : { status: "unknown", display: null };
    };
    const direct = /^全体\s*\d+$/.test(row.raw.recovery.trim());
    const total = row.whiffTotal
      ? {
          status: "confirmed",
          display: String(row.whiffTotal.value),
          numeric: row.whiffTotal.value,
          provenance: direct ? "source" : "verified_calculation",
          calculation: direct ? null : row.whiffTotal.evidence,
        }
      : {
          status: "unknown",
          display: null,
          provenance: null,
          calculation: null,
        };
    const moves = inputs.map((input: any) => ({
      id: `${id}__official_${digest(JSON.stringify(row.raw)).slice(0, 16)}_${input.strength}`,
      name: row.name,
      category,
      input,
      variant: excluded
        ? { kind: "conditional", condition: "Excluded official variant" }
        : { kind: "base", condition: null },
      frames: {
        startup: value("startup"),
        total,
        hit: value("hit"),
        block: value("block"),
      },
      notes: [
        row.notes.trim() ? row.notes : "Official ordinary-state row",
        `officialSource: ${JSON.stringify(row.raw)}`,
      ],
      source: evidence,
      adoption: {
        status: classification,
        basis:
          classification === "accepted"
            ? "Reviewed ordinary official command"
            : "Official condition or input requires review",
      },
      ...(category === "super_art"
        ? {
            saEvidence: {
              researchRecordId: `official:${row.officialId ?? row.name}`,
              officialRef: source.url,
              strengthBasis: "explicit_group",
              sourceNotation: { startup: row.raw.startup },
              frameOrigins: { startup: "source" },
              laterAttackStartup: null,
            },
          }
        : {}),
    }));
    return { sourceRow: row.raw, classification, moves };
  });
  const moves = rows.flatMap((r: any) => r.moves);
  for (const m of moves)
    if (
      m.adoption.status !== "excluded" &&
      moves.filter(
        (x: any) =>
          x.adoption.status !== "excluded" &&
          inputKey(x.input) === inputKey(m.input),
      ).length > 1
    ) {
      m.adoption.status = "held";
      m.variant = {
        kind: "conditional",
        condition: "Ambiguous official source input",
      };
    }
  const complete = (category: string) =>
    rows
      .filter(
        (r: any) =>
          r.sourceRow.section ===
          (
            {
              normal: "通常技",
              special: "必殺技",
              super_art: "スーパーアーツ",
            } as any
          )[category],
      )
      .every(
        (r: any) =>
          r.classification === "excluded" ||
          (r.moves.length > 0 &&
            r.moves.every((m: any) => m.adoption.status === "accepted")),
      );
  const accepted = moves.filter((m: any) => m.adoption.status === "accepted");
  const normalComplete =
    complete("normal") &&
    new Set(
      accepted
        .filter((m: any) => m.category === "normal")
        .map((m: any) => inputKey(m.input)),
    ).size === 12;
  const saComplete =
    complete("super_art") &&
    [1, 2, 3].every((l) =>
      ["L", "M", "H"].every(
        (s) =>
          accepted.filter(
            (m: any) =>
              m.category === "super_art" &&
              m.input.saLevel === l &&
              m.input.strength === s,
          ).length === 1,
      ),
    );
  const specialComplete =
    complete("special") &&
    rows.some((r: any) => r.sourceRow.section === "必殺技") &&
    [
      ...new Set(
        accepted
          .filter((m: any) => m.category === "special")
          .map((m: any) => `${m.input.motion}/${m.input.button}`),
      ),
    ].every((key) =>
      ["L", "M", "H", "OD"].every((s) =>
        accepted.some(
          (m: any) =>
            m.category === "special" &&
            `${m.input.motion}/${m.input.button}` === key &&
            m.input.strength === s,
        ),
      ),
    );
  const unclassified = rows.some(
    (r: any) =>
      r.classification === "held" &&
      !["通常技", "必殺技", "スーパーアーツ"].includes(r.sourceRow.section),
  );
  const coverage = (ok: boolean) => ({
    status: ok && !unclassified ? "complete" : "partial",
    verification: "unverified",
  });
  const character = characterSchema.parse({
    id,
    ...(names
      ? approvedCharacterNames(names, id)
      : { nameJa: "名称未承認", nameEn: "Name pending approval" }),
    gameVersion: version,
    source: evidence,
    adoption: {
      status:
        normalComplete &&
        specialComplete &&
        saComplete &&
        rows.every((r: any) => r.classification !== "held")
          ? "accepted"
          : "held",
      basis: "Reviewed official source scope",
    },
    coverage: {
      normal: coverage(normalComplete),
      special: coverage(specialComplete),
      super_art: coverage(saComplete),
    },
    moves,
  });
  return { character, rows };
}

export function loadOfficialCharacter(
  decision: any,
  version: string,
  batches: any[],
): Character {
  const bytes = readFileSync(decision.officialSource);
  if (digest(bytes) !== decision.sourceHash)
    throw new Error("Official source hash mismatch");
  const stored = JSON.parse(readFileSync(decision.candidatePath, "utf8"));
  const generated = officialCandidate(
    JSON.parse(bytes.toString()),
    decision.id,
    version,
    decision.retrievedAt,
    approvedCharacterNames(decision.names, decision.id),
  ).character;
  const approvals = batches
    .flatMap((b) => b.decisions)
    .filter((d) => d.kind === "add_character" && d.characterId === decision.id);
  if (
    approvals.length !== 1 ||
    !isDeepStrictEqual(approvals[0].names, decision.names) ||
    !isDeepStrictEqual(approvals[0].character, generated) ||
    !isDeepStrictEqual(stored, generated) ||
    decision.sourceInventoryComplete !==
      (generated.adoption?.status === "accepted")
  )
    throw new Error("Official candidate/coverage mismatch");
  return generated;
}
