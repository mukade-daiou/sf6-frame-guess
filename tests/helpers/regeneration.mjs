import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Legacy generators normalize JSON formatting. Verify semantics and restore
// their exact input bytes even on failure, so tests leave no production changes.
export function assertRegenerationPreserves(paths, scripts) {
  const before = paths.map((p) => readFileSync(p, "utf8"));
  try {
    for (const script of scripts) execFileSync(process.execPath, [script]);
    assert.deepEqual(
      paths.map((p) => JSON.parse(readFileSync(p, "utf8"))),
      before.map((text) => JSON.parse(text)),
    );
  } finally {
    paths.forEach((p, i) => {
      if (readFileSync(p, "utf8") !== before[i]) writeFileSync(p, before[i]);
    });
  }
}
