// Historical stage 15C browser procedure: requires the former SA-level UI.
// Current UI verification starts at scripts/verify-gameplay.mjs.
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-review-browser",
    },
  }).trim();
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const assert = (x, m) => {
  if (!x) throw new Error(m);
};
const click = (label) =>
  ev(async (label) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    if (!b || b.disabled) throw new Error(label);
    b.click();
    await new Promise((r) => setTimeout(r, 35));
    return true;
  }, label);
const ids = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();
const command = () => {
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  for (const d of "214214") run("press", d);
};
const out = "staging/sa-review/browser";
mkdirSync(out, { recursive: true });
const results = [];
for (const width of [1280, 768, 390, 320])
  for (const [target, button, field, value] of [
    ["aki", "P", 3, "-19"],
    ["ed", "P", 3, "+65"],
    ["sagat", "K", 2, "D"],
  ]) {
    run("open", "http://127.0.0.1:4173/");
    run("set", "viewport", String(width), "1000");
    ev(
      (draw) => {
        Math.random = () => draw;
        return true;
      },
      (ids.indexOf(target) + 0.5) / 32,
    );
    click("ゲーム開始");
    click("SA");
    click("SA2");
    for (const s of ["弱", "中", "強"]) {
      command();
      click(s + button);
      click("質問する");
    }
    const frames = ev(() =>
      [...document.querySelectorAll("ol.history li")].map((li) =>
        [...li.querySelectorAll("dd")].map((e) => e.textContent),
      ),
    );
    assert(
      frames.length === 3 && frames.every((f) => f[field] === value),
      `${target} values`,
    );
    click("Hard");
    assert(
      ev(() => document.querySelectorAll("ol.history dd").length) === 3,
      "Hard",
    );
    command();
    click("弱" + button);
    click("質問する");
    assert(
      ev(() => document.querySelectorAll("ol.history li").length) === 3,
      "duplicate",
    );
    click("Normal");
    command();
    click("弱" + button);
    click("SA3");
    assert(
      ev(() => document.querySelector('button[type="submit"]').disabled),
      "level clear",
    );
    click("回答へ進む");
    assert(
      ev(() => document.querySelectorAll('input[name="answer"]').length) === 32,
      "roster",
    );
    click("質問に戻る");
    click("回答へ進む");
    ev(async (id) => {
      document.querySelector(`input[value="${id}"]`).click();
      await new Promise((r) => setTimeout(r, 35));
      return true;
    }, target);
    click("回答確定");
    assert(
      ev(() => document.querySelector(".verdict").textContent.trim()) ===
        "正解！",
      "result",
    );
    click("Normal");
    if (target === "sagat") run("screenshot", `${out}/${width}.png`, "--full");
    assert(
      ev(() => document.documentElement.scrollWidth <= innerWidth),
      "overflow",
    );
    click("再プレイ");
    results.push({
      width,
      target,
      frames,
      strengthIndependent: true,
      duplicateAcrossModes: true,
      levelReset: true,
      roster32: true,
      resultAndReplay: true,
    });
  }
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({ passed: results.length }));
