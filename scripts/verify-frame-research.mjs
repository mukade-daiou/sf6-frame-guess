import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
const out = "staging/verification/stage17";
mkdirSync(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-stage17-browser",
    },
  }).trim();
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const click = (label) =>
  ev(async (label) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    if (!b || b.disabled) throw new Error(`Missing/disabled: ${label}`);
    b.click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  }, label);
const ids = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();
const assert = (value, message) => {
  if (!value) throw new Error(message);
};
const start = (id, width) => {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev(
    (n) => {
      Math.random = () => n;
      return true;
    },
    (ids.indexOf(id) + 0.5) / 32,
  );
  click("ゲーム開始");
};
const ask = (motion, button) => {
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  for (const d of motion) run("press", d);
  click(button);
  click("質問する");
};
const history = () =>
  ev(() =>
    [...document.querySelectorAll("ol.history li")].map((li) => ({
      text: li.textContent,
      frames: [...li.querySelectorAll("dd")].map((x) => x.textContent),
    })),
  );
const results = [];
for (const width of [1280, 390]) {
  start("ken", width);
  ask("2", "強K");
  assert(
    history()[0].frames.join(",") === "8,34,D,-10",
    "Ken researched total",
  );
  click("Hard");
  assert(history()[0].frames.join(",") === "8", "Ken Hard");
  ask("2", "強K");
  assert(history().length === 1, "Mode-independent duplicate");
  click("Normal");
  run("screenshot", `${out}/${width}-ken.png`, "--full");
  click("回答へ進む");
  ev(() => {
    document.querySelector('input[name="answer"][value="ken"]').click();
    return true;
  });
  click("回答確定");
  assert(
    ev(() => document.querySelector(".verdict").textContent) === "正解！",
    "Final answer",
  );
  click("再プレイ");
  assert(
    ev(
      () =>
        !!document.querySelector(".lever") &&
        !document.querySelector("ol.history li"),
    ),
    "Replay clears and enters play",
  );
  start("marisa", width);
  ask("2", "中K");
  assert(
    history()[0].frames.join(",") === "9,29,+5,-2",
    "Marisa researched total",
  );
  start("alex", width);
  click("必殺技・SA");
  ask("63214", "弱P");
  assert(
    history()[0].frames.join(",") === "9,61,D,-",
    "Explicit not-applicable block; existing hit unchanged",
  );
  start("jamie", width);
  click("必殺技・SA");
  for (const s of ["弱P", "中P", "強P"]) ask("22", s);
  assert(
    history().length === 3 &&
      history().every((h) => h.frames.join(",") === "48,50,-,-"),
    "Common strengths independently consume",
  );
  ask("22", "弱P");
  assert(history().length === 3, "Duplicate does not consume");
  click("Hard");
  ask("22", "中P");
  assert(
    history().length === 3 &&
      history().every((h) => h.frames.join(",") === "48"),
    "Hard duplicate and history",
  );
  start("ryu", width);
  click("必殺技・SA");
  ask("236", "弱K＋中K");
  assert(
    history().length === 0 &&
      ev(() => document.body.textContent.includes("残り 5回")),
    "Unresolved hit consumes no question",
  );
  click("Hard");
  ask("236", "弱K＋中K");
  assert(
    history().length === 1 && history()[0].frames.join(",") === "17",
    "Known startup remains usable",
  );
  click("Normal");
  assert(history()[0].frames.includes("不明"), "Saved unknown remains visible");
  run("screenshot", `${out}/${width}-unknown.png`, "--full");
  start("zangief", width);
  ask("5", "強P");
  assert(history().length === 0, "Unresolved HP Normal");
  click("Hard");
  ask("5", "強P");
  assert(history().length === 0, "Unresolved HP Hard");
  assert(
    ev(() => document.documentElement.scrollWidth <= innerWidth),
    "Horizontal overflow",
  );
  results.push({
    width,
    kenTotal34: true,
    marisaTotal29: true,
    explicitDash: true,
    sharedStrengthsIndependent: true,
    unknownNotConsumed: true,
    normalHard: true,
    answerAndReplay: true,
  });
}
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results));
