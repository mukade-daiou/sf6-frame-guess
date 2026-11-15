import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  mkdtempSync,
  copyFileSync,
  symlinkSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import { characterSchema } from "../src/lib/frame-data/schema";
import { digest } from "./reviewed-updates";
// @ts-ignore existing source normalizer
import { normalize } from "./lib/source-scan.mjs";
// @ts-ignore existing baseline loader
import { readHistoricalSnapshot } from "../tests/helpers/snapshots.mjs";
// @ts-ignore shared Node JSON diff implementation
import { assertSnapshotDiff, diffSnapshots } from "./lib/snapshot-diff.mjs";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
const policyDigest = (policy: any) =>
  digest(
    JSON.stringify({
      ...policy,
      reviewedUpdates: (policy.reviewedUpdates ?? []).map(
        ({ policyHash, ...batch }: any) => batch,
      ),
    }),
  );
const characters = (root: string) =>
  readdirSync(join(root, "data/characters"))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => read(join(root, "data/characters", f)));
export function template(run: string, root = process.cwd()) {
  const manifest = read(join(run, "manifest.json"));
  if (manifest.status !== "success")
    throw new Error("Cannot review failed/partial scan");
  return {
    schemaVersion: 1,
    runId: manifest.id,
    datasetId: "",
    contextHash: manifest.contextHash,
    decisions: read(join(run, "diff.json")).flatMap((e: any, index: number) =>
      ["move_changed", "move_added"].includes(e.kind)
        ? [
            {
              event: index,
              approved: false,
              characterId: e.characterId,
              moveId:
                e.productionMoveIds?.length === 1 ? e.productionMoveIds[0] : "",
              field: "",
              before: null,
              after: null,
              sourceHash: manifest.inputs.find(
                (i: any) =>
                  i.side === "after" && i.characterId === e.characterId,
              )?.hash,
              reason: "",
              mappingReason: "",
            },
          ]
        : [],
    ),
  };
}
export function plan(run: string, approval: any, root = process.cwd()) {
  const policy = read(join(root, "data/adoption-decisions.json")),
    production = characters(root);
  const approvalHash = digest(JSON.stringify(approval));
  const metadata = read(join(root, "data/metadata.json"));
  if (
    !isDeepStrictEqual(metadata, {
      schemaVersion: "1.0.0",
      kind: "production",
      datasetId: policy.datasetId,
      gameVersion: policy.gameVersion,
      label: policy.label,
      updatePolicy: "manual",
    })
  )
    throw new Error("Metadata/policy mismatch");
  const sourceManifest = read(join(run, "manifest.json"));
  if (
    sourceManifest.id !== approval.runId ||
    sourceManifest.status !== "success"
  )
    throw new Error("Invalid source run");
  for (const i of sourceManifest.inputs)
    if (
      i.status !== "success" ||
      digest(
        readFileSync(join(run, "raw", `${i.side}-${i.characterId}.raw`)),
      ) !== i.hash
    )
      throw new Error("Source hash mismatch");
  const previous = policy.reviewedUpdates?.find(
    (b: any) => b.approvalHash === approvalHash,
  );
  if (previous) {
    if (
      previous.resultHash !== digest(JSON.stringify(production)) ||
      previous.policyHash !== policyDigest(policy)
    )
      throw new Error("Applied approval no longer matches dataset");
    return {
      policy,
      production,
      decisions: [],
      evidence: new Map<string, Buffer>(),
      alreadyApplied: true,
    };
  }
  const manifest = read(join(run, "manifest.json")),
    events = read(join(run, "diff.json"));
  if (
    manifest.status !== "success" ||
    approval.runId !== manifest.id ||
    approval.contextHash !== manifest.contextHash ||
    approval.contextHash !== digest(JSON.stringify({ production, policy }))
  )
    throw new Error("Stale approval/context");
  if (
    approval.schemaVersion !== 1 ||
    typeof approval.datasetId !== "string" ||
    !approval.datasetId.trim() ||
    approval.datasetId === policy.datasetId ||
    !Array.isArray(approval.decisions)
  )
    throw new Error("Invalid approval/datasetId");
  for (const input of manifest.inputs) {
    if (
      input.status !== "success" ||
      digest(
        readFileSync(
          join(run, "raw", `${input.side}-${input.characterId}.raw`),
        ),
      ) !== input.hash
    )
      throw new Error("Source hash mismatch");
  }
  const evidence = new Map<string, Buffer>(),
    decisions: any[] = [],
    seen = new Set<string>();
  const protectedFields: any[] = [];
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (v.moveId) protectedFields.push(v);
    for (const [k, x] of Object.entries(v))
      if (k !== "reviewedUpdates") walk(x);
  };
  walk(policy);
  for (const d of approval.decisions) {
    if (d.approved !== true) continue;
    const e = events[d.event],
      key = JSON.stringify([d.characterId, d.moveId, d.field]);
    if (
      !e ||
      !["move_changed", "move_added"].includes(e.kind) ||
      !e.after?.raw ||
      e.characterId !== d.characterId ||
      !["startup", "total", "hit", "block"].includes(d.field) ||
      seen.has(key) ||
      !d.reason?.trim()
    )
      throw new Error("Invalid/duplicate approval");
    seen.add(key);
    if (
      e.kind === "move_changed" &&
      !e.changes.some(
        (c: any) =>
          (c.path[0] === "frames" && c.path[1] === d.field) ||
          (d.field === "total" &&
            ["whiffTotal", "notes", "frames"].includes(c.path[0])),
      )
    )
      throw new Error("Field not changed in source");
    if (
      (e.productionMoveIds?.length !== 1 ||
        e.productionMoveIds[0] !== d.moveId) &&
      !d.mappingReason?.trim()
    )
      throw new Error("Manual mapping reason required");
    if (e.kind === "move_added" && !d.mappingReason?.trim())
      throw new Error("Manual mapping reason required");
    if (isDeepStrictEqual(d.before, d.after)) throw new Error("No-op approval");
    const c = production.find((c) => c.id === d.characterId),
      m = c?.moves.find((m: any) => m.id === d.moveId);
    if (
      !m ||
      m.adoption?.status !== "accepted" ||
      !isDeepStrictEqual(m.frames[d.field], d.before)
    )
      throw new Error("Current before mismatch");
    if (
      protectedFields.some(
        (p) =>
          p.moveId === (m.strengthExpansion?.sourceMoveId || m.id) ||
          p.moveId === m.id,
      )
    )
      throw new Error("Existing correction conflict");
    const input = manifest.inputs.find(
      (i: any) => i.side === "after" && i.characterId === d.characterId,
    );
    if (d.sourceHash !== input?.hash)
      throw new Error("Approved source hash mismatch");
    const bytes = readFileSync(join(run, "raw", `after-${d.characterId}.raw`));
    const normalized = normalize(readSource(bytes), d.characterId);
    if (!normalized.moves.some((m: any) => isDeepStrictEqual(m, e.after)))
      throw new Error("Normalized source mismatch");
    if (
      !readSource(bytes).rows.some((r: any) =>
        isDeepStrictEqual(r, e.after.raw),
      )
    )
      throw new Error("Source row mismatch");
    const value = e.after.frames[d.field];
    if (d.field === "total") {
      const direct =
        /^全体\s*\d+$/.test(e.after.raw.recovery.trim()) &&
        e.after.whiffTotal?.evidence === e.after.raw.recovery.trim();
      if (
        !e.after.whiffTotal ||
        d.after?.numeric !== e.after.whiffTotal.value ||
        d.after?.provenance !== (direct ? "source" : "verified_calculation") ||
        d.after?.calculation !== (direct ? null : e.after.whiffTotal.evidence)
      )
        throw new Error("Total provenance mismatch");
    } else if (
      value.status === "unknown"
        ? d.after?.status !== "unknown"
        : value.status === "not_applicable"
          ? d.after?.status !== "not_applicable"
          : value.status === "numeric"
            ? d.after?.numeric !== value.value
            : d.after?.display !== value.raw
    )
      throw new Error("Approved value does not match source");
    const clone = structuredClone(c);
    clone.moves.find((x: any) => x.id === m.id).frames[d.field] = d.after;
    const validated = characterSchema.parse(clone);
    if (
      !isDeepStrictEqual(
        (validated.moves.find((x) => x.id === m.id)!.frames as any)[d.field],
        d.after,
      )
    )
      throw new Error("FrameValue must match schema exactly");
    const sourcePath = `staging/adoption-inputs/reviewed-updates/${input.hash}.json`;
    evidence.set(sourcePath, bytes);
    decisions.push({ ...d, sourcePath, sourceRow: e.after.raw });
  }
  if (!decisions.length) throw new Error("No approved changes");
  const result = structuredClone(production);
  for (const d of decisions)
    result
      .find((c) => c.id === d.characterId)
      .moves.find((m: any) => m.id === d.moveId).frames[d.field] = d.after;
  policy.datasetId = approval.datasetId;
  const normalizedResult = result.map((c) => characterSchema.parse(c));
  policy.reviewedUpdates = [
    ...(policy.reviewedUpdates ?? []),
    {
      approvalHash,
      runId: approval.runId,
      resultHash: digest(JSON.stringify(normalizedResult)),
      decisions,
    },
  ];
  policy.reviewedUpdates.at(-1).policyHash = policyDigest(policy);
  return {
    policy,
    production: normalizedResult,
    decisions,
    evidence,
    alreadyApplied: false,
  };
}
const readSource = (b: Buffer) => JSON.parse(b.toString());
export function execute(
  run: string,
  approval: any,
  root = process.cwd(),
  write = false,
) {
  const result = plan(run, approval, root);
  if (result.alreadyApplied) return { alreadyApplied: true };
  const workspace = mkdtempSync(join(tmpdir(), "sf6-apply-"));
  try {
    // Isolate the existing generator, including audits and their side effects.
    const files = execFileSync("git", ["ls-files", "-z"], { cwd: root })
      .toString()
      .split("\0")
      .filter(Boolean);
    for (const file of [
      ...new Set([
        ...files,
        "scripts/reviewed-updates.ts",
        "scripts/review-update.ts",
      ]),
    ]) {
      mkdirSync(dirname(join(workspace, file)), { recursive: true });
      copyFileSync(join(root, file), join(workspace, file));
    }
    symlinkSync(
      join(root, "node_modules"),
      join(workspace, "node_modules"),
      "dir",
    );
    symlinkSync(resolve(root, ".git"), join(workspace, ".git"), "dir");
    for (const [p, b] of result.evidence) {
      mkdirSync(dirname(join(workspace, p)), { recursive: true });
      writeFileSync(join(workspace, p), b);
    }
    writeFileSync(
      join(workspace, "data/adoption-decisions.json"),
      json(result.policy),
    );
    execFileSync(
      join(root, "node_modules/.bin/tsx"),
      [join(workspace, "scripts/build-snapshot.ts"), "--write", "--update"],
      { cwd: workspace, stdio: "pipe" },
    );
    assertSnapshotDiff(result.production, characters(workspace));
    execFileSync(
      join(root, "node_modules/.bin/tsx"),
      [join(workspace, "scripts/build-snapshot.ts"), "--check"],
      { cwd: workspace, stdio: "pipe" },
    );
    const changed = diffSnapshots(characters(root), characters(workspace));
    if (!write) return { dryRun: true, changes: changed };
    // Revalidate immediately before installation. Only generated outputs and
    // reviewed inputs are installed; temporary audit output is discarded.
    const fresh = plan(run, approval, root);
    if (!isDeepStrictEqual(fresh.policy, result.policy))
      throw new Error("Concurrent state change");
    const outputs = [
      "tests/fixtures/snapshot-approvals.json",
      "data/adoption-decisions.json",
      "data/metadata.json",
      ...readdirSync(join(workspace, "data/characters")).map(
        (f) => `data/characters/${f}`,
      ),
      ...result.evidence.keys(),
    ];
    const snapshotPolicy = read(
      join(root, "tests/fixtures/snapshot-approvals.json"),
    );
    const baseline = readHistoricalSnapshot(snapshotPolicy.baselineRef);
    assertSnapshotDiff(baseline, characters(root), snapshotPolicy.approvals);
    snapshotPolicy.approvals = diffSnapshots(baseline, characters(workspace));
    writeFileSync(
      join(workspace, "tests/fixtures/snapshot-approvals.json"),
      json(snapshotPolicy),
    );
    const originals = new Map(
      outputs.map((p) => [
        p,
        existsSync(join(root, p)) ? readFileSync(join(root, p)) : null,
      ]),
    );
    try {
      for (const p of outputs) {
        mkdirSync(dirname(join(root, p)), { recursive: true });
        writeFileSync(join(root, p), readFileSync(join(workspace, p)));
      }
    } catch (error) {
      for (const [p, b] of originals)
        if (b === null) rmSync(join(root, p), { force: true });
        else writeFileSync(join(root, p), b);
      throw error;
    }
    return { written: true, changes: changed };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [mode, run, file, ...flags] = process.argv.slice(2);
  if (!run || !file || flags.some((f) => f !== "--write"))
    throw new Error(
      "review RUN APPROVAL.json [--write] | apply RUN APPROVAL.json [--write]",
    );
  if (mode === "review") {
    if (existsSync(file)) {
      plan(run, read(file));
      console.log("Approval valid (dry-run)");
    } else {
      const draft = template(run);
      if (flags.includes("--write")) {
        writeFileSync(file, json(draft), { flag: "wx" });
        console.log(file);
      } else console.log(json(draft));
    }
  } else if (mode === "apply")
    console.log(
      json(execute(run, read(file), process.cwd(), flags.includes("--write"))),
    );
  else throw new Error("Unknown mode");
}
