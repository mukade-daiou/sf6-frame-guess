import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  applyCommandNormals,
  commandNormalCandidates,
} from "../../../scripts/command-normals";
import { digest } from "../../../scripts/reviewed-updates";
import ryu from "../../../data/characters/ryu.json";
import { characterSchema } from "./schema";
import { displayInput } from "./input";
import { resolveMove } from "./resolver";
import { production } from "./datasets";
import policy from "../../../data/adoption-decisions.json";
// @ts-ignore shared historical projection
import { restoreCommandNormals } from "../../../scripts/compound-startup-projection.mjs";

function official(id: string) {
  const bytes = readFileSync(
    `staging/official-verification/sources/${id}.json`,
  );
  return { bytes, ...commandNormalCandidates(bytes, id, "UNVERIFIED") };
}

const it = test.skipIf(process.env.SF6_WITHOUT_SOURCE_CAPTURES === "1");
it("takes only direct official inputs, including alternate directions and standalone openers", () => {
  expect(
    official("chunli")
      .rows.filter(({ move }) => move.name === "追突拳")
      .map(({ move }) => displayInput(move.input)),
  ).toEqual(["4MP", "6MP"]);
  expect(
    official("luke").rows.find(({ opener }) => opener)?.move.frames.total,
  ).toMatchObject({ numeric: 37 });
  expect(
    official("dhalsim").rows.map(({ move }) => displayInput(move.input)),
  ).not.toContain("2HK");
  expect(official("jamie").rows.map(({ move }) => move.name)).toEqual([
    "落星脚",
    "仙姑肘",
    "旋影脚",
  ]);
  expect(
    official("guile")
      .rows.filter(({ move }) => move.name === "ローリングソバット")
      .map(({ move }) => move.frames.total),
  ).toMatchObject([{ numeric: 31 }, { numeric: 34 }]);
});

it("replays approved evidence only and preserves existing records", () => {
  const character = characterSchema.parse(
    restoreCommandNormals(ryu, policy.commandNormals.ryu),
  );
  const { bytes, rows } = official("ryu");
  const collarbone = rows.find(({ move }) => move.name === "鎖骨割り")!.move;
  const approval = {
    sourceHash: digest(bytes),
    candidateHash: digest(JSON.stringify(rows)),
    approvedMoveIds: [collarbone.id],
  };
  expect(resolveMove(character, collarbone.input, "normal").status).toBe(
    "unknown",
  );
  const applied = applyCommandNormals(character, approval);
  expect(applied.moves.slice(0, character.moves.length)).toEqual(
    character.moves,
  );
  expect(applied.coverage.command_normal?.status).toBe("partial");
  expect(resolveMove(applied, collarbone.input, "normal")).toEqual({
    status: "found",
    frames: collarbone.frames,
  });
  expect(collarbone.frames).toMatchObject({
    startup: { numeric: 20 },
    total: { numeric: 42 },
    hit: { display: "+3", numeric: 3 },
    block: { display: "-3", numeric: -3 },
  });
  expect(() =>
    applyCommandNormals(character, { ...approval, candidateHash: "stale" }),
  ).toThrow();
  expect(() =>
    applyCommandNormals(character, { ...approval, sourceHash: "stale" }),
  ).toThrow();
  expect(() =>
    applyCommandNormals(character, {
      ...approval,
      measurements: {
        [collarbone.id]: {
          before: 41,
          measured: 42,
          communityTotal: 42,
          evidence: "fixture",
        },
      },
    }),
  ).toThrow(/Stale command normal measurement/);
  expect(() => applyCommandNormals(applied, approval)).toThrow();
  expect(
    applyCommandNormals(character, {
      ...approval,
      approvedMoveIds: rows.map(({ move }) => move.id),
    }).coverage.command_normal?.status,
  ).toBe("complete");
});

it("resolves all 109 approved command normals in both modes, changing only six measured totals", () => {
  const measured: Record<string, number> = {
    blanka__normal_6_P_H: 52,
    elena__normal_3_K_H: 44,
    guile__normal_4_K_L: 27,
    juri__normal_6_K_M: 45,
    ryu__normal_4_P_H: 35,
    ryu__normal_4_K_H: 43,
    yasmine__normal_4_K_H: 48,
  };
  let inputs = 0;
  let changed = 0;
  expect(production.errors).toEqual([]);
  expect(production.eligible).toHaveLength(32);
  for (const character of production.eligible) {
    expect(character.coverage.command_normal).toEqual({
      status: "complete",
      verification: "unverified",
    });
    const { rows } = official(character.id);
    for (const { move } of rows) {
      inputs++;
      const current = character.moves.find((m) => m.id === move.id)!;
      expect(current).toMatchObject({ name: move.name, input: move.input });
      expect(production.inputs).toContainEqual(move.input);
      const total = measured[move.id];
      const before = move.frames.total;
      if (
        total !== undefined &&
        before.status === "confirmed" &&
        before.numeric !== total
      ) {
        changed++;
        expect(current.frames).toEqual({
          ...move.frames,
          total: {
            status: "confirmed",
            numeric: total,
            display: String(total),
            provenance: "source",
            calculation: null,
          },
        });
      } else {
        expect(current.frames).toEqual(move.frames);
      }
      for (const mode of ["normal", "startup"] as const)
        expect(resolveMove(character, move.input, mode)).toEqual({
          status: "found",
          frames: current.frames,
        });
    }
  }
  expect(inputs).toBe(109);
  expect(changed).toBe(6);
  const ken = production.eligible.find((c) => c.id === "ken")!;
  expect(policy.commandNormals.ken.approvedMoveIds).toEqual([]);
  for (const mode of ["normal", "startup"] as const)
    expect(
      resolveMove(
        ken,
        { type: "normal", direction: "6", button: "P", strength: "M" },
        mode,
      ),
    ).toEqual({ status: "not_found" });
});
