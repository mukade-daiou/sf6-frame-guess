import { it, expect } from "vitest";
import {
  readFileSync,
  readdirSync,
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  symlinkSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { plan, execute, template } from "../../../scripts/review-update";
// @ts-ignore source scanner is shared Node JS
import { scan } from "../../../scripts/lib/source-scan.mjs";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
it("reviews, rejects stale/conflicting approvals and regenerates only approved fields in an isolated fixture", async () => {
  const root = process.cwd(),
    tmp = mkdtempSync(join(tmpdir(), "sf6-review-test-"));
  try {
    const production = readdirSync("data/characters")
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => read(`data/characters/${f}`));
    const policy = read("data/adoption-decisions.json");
    const before = read("tests/fixtures/source-scan/ryu.json"),
      after = structuredClone(before);
    after.rows[0].startup = "5";
    for (const [side, source] of [
      ["before", before],
      ["after", after],
    ] as const) {
      mkdirSync(join(tmp, side));
      writeFileSync(
        join(tmp, side, "inventory.json"),
        JSON.stringify({
          complete: true,
          characters: [{ id: "ryu", file: "ryu.json" }],
        }),
      );
      writeFileSync(join(tmp, side, "ryu.json"), JSON.stringify(source));
    }
    const run = await scan({
      baseline: join(tmp, "before"),
      incoming: join(tmp, "after"),
      output: join(tmp, "runs"),
      production,
      policy,
    });
    const draft = template(run.root);
    const event = run.events.findIndex((e: any) => e.kind === "move_changed");
    const move = production
      .find((c) => c.id === "ryu")
      .moves.find((m: any) => m.id === "ryu__normal_5_P_L");
    const approval = {
      ...draft,
      datasetId: "fixture-review-update",
      decisions: [
        {
          ...draft.decisions[0],
          event,
          approved: true,
          moveId: move.id,
          field: "startup",
          before: move.frames.startup,
          after: { status: "confirmed", display: "5", numeric: 5 },
          reason: "Fixture only",
          mappingReason: "Fixture command manually mapped",
        },
      ],
    };
    expect(plan(run.root, approval).decisions).toHaveLength(1);
    const diffPath = join(run.root, "diff.json"),
      originalDiff = readFileSync(diffPath);
    const manualEvents = structuredClone(run.events);
    manualEvents[event].kind = "move_added";
    writeFileSync(diffPath, JSON.stringify(manualEvents));
    expect(plan(run.root, approval).decisions).toHaveLength(1);
    const noMapping = structuredClone(approval);
    noMapping.decisions[0].mappingReason = "";
    expect(() => plan(run.root, noMapping)).toThrow(/mapping/);
    writeFileSync(diffPath, originalDiff);
    const rawPath = join(run.root, "raw/after-ryu.raw"),
      rawBytes = readFileSync(rawPath);
    writeFileSync(rawPath, "tampered source");
    expect(() => plan(run.root, approval)).toThrow(/hash/);
    writeFileSync(rawPath, rawBytes);
    for (const recovery of ["全体14", "8"]) {
      const source = structuredClone(after);
      source.rows[0].recovery = recovery;
      writeFileSync(join(tmp, "after/ryu.json"), JSON.stringify(source));
      const totalRun = await scan({
        baseline: join(tmp, "before"),
        incoming: join(tmp, "after"),
        output: join(tmp, "runs"),
        production,
        policy,
      });
      const index = totalRun.events.findIndex(
          (e: any) => e.kind === "move_changed",
        ),
        evidence = totalRun.events[index].after.whiffTotal;
      const totalApproval = {
        ...approval,
        runId: totalRun.manifest.id,
        contextHash: totalRun.manifest.contextHash,
        decisions: [
          {
            ...approval.decisions[0],
            event: index,
            field: "total",
            before: move.frames.total,
            after: {
              status: "confirmed",
              numeric: 14,
              display: "14",
              provenance: recovery.startsWith("全体")
                ? "source"
                : "verified_calculation",
              calculation: recovery.startsWith("全体")
                ? null
                : evidence.evidence,
            },
            sourceHash: totalRun.manifest.inputs.find(
              (i: any) => i.side === "after",
            ).hash,
          },
        ],
      };
      expect(plan(totalRun.root, totalApproval).decisions).toHaveLength(1);
      totalApproval.decisions[0].after.provenance = "wrong";
      expect(() => plan(totalRun.root, totalApproval)).toThrow(/provenance/);
    }
    for (const mutate of [
      (a: any) => (a.contextHash = "stale"),
      (a: any) => (a.decisions[0].before.numeric = 99),
      (a: any) => a.decisions.push(a.decisions[0]),
      (a: any) => (a.decisions[0].sourceHash = "wrong"),
      (a: any) => (a.decisions[0].approved = false),
    ]) {
      const a = structuredClone(approval);
      mutate(a);
      expect(() => plan(run.root, a)).toThrow();
    }
    const isolated = join(tmp, "project");
    mkdirSync(isolated);
    for (const p of [
      ...new Set([
        ...execFileSync("git", ["ls-files", "-z"])
          .toString()
          .split("\0")
          .filter(Boolean),
        "scripts/reviewed-updates.ts",
        "scripts/review-update.ts",
      ]),
    ]) {
      mkdirSync(dirname(join(isolated, p)), { recursive: true });
      copyFileSync(join(root, p), join(isolated, p));
    }
    symlinkSync(join(root, ".git"), join(isolated, ".git"), "dir");
    symlinkSync(
      join(root, "node_modules"),
      join(isolated, "node_modules"),
      "dir",
    );
    const original = readFileSync(
      join(isolated, "data/adoption-decisions.json"),
      "utf8",
    );
    const bad = structuredClone(approval);
    const protectedPolicy = {
      ...policy,
      fixtureCorrection: {
        moveId: move.id,
        field: "startup",
        reason: "existing correction",
      },
    };
    writeFileSync(
      join(isolated, "data/adoption-decisions.json"),
      JSON.stringify(protectedPolicy),
    );
    const conflictRun = await scan({
      baseline: join(tmp, "before"),
      incoming: join(tmp, "after"),
      output: join(tmp, "runs"),
      production,
      policy: protectedPolicy,
    });
    expect(() =>
      plan(
        conflictRun.root,
        {
          ...approval,
          runId: conflictRun.manifest.id,
          contextHash: conflictRun.manifest.contextHash,
        },
        isolated,
      ),
    ).toThrow(/conflict/);
    writeFileSync(join(isolated, "data/adoption-decisions.json"), original);
    bad.decisions[0].before.numeric = 100;
    expect(() => execute(run.root, bad, isolated, true)).toThrow();
    expect(
      readFileSync(join(isolated, "data/adoption-decisions.json"), "utf8"),
    ).toBe(original);
    const inputPath = join(isolated, policy.characters[0].candidatePath),
      inputBytes = readFileSync(inputPath);
    writeFileSync(inputPath, "invalid fixture JSON");
    expect(() => execute(run.root, approval, isolated, true)).toThrow();
    expect(
      readFileSync(join(isolated, "data/adoption-decisions.json"), "utf8"),
    ).toBe(original);
    writeFileSync(inputPath, inputBytes);
    expect(execute(run.root, approval, isolated, false)).toMatchObject({
      dryRun: true,
    });
    expect(
      readFileSync(join(isolated, "data/adoption-decisions.json"), "utf8"),
    ).toBe(original);
    expect(execute(run.root, approval, isolated, true)).toMatchObject({
      written: true,
    });
    expect(
      read(join(isolated, "data/characters/ryu.json")).moves.find(
        (m: any) => m.id === move.id,
      ).frames.startup.numeric,
    ).toBe(5);
    expect(execute(run.root, approval, isolated, true)).toEqual({
      alreadyApplied: true,
    });
    execFileSync(
      process.execPath,
      [
        "--test",
        "--test-concurrency=1",
        "tests/current-snapshot.test.mjs",
        "tests/compound-startup-regression.test.mjs",
        "tests/held-range-review.test.mjs",
      ],
      { cwd: isolated, stdio: "pipe" },
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}, 30000);
