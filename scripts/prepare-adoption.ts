import { readFile, writeFile } from "node:fs/promises";
import { characterSchema, type MoveInput } from "../src/lib/frame-data/schema";
import { inputKey } from "../src/lib/frame-data/input";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const inventory = await read("staging/integration/inventory.json");
const pilots = ["ryu", "guile", "terry", "aki"];
const ids = process.argv.includes("--all")
  ? inventory.characters.map((c: any) => c.id)
  : pilots;
const results = [];
for (const id of ids) {
  if (["ken", "marisa"].includes(id)) continue;
  const audit = inventory.characters.find((c: any) => c.id === id);
  if (
    audit.unmatchedCandidates.length ||
    audit.unclassifiedSourceRows.length ||
    audit.collisions.length
  )
    throw new Error(`Unresolved source inventory: ${id}`);
  const c = characterSchema.parse(await read(`staging/candidates/${id}.json`));
  const heldMoveIds: string[] = [];
  for (const row of audit.sourceInventory) {
    if (row.category !== "special" || row.candidates.length) continue;
    const match = /^([0-9\[\]]+)([LMH]?)(PP|KK|P|K)$/.exec(row.input);
    const simultaneous = /^(PP|KK)$/.test(row.input);
    if (!match && !simultaneous) continue;
    const [, motion, strength, buttons] = match || [
      "",
      "none",
      "none",
      row.input,
    ];
    const input: MoveInput = simultaneous
      ? {
          type: "special",
          motion: "none",
          button: row.input[0],
          strength: "none",
          buttonCombination: row.input === "PP" ? "LP+MP" : "LK+MK",
        }
      : {
          type: "special",
          motion,
          button: buttons[0] as "P" | "K",
          strength:
            buttons.length === 2
              ? "OD"
              : ((strength || "none") as "L" | "M" | "H" | "none"),
        };
    if (c.moves.some((m) => inputKey(m.input) === inputKey(input))) continue;
    const moveId = `${id}__held_${inputKey(input).replaceAll(":", "_")}`;
    c.moves.push({
      id: moveId,
      name: row.name,
      category: "special",
      input,
      variant: {
        kind: "conditional",
        condition:
          "Original source input retained; normal-state applicability/performance pending.",
      },
      frames: {
        startup: { status: "unknown", display: null },
        total: {
          status: "unknown",
          display: null,
          provenance: null,
          calculation: null,
        },
        hit: { status: "unknown", display: null },
        block: { status: "unknown", display: null },
      },
      source: { ...c.source },
      notes: [
        `upstreamInput: ${row.input}`,
        `Source inventory: archive/staging/sf6-frame-data/raw/${id}.json#${row.id}`,
        "Rule held-source-input: source input exists; normal-state availability/performance is not certified. Keep unknown rather than assert absence.",
      ],
      adoption: { status: "held", basis: "held-source-input" },
    });
    heldMoveIds.push(moveId);
  }
  c.adoption = {
    status: "accepted",
    basis: "source-inventory; held-source-input; unverified sources permitted",
  };
  for (const m of c.moves)
    m.adoption = {
      status: heldMoveIds.includes(m.id) ? "held" : "accepted",
      basis: heldMoveIds.includes(m.id)
        ? "held-source-input"
        : "source-matched candidate",
    };
  c.coverage.normal.status = "complete";
  c.coverage.special.status = "complete";
  characterSchema.parse(c);
  await writeFile(
    `staging/adoption-inputs/${id}.json`,
    JSON.stringify(c, null, 2) + "\n",
  );
  results.push({
    id,
    heldMoveIds,
    moves: c.moves.length,
    sourceInventoryComplete: true,
    candidatePath: `staging/adoption-inputs/${id}.json`,
    basis:
      "保存済み原典全行を候補・過去の除外判断へ対応付け。未確定の地上入力はheld-source-input規則で保留登録。",
  });
}
await writeFile(
  `staging/integration/${process.argv.includes("--all") ? "prepared" : "pilot"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
console.log(
  results.map((r) => ({
    id: r.id,
    moves: r.moves,
    held: r.heldMoveIds.length,
  })),
);
if (process.argv.includes("--decisions")) {
  if (!process.argv.includes("--all"))
    throw new Error("--decisions requires --all");
  const decisions = await read("data/adoption-decisions.json");
  decisions.characters = [
    ...decisions.characters.filter((c: any) =>
      ["ken", "marisa"].includes(c.id),
    ),
    ...results.map(({ moves, ...d }) => d),
  ];
  decisions.datasetId = "roster32-2026-11-06-r2";
  decisions.label = "32キャラ採用データ（パッチ未確認）";
  await writeFile(
    "data/adoption-decisions.json",
    JSON.stringify(decisions, null, 2) + "\n",
  );
}
