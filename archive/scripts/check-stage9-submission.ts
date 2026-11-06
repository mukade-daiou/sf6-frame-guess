import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { frameValueSchema } from "../../src/lib/frame-data/schema";
const base = "archive/staging/sf6-frame-data-stage9";
const evidence = z
  .object({ file: z.string().min(1), locator: z.string().min(1) })
  .strict();
const schema = z
  .object({
    sessions: z.array(
      z
        .object({
          id: z.string().min(1),
          battleVersion: z.string().min(1),
          versionLabel: z.string().min(1),
          versionMeaning: z.enum(["battle_version", "unconfirmed"]),
          capturedAt: z.iso.datetime(),
          evidence: z.array(evidence).min(1),
        })
        .strict(),
    ),
    observations: z.array(
      z
        .object({
          moveId: z.string().min(1),
          observedName: z.string().min(1),
          sessionId: z.string().min(1),
          inputPair: z.enum(["LP+MP", "LK+MK"]).nullable(),
          standardConfirmed: z.literal(true),
          frames: z
            .object({
              startup: frameValueSchema,
              total: frameValueSchema,
              hit: frameValueSchema,
              block: frameValueSchema,
            })
            .strict(),
          evidence: z.array(evidence).min(1),
          notes: z.string(),
        })
        .strict(),
    ),
    coverage: z.array(
      z
        .object({
          characterId: z.enum(["ken", "marisa"]),
          sessionId: z.string().min(1),
          observedMoveIds: z.array(z.string()),
          outOfScope: z.array(
            z
              .object({ input: z.string().min(1), reason: z.string().min(1) })
              .strict(),
          ),
          unresolvedRows: z.array(
            z
              .object({ input: z.string().min(1), reason: z.string().min(1) })
              .strict(),
          ),
          evidence: z.array(evidence).min(1),
        })
        .strict(),
    ),
  })
  .strict();
const raw = JSON.parse(
  await readFile(process.argv[2] ?? `${base}/submission.json`, "utf8"),
);
const submission = schema.parse(raw);
const plan = JSON.parse(await readFile(`${base}/plan.json`, "utf8"));
const issues: string[] = [];
const root = await realpath(`${base}/evidence`);
const sessions = new Map(submission.sessions.map((s) => [s.id, s]));
if (sessions.size !== submission.sessions.length)
  issues.push("duplicate session IDs");
for (const s of submission.sessions) {
  if (s.battleVersion !== plan.targetBattleVersion)
    issues.push(`version mismatch: ${s.id}: ${s.battleVersion}`);
  if (s.versionMeaning !== "battle_version")
    issues.push(`version meaning unconfirmed: ${s.id}`);
}
const refs = [
  ...submission.sessions,
  ...submission.observations,
  ...submission.coverage,
].flatMap((r) => r.evidence);
for (const e of refs) {
  if (path.isAbsolute(e.file) || e.file.split(/[\\/]/).includes("..")) {
    issues.push(`unsafe evidence path: ${e.file}`);
    continue;
  }
  try {
    const file = await realpath(path.join(root, e.file));
    const info = await stat(file);
    if (!file.startsWith(root + path.sep) || !info.isFile() || !info.size)
      issues.push(`invalid evidence file: ${e.file}`);
  } catch {
    issues.push(`missing evidence file: ${e.file}`);
  }
}
const seen = new Set<string>();
for (const o of submission.observations) {
  const move = plan.moves.find((m: any) => m.moveId === o.moveId);
  if (!move) issues.push(`unknown move: ${o.moveId}`);
  if (seen.has(o.moveId)) issues.push(`duplicate observation: ${o.moveId}`);
  seen.add(o.moveId);
  if (!sessions.has(o.sessionId))
    issues.push(`unknown session: ${o.sessionId}`);
  if (move && move.requiredPair !== o.inputPair)
    issues.push(`input pair mismatch: ${o.moveId}`);
}
for (const c of submission.coverage) {
  if (
    submission.coverage.filter((r) => r.characterId === c.characterId).length >
    1
  )
    issues.push(`duplicate coverage: ${c.characterId}`);
  if (c.unresolvedRows.length)
    issues.push(`unresolved scope rows: ${c.characterId}`);
  if (!sessions.has(c.sessionId))
    issues.push(`unknown session: ${c.sessionId}`);
  const expected = plan.moves
    .filter((m: any) => m.characterId === c.characterId)
    .map((m: any) => m.moveId);
  if (
    new Set(c.observedMoveIds).size !== c.observedMoveIds.length ||
    c.observedMoveIds.length !== expected.length ||
    expected.some((id: string) => !c.observedMoveIds.includes(id))
  )
    issues.push(`incomplete or unexpected coverage: ${c.characterId}`);
}
const result = {
  targetBattleVersion: plan.targetBattleVersion,
  inputRecordsReceived: submission.observations.length,
  gameChecksCompleted: 0,
  coverageWithoutRecords: ["ken", "marisa"].filter(
    (id) => !submission.coverage.some((c) => c.characterId === id),
  ),
  priorityInputsWithoutRecords: plan.moves
    .filter((m: any) => m.requiredPair && !seen.has(m.moveId))
    .map((m: any) => m.moveId),
  versionGate: issues.length
    ? "blocked"
    : submission.sessions.length
      ? "metadata_only_content_review_required"
      : "pending",
  issues,
  canPromote: false,
  productionEligible: 0,
  note: "This checker validates structure and file references only. Inspect images/videos and per-move values manually before verification. It never edits production or candidate data.",
};
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exitCode = 1;
