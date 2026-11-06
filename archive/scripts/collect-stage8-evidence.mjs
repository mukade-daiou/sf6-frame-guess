import { mkdir, writeFile } from "node:fs/promises";
const out = "archive/staging/sf6-frame-data-stage8/evidence";
await mkdir(out, { recursive: true });
const urls = {
  frame_ken_special_page2:
    "https://frame-search.com/api/rows?lang=en-us&character_name=Ken&category=Special%20Moves&pageNo=2",
  frame_marisa_special_page2:
    "https://frame-search.com/api/rows?lang=en-us&character_name=Marisa&category=Special%20Moves&pageNo=2",
  steam_official_news:
    "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1364780&count=100&maxlength=0&feeds=steam_community_announcements&format=json",
  frame_ken_special:
    "https://frame-search.com/?lang=en-us&character_name=Ken&category=Special%20Moves",
  frame_marisa_special:
    "https://frame-search.com/?lang=en-us&character_name=Marisa&category=Special%20Moves",
  frame_guide: "https://frame-search.com/guide?lang=en-us",
  frame_script: "https://frame-search.com/script.js",
  steam_news:
    "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1364780&count=100&maxlength=0&format=json",
  wiki_glossary: `https://srk.shib.live/api.php?${new URLSearchParams({ action: "parse", format: "json", page: "Street Fighter 6/Glossary", prop: "wikitext|revid" })}`,
};
const results = await Promise.all(
  Object.entries(urls)
    .filter(
      ([id]) =>
        !process.argv.slice(2).length || process.argv.slice(2).includes(id),
    )
    .map(async ([id, url]) => {
      let result = { url, retrievedAt: new Date().toISOString() };
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
        result = {
          ...result,
          status: r.status,
          finalUrl: r.url,
          body: await r.text(),
        };
      } catch (error) {
        result = { ...result, status: null, body: "", error: String(error) };
      }
      await writeFile(
        `${out}/${id}.json`,
        JSON.stringify(result, null, 2) + "\n",
      );
      return { id, ...result, body: undefined };
    }),
);
await writeFile(
  `${out}/${process.argv.length > 2 ? "supplement-index" : "index"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
console.log(results);
