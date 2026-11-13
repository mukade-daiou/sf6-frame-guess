import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { applyCompoundStartup } from "./compound-startup";
import { applyKdHkdCorrections } from "./kd-hkd-corrections";
import { restoreWhiffTotalCorrections } from "./whiff-total-corrections";
import { execFileSync } from "node:child_process";
import { characterSchema, type Character } from "../src/lib/frame-data/schema";
import { isQuestionInput, inputKey } from "../src/lib/frame-data/input";
import { resolveMove, isDisplayable } from "../src/lib/frame-data/resolver";
import { withStrengthExpansions } from "../src/lib/frame-data/strength-expansion";
import { applyFrameResearch } from "./frame-research";
import { applyDistanceRanges } from "./distance-ranges";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const save = (path: string, data: unknown) =>
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
const baseline = read("staging/stage17/baseline.json");
const before: Character[] = baseline.characters.map((c: unknown) =>
  characterSchema.parse(c),
);
const current: Character[] = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => characterSchema.parse(read(`data/characters/${f}`)));
const missing = (m: Character["moves"][number]) =>
  Object.entries(m.frames).filter(([, v]) => !isDisplayable(v));
const basic = (c: Character) =>
  c.moves.filter(
    (m) => m.adoption?.status === "accepted" && m.variant.kind === "base",
  );
function stats(characters: Character[]) {
  const rows = characters.flatMap(basic).filter((m) => missing(m).length);
  const sources = new Set(
    rows.flatMap((m) =>
      missing(m).map(
        ([f]) => `${m.strengthExpansion?.sourceMoveId || m.id}:${f}`,
      ),
    ),
  );
  const questions = characters.flatMap((c) =>
    basic(c)
      .filter((m) => isQuestionInput(m.input))
      .map((m) => ({ c, m })),
  );
  return {
    characters: characters.length,
    records: characters.reduce((n, c) => n + c.moves.length, 0),
    unknownRecords: rows.length,
    unknownFields: rows.reduce((n, m) => n + missing(m).length, 0),
    deduplicatedFieldTargets: sources.size,
    deduplicatedSourceRecords: new Set(
      rows.map((m) => m.strengthExpansion?.sourceMoveId || m.id),
    ).size,
    normalUnavailableInputs: questions.filter(
      ({ c, m }) => resolveMove(c, m.input, "normal").status !== "found",
    ).length,
    hardUnavailableInputs: questions.filter(
      ({ c, m }) => resolveMove(c, m.input, "startup").status !== "found",
    ).length,
    saUnknownInputs: questions.filter(
      ({ m }) => m.category === "super_art" && missing(m).length,
    ).length,
    saInputs: questions.filter(({ m }) => m.category === "super_art").length,
  };
}
const sources: any[] = [],
  targets: any[] = [],
  conflicts: any[] = [];
const cargoField: Record<string, string> = {
  startup: "startup",
  total: "total",
  hit: "hitAdv",
  block: "blockAdv",
};
const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replaceAll("'", "")
    .trim();
for (const c of before)
  for (const m of basic(c).filter(
    (m) => !m.strengthExpansion && missing(m).length,
  )) {
    const sourceInput = m.notes
      .find((n) => n.startsWith("upstreamInput: "))
      ?.slice(15);
    const upstreamName = m.notes
      .find((n) => n.startsWith("upstreamName: "))
      ?.slice(14);
    const rawPath = `archive/staging/sf6-frame-data/raw/${c.id}.json`;
    const cargoPath = `archive/staging/sf6-frame-data-quality/evidence/${c.id}.cargo.json`;
    const raw = read(rawPath),
      cargo = read(cargoPath);
    const raws = raw.moves
      .map((r: any, i: number) => ({ r, i }))
      .filter(
        ({ r }: any) =>
          r.input.numpad === sourceInput && r.name.en === upstreamName,
      );
    const cargos = cargo.data.cargoquery
      .map((r: any, i: number) => ({ r: r.title, i }))
      .filter(({ r }: any) => r.input === sourceInput);
    if (raws.length !== 1 || cargos.length !== 1)
      throw new Error(`Research source not unique: ${m.id}`);
    const r = raws[0],
      q = cargos[0];
    if (
      raw.id !== c.id ||
      cargo.characterId !== c.id ||
      r.r.characterId !== c.id
    )
      throw new Error(`Research character mismatch: ${m.id}`);
    const evidence = {
      id: m.id,
      characterId: c.id,
      name: m.name,
      input: m.input,
      sourceInput,
      rawPath,
      rawIndex: r.i,
      rawRecord: r.r,
      cargoPath,
      cargoIndex: q.i,
      cargoRecord: q.r,
      url: m.source.url,
      rawRetrievedAt: r.r.source.fetchedAt,
      cargoRetrievedAt: cargo.retrievedAt,
      gameVersion: cargo.gameVersion,
      kind: "community",
      verification: "unverified",
      attribution: cargo.attribution,
      license: cargo.license,
    };
    sources.push(evidence);
    // Conflicts in already-known values are evidence only; never repaired by this task.
    for (const [field, value] of Object.entries(m.frames)) {
      const notation = clean(q.r[cargoField[field]] || "");
      if (
        value.status === "confirmed" &&
        /\b(?:HKD|KD)\b/.test(notation) &&
        value.display !== "D"
      )
        conflicts.push({
          characterId: c.id,
          moveId: m.id,
          field,
          current: value,
          sourceNotation: notation,
          reason:
            "Cargo knockdown notation differs semantically from the existing numeric hit value; outside unknown-only scope; unchanged",
          sourceId: m.id,
        });
    }
    for (const [field, value] of missing(m)) {
      const notation = clean(q.r[cargoField[field]] || "");
      let adopted: any = null;
      const representative = read(
        "data/adoption-decisions.json",
      ).frameResearch?.representatives?.find(
        (d: any) => d.moveId === m.id && d.field === field,
      );
      let reason =
        "Standard-condition value is not established by the stored source; keep unknown.";
      if (representative) {
        if (representative.sourceNotation !== notation)
          throw new Error(`Representative source mismatch: ${m.id}`);
        adopted = representative.value;
        reason = representative.reason;
      } else if (notation === "-") {
        adopted = { status: "not_applicable", display: "-" };
        reason =
          "Saved Cargo explicitly marks this exact field as not applicable; this is not a rule converting missing values to '-'.";
      } else if (
        field === "total" &&
        ["ken__normal_2_K_H", "marisa__normal_2_K_M"].includes(m.id)
      ) {
        const number = /^(\d+)(?:\(\d+\))?$/.exec(notation);
        if (!number || r.r.totalFrames !== Number(number[1]))
          throw new Error(`Stored total mismatch: ${m.id}`);
        adopted = {
          status: "confirmed",
          display: number[1],
          numeric: Number(number[1]),
          provenance: "source",
          calculation: null,
        };
        reason = m.id.startsWith("ken")
          ? "Cargo explicitly gives 34(37), stored raw totalFrames is 34, and its note separately identifies block-specific recovery. Adopt the outside total 34 under the existing representative rule, without calculating from components."
          : "Cargo explicitly gives total 29 and raw totalFrames agrees; whiff/block recovery note is retained. Use the written total, with no formula or extra +1.";
      } else if (c.id === "jp" && field === "hit" && notation === "KD ~") {
        adopted = { status: "confirmed", display: "D" };
        reason =
          "Cargo explicitly identifies knockdown. Apply the existing KD-to-D rule without assigning an advantage number. Deferred spike timing remains in the source; no activation-only '-' rule is applied.";
      } else if (c.id === "zangief") {
        reason =
          "Cargo (6~22)+10 and raw note 16-32 include hold duration. Official/Wiki retrieval failed; search excerpt 16 lacks compatible patch/condition evidence. Do not infer 16 or a standard-condition range from the formula.";
      } else if (c.id === "akuma") {
        reason =
          "Cargo total is an unexpanded template; automatic follow-up on frame 41 does not establish whiff total. No total is computed from follow-ups.";
      } else if (c.id === "marisa") {
        reason =
          "Cargo KD +50(68) Wall Splat is tied to wall outcome/distance. The standard midscreen hit result is not independently established; do not use its number or equate wall splat with ordinary knockdown.";
      } else if (c.id === "ryu") {
        reason =
          "Cargo Wall Bounce +49(65) describes wall/airborne outcome. No normal midscreen hitstun value or explicit KD result established; keep unknown rather than interpreting +49 as normal advantage.";
      }
      const related = c.moves.filter(
        (x) => x.id === m.id || x.strengthExpansion?.sourceMoveId === m.id,
      );
      targets.push({
        id: `${m.id}:${field}`,
        characterId: c.id,
        sourceMoveId: m.id,
        sourceId: evidence.id,
        field,
        sourceNotation: notation,
        before: value,
        decision: adopted ? "adopt" : "retain_unknown",
        value: adopted || value,
        reason,
        oldUnknownReason:
          field === "total"
            ? "Existing conversion did not establish whiff total"
            : field === "startup"
              ? "Compound/hold-dependent expression"
              : "Raw normalizer omitted a special/non-numeric source notation or condition remained unresolved",
        recordIds: related.map((x) => x.id),
        questionInputs: related
          .filter((x) => isQuestionInput(x.input))
          .map((x) => ({
            moveId: x.id,
            input: x.input,
            key: inputKey(x.input),
            beforeNormal: resolveMove(c, x.input, "normal").status,
            beforeHard: resolveMove(c, x.input, "startup").status,
            afterNormal: resolveMove(
              current.find((y) => y.id === c.id)!,
              x.input,
              "normal",
            ).status,
            afterHard: resolveMove(
              current.find((y) => y.id === c.id)!,
              x.input,
              "startup",
            ).status,
            finalField: current
              .find((y) => y.id === c.id)!
              .moves.find((y) => y.id === x.id)!.frames[
              field as keyof typeof x.frames
            ],
          })),
        liveChecksPath: "staging/stage17/live-source-checks.json",
      });
    }
  }
for (const d of read("data/adoption-decisions.json").demonRaidNoInput
  ?.records || []) {
  const target = targets.find(
    (t) => t.sourceMoveId === d.moveId && t.field === "total",
  );
  if (target) {
    target.decision = "representative_variant";
    target.value = d.frames.total;
    target.reason = d.condition + " " + d.reason;
    target.representativeSource = d;
  }
}
const ledger = {
  baselineHead: baseline.head,
  definitions: {
    record:
      "accepted base record, including shared templates and generated strengths",
    field: "a frame not displayable under the existing resolver",
    target: "sourceMoveId + field, counting expanded strengths only once",
    question:
      "accepted base record satisfying isQuestionInput; source strength none is excluded; per-character input; Normal requires 4 fields, Hard requires startup",
  },
  before: stats(before),
  after: stats(current),
  sources,
  targets,
  knownValueConflicts: conflicts,
  liveChecks: read("staging/stage17/live-source-checks.json"),
};
save("staging/stage17/frame-ledger.json", ledger);
if (process.argv.includes("--write-decisions")) {
  const policy = read("data/adoption-decisions.json");
  const fieldDecisions = targets
    .filter((t) => t.decision === "adopt")
    .map((t) => ({
      characterId: t.characterId,
      moveId: t.sourceMoveId,
      field: t.field,
      before: t.before,
      value: t.value,
      evidenceId: t.id,
      sourceNotation: t.sourceNotation,
      reason: t.reason,
    }));
  if (!fieldDecisions.length)
    throw new Error("No frame decisions; dataset must not be bumped");
  policy.frameResearch = {
    ...policy.frameResearch,
    baselinePath: "staging/stage17/baseline.json",
    ledgerPath: "staging/stage17/frame-ledger.json",
    fieldDecisions,
  };
  save("data/adoption-decisions.json", policy);
}
if (process.argv.includes("--check")) {
  const policy = read("data/adoption-decisions.json");
  const expectedFields = targets
    .filter((t) => t.decision === "adopt")
    .map((t) => ({
      characterId: t.characterId,
      moveId: t.sourceMoveId,
      field: t.field,
      before: t.before,
      value: t.value,
      evidenceId: t.id,
      sourceNotation: t.sourceNotation,
      reason: t.reason,
    }));
  if (!isDeepStrictEqual(policy.frameResearch?.fieldDecisions, expectedFields))
    throw new Error(
      "Research decisions do not exactly match the evidenced field whitelist",
    );
  if (
    !isDeepStrictEqual(
      baseline.decisions,
      JSON.parse(
        execFileSync(
          "git",
          ["show", `${baseline.head}:data/adoption-decisions.json`],
          { encoding: "utf8" },
        ),
      ),
    ) ||
    !isDeepStrictEqual(
      baseline.metadata,
      JSON.parse(
        execFileSync("git", ["show", `${baseline.head}:data/metadata.json`], {
          encoding: "utf8",
        }),
      ),
    )
  )
    throw new Error("Saved decision/metadata baseline changed");
  // Verify the saved baseline really is the original commit, not a movable protection ref.
  for (const old of before) {
    const historical = JSON.parse(
      execFileSync(
        "git",
        ["show", `${baseline.head}:data/characters/${old.id}.json`],
        { encoding: "utf8" },
      ),
    );
    if (!isDeepStrictEqual(old, historical))
      throw new Error(`Baseline changed: ${old.id}`);
    const expected = withStrengthExpansions(
      applyKdHkdCorrections(
        applyCompoundStartup(applyDistanceRanges(applyFrameResearch(old))),
      ),
    );
    const currentCharacter = current.find((c) => c.id === old.id);
    const actual =
      currentCharacter && restoreWhiffTotalCorrections(currentCharacter);
    if (!isDeepStrictEqual(expected, actual))
      throw new Error(`Unauthorized stage17 record change: ${old.id}`);
  }
  const expectedDecisions = structuredClone(policy);
  delete expectedDecisions.frameResearch;
  delete expectedDecisions.distanceRanges;
  delete expectedDecisions.knockdownCorrections;
  delete expectedDecisions.demonRaidNoInput;
  delete expectedDecisions.compoundStartup;
  delete expectedDecisions.kdHkdCorrections;
  delete expectedDecisions.whiffTotalCorrections;
  delete expectedDecisions.userConfirmedFrames;
  for (const d of expectedDecisions.specialStateExclusions ?? []) {
    const character = expectedDecisions.characters.find(
      (c: any) => c.id === d.characterId,
    );
    if (!character?.excludedMoveIds.includes(d.moveId))
      throw new Error(`Missing authorized exclusion: ${d.moveId}`);
    character.excludedMoveIds = character.excludedMoveIds.filter(
      (id: string) => id !== d.moveId,
    );
  }
  delete expectedDecisions.specialStateExclusions;
  expectedDecisions.datasetId = baseline.decisions.datasetId;
  if (!isDeepStrictEqual(expectedDecisions, baseline.decisions))
    throw new Error("Unrelated adoption decision changed");
  const metadata = read("data/metadata.json");
  if (
    !isDeepStrictEqual(
      { ...metadata, datasetId: baseline.metadata.datasetId },
      baseline.metadata,
    )
  )
    throw new Error("Unexpected metadata change");
  if (
    ledger.after.records !== 1298 ||
    ledger.after.saInputs !== 288 ||
    ledger.after.characters !== 32
  )
    throw new Error("Dataset counts changed");
}
console.log(
  JSON.stringify(
    {
      before: ledger.before,
      after: ledger.after,
      adoptedFields: targets.filter((t) => t.decision === "adopt").length,
      unresolvedTargets: targets.filter((t) => t.decision === "retain_unknown")
        .length,
      knownValueConflicts: conflicts.length,
    },
    null,
    2,
  ),
);
