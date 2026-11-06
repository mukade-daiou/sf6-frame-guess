import { readFile, writeFile } from "node:fs/promises";
import { fingerprint } from "./quality-converter.mjs";
const root = "archive/staging/sf6-frame-data",
  out = "archive/staging/sf6-frame-data-quality";
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const manifest = await read(`${root}/collection-report.json`),
  reviews = await read(`${out}/review-decisions.json`);
const clean = (s) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/'{2,}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const observations = [];
for (const { id } of manifest.characters) {
  const raw = await read(`${root}/raw/${id}.json`),
    live = await read(`${out}/evidence/${id}.cargo.json`);
  const rows = live.data?.cargoquery?.map((r) => r.title) ?? [];
  for (const m of raw.moves) {
    const matches = rows.filter(
      (r) =>
        r.input === m.input.numpad && clean(r.notes) === clean(m.notes?.en),
    );
    const unique = [
      ...new Map(matches.map((r) => [JSON.stringify(r), r])).values(),
    ];
    if (unique.length !== 1) continue;
    const row = unique[0],
      kd = /^(?:KD|HKD)\s*\+?(\d+(?:\.\d+)?)(?:\s.*)?$/.exec(clean(row.hitAdv));
    if (
      kd &&
      clean(m.notes?.en) &&
      Number(kd[1]) === m.onHit &&
      clean(row.startup) === String(m.startup)
    ) {
      const decision = {
        characterId: id,
        input: m.input.numpad,
        name: m.name.en,
        fingerprint: fingerprint(m),
        action: "replace_hit_D",
        classification: "explicit_knockdown_marker",
        reason:
          "Same input, normalized source notes, startup, and numeric KD advantage match pinned row; restore lost KD semantics only. No cross-patch numerical frame value imported.",
        sourceDisplay: clean(row.hitAdv),
        evidenceRetrievedAt: live.retrievedAt,
        urls: [m.source.url, live.url],
        patchStatus: "UNVERIFIED",
      };
      if (
        !reviews.decisions.some(
          (d) =>
            d.fingerprint === decision.fingerprint &&
            d.action === decision.action,
        )
      )
        reviews.decisions.push(decision);
    }
    for (const [field, column] of Object.entries({
      startup: "startup",
      total: "total",
      hit: "hitAdv",
      block: "blockAdv",
    })) {
      const rawField = {
        startup: "startup",
        total: "totalFrames",
        hit: "onHit",
        block: "onBlock",
      }[field];
      if (m[rawField] != null) continue;
      const display = clean(row[column]);
      const classification =
        display === "-"
          ? "explicit_not_applicable"
          : !display || /\{\{\{/.test(display)
            ? "original_information_missing"
            : /\d/.test(display)
              ? "source_value_requires_patch_confirmation"
              : "non_simple_or_conditional";
      observations.push({
        characterId: id,
        input: m.input.numpad,
        name: m.name.en,
        fingerprint: fingerprint(m),
        field,
        sourceDisplay: display,
        classification,
        urls: [m.source.url, live.url],
        evidenceRetrievedAt: live.retrievedAt,
      });
      if (display === "-") {
        const d = {
          characterId: id,
          input: m.input.numpad,
          name: m.name.en,
          fingerprint: fingerprint(m),
          action: "mark_not_applicable",
          field,
          classification,
          reason:
            "Explicit dash in matched source row; no numeric frame value imported.",
          urls: [m.source.url, live.url],
          patchStatus: "UNVERIFIED",
        };
        if (
          !reviews.decisions.some(
            (x) =>
              x.fingerprint === d.fingerprint &&
              x.action === d.action &&
              x.field === d.field,
          )
        )
          reviews.decisions.push(d);
      }
    }
  }
}
await writeFile(
  `${out}/review-decisions.json`,
  JSON.stringify(reviews, null, 2) + "\n",
);
await writeFile(
  `${out}/source-semantic-observations.json`,
  JSON.stringify(observations, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    decisions: reviews.decisions.length,
    semanticD: reviews.decisions.filter((d) => d.action === "replace_hit_D")
      .length,
    notApplicable: reviews.decisions.filter(
      (d) => d.action === "mark_not_applicable",
    ).length,
    observedMissing: observations.length,
  }),
);
