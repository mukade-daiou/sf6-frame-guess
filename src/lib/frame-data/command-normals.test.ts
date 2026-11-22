import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  applyCommandNormals,
  commandNormalCandidates,
} from "../../../scripts/command-normals";
import { digest } from "../../../scripts/reviewed-updates";
import ryu from "../../../data/characters/ryu.json";
import { characterSchema } from "./schema";
import { displayInput } from "./input";
import { resolveMove } from "./resolver";

function official(id: string) {
  const bytes = readFileSync(
    `staging/official-verification/sources/${id}.json`,
  );
  return { bytes, ...commandNormalCandidates(bytes, id, "UNVERIFIED") };
}

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
  const character = characterSchema.parse(ryu);
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
  expect(() => applyCommandNormals(applied, approval)).toThrow();
  expect(
    applyCommandNormals(character, {
      ...approval,
      approvedMoveIds: rows.map(({ move }) => move.id),
    }).coverage.command_normal?.status,
  ).toBe("complete");
});
