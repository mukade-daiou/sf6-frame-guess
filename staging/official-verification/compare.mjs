import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const dir = "staging/official-verification";
const names = read("src/features/moves/japanese-names.json");
const manual = read(`${dir}/manual-mappings.json`);
const directions = {
  d: "2",
  dr: "3",
  r: "6",
  ur: "9",
  u: "8",
  ul: "7",
  l: "4",
  dl: "1",
};
function parseImages(images) {
  let motion = "",
    button = "",
    strength = "none",
    count = 0,
    unknown = [],
    charge = false;
  for (const url of images) {
    const file = url.split("/").pop().replace(".png", "");
    if (/^key-/.test(file)) {
      const key = file.slice(4);
      if (directions[key]) motion += directions[key];
      else if (["lc", "dc", "rc"].includes(key)) {
        motion += directions[key[0]];
        charge = true;
      } else if (key === "circle") motion += "360";
      else if (!["plus"].includes(key)) unknown.push(file);
    } else {
      const m = /^icon_(punch|kick)(?:_([lmh]))?$/.exec(file);
      if (m) {
        button = m[1] === "punch" ? "P" : "K";
        count++;
        if (m[2]) strength = m[2].toUpperCase();
      } else unknown.push(file);
    }
  }
  if (count === 2) strength = "OD";
  if (motion === "360360") motion = "720";
  return { motion, button, strength, unknown, charge };
}
export function commands(row) {
  const groups = [[]];
  let hasButton = false;
  for (const image of row.commandImages) {
    if (image.endsWith("/key-or.png")) {
      groups.push([]);
      hasButton = false;
      continue;
    }
    if (
      hasButton &&
      /\/key-(?:d|dr|r|ur|u|ul|l|dl|lc|dc|rc|circle)\.png$/.test(image)
    ) {
      groups.push([]);
      hasButton = false;
    }
    groups.at(-1).push(image);
    if (image.includes("/icon_")) hasButton = true;
  }
  const parsed = groups.map(parseImages);
  for (let i = 1; i < parsed.length; i++)
    if (!parsed[i].motion) {
      parsed[i].motion = parsed[i - 1].motion;
      parsed[i].charge = parsed[i - 1].charge;
    }
  return parsed;
}
export function command(row) {
  return commands(row)[0];
}
const clean = (x) =>
  x
    .replace(/[\s・]/g, "")
    .replace(/^(?:(?:弱|中|強|OD|SA[123]))+/, "")
    .replace(/[（(].*$/, "")
    .replace(/Lv\.1$/, "");
const basicRow = (r) =>
  !(
    /ホールド|Lv[.．]?[23]|当身派生|（2段目）|射出/.test(r.name) ||
    /ホールド/.test(r.commandText)
  );
export function candidates(m, c, source) {
  if (m.category === "normal")
    return source.rows.filter(
      (r) => r.section === "通常技" && r.name.startsWith(m.name) && basicRow(r),
    );
  const display = names[c.id]?.[m.id] ?? m.name;
  return source.rows.filter((r) => {
    if (
      r.section !== (m.category === "super_art" ? "スーパーアーツ" : "必殺技")
    )
      return false;
    if (!basicRow(r)) return false;
    if (
      m.category === "super_art" &&
      !r.name.startsWith("SA" + m.input.saLevel)
    )
      return false;
    const motion = m.input.motion?.replace(/[\[\]]/g, "");
    if (
      !commands(r).some(
        (q) =>
          q.motion === motion &&
          q.button === m.input.button &&
          !q.unknown.length &&
          q.charge === m.input.motion.includes("[") &&
          (m.input.strength === "OD"
            ? q.strength === "OD"
            : q.strength !== "OD") &&
          (q.strength === "none" || q.strength === m.input.strength),
      )
    )
      return false;
    // Match the displayed Japanese base name as well as the full command.
    return clean(r.name) === clean(display);
  });
}
export function total(row) {
  if (
    /(?:段目|初段).*ヒット時.*派生|ヒット時.*(?:段目|最終段).*派生/.test(
      row.notes,
    )
  )
    return null;
  const raw = row.recovery.trim();
  const direct = /^全体\s*(\d+)$/.exec(raw);
  if (direct) {
    if (/空振り.*増加/.test(row.notes)) return null;
    return { value: Number(direct[1]), evidence: raw };
  }
  if (!/^\d+(?:-\d+)?(?:[.,]\d+(?:-\d+)?)*$/.test(row.active.trim()))
    return null;
  if (!/^\d+(?:\+着地後\d+)?$/.test(raw)) return null;
  const extra = [...row.notes.matchAll(/空振り時硬直(\d+)F増加/g)];
  if (/空振り|ヒット時.*硬直|ガード時.*硬直/.test(row.notes) && !extra.length)
    return null;
  const end = Number(row.active.match(/\d+/g).at(-1));
  const recovery = raw
    .match(/\d+/g)
    .map(Number)
    .reduce((a, b) => a + b, 0);
  const addition = extra.reduce((a, m) => a + Number(m[1]), 0);
  return {
    value: end + recovery + addition,
    evidence: `持続 ${row.active} の最終F ${end} + 硬直 ${raw}${addition ? " + " + extra.map((m) => m[0]).join(" / ") : ""}`,
  };
}
export function runComparison() {
  const results = [];
  const pending = [];
  for (const f of readdirSync("data/characters")
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const c = read("data/characters/" + f);
    let source;
    try {
      source = read(`${dir}/sources/${c.id}.json`);
    } catch {
      continue;
    }
    for (const m of c.moves.filter((m) => m.adoption.status === "accepted")) {
      const selection = manual[m.id];
      const options = selection
        ? source.rows.filter((r) =>
            (selection.rows ?? [selection.row]).includes(r.row),
          )
        : candidates(m, c, source);
      if (options.length !== 1 && !selection)
        pending.push({
          character: c.id,
          id: m.id,
          name: m.name,
          display: names[c.id]?.[m.id],
          input: m.input,
          options: options.map((r) => [r.row, r.name]),
        });
      const r = options.length === 1 || selection ? options[0] : null;
      const fields = {};
      for (const field of ["startup", "total", "hit", "block"]) {
        const fieldRows = r
          ? options.filter(
              (r) =>
                !selection?.fieldRows?.[field] ||
                selection.fieldRows[field].includes(r.row),
            )
          : [];
        const t = r && field === "total" ? total(fieldRows[0] ?? r) : null;
        const values = fieldRows.map((r) =>
          field === "total" ? total(r)?.value : r[field]?.trim(),
        );
        const distinct = [...new Set(values)];
        const value = distinct.length === 1 ? distinct[0] : null;
        const local = m.frames[field];
        const official = value == null ? "" : String(value);
        let status = "確認不能",
          reason = r
            ? "公式値が空欄、複合値、または全体Fの根拠不足"
            : "公式行の対応が一意に未確定";
        if (/^[+-]?\d+$|^D$|^-$/.test(official)) {
          if (local.status === "conditional" || local.range) {
            status = "条件違い";
            reason =
              "ローカルの条件付き・距離範囲と公式の単一代表条件を同一視しない";
          } else if (local.status === "unknown") {
            status = "確認不能";
            reason = "ローカル値が未確定。公式候補を記録";
          } else {
            status =
              String(local.display).replace(/^\+/, "") ===
              official.replace(/^\+/, "")
                ? "一致"
                : "不一致";
            reason = t?.evidence ?? "公式表の対応欄";
          }
        }
        if (r && distinct.length > 1) {
          status = "条件違い";
          reason = "共通強度の元レコードに対して公式の強度別値が異なる";
        }
        if (selection?.conditions?.[field]) {
          status = "条件違い";
          reason = selection.conditions[field];
        }
        fields[field] = {
          status,
          local: local.display,
          official: official || null,
          reason,
          officialByRow: fieldRows.map((r, i) => ({
            row: r.row,
            name: r.name,
            value: values[i] ?? null,
          })),
          calculation:
            field === "total" ? fieldRows.map((r) => total(r)) : null,
        };
      }
      results.push({
        characterId: c.id,
        moveId: m.id,
        name: m.name,
        input: m.input,
        variant: m.variant,
        representativeCondition: m.representativeCondition ?? null,
        localConditionEvidence: m.notes,
        source: source.url,
        row: r?.row ?? null,
        sourceRows: r ? options.map((r) => r.row) : [],
        mappingReason:
          selection?.reason ??
          "日本語技名・CLASSICコマンド画像・強度・基本状態を照合",
        officialName: r?.name ?? null,
        command: r ? command(r) : null,
        officialNotes: r
          ? options.map((r) => ({
              row: r.row,
              notes: r.notes,
              commandText: r.commandText,
            }))
          : null,
        fields,
      });
    }
  }
  for (const [name, value] of [
    ["results", results],
    ["pending-mappings", pending],
  ]) {
    const path = `${dir}/${name}.json`;
    if (process.argv.includes("--check")) {
      if (JSON.stringify(read(path)) !== JSON.stringify(value))
        throw Error(`Stale official verification: ${name}`);
    } else writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
  }
  console.log(
    JSON.stringify(
      {
        characters: new Set(results.map((x) => x.characterId)).size,
        moves: results.length,
        fields: results.length * 4,
        counts: results
          .flatMap((r) => Object.values(r.fields))
          .reduce((a, f) => ((a[f.status] = (a[f.status] ?? 0) + 1), a), {}),
        pending: pending.length,
      },
      null,
      2,
    ),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  runComparison();
