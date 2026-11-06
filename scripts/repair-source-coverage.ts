// Explicit, offline repair of saved source rows. Never fetches or updates at app startup.
import { readFile, writeFile } from "node:fs/promises";
import { characterSchema } from "../src/lib/frame-data/schema";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const decisions = await read("data/adoption-decisions.json");
const write = process.argv.includes("--write");
const added = [];
for (const id of ["zangief", "lily", "kimberly", "ingrid"]) {
  const path = `staging/adoption-inputs/${id}.json`;
  const c = await read(path);
  const raw = await read(`archive/staging/sf6-frame-data/raw/${id}.json`);
  const cargo = await read(
    `archive/staging/sf6-frame-data-quality/evidence/${id}.cargo.json`,
  );
  for (const [index, row] of raw.moves.entries()) {
    if (row.category !== "special") continue;
    const notation = row.input.numpad;
    const rotation = /^360\+(LP|MP|HP|PP)$/.test(notation);
    const nonheld = / \(HOLD OK\)$/.test(notation);
    const distance = id === "zangief" && /^63214/.test(notation);
    if (!rotation && !nonheld && !distance) continue;
    const normalized = notation
      .replace(/^360\+/, "360")
      .replace(/ \(HOLD OK\)$/, "");
    const match = /^(\d+)([LMH]?)(PP|KK|P|K)$/.exec(normalized);
    const input = distance
      ? {
          type: "special",
          motion: "63214",
          button: "K",
          strength: notation.includes("KK") ? "OD" : "none",
        }
      : match
        ? {
            type: "special",
            motion: match[1],
            button: match[3][0],
            strength: match[3].length === 2 ? "OD" : match[2] || "none",
          }
        : null;
    if (!input) throw new Error(`Unmapped repair: ${id} ${notation}`);
    const moveId = `${id}__coverage_${index}`;
    const held = distance;
    const sourceRows = cargo.data.cargoquery
      .filter((r: any) => r.title.input === notation)
      .map((r: any) => r.title);
    const sourceRow = sourceRows[0];
    const field = (key: string) => {
      const texts = [...new Set(sourceRows.map((r: any) => r[key]))];
      const text =
        texts.length === 1
          ? String(texts[0])
              .replace(/<[^>]*>/g, "")
              .replaceAll("'", "")
              .trim()
          : "";
      if (held || !text) return { status: "unknown", display: null };
      if (text === "-") return { status: "not_applicable", display: "-" };
      if (key === "hitAdv" && /KD/.test(text))
        return { status: "confirmed", display: "D" };
      const n = /^([+-]?\d+)(?:\([^)]*\))?$/.exec(text);
      return n
        ? {
            status: "confirmed",
            display: n[1],
            ...(key === "startup" || key === "total"
              ? { numeric: Number(n[1]) }
              : {}),
          }
        : { status: "unknown", display: null };
    };
    const total = field("total");
    // The total column includes held versions, while the note explicitly names the non-held total.
    const unheldTotal =
      nonheld && sourceRow?.notes?.match(/unheld version\): (\d+)F total/);
    if (unheldTotal)
      Object.assign(total, {
        status: "confirmed",
        display: unheldTotal[1],
        numeric: Number(unheldTotal[1]),
      });
    const frames = {
      startup: field("startup"),
      total: {
        ...total,
        provenance: total.status === "confirmed" ? "source" : null,
        calculation: null,
      },
      hit: field("hitAdv"),
      block: field("blockAdv"),
    };
    // Throw block advantage is inapplicable, never zero.
    if (!held && row.properties?.includes("throw"))
      frames.block = { status: "not_applicable", display: "-" };
    const move = {
      id: moveId,
      name: row.name.en,
      category: "special",
      input,
      variant: held
        ? {
            kind: "conditional",
            condition:
              "Close/Mid/Far distance-dependent variants; no single standard startup/total selected.",
          }
        : { kind: "base", condition: null },
      frames,
      notes: [
        `upstreamInput: ${notation}`,
        `upstreamName: ${row.name.en}`,
        `coverageSourceRow: ${index}`,
        `coverageSource: archive/staging/sf6-frame-data/raw/${id}.json`,
        `upstreamNotes: ${row.notes?.en || ""}`,
        `cargoSourceNotation: ${JSON.stringify(sourceRow || null)}`,
        held
          ? "Distance variants are separately held; do not merge performance or assert absence."
          : "Saved source repair: explicit plus separator / HOLD OK non-held version; no calculated total or guessed strength.",
      ],
      source: {
        ...c.source,
        url: row.source.url,
        retrievedAt: row.source.fetchedAt,
      },
      adoption: {
        status: held ? "held" : "accepted",
        basis: "source-coverage-repair",
      },
    };
    const existingIndex = c.moves.findIndex((m: any) => m.id === moveId);
    if (existingIndex < 0) c.moves.push(move);
    else if (process.argv.includes("--refresh-added"))
      c.moves[existingIndex] = move;
    const d = decisions.characters.find((d: any) => d.id === id);
    if (held && !d.heldMoveIds.includes(moveId)) d.heldMoveIds.push(moveId);
    added.push({
      characterId: id,
      moveId,
      input,
      sourceInput: notation,
      held,
      frames,
    });
  }
  characterSchema.parse(c);
  if (write) await writeFile(path, JSON.stringify(c, null, 2) + "\n");
}
if (write) {
  if (process.argv.includes("--coverage")) {
    const audit = await read("staging/coverage-audit/review.json");
    for (const d of decisions.characters) {
      const reviewed = audit.characters.find((c: any) => c.id === d.id);
      if (!reviewed) throw new Error(`Missing coverage review: ${d.id}`);
      d.sourceInventoryComplete = reviewed.sourceInventoryComplete;
      if (["ken", "marisa"].includes(d.id)) continue;
      const input = await read(d.candidatePath);
      input.coverage.special.status = reviewed.sourceInventoryComplete
        ? "complete"
        : "partial";
      await writeFile(d.candidatePath, JSON.stringify(input, null, 2) + "\n");
    }
    decisions.datasetId = "coverage-repair-2026-11-07-r2";
    decisions.label = "収録範囲監査データ（パッチ未確認）";
  }
  await writeFile(
    "data/adoption-decisions.json",
    JSON.stringify(decisions, null, 2) + "\n",
  );
  await writeFile(
    "staging/coverage-audit/additions.json",
    JSON.stringify(added, null, 2) + "\n",
  );
}
console.log(JSON.stringify({ write, additions: added }, null, 2));
