// Creates review records for this fixed snapshot. Do not re-seed to approve future data.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fingerprint } from "./quality-converter.mjs";
const root = "staging/sf6-frame-data";
const output = "staging/sf6-frame-data-quality";
await mkdir(output, { recursive: true });
const manifest = JSON.parse(
  await readFile(`${root}/collection-report.json`, "utf8"),
);
const decisions = [];
for (const { id } of manifest.characters) {
  const raw = JSON.parse(await readFile(`${root}/raw/${id}.json`, "utf8"));
  for (const m of raw.moves) {
    const name = m.name?.en ?? "",
      notes = m.notes?.en ?? "";
    let reason, classification;
    if (
      id === "blanka" &&
      name.endsWith("(SA2)") &&
      /SA2 install version/.test(notes)
    ) {
      classification = "enhanced_state";
      reason =
        "SA2 install requirement is explicit in source notes; ordinary same-input record exists.";
    }
    if (
      id === "mai" &&
      name.endsWith("(Flame)") &&
      /(?:costs|Consumes) 1 Flame Stock/i.test(notes)
    ) {
      classification = "resource_state";
      reason =
        "Source explicitly requires consuming Flame Stock; ordinary same-input record exists.";
    }
    if (
      id === "m_bison" &&
      name.endsWith("(Mine)") &&
      /(?:Detonates|detonat).*Mine/i.test(notes)
    ) {
      classification = "installed_object";
      reason =
        "Source describes detonation of an installed Mine; separate no-Mine record exists.";
    }
    if (
      id === "juri" &&
      name.endsWith("(1 Stock)") &&
      /Costs 1 Fuha stock/i.test(notes)
    ) {
      classification = "resource_state";
      reason =
        "Source explicitly requires 1 Fuha stock; ordinary same-input record exists.";
    }
    if (
      id === "jamie" &&
      /\(DL[1-4]\)/.test(name) &&
      m.category === "special"
    ) {
      classification = /requires|only|Drink Lv/i.test(notes)
        ? "drink_state"
        : "state_scope_unconfirmed";
      reason =
        "DL-specific source row; DL0 frames are not separately certified. Quarantine rather than assuming identical DL0 performance. See preserved source notes.";
    }
    if (
      id === "jamie" &&
      m.input?.numpad === "5LP" &&
      /requires Drink Lv\.1 or higher/.test(notes)
    ) {
      classification = "drink_state";
      reason =
        "Source explicitly requires Drink Lv.1 or higher; separate DL0-only row exists.";
    }
    if (reason)
      decisions.push({
        characterId: id,
        input: m.input.numpad,
        name,
        fingerprint: fingerprint(m),
        action: "exclude",
        classification,
        reason,
        evidence: notes,
        urls: [m.source.url],
        patchStatus: "UNVERIFIED",
      });
    if (
      (id === "ryu" && m.input?.numpad === "2HK") ||
      (id === "marisa" && m.input?.numpad === "236LP")
    )
      decisions.push({
        characterId: id,
        input: m.input.numpad,
        name,
        fingerprint: fingerprint(m),
        action: "quarantine_hit",
        classification: "hit_semantics_conflict",
        reason:
          "Numeric knockdown advantage must not be displayed as ordinary hitstun advantage. Comparison patch is 2.0401.010; upstream patch is unknown, so D is not imported as a verified replacement.",
        urls: [
          m.source.url,
          `https://frame-search.com/?character_name=${id === "ryu" ? "Ryu" : "Marisa"}&lang=en-us`,
        ],
        patchStatus: "UNVERIFIED",
      });
  }
}
// Exclusive creation prevents overwriting prior review work.
await writeFile(
  `${output}/review-decisions.json`,
  JSON.stringify(
    {
      schemaVersion: "1.0.0",
      upstreamRef: manifest.upstreamRef,
      attribution:
        "SuperCombo Wiki contributors; RyoSogawa/sf6-sensei; extracted review annotations",
      license: "CC-BY-SA-4.0",
      decisions,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(`Saved ${decisions.length} source-guarded review decisions`);
