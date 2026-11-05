import { mkdir, writeFile } from "node:fs/promises";
const out = "staging/sf6-frame-data-stage6/evidence";
await mkdir(out, { recursive: true });
const urls = {
  tracker_ken: "https://update-tracker.org/ja/topics/sf6/ken/",
  tracker_marisa: "https://update-tracker.org/en/topics/sf6/marisa/",
  history: "https://frame-search.com/history",
  official_20260803:
    "https://www.streetfighter.com/6/buckler/en/battle_change/20260803",
  official_20261013:
    "https://www.streetfighter.com/6/buckler/en/battle_change/20261013",
  official_20261016:
    "https://www.streetfighter.com/6/buckler/en/battle_change/20261016",
};
const results = await Promise.all(
  Object.entries(urls).map(async ([id, url]) => {
    let result = { url, retrievedAt: new Date().toISOString() };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      result = {
        ...result,
        status: response.status,
        body: await response.text(),
      };
    } catch (error) {
      result = { ...result, status: null, error: String(error), body: "" };
    }
    await writeFile(
      `${out}/${id}.json`,
      JSON.stringify(result, null, 2) + "\n",
    );
    return { id, ...result, body: undefined };
  }),
);
await writeFile(`${out}/index.json`, JSON.stringify(results, null, 2) + "\n");
console.log(results);
