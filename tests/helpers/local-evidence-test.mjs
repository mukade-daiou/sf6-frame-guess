import test from "node:test";

export const localEvidenceTest =
  process.env.SF6_WITHOUT_SOURCE_CAPTURES === "1" ? test.skip : test;
