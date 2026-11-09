import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("Japanese display names reproduce from saved references without treating missing markers as names", () => {
  execFileSync("node", ["scripts/build-move-names.mjs", "--check"]);
  const names = JSON.parse(
    readFileSync("src/features/moves/japanese-names.json", "utf8"),
  );
  for (const entries of Object.values(names))
    for (const name of Object.values(entries))
      assert.match(name, /[\u3040-\u30ff\u3400-\u9fff]/);
  assert.equal(names.ryu.ryu__special_236_P_L, "波動拳");
  assert.equal(names.arjun.arjun__special_22_K_H, undefined);
});
