// Explicit one-off investigation only. Never imported by the app or build.
import { mkdir, writeFile } from "node:fs/promises";
const out = "staging/sf6-frame-data-stage7/evidence";
await mkdir(out, { recursive: true });
const urls = [
  "https://www.streetfighter.com/6/ja-jp/character/ken/frame",
  "https://www.streetfighter.com/6/ja-jp/character/marisa/frame",
  ...["20260803", "20261013", "20261016"].map(
    (date) =>
      `https://www.streetfighter.com/6/buckler/en/battle_change/${date}`,
  ),
  "https://update-tracker.org/ja/topics/sf6/ken/",
  "https://update-tracker.org/en/topics/sf6/marisa/",
];
const records = await Promise.all(
  urls.map(async (url, index) => {
    let record = { url, retrievedAt: new Date().toISOString() };
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      record = { ...record, status: r.status, body: await r.text() };
    } catch (error) {
      record = { ...record, status: null, body: "", error: String(error) };
    }
    await writeFile(
      `${out}/${index}.json`,
      JSON.stringify(record, null, 2) + "\n",
    );
    return { ...record, body: undefined };
  }),
);
await writeFile(`${out}/index.json`, JSON.stringify(records, null, 2) + "\n");
console.log(records);
