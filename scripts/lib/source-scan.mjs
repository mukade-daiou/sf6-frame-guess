import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  commands,
  total,
  candidates,
} from "../../staging/official-verification/compare.mjs";
import { diffSnapshots } from "./snapshot-diff.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
export function frame(raw) {
  const text = raw.trim();
  if (!text) return { status: "unknown", raw };
  if (/^[-−—]$/.test(text)) return { status: "not_applicable", raw };
  if (/^[+-]?\d+$/.test(text))
    return { status: "numeric", value: Number(text), raw };
  if (/^(?:KD|HKD|D)$/.test(text)) return { status: "special", raw };
  if (/^[+-]?\d+\s*[~～]\s*[+-]?\d*$/.test(text))
    return { status: "range", raw };
  return { status: "conditional", raw };
}
export function normalize(source, id) {
  if (
    source.control !== "CLASSIC" ||
    !Array.isArray(source.rows) ||
    !source.rows.length
  )
    throw new Error("Expected nonempty saved official CLASSIC rows");
  const moves = source.rows.map((r) => {
    for (const f of [
      "name",
      "section",
      "startup",
      "active",
      "recovery",
      "hit",
      "block",
      "notes",
    ])
      if (typeof r[f] !== "string") throw new Error(`Invalid row field: ${f}`);
    if (
      !Array.isArray(r.commandImages) ||
      !r.commandImages.every((x) => typeof x === "string")
    )
      throw new Error("Invalid commandImages");
    return {
      officialId: r.officialId ?? null,
      name: r.name,
      section: r.section,
      commandText: r.commandText ?? "",
      commands: commands(r),
      frames: Object.fromEntries(
        ["startup", "active", "recovery", "hit", "block"].map((f) => [
          f,
          frame(r[f]),
        ]),
      ),
      notes: r.notes,
      whiffTotal: total(r),
      sourceRow: r.row ?? null,
      raw: r,
    };
  });
  return { id, moves };
}
const comparable = (m) => {
  const { sourceRow, raw, ...value } = m;
  return value;
};
const input = (m) => JSON.stringify([m.section, m.commands]);
// Match unique stable identifiers first, then exact name/input, then a unique
// name or input. Ambiguous groups stay unresolved; never pair by array index.
export function compareSources(before, after) {
  const events = [],
    left = new Map(before.map((c) => [c.id, c])),
    right = new Map(after.map((c) => [c.id, c]));
  for (const id of [...new Set([...left.keys(), ...right.keys()])].sort()) {
    const a = left.get(id),
      b = right.get(id);
    if (!a || !b) {
      events.push({
        characterId: id,
        kind: a ? "character_removed" : "character_added",
        state: "candidate",
        before: a ?? null,
        after: b ?? null,
      });
      continue;
    }
    const old = new Set(a.moves),
      next = new Set(b.moves),
      pairs = [];
    for (const key of [
      (m) => m.officialId && `${m.section}/${m.officialId}`,
      (m) => `${m.name}/${input(m)}`,
      (m) => `${m.section}/${m.name}`,
      input,
    ]) {
      for (const x of [...old]) {
        const k = key(x);
        if (!k) continue;
        const xs = [...old].filter((m) => key(m) === k),
          ys = [...next].filter((m) => key(m) === k);
        if (xs.length === 1 && ys.length === 1) {
          pairs.push([x, ys[0]]);
          old.delete(x);
          next.delete(ys[0]);
        }
      }
    }
    for (const [x, y] of pairs) {
      // Thin source adapter: do not compare volatile row numbers or raw cells.
      const changes = diffSnapshots(
        [{ id, moves: [{ id: "matched", ...comparable(x) }] }],
        [{ id, moves: [{ id: "matched", ...comparable(y) }] }],
      );
      events.push({
        characterId: id,
        kind: changes.length ? "move_changed" : "unchanged",
        state: changes.length ? "candidate" : "unchanged",
        before: x,
        after: y,
        changes,
      });
    }
    for (const [rows, other, kind] of [
      [old, next, "move_removed"],
      [next, old, "move_added"],
    ])
      for (const m of rows) {
        const ambiguous =
          [...other].some((n) => n.name === m.name || input(n) === input(m)) ||
          [...rows].filter((n) => n.name === m.name || input(n) === input(m))
            .length > 1;
        events.push({
          characterId: id,
          kind,
          state: ambiguous ? "unmatched" : "candidate",
          before: kind === "move_removed" ? m : null,
          after: kind === "move_added" ? m : null,
        });
      }
  }
  return events.sort((a, b) =>
    JSON.stringify([
      a.characterId,
      a.kind,
      a.before?.name,
      a.after?.name,
      a.before?.commands,
      a.after?.commands,
    ]).localeCompare(
      JSON.stringify([
        b.characterId,
        b.kind,
        b.before?.name,
        b.after?.name,
        b.before?.commands,
        b.after?.commands,
      ]),
    ),
  );
}
export function classify(events, production, policy) {
  const protections = [];
  function walk(v, path = []) {
    if (!v || typeof v !== "object") return;
    if (typeof v.moveId === "string")
      protections.push({ path: path.join("."), decision: v });
    for (const [k, x] of Object.entries(v)) walk(x, [...path, k]);
  }
  walk(policy);
  return events.map((e) => {
    if (["source_error", "unchanged"].includes(e.state)) return e;
    const c = production.find((c) => c.id === e.characterId);
    const row = e.after ?? e.before;
    if (!c || !row?.raw)
      return {
        ...e,
        state: "needs_review",
        reason: "Character addition/removal requires roster review",
      };
    const matches = c.moves.filter(
      (m) => candidates(m, c, { rows: [row.raw] }).length,
    );
    const protectedRows = protections.filter((p) =>
      matches.some(
        (m) =>
          p.decision.moveId === m.id ||
          p.decision.moveId === m.strengthExpansion?.sourceMoveId,
      ),
    );
    const held = matches.filter((m) => m.adoption?.status !== "accepted");
    return {
      ...e,
      state:
        e.state === "unmatched" || matches.length !== 1
          ? "unmatched"
          : protectedRows.length ||
              held.length ||
              !e.after ||
              Object.values(row.frames).some((f) =>
                ["conditional", "unknown"].includes(f.status),
              )
            ? "needs_review"
            : "candidate",
      productionMoveIds: matches.map((m) => m.id),
      retainedDecisions: protectedRows,
      held: held.map((m) => ({ id: m.id, adoption: m.adoption })),
      reason:
        "Source comparison only; production adoption requires human review",
    };
  });
}
export function markdown(manifest, events) {
  const safe = (v) =>
    JSON.stringify(v ?? null)
      .replaceAll("|", "\\|")
      .replaceAll("<", "&lt;");
  return `# Official source scan\n\nRun: ${manifest.id}\n\nStatus: ${manifest.status}\n\nInputs (SHA-256):\n${manifest.inputs.map((i) => `- ${i.side}/${i.characterId}: ${i.origin} (${i.hash ?? "unavailable"}), ${i.status}${i.error ? `: ${i.error}` : ""}`).join("\n")}\n\n| Character | Kind | State | Before | After | Evidence / reason |\n| --- | --- | --- | --- | --- | --- |\n${events.map((e) => `| ${safe(e.characterId)} | ${e.kind} | ${e.state} | ${safe(e.before && comparable(e.before))} | ${safe(e.after && comparable(e.after))} | ${safe(e.reason ?? e.error ?? e.changes ?? [])} |`).join("\n")}\n`;
}
export async function scan({
  baseline,
  incoming,
  output = "staging/verification/update-scans",
  production,
  policy,
  fetcher = fetch,
}) {
  const id = `${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}`;
  const root = resolve(output, id);
  await mkdir(join(root, "raw"), { recursive: true });
  const manifest = {
    schemaVersion: 1,
    id,
    createdAt: new Date().toISOString(),
    status: "success",
    inputs: [],
    inventories: [],
    contextHash: hash(JSON.stringify({ production, policy })),
  };
  async function load(spec, side) {
    const result = [];
    const base = resolve(spec);
    // A manifest declares scope explicitly. A missing entry is a deletion only
    // when both inventories declare themselves complete.
    const inventoryBytes = await readFile(join(base, "inventory.json"));
    await writeFile(
      join(root, "raw", `${side}-inventory.json`),
      inventoryBytes,
    );
    const inventory = JSON.parse(inventoryBytes.toString("utf8"));
    manifest.inventories.push({
      side,
      path: join(base, "inventory.json"),
      hash: hash(inventoryBytes),
      complete: inventory.complete,
    });
    if (
      !Array.isArray(inventory.characters) ||
      typeof inventory.complete !== "boolean"
    )
      throw new Error("Invalid inventory");
    const seen = new Set();
    for (const item of inventory.characters) {
      if (!/^[a-z0-9_-]+$/.test(item.id) || seen.has(item.id))
        throw new Error("Invalid/duplicate character ID");
      seen.add(item.id);
      const entry = {
        side,
        characterId: item.id,
        origin: item.file ? resolve(base, item.file) : item.url,
        acquiredAt: new Date().toISOString(),
        status: "failed",
        hash: null,
        gameVersion: null,
        versionEvidence: null,
      };
      manifest.inputs.push(entry);
      try {
        let bytes;
        if (item.file) bytes = await readFile(resolve(base, item.file));
        else {
          const url = new URL(item.url);
          if (
            url.protocol !== "https:" ||
            url.hostname !== "www.streetfighter.com"
          )
            throw new Error("Only official HTTPS URLs supported");
          const response = await fetcher(url, {
            signal: AbortSignal.timeout(30000),
            redirect: "error",
          });
          bytes = Buffer.from(await response.arrayBuffer());
          entry.httpStatus = response.status;
          entry.hash = hash(bytes);
          await writeFile(join(root, "raw", `${side}-${item.id}.raw`), bytes);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        entry.hash = hash(bytes);
        await writeFile(join(root, "raw", `${side}-${item.id}.raw`), bytes);
        const source = JSON.parse(bytes.toString("utf8"));
        entry.sourceUrl = source.url ?? item.url ?? null;
        entry.sourceRetrievedOn = source.retrievedOn ?? null;
        entry.gameVersion =
          source.gameVersion === "UNVERIFIED"
            ? null
            : (source.gameVersion ?? null);
        entry.versionEvidence = source.versionEvidence ?? null;
        if (!entry.versionEvidence) entry.gameVersion = null;
        const c = normalize(source, item.id);
        result.push(c);
        entry.status = source.complete === false ? "partial" : "success";
      } catch (error) {
        entry.error = error.message;
      }
    }
    return {
      characters: result,
      complete:
        inventory.complete &&
        manifest.inputs
          .filter((i) => i.side === side)
          .every((i) => i.status === "success"),
    };
  }
  let before = { characters: [], complete: false },
    after = before,
    events = [];
  try {
    before = await load(baseline, "before");
    after = await load(incoming, "after");
  } catch (error) {
    events.push({
      state: "source_error",
      kind: "inventory_error",
      characterId: null,
      error: error.message,
    });
  }
  const failed = manifest.inputs.filter((i) => i.status !== "success");
  events.push(
    ...failed.map((i) => ({
      state: "source_error",
      kind: "source_error",
      characterId: i.characterId,
      error: i.error ?? "Partial source",
      side: i.side,
    })),
  );
  if (before.complete && after.complete)
    events.push(
      ...classify(
        compareSources(before.characters, after.characters),
        production,
        policy,
      ),
    );
  else {
    // Partial inventories can compare successful common characters but cannot
    // establish any character or move deletion safely.
    const good = (id) =>
      ["before", "after"].every((s) =>
        manifest.inputs.some(
          (i) => i.side === s && i.characterId === id && i.status === "success",
        ),
      );
    events.push(
      ...classify(
        compareSources(
          before.characters.filter((c) => good(c.id)),
          after.characters.filter((c) => good(c.id)),
        ),
        production,
        policy,
      ),
    );
    events.push({
      state: "source_error",
      kind: "incomplete_scope",
      characterId: null,
      error:
        "Incomplete inventory; additions/deletions outside successful common scope are unverified",
    });
  }
  if (events.some((e) => e.state === "source_error"))
    manifest.status = "partial_or_failed";
  for (const [file, value] of [
    ["context.json", { production, policy }],
    ["manifest.json", manifest],
    ["normalized.json", { before, after }],
    ["diff.json", events],
  ])
    await writeFile(join(root, file), JSON.stringify(value, null, 2) + "\n");
  await writeFile(join(root, "report.md"), markdown(manifest, events));
  return { root, manifest, events };
}
