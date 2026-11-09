import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-distance" },
  });
const ev = (code) => JSON.parse(run("eval", code));
const click = (label) =>
  ev(
    `(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b) throw Error('button'); b.click(); return true; })()`,
  );
const ids = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .sort();
mkdirSync("staging/verification/distance-ranges", { recursive: true });
for (const width of [1280, 320]) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev(`Math.random = () => ${(ids.indexOf("jp") + 0.5) / 32}; true`);
  click("ゲーム開始");
  click("必殺技・SA");
  ev(`document.querySelector('.lever').focus(); true`);
  for (const d of "236") run("press", d);
  click("強K");
  click("質問する");
  assert.match(ev("document.querySelector('ol.history').textContent"), /\+6~/);
  assert.match(ev("document.querySelector('ol.history').textContent"), /-8~/);
  click("Hard");
  assert.doesNotMatch(
    ev("document.querySelector('ol.history').textContent"),
    /-8~/,
  );
  click("Normal");
  assert.match(ev("document.querySelector('ol.history').textContent"), /-8~/);
  assert.equal(ev("document.documentElement.scrollWidth <= innerWidth"), true);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}.png`,
    "--full",
  );
  run("open", "http://127.0.0.1:4173/#/moves");
  run("wait", "#moves-character");
  run("select", "#moves-character", "jp");
  run("fill", 'input[type="search"]', "214");
  assert.match(ev("document.querySelector('.moves-table').textContent"), /26~/);
  ev(
    "(() => { const s = document.querySelector('.moves-scroll'); s.scrollLeft += document.querySelector('.move-frame').getBoundingClientRect().left - s.getBoundingClientRect().left; return true; })()",
  );
  assert.equal(ev("document.documentElement.scrollWidth <= innerWidth"), true);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}-list-open.png`,
    "--full",
  );
  run("fill", 'input[type="search"]', "236");
  assert.match(
    ev("document.querySelector('.moves-table').textContent"),
    /\+6~/,
  );
  assert.match(ev("document.querySelector('.moves-table').textContent"), /-8~/);
  ev(
    "(() => { const s = document.querySelector('.moves-scroll'); s.scrollLeft += document.querySelector('.move-frame').getBoundingClientRect().left - s.getBoundingClientRect().left; return true; })()",
  );
  assert.equal(ev("document.documentElement.scrollWidth <= innerWidth"), true);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}-list-signed.png`,
    "--full",
  );
  run("select", "#moves-character", "m_bison");
  run("fill", 'input[type="search"]', "[2]8");
  assert.match(
    ev("document.querySelector('.moves-table').textContent"),
    /16~47/,
  );
  ev(
    "(() => { const s = document.querySelector('.moves-scroll'); s.scrollLeft += document.querySelector('.move-frame').getBoundingClientRect().left - s.getBoundingClientRect().left; return true; })()",
  );
  assert.equal(ev("document.documentElement.scrollWidth <= innerWidth"), true);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}-list-closed.png`,
    "--full",
  );
  for (const [id, search, values] of [
    ["cammy", "236", ["-12~0", "-14~0"]],
    ["terry", "214", ["-8~+5", "-6~+2"]],
  ]) {
    run("select", "#moves-character", id);
    run("fill", 'input[type="search"]', search);
    for (const value of values)
      assert.ok(
        ev("document.querySelector('.moves-table').textContent").includes(
          value,
        ),
      );
    ev(
      "(() => { const s = document.querySelector('.moves-scroll'); s.scrollLeft += document.querySelector('.move-frame').getBoundingClientRect().left - s.getBoundingClientRect().left; return true; })()",
    );
    assert.equal(
      ev("document.documentElement.scrollWidth <= innerWidth"),
      true,
    );
    run(
      "screenshot",
      `staging/verification/distance-ranges/${width}-held-${id}.png`,
      "--full",
    );
  }
}
console.log("PC/320px signed ranges and mode history passed");
for (const width of [1280, 320]) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev(`Math.random = () => ${(ids.indexOf("luke") + 0.5) / 32}; true`);
  click("ゲーム開始");
  click("必殺技・SA");
  ev("document.querySelector('.lever').focus(); true");
  for (const d of "236236") run("press", d);
  click("強K");
  click("質問する");
  assert.ok(
    ev("document.querySelector('ol.history').textContent").includes("10~27"),
  );
  click("Hard");
  assert.ok(
    ev("document.querySelector('ol.history').textContent").includes("10~27"),
  );
  click("Normal");
  assert.equal(ev("document.querySelectorAll('ol.history li').length"), 1);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}-stage2-game.png`,
    "--full",
  );
  run("open", "http://127.0.0.1:4173/#/moves");
  run("wait", "#moves-character");
  run("select", "#moves-character", "luke");
  run("fill", 'input[type="search"]', "236236");
  assert.ok(
    ev("document.querySelector('.moves-table').textContent").includes("10~27"),
  );
  ev(
    "(() => { const s = document.querySelector('.moves-scroll'); s.scrollLeft += document.querySelector('.move-frame').getBoundingClientRect().left - s.getBoundingClientRect().left; return true; })()",
  );
  assert.equal(ev("document.documentElement.scrollWidth <= innerWidth"), true);
  run(
    "screenshot",
    `staging/verification/distance-ranges/${width}-stage2-list.png`,
    "--full",
  );
}
console.log("Stage2 Luke SA3 PC/320px gameplay and inventory passed");
