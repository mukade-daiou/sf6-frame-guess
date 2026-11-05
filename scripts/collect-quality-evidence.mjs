import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = "staging/sf6-frame-data",
  out = "staging/sf6-frame-data-quality/evidence";
await mkdir(out, { recursive: true });
const manifest = JSON.parse(
  await readFile(`${root}/collection-report.json`, "utf8"),
);
const results = [];
async function get(url) {
  const retrievedAt = new Date().toISOString();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return { url, retrievedAt, status: r.status, body: await r.text() };
  } catch (e) {
    return { url, retrievedAt, status: null, error: String(e), body: "" };
  }
}
const queue = [...manifest.characters];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const { id } = queue.shift();
      const raw = JSON.parse(await readFile(`${root}/raw/${id}.json`, "utf8"));
      const sourceUrl = raw.moves.find((m) =>
        /\/Frame_data$/.test(m.source?.url),
      )?.source.url;
      if (!sourceUrl) throw new Error(`Missing character source URL: ${id}`);
      const chara = decodeURIComponent(sourceUrl.split("/").at(-2));
      const params = new URLSearchParams({
        action: "cargoquery",
        format: "json",
        tables: "SF6_FrameData",
        fields: "chara,input,startup,total,hitAdv,blockAdv,notes",
        where: `chara="${chara}"`,
        limit: "500",
      });
      const r = await get(`https://srk.shib.live/api.php?${params}`);
      let data;
      try {
        data = JSON.parse(r.body);
      } catch {
        data = null;
      }
      const record = {
        ...r,
        body: undefined,
        characterId: id,
        gameVersion: "UNVERIFIED",
        license: "CC-BY-SA-4.0",
        attribution: "SuperCombo Wiki contributors",
        data,
      };
      await writeFile(
        `${out}/${id}.cargo.json`,
        JSON.stringify(record, null, 2) + "\n",
      );
      results.push({
        id,
        status: r.status,
        rows: data?.cargoquery?.length ?? 0,
        error: data?.error ?? r.error ?? null,
      });
    }
  }),
);
const probes = [];
for (const url of [
  "https://www.streetfighter.com/6/ja-jp/character/ryu/frame",
  "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261013",
  "https://www.streetfighter.com/6/buckler/ja-jp/battle_change/20261016",
  "https://www.sf6-lab.com/",
  "https://frame-search.com/history",
  "https://frame-search.com/?lang=en-us&character_name=ARJUN",
  "https://frame-search.com/?lang=en-us&character_name=Jamie",
  "https://frame-search.com/?lang=en-us&character_name=Marisa&category=Special%20Moves",
]) {
  const r = await get(url);
  const text = r.body
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ");
  const terms = [
    "Crush Dissent",
    "Crouching Heavy Kick",
    "Standing Light Punch",
    "Gladius",
    "2026/10/16",
    "2026/10/13",
    "2026/09/08",
  ];
  probes.push({
    ...r,
    body: undefined,
    title: r.body.match(/<title>(.*?)<\/title>/s)?.[1],
    displayedVersion: text.match(/Ver\.\d+\.\d+\.\d+/)?.[0] ?? null,
    observations: terms.flatMap((term) => {
      const at = text.indexOf(term);
      return at < 0 ? [] : [{ term, excerpt: text.slice(at, at + 300) }];
    }),
  });
}
await writeFile(
  `${out}/source-checks.json`,
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      cargo: results.sort((a, b) => a.id.localeCompare(b.id)),
      probes,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(results));
