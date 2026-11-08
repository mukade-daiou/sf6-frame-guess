import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
const run = (...a) =>
  execFileSync("agent-browser", a, {
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-stage16-browser",
    },
  }).trim();
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const click = (t) =>
  ev(async (t) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === t,
    );
    if (!b || b.disabled) throw new Error(t);
    b.click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  }, t);
const ids = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();
const start = (id, width) => {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev(
    (x) => {
      Math.random = () => x;
      return true;
    },
    (ids.indexOf(id) + 0.5) / 32,
  );
  click("ゲーム開始");
  click("必殺技・SA");
};
const command = (s) => {
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  for (const d of s) run("press", d);
};
const ask = (motion, button) => {
  command(motion);
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
const assert = (a, m) => {
  if (!a) throw new Error(m);
};
const out = "staging/conditional-specials/browser";
mkdirSync(out, { recursive: true });
const results = [];
for (const width of [1280, 320]) {
  start("dee_jay", width);
  ask("22", "弱P＋中P");
  assert(
    history().length === 1 && history()[0].text.includes("技なし"),
    "Maracas excluded",
  );
  start("jamie", width);
  ask("236", "弱P");
  assert(history()[0].frames.join(",") === "13,38,-1,-6", "DL2");
  ask("236", "弱P＋中P");
  assert(history()[0].frames.join(",") === "13,38,+1,-3", "DL2 OD");
  for (const s of ["弱K", "中K", "強K"]) ask("63214", s);
  assert(history().length === 5, "Tenshin independent");
  assert(
    history()
      .slice(0, 3)
      .every((x) => x.frames.join(",") === "8,61,+8,-"),
    "DL3",
  );
  click("Hard");
  assert(
    history().every((x) => x.frames.length === 1),
    "Hard",
  );
  click("Normal");
  run("screenshot", `${out}/${width}-jamie.png`, "--full");
  start("cviper", width);
  for (const s of ["弱K", "中K", "強K"]) ask("214", s);
  assert(
    history().length === 3 &&
      history().every((x) => x.frames.join(",") === "13+10,70,D,-16"),
    "Focus Lv1",
  );
  ask("214", "弱K＋中K");
  assert(history()[0].frames.join(",") === "10+10,67,D,-16", "OD Focus Lv1");
  run("screenshot", `${out}/${width}-cviper.png`, "--full");
  results.push({
    width,
    excludedMaracas: true,
    jamieDL2: true,
    tenshinDL3Independent: true,
    focusLv1NormalAndOD: true,
    normalHard: true,
  });
}
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results));
