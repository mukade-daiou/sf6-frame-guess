import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const decisions = read("data/adoption-decisions.json");
const selections: any[] = [];
const evidence: any[] = [];
for (const characterId of ["jamie", "cviper"]) {
  const entry = decisions.characters.find((x: any) => x.id === characterId);
  const c = read(entry.candidatePath);
  const rawPath = `archive/staging/sf6-frame-data/raw/${characterId}.json`,
    cargoPath = `archive/staging/sf6-frame-data-quality/evidence/${characterId}.cargo.json`;
  const raw = read(rawPath),
    cargo = read(cargoPath);
  for (const m of c.moves.filter((m: any) =>
    m.id.includes("__held_special_"),
  )) {
    const sourceInput = m.notes
      .find((n: string) => n.startsWith("upstreamInput: "))
      .slice(15);
    const raws = raw.moves
      .map((r: any, i: number) => ({ r, i }))
      .filter(
        ({ r }: any) => r.input.numpad === sourceInput && r.name.en === m.name,
      );
    if (raws.length !== 1) throw new Error(`Raw ambiguous: ${m.id}`);
    const { r, i: rawIndex } = raws[0];
    let matches = cargo.data.cargoquery
      .map((x: any, i: number) => ({ r: x.title, i }))
      .filter((x: any) => x.r.input === sourceInput);
    if (matches.length > 1)
      matches = matches.filter((x: any) =>
        x.r.notes.startsWith("Damage DL0-DL3:"),
      );
    if (matches.length !== 1) throw new Error(`Cargo ambiguous: ${m.id}`);
    const selected = matches[0];
    const condition =
      characterId === "cviper"
        ? "第16段階ユーザー指定: Focus Force Lv.1、最短ホールド（非チャージ/19F以内）。自動反撃・Lv.2/3を選ばない。発生は原典の固定複合表記を加算せず表示。"
        : m.name.includes("DL3")
          ? "第16段階ユーザー指定: 酔いLv.3のTenshinを代表条件に固定。"
          : "第16段階ユーザー指定: 酔いLv.2を代表条件に固定。DL4性能・派生は採用しない。";
    selections.push({
      characterId,
      moveId: m.id,
      condition,
      rawPath,
      rawIndex,
      cargoPath,
      cargoIndex: selected.i,
      sourceName: m.name,
      sourceInput,
      expectedCargoNotes: selected.r.notes,
    });
    evidence.push({
      characterId,
      moveId: m.id,
      condition,
      rawRef: `${rawPath}#/moves/${rawIndex}`,
      cargoRef: `${cargoPath}#/data/cargoquery/${selected.i}/title`,
      rawRecord: r,
      cargoRecord: selected.r,
      rawFetchedAt: r.source.fetchedAt,
      cargoRetrievedAt: cargo.retrievedAt,
      url: r.source.url,
      kind: "community",
      gameVersion: cargo.gameVersion,
      verification: "unverified",
    });
  }
}
if (selections.length !== 20)
  throw new Error("Expected 18 Jamie and 2 Focus Force records");
decisions.conditionalSpecials = {
  protectionRef: "571cea0f69dbc8b816dbd8280cf81d173df3b093",
  excludedMoveId: "dee_jay__held_special_22_P_OD",
  selections,
};
decisions.datasetId = "conditional-specials-2026-11-07-r2";
for (const c of decisions.characters) {
  c.heldMoveIds = c.heldMoveIds.filter(
    (id: string) =>
      !selections.some((s) => s.moveId === id) &&
      id !== decisions.conditionalSpecials.excludedMoveId,
  );
  if (c.id === "dee_jay")
    c.excludedMoveIds = [
      ...new Set([
        ...(c.excludedMoveIds || []),
        decisions.conditionalSpecials.excludedMoveId,
      ]),
    ];
}
if (process.argv.includes("--write")) {
  writeFileSync(
    "data/adoption-decisions.json",
    JSON.stringify(decisions, null, 2) + "\n",
  );
  mkdirSync("staging/conditional-specials", { recursive: true });
  writeFileSync(
    "staging/conditional-specials/evidence.json",
    JSON.stringify(
      {
        records: evidence,
        liveSourceChecks: [
          {
            url: "https://wiki.supercombo.gg/w/Street_Fighter_6/C._Viper/Frame_data",
            result: "Anubis Access Denied; stored Cargo used",
          },
        ],
        note: "DL0-DL3 damage note uniquely associates Freeflow DL2 rows; DL4 has separate 2-hit description. No live values imported.",
      },
      null,
      2,
    ) + "\n",
  );
}
console.log(
  JSON.stringify({
    selections: selections.length,
    write: process.argv.includes("--write"),
  }),
);
