#!/usr/bin/env node
/**
 * SF6 community snapshot -> DATA_SPEC.md v1.0.0 staging JSON.
 * This DOES NOT certify patch consistency, move completeness or official accuracy.
 * It never modifies data/characters or data/metadata.json.
 *
 * Usage:
 *   node scripts/collect-supercombo.mjs --all
 *   node scripts/collect-supercombo.mjs --character marisa --character ryu
 *   node scripts/collect-supercombo.mjs --source-dir ./local-upstream --all
 *   node scripts/collect-supercombo.mjs --source-dir ./local-upstream --character ryu
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import process from "node:process";

export const PINNED_REF = "a0b4105fb368c308699ec0757ee6e4182e5a9d1c";
export const UPSTREAM = "RyoSogawa/sf6-sensei";
export const GAME_VERSION = "UNVERIFIED"; // A staging marker, NOT a real game patch.
const AUTHOR = "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei (normalization)";
const LICENSE = "CC-BY-SA-4.0";
const NORMAL = /^([52])([LMH])([PK])$/;
const SPECIAL = /^([0-9[\]]+)(LP|MP|HP|LK|MK|HK|PP|KK|P|K)$/;
const POSITIVE = /^[+]?\d+(?:\.\d+)?$/;
const NONNEGATIVE = /^\d+(?:\.\d+)?$/;
const MAX_SIZE = 3_000_000;

const names = {
  aki: ["A.K.I.", "A.K.I."], akuma: ["豪鬼", "Akuma"], alex: ["アレックス", "Alex"],
  arjun: ["アルジュン", "Arjun"], blanka: ["ブランカ", "Blanka"],
  cammy: ["キャミィ", "Cammy"], chunli: ["春麗", "Chun-Li"],
  cviper: ["C.ヴァイパー", "C. Viper"], dee_jay: ["ディージェイ", "Dee Jay"],
  dhalsim: ["ダルシム", "Dhalsim"], e_honda: ["エドモンド本田", "E. Honda"],
  ed: ["エド", "Ed"], elena: ["エレナ", "Elena"],
  guile: ["ガイル", "Guile"], ingrid: ["イングリッド", "Ingrid"],
  jamie: ["ジェイミー", "Jamie"], jp: ["JP", "JP"],
  juri: ["ジュリ", "Juri"], ken: ["ケン", "Ken"],
  kimberly: ["キンバリー", "Kimberly"], lily: ["リリー", "Lily"],
  luke: ["ルーク", "Luke"], m_bison: ["ベガ", "M. Bison"],
  mai: ["不知火舞", "Mai"], manon: ["マノン", "Manon"],
  marisa: ["マリーザ", "Marisa"], rashid: ["ラシード", "Rashid"],
  ryu: ["リュウ", "Ryu"], sagat: ["サガット", "Sagat"],
  terry: ["テリー", "Terry"], yasmine: ["ヤスミン", "Yasmine"],
  zangief: ["ザンギエフ", "Zangief"],
};
const moveStr = (v) => String(v ?? "").trim();
const withSign = (v, signed) => signed && Number(v) > 0 ? `+${v}` : `${v}`;
function frame(value, { signed = false } = {}) {
  if (value === null || value === undefined || value === "") {
    return { status: "unknown", display: null };
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return { status: "confirmed", display: withSign(value, signed), numeric: value };
  }
  const s = String(value).trim();
  if (!s || s === "?") return { status: "unknown", display: null };
  if (s === "-") return { status: "not_applicable", display: "-" };
  if (s === "D") return { status: "confirmed", display: "D" };
  if (/^[+-]?\d+(?:\.\d+)?$/.test(s)) {
    const n = Number(s);
    return { status: "confirmed", display: withSign(s.replace(/^\+/, ""), signed), numeric: n };
  }
  // Nontrivial source notation must not become a falsely confirmed plain number.
  return { status: "conditional", display: s, condition: "原典の複合表記。通常状態での意味は未照合" };
}
function totalFrame(raw) {
  const value = frame(raw);
  if (value.status === "confirmed") return { ...value, provenance: "source", calculation: null };
  return { ...value, provenance: null, calculation: null };
}
function parseInput(move) {
  const raw = moveStr(move?.input?.numpad).toUpperCase();
  const matchNormal = NORMAL.exec(raw);
  if (move.category === "normal" && matchNormal) {
    const [, direction, strength, button] = matchNormal;
    return { type: "normal", direction, button, strength };
  }
  if (move.category !== "special") return null;
  const matchSpecial = SPECIAL.exec(raw);
  if (!matchSpecial) return null;
  const [, motion, suffix] = matchSpecial;
  if (!/^\d+$/.test(motion) && !/^\[[1-9]\]\d+$/.test(motion)) return null;
  const button = suffix.slice(-1);
  const strength = suffix === "PP" || suffix === "KK" ? "OD"
    : suffix.length === 1 ? "none" : suffix[0];
  return { type: "special", motion, button, strength };
}
function key(input) {
  return input.type === "normal"
    ? `normal:${input.direction}:${input.button}:${input.strength}`
    : `special:${input.motion}:${input.button}:${input.strength}`;
}
function isConditionalSource(move) {
  const name = moveStr(move?.name?.en);
  const input = moveStr(move?.input?.numpad);
  return /\bDenjin Charge (?:Hadoken|Hashogeki)\b/i.test(name)
    || /\((?:Counter|Hold|Charged|Level\s*\d+|Lv\.?\s*\d+)\)/i.test(name)
    || /(?:Psycho Mine|Enhanced|Windclad|Fully Charged)/i.test(name)
    || /(?:~|>|\bj\.|\+|\(CA\))/i.test(input);
}
function normalName(input) {
  const names = { L: "弱", M: "中", H: "強" };
  return `${input.direction === "5" ? "立ち" : "しゃがみ"}${names[input.strength]}${input.button}`;
}
function mkSource(raw) {
  const s = raw?.source ?? {};
  const url = s.url?.startsWith("https://")
    ? s.url : "https://wiki.supercombo.gg/w/Street_Fighter_6";
  const fetchedAt = s.fetchedAt;
  if (!(typeof fetchedAt === "string" && !isNaN(Date.parse(fetchedAt)))) {
    throw new Error(`Missing/invalid source.fetchedAt for ${url}`);
  }
  return {
    url,
    retrievedAt: new Date(fetchedAt).toISOString(),
    gameVersion: GAME_VERSION,
    kind: "community",
    attribution: AUTHOR,
    license: LICENSE,
    verification: "unverified"
  };
}
function makeMove(characterId, item, input, parentSource) {
  const src = mkSource(item?.source?.fetchedAt ? item : { source: parentSource });
  const id = `${characterId}__${key(input).replace(/:/g, "_")}`;
  const rawName = moveStr(item?.name?.ja || item?.name?.en || id);
  const name = input.type === "normal" ? normalName(input) : rawName;
  const notes = [];
  if (item?.input?.numpad) notes.push(`upstreamInput: ${item.input.numpad}`);
  if (item?.name?.en) notes.push(`upstreamName: ${item.name.en}`);
  if (item?.notes?.en) notes.push(`upstreamNotes: ${item.notes.en}`);
  if (item?.active != null) notes.push(`upstreamActive: ${item.active}`);
  if (item?.recovery != null) notes.push(`upstreamRecovery: ${item.recovery}`);
  if (item?.onHit != null && Number(item.onHit) >= 20) {
    notes.push("HIT VALUE WARNING: may represent knockdown advantage, not standard hitstun advantage.");
  }
  return {
    id, name, category: input.type, input,
    variant: { kind: "base", condition: null },
    frames: {
      startup: frame(item.startup),
      total: totalFrame(item.totalFrames),
      hit: frame(item.onHit, { signed: true }),
      block: frame(item.onBlock, { signed: true }),
    },
    notes, source: src,
  };
}
function recordIssue(out, reason, item) {
  out.push({
    reason,
    input: moveStr(item?.input?.numpad),
    name: moveStr(item?.name?.en),
    category: moveStr(item?.category),
  });
}
export function convert(raw) {
  if (!raw || !Array.isArray(raw.moves) || !raw.id || !names[raw.id])
    throw new Error("Invalid character file or unknown character id");
  const groups = new Map();
  const issues = [];
  for (const item of raw.moves) {
    if (!["normal", "special"].includes(item.category)) continue;
    const input = parseInput(item);
    if (!input) { recordIssue(issues, "out_of_scope_or_unsupported_input", item); continue; }
    const k = key(input);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ item, input });
  }
  const output = [];
  for (const [k, candidates] of groups) {
    const base = candidates.filter(({ item }) => !isConditionalSource(item));
    if (base.length !== 1) {
      // Do not invent a winner; exclude this key rather than emitting duplicate base moves.
      for (const { item } of candidates) recordIssue(issues, "unresolved_base_collision:" + k, item);
      continue;
    }
    output.push(makeMove(raw.id, base[0].item, base[0].input, raw.source));
    for (const { item } of candidates) {
      if (item !== base[0].item) recordIssue(issues, "excluded_conditional_variant:" + k, item);
    }
  }
  output.sort((a,b) => a.id.localeCompare(b.id));
  const normalKeys = new Set(output.filter(m=>m.category==="normal").map(m=>key(m.input)));
  const expectedNormalKeys = [];
  for (const direction of ["5","2"]) {
    for (const button of ["P","K"]) {
      for (const strength of ["L","M","H"]) {
        expectedNormalKeys.push(`normal:${direction}:${button}:${strength}`);
      }
    }
  }
  const missingNormals = expectedNormalKeys.filter(k=>!normalKeys.has(k));
  const rawSource = mkSource(raw);
  return {
    character: {
      id: raw.id,
      nameJa: names[raw.id][0], nameEn: names[raw.id][1],
      gameVersion: GAME_VERSION, source: rawSource,
      // Not "complete". User validation against current official data is pending.
      coverage: {
        normal: { status: "partial", verification: "unverified" },
        special: { status: "partial", verification: "unverified" },
      },
      moves: output,
    },
    audit: {
      characterId: raw.id,
      rawMoveCount: raw.moves.length,
      candidateMoveCount: output.length,
      candidateNormals: output.filter(m=>m.category==="normal").length,
      candidateSpecials: output.filter(m=>m.category==="special").length,
      upstreamFetchedAt: raw?.source?.fetchedAt ?? null,
      missingNormals, excluded: issues,
      gameVersion: GAME_VERSION,
      status: "STAGING_ONLY",
    },
  };
}

async function fetchText(url, token) {
  const headers = { "User-Agent": "sf6-guess-frame-data-staging/1.0",
    "Accept": "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    if (response.status === 429 || response.status >= 500) {
      if (attempt < 2) { await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); continue; }
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
    const data = await response.text();
    if (data.length > MAX_SIZE) throw new Error(`Response too large: ${url}`);
    return data;
  }
  throw new Error(`Failed: ${url}`);
}
const filename = (id) => `packages/data/src/generated/${id}.json`;
async function characterIds(sourceDir) {
  if (sourceDir) return Object.keys(names);
  const url = `https://api.github.com/repos/${UPSTREAM}/contents/packages/data/src/generated?ref=${PINNED_REF}`;
  const rows = JSON.parse(await fetchText(url, process.env.GITHUB_TOKEN));
  if (!Array.isArray(rows)) throw new Error("Unexpected GitHub directory response");
  return rows.filter(x=>x.type==="file"&&x.name.endsWith(".json"))
    .map(x=>x.name.slice(0,-5)).filter(id=>!!names[id]).sort();
}
async function readUpstream(id, sourceDir) {
  if (sourceDir) return JSON.parse(await readFile(join(sourceDir,`${id}.json`),"utf-8"));
  const url = `https://raw.githubusercontent.com/${UPSTREAM}/${PINNED_REF}/${filename(id)}`;
  return JSON.parse(await fetchText(url));
}
export async function collect({ ids, sourceDir = null, outDir }) {
  const allIds = ids?.length ? [...new Set(ids)] : await characterIds(sourceDir);
  if (allIds.some(id=>!names[id])) throw new Error("Unknown characters: " + allIds.filter(id=>!names[id]).join(", "));
  const report = {
    mode: "unverified-community-staging",
    upstream: `https://github.com/${UPSTREAM}`,
    upstreamRef: PINNED_REF,
    dataLicense: LICENSE,
    generatedAt: new Date().toISOString(),
    count: 0, failures: [], characters: [],
  };
  await mkdir(join(outDir,"characters"), { recursive: true });
  for (const id of allIds) {
    try {
      const raw = await readUpstream(id, sourceDir);
      if (raw.id !== id) throw new Error(`ID mismatch: ${raw.id}`);
      const { character, audit } = convert(raw);
      await writeFile(join(outDir,"characters",`${id}.json`), JSON.stringify(character,null,2)+"\n");
      await writeFile(join(outDir,`${id}.audit.json`), JSON.stringify(audit,null,2)+"\n");
      report.characters.push({ id, ...Object.fromEntries(
        ["rawMoveCount","candidateMoveCount","candidateNormals","candidateSpecials",
         "upstreamFetchedAt","missingNormals"].map(k=>[k,audit[k]]) ),
        excludedCount:audit.excluded.length });
      report.count++;
    } catch(error) { report.failures.push({id, reason:String(error)}); }
  }
  await writeFile(join(outDir,"collection-report.json"),JSON.stringify(report,null,2)+"\n");
  return report;
}
function argsOf(argv) {
  const cfg = { ids: [], outDir: resolve("staging/sf6-frame-data") };
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(a==="--all"){cfg.ids=[];}
    else if(a==="--character"){cfg.ids.push(argv[++i]);}
    else if(a==="--source-dir"){cfg.sourceDir=resolve(argv[++i]);}
    else if(a==="--output"){cfg.outDir=resolve(argv[++i]);}
    else if(a==="--help"){console.log("node scripts/collect-supercombo.mjs [--all | --character ID ...] [--source-dir DIR] [--output DIR]");process.exit(0);}
    else throw new Error(`Unknown option: ${a}`);
  }
  return cfg;
}
if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  collect(argsOf(process.argv.slice(2))).then(r=>{
    console.log(JSON.stringify({written:r.count, failed:r.failures,
      summary:r.characters.map(({id,candidateNormals,candidateSpecials,excludedCount}) =>
        ({id,candidateNormals,candidateSpecials,excludedCount}))},null,2));
    if(r.failures.length) process.exitCode = 1;
  }).catch(e=>{console.error(e);process.exitCode=1;});
}
