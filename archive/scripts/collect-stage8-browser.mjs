import { execFileSync } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
const out = "archive/staging/sf6-frame-data-stage8/evidence";
await mkdir(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
for (const id of ["ken", "marisa"]) {
  const url = `https://frame-search.com/?lang=en-us&character_name=${id === "ken" ? "Ken" : "Marisa"}&category=Special%20Moves`;
  run("open", url);
  for (let page = 1; page <= 2; page++) {
    const body = JSON.parse(
      run(
        "eval",
        `(async()=>{await new Promise(r=>setTimeout(r,500));return {url:location.href,table:document.querySelector('#frame_table')?.outerHTML??'',nav:document.querySelector('#fds-page-nav')?.innerText??'',versions:[...new Set(document.body.innerText.match(/Ver\\.\\d+\\.\\d+\\.\\d+/g)??[])]}})()`,
      ),
    );
    await writeFile(
      `${out}/browser_${id}_${page}.json`,
      JSON.stringify(
        { retrievedAt: new Date().toISOString(), ...body },
        null,
        2,
      ) + "\n",
    );
    console.log(id, page, body.nav);
    if (page === 1)
      run(
        "eval",
        `(()=>{const a=[...document.querySelectorAll('#fds-page-nav a')].find(a=>a.textContent.includes('Next'));if(!a)throw new Error('No next page');a.click();return 'clicked next';})()`,
      );
  }
}
