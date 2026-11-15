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
import {
  officialCandidate,
  loadOfficialCharacter,
} from "../../../scripts/official-additions";
import { validateDataset } from "./loader";
import { startGame, ask } from "../../features/game/engine";
// @ts-ignore shared historical projection
import { restoreReviewedUpdates } from "../../../scripts/compound-startup-projection.mjs";
// @ts-ignore source scanner is shared Node JS
import { scan } from "../../../scripts/lib/source-scan.mjs";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
it("reviews, rejects stale/conflicting approvals and regenerates only approved fields in an isolated fixture", async () => {
  const root = process.cwd(),
    tmp = mkdtempSync(join(tmpdir(), "sf6-review-test-"));
  try {
    for (const id of ["ryu", "ingrid", "alex", "cviper"]) {
      const source = read(`staging/official-verification/sources/${id}.json`);
      const proposal = officialCandidate(
        source,
        id,
        "UNVERIFIED",
        new Date().toISOString(),
      );
      const ordinary = proposal.rows.filter(
        (r: any) =>
          r.sourceRow.section === "通常技" &&
          /^(立ち|しゃがみ)/.test(r.sourceRow.name) &&
          r.sourceRow.notes &&
          r.sourceRow.notes
            .split(/\r?\n/)
            .every((line: string) =>
              [
                "連打キャンセル対応",
                "強制立ち効果",
                "ハイジャンプキャンセル可能",
              ].includes(line.trim()),
            ),
      );
      expect(ordinary.length).toBeGreaterThan(0);
      for (const r of ordinary) {
        expect(r.classification).toBe("accepted");
        expect(
          r.moves.every((m: any) => m.notes.includes(r.sourceRow.notes)),
        ).toBe(true);
      }
      for (const r of proposal.rows.filter(
        (r: any) =>
          r.sourceRow.section === "通常技" &&
          /^(立ち|しゃがみ)/.test(r.sourceRow.name) &&
          /ホールド|ヒット時|空振り時|パニッシュ/.test(r.sourceRow.notes),
      ))
        expect(["held", "excluded"]).toContain(r.classification);
    }
    for (const note of [
      "連打キャンセル対応\nホールドで性能変化",
      "強化状態で発生変化",
      "距離によって変化",
      "派生可能",
      "接触時のみ変化",
      "未確認の注記",
    ]) {
      const source = read("tests/fixtures/source-scan/new-character.json");
      source.rows[0].notes = note;
      expect(
        officialCandidate(
          source,
          "fixture_new",
          "UNVERIFIED",
          new Date().toISOString(),
        ).rows[0].classification,
      ).toBe("held");
    }
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
    const wrong = structuredClone(approval);
    wrong.decisions[0].moveId = "ryu__normal_2_P_L";
    wrong.decisions[0].mappingReason =
      "Wrong grounded normal despite manual reason";
    expect(() => plan(run.root, wrong)).toThrow(
      /does not match official source/,
    );
    for (const file of readdirSync(
      "staging/official-verification/sources",
    ).filter((f) => f.endsWith(".json"))) {
      const p = officialCandidate(
        read(`staging/official-verification/sources/${file}`),
        file.slice(0, -5),
        "UNVERIFIED",
        new Date().toISOString(),
      );
      expect(p.character.id).toBe(file.slice(0, -5));
      expect(p.rows.length).toBeGreaterThan(0);
    }
    const diffPath = join(run.root, "diff.json"),
      originalDiff = readFileSync(diffPath);
    for (const mutate of [
      (e: any) => (e.kind = "move_added"),
      (e: any) => (e.changes[0].path = ["frames", "block", "numeric"]),
      (e: any) => (e.productionMoveIds = ["other-move"]),
      (e: any) => (e.state = "unmatched"),
    ]) {
      const modified = structuredClone(run.events);
      mutate(modified[event]);
      writeFileSync(diffPath, JSON.stringify(modified));
      expect(() => plan(run.root, approval)).toThrow(/Saved diff/);
      expect(() => template(run.root)).toThrow(/Saved diff/);
    }
    writeFileSync(diffPath, originalDiff);
    const rawPath = join(run.root, "raw/after-ryu.raw"),
      rawBytes = readFileSync(rawPath);
    writeFileSync(rawPath, "tampered source");
    expect(() => plan(run.root, approval)).toThrow(/hash/);
    writeFileSync(rawPath, rawBytes);
    const addedSource = structuredClone(before);
    addedSource.rows.push({
      ...after.rows[0],
      officialId: "new-move",
      name: "new move",
    });
    writeFileSync(join(tmp, "after/ryu.json"), JSON.stringify(addedSource));
    const addedRun = await scan({
      baseline: join(tmp, "before"),
      incoming: join(tmp, "after"),
      output: join(tmp, "runs"),
      production,
      policy,
    });
    const addedApproval = {
      ...approval,
      runId: addedRun.manifest.id,
      contextHash: addedRun.manifest.contextHash,
      decisions: [
        {
          ...approval.decisions[0],
          event: addedRun.events.findIndex((e: any) => e.kind === "move_added"),
          sourceHash: addedRun.manifest.inputs.find(
            (i: any) => i.side === "after",
          ).hash,
        },
      ],
    };
    expect(() => plan(addedRun.root, addedApproval)).toThrow(
      /Invalid\/duplicate approval/,
    );
    expect(template(addedRun.root).decisions[0]).toMatchObject({
      kind: "add_move",
      approved: false,
    });
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
    const alteredReplay = structuredClone(run.events);
    alteredReplay[event].kind = "move_added";
    writeFileSync(diffPath, JSON.stringify(alteredReplay));
    expect(() => execute(run.root, approval, isolated, true)).toThrow(
      /Saved diff/,
    );
    writeFileSync(diffPath, originalDiff);
    const current = read(join(isolated, "data/characters/ryu.json")),
      appliedPolicy = read(join(isolated, "data/adoption-decisions.json"));
    const projected = restoreReviewedUpdates(current, appliedPolicy);
    expect(
      projected.moves.find((m: any) => m.id === move.id).frames.startup,
    ).toEqual(move.frames.startup);
    expect(restoreReviewedUpdates(projected, appliedPolicy)).toEqual(projected);
    const reverted = structuredClone(current);
    reverted.moves.find((m: any) => m.id === move.id).frames.startup =
      move.frames.startup;
    expect(() => restoreReviewedUpdates(reverted, appliedPolicy)).toThrow(
      /Unauthorized reviewed update/,
    );
    expect(() =>
      restoreReviewedUpdates(structuredClone(projected), appliedPolicy),
    ).toThrow(/Unauthorized reviewed update/);
    const chainedPolicy = structuredClone(appliedPolicy);
    const later = {
      ...appliedPolicy.reviewedUpdates[0].decisions[0],
      before: approval.decisions[0].after,
      after: { status: "confirmed", display: "6", numeric: 6 },
    };
    chainedPolicy.reviewedUpdates.push({ decisions: [later] });
    const latest = structuredClone(current);
    latest.moves.find((m: any) => m.id === move.id).frames.startup =
      later.after;
    expect(restoreReviewedUpdates(latest, chainedPolicy)).toEqual(projected);
    expect(() => restoreReviewedUpdates(current, chainedPolicy)).toThrow(
      /Unauthorized reviewed update/,
    );
    expect(() => restoreReviewedUpdates(projected, chainedPolicy)).toThrow(
      /policy mismatch/,
    );
    const alteredProjection = restoreReviewedUpdates(current, appliedPolicy);
    alteredProjection.moves.find((m: any) => m.id === move.id).frames.startup =
      approval.decisions[0].after;
    expect(() =>
      restoreReviewedUpdates(alteredProjection, appliedPolicy),
    ).toThrow(/Unauthorized reviewed projection/);
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
    const freshProduction = readdirSync(join(isolated, "data/characters"))
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => read(join(isolated, "data/characters", f)));
    const newSource = read("tests/fixtures/source-scan/new-character.json");
    const addedRow = {
      ...before.rows[0],
      officialId: "new-special",
      name: "Fixture new special",
      section: "必殺技",
      commandImages: ["/key-d.png", "/key-d.png", "/icon_kick_l.png"],
    };
    writeFileSync(
      join(tmp, "after/ryu.json"),
      JSON.stringify({ ...before, rows: [...before.rows, addedRow] }),
    );
    writeFileSync(join(tmp, "after/new.json"), JSON.stringify(newSource));
    writeFileSync(
      join(tmp, "after/inventory.json"),
      JSON.stringify({
        complete: true,
        characters: [
          { id: "ryu", file: "ryu.json" },
          { id: "fixture_new", file: "new.json" },
        ],
      }),
    );
    const additionRun = await scan({
      baseline: join(tmp, "before"),
      incoming: join(tmp, "after"),
      output: join(tmp, "runs"),
      production: freshProduction,
      policy: appliedPolicy,
    });
    const additionApproval = template(additionRun.root);
    additionApproval.datasetId = "fixture-additions";
    for (const d of additionApproval.decisions) {
      d.approved = true;
      d.reason = "Saved fictional fixture reviewed";
      if (d.kind === "add_character")
        d.names = {
          nameJa: "追加検証キャラクター",
          nameEn: "Addition Test Character",
        };
      if (d.kind === "add_move")
        d.moves = d.proposal.rows.find(
          (r: any) => r.sourceRow.name === addedRow.name,
        ).moves;
    }
    const newCandidate = additionApproval.decisions.find(
      (d: any) => d.kind === "add_character",
    ).proposal.character;
    expect(newCandidate.adoption.status).toBe("accepted");
    expect(
      newCandidate.moves.filter((m: any) => m.category === "normal"),
    ).toHaveLength(12);
    expect(
      newCandidate.moves.filter((m: any) => m.category === "super_art"),
    ).toHaveLength(9);
    expect(newCandidate.moves.some((m: any) => m.input.strength === "OD")).toBe(
      true,
    );
    for (const mutate of [
      (a: any) => a.decisions.forEach((d: any) => (d.approved = false)),
      (a: any) =>
        a.decisions.push(a.decisions.find((d: any) => d.kind === "add_move")),
      (a: any) =>
        (a.decisions.find((d: any) => d.kind === "add_move").moves[0].id =
          "duplicate"),
      (a: any) =>
        (a.decisions.find((d: any) => d.kind === "add_character").names.nameJa =
          ""),
      (a: any) =>
        (a.decisions.find((d: any) => d.kind === "add_character").names.nameEn =
          "fixture_new"),
    ]) {
      const bad = structuredClone(additionApproval);
      mutate(bad);
      expect(() => plan(additionRun.root, bad, isolated)).toThrow();
    }
    const collidingRow = {
      ...addedRow,
      commandImages: [
        "/key-d.png",
        "/key-dr.png",
        "/key-r.png",
        "/icon_punch_l.png",
      ],
    };
    writeFileSync(
      join(tmp, "after/ryu.json"),
      JSON.stringify({ ...before, rows: [...before.rows, collidingRow] }),
    );
    const collisionRun = await scan({
      baseline: join(tmp, "before"),
      incoming: join(tmp, "after"),
      output: join(tmp, "runs"),
      production: freshProduction,
      policy: appliedPolicy,
    });
    const collisionApproval = template(collisionRun.root);
    collisionApproval.datasetId = "collision";
    const collisionDecision = collisionApproval.decisions.find(
      (d: any) => d.kind === "add_move",
    );
    collisionDecision.approved = true;
    collisionDecision.reason = "fixture collision";
    collisionDecision.moves = collisionDecision.proposal.rows.find(
      (r: any) => r.sourceRow.name === addedRow.name,
    ).moves;
    expect(() => plan(collisionRun.root, collisionApproval, isolated)).toThrow(
      /Duplicate move ID or question input/,
    );
    const partial = structuredClone(newSource);
    partial.rows.pop();
    const incomplete = officialCandidate(
      partial,
      "fixture_new",
      policy.gameVersion,
      new Date().toISOString(),
    ).character;
    expect(incomplete.adoption?.status).toBe("held");
    expect(
      validateDataset(read("data/metadata.json"), { incomplete }).eligible,
    ).toHaveLength(0);
    const noOD = structuredClone(newSource);
    const heldVariant = structuredClone(newSource);
    heldVariant.rows.push({
      ...heldVariant.rows[0],
      name: "立ち弱P（ホールド）",
    });
    expect(
      officialCandidate(
        heldVariant,
        "fixture_new",
        policy.gameVersion,
        new Date().toISOString(),
      ).character.adoption?.status,
    ).toBe("accepted");
    noOD.rows = noOD.rows.filter((r: any) => r.name !== "Fixture od");
    expect(
      officialCandidate(
        noOD,
        "fixture_new",
        policy.gameVersion,
        new Date().toISOString(),
      ).character.coverage.special.status,
    ).toBe("partial");
    for (const row of [
      { ...newSource.rows[12], section: "Unrecognized section" },
      {
        ...newSource.rows[12],
        commandImages: [
          "/key-d.png",
          "/key-dr.png",
          "/key-r.png",
          "/icon_punch_l.png",
          "/icon_punch_m.png",
          "/icon_punch_h.png",
        ],
      },
    ]) {
      const unresolved = structuredClone(newSource);
      unresolved.rows.push(row);
      expect(
        officialCandidate(
          unresolved,
          "fixture_new",
          policy.gameVersion,
          new Date().toISOString(),
        ).character.adoption?.status,
      ).toBe("held");
    }
    const collision = structuredClone(newSource);
    collision.rows.push({ ...collision.rows[12], name: "duplicate input" });
    const ambiguous = officialCandidate(
      collision,
      "fixture_new",
      policy.gameVersion,
      new Date().toISOString(),
    ).character;
    expect(ambiguous.adoption?.status).toBe("held");
    expect(ambiguous.moves.some((m) => m.variant.kind === "conditional")).toBe(
      true,
    );
    expect(
      execute(additionRun.root, additionApproval, isolated, true),
    ).toMatchObject({ written: true });
    expect(execute(additionRun.root, additionApproval, isolated, true)).toEqual(
      { alreadyApplied: true },
    );
    const files = Object.fromEntries(
      readdirSync(join(isolated, "data/characters"))
        .filter((f) => f.endsWith(".json"))
        .map((f) => [f, read(join(isolated, "data/characters", f))]),
    );
    const dataset = validateDataset(
      read(join(isolated, "data/metadata.json")),
      files,
    );
    expect(dataset.errors).toEqual([]);
    expect(dataset.characters).toHaveLength(freshProduction.length + 1);
    expect(dataset.eligible.some((c) => c.id === "fixture_new")).toBe(true);
    expect(
      dataset.characters.find((c) => c.id === "fixture_new"),
    ).toMatchObject({
      nameJa: "追加検証キャラクター",
      nameEn: "Addition Test Character",
    });
    const namedPolicy = read(join(isolated, "data/adoption-decisions.json"));
    const recorded = namedPolicy.characters.find(
      (d: any) => d.id === "fixture_new",
    );
    const absolute = {
      ...recorded,
      officialSource: join(isolated, recorded.officialSource),
      candidatePath: join(isolated, recorded.candidatePath),
    };
    expect(
      loadOfficialCharacter(
        absolute,
        namedPolicy.gameVersion,
        namedPolicy.reviewedUpdates,
      ).nameEn,
    ).toBe("Addition Test Character");
    const altered = structuredClone(namedPolicy.reviewedUpdates);
    altered
      .flatMap((b: any) => b.decisions)
      .find((d: any) => d.kind === "add_character").names.nameJa =
      "改変された名称";
    expect(() =>
      loadOfficialCharacter(absolute, namedPolicy.gameVersion, altered),
    ).toThrow(/candidate\/coverage mismatch/);
    const index = dataset.eligible.findIndex((c) => c.id === "fixture_new"),
      game = startGame(
        dataset,
        "startup",
        5,
        () => (index + 0.5) / dataset.eligible.length,
      );
    const unknown = newCandidate.moves.find(
      (m: any) => m.frames.startup.status === "unknown",
    );
    expect(ask(game, unknown.input).game.history).toHaveLength(0);
    for (const c of freshProduction) {
      const after = dataset.characters.find((x) => x.id === c.id)!;
      expect(after.moves.filter((m) => !m.id.includes("__official_"))).toEqual(
        c.moves,
      );
    }
    const stale = structuredClone(additionApproval);
    stale.datasetId = "stale-addition";
    expect(() => plan(additionRun.root, stale, isolated)).toThrow(/Stale/);
    execFileSync(
      process.execPath,
      ["--test", "tests/current-snapshot.test.mjs"],
      { cwd: isolated, stdio: "pipe" },
    );
    execFileSync(process.execPath, ["scripts/run-data-tests.mjs", "history"], {
      cwd: isolated,
      stdio: "inherit",
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}, 90000);
