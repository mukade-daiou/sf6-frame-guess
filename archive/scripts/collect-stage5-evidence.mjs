import { mkdir, writeFile } from "node:fs/promises";
const out = "archive/staging/sf6-frame-data-stage5/evidence";
await mkdir(out, { recursive: true });
const urls = {
  frame_key: `https://srk.shib.live/api.php?${new URLSearchParams({ action: "parse", format: "json", page: "Template:FrameDataKey-SF6", prop: "wikitext|revid" })}`,
  official_ken: "https://www.streetfighter.com/6/ja-jp/character/ken/frame",
  official_marisa:
    "https://www.streetfighter.com/6/ja-jp/character/marisa/frame",
  official_changes:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change",
  official_20261013:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261013",
  official_20261016:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261016",
  official_20260803:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20260803",
  official_20260528:
    "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20260528",
  lab_ken: "https://sf6-lab.net/fighters/ken/frame",
  lab_marisa: "https://sf6-lab.net/fighters/marisa/frame",
};
for (const id of ["ken", "marisa"]) {
  urls[`wiki_${id}`] =
    `https://srk.shib.live/api.php?${new URLSearchParams({ action: "parse", format: "json", page: `Street Fighter 6/${id === "ken" ? "Ken" : "Marisa"}`, prop: "wikitext|revid", redirects: "true" })}`;
  urls[`pages_${id}`] =
    `https://srk.shib.live/api.php?${new URLSearchParams({ action: "query", format: "json", list: "allpages", apprefix: `Street Fighter 6/${id === "ken" ? "Ken" : "Marisa"}`, aplimit: "50" })}`;
}
const selected = process.argv.slice(2);
const records = await Promise.all(
  Object.entries(urls)
    .filter(([id]) => !selected.length || selected.includes(id))
    .map(async ([id, url]) => {
      let record = { id, url, retrievedAt: new Date().toISOString() };
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
        record = {
          ...record,
          status: r.status,
          finalUrl: r.url,
          body: await r.text(),
        };
      } catch (error) {
        record = { ...record, status: null, error: String(error), body: "" };
      }
      await writeFile(
        `${out}/${id}.json`,
        JSON.stringify(record, null, 2) + "\n",
      );
      return { ...record, body: undefined };
    }),
);
await writeFile(
  `${out}/${selected.length ? "supplement-index" : "index"}.json`,
  JSON.stringify(records, null, 2) + "\n",
);
console.log(JSON.stringify(records, null, 2));
