import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
const run = (...a) =>
  execFileSync("agent-browser", a, {
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-common-strengths",
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
const start = (target, width) => {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev(
    (x) => {
      Math.random = () => x;
      return true;
    },
    (ids.indexOf(target) + 0.5) / 32,
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
const count = () => ev(() => document.querySelectorAll("ol.history li").length);
const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
const out = "staging/strength-expansion/browser";
mkdirSync(out, { recursive: true });
const results = [];
for (const width of [1280, 320]) {
  start("ryu", width);
  for (const [i, s] of ["弱P", "中P", "強P"].entries()) {
    command("22");
    click(s);
    click("質問する");
    assert(count() === i + 1, s);
  }
  const frames = ev(() =>
    [...document.querySelectorAll("ol.history li")].map((li) =>
      [...li.querySelectorAll("dd")].map((d) => d.textContent),
    ),
  );
  assert(
    frames.every((f) => f.join(",") === "50,52,-,-"),
    "shared frames",
  );
  click("Hard");
  command("22");
  click("弱P");
  click("質問する");
  assert(count() === 3, "duplicate");
  click("Normal");
  command("22");
  click("弱P＋中P");
  click("質問する");
  assert(count() === 4, "OD consumes question");
  assert(
    ev(() =>
      document.querySelector("ol.history li").textContent.includes("技なし"),
    ),
    "OD absence",
  );
  run("screenshot", `${out}/${width}.png`, "--full");
  start("ingrid", width);
  command("214214");
  click("弱K＋中K");
  click("質問する");
  assert(count() === 1, "virtual OD query supported");
  assert(
    ev(() =>
      document.querySelector("ol.history li").textContent.includes("技なし"),
    ),
    "Ingrid OD absent",
  );
  start("jamie", width);
  command("22");
  click("弱P");
  click("質問する");
  assert(count() === 0, "missing frames remain unknown");
  click("Hard");
  command("22");
  click("弱P");
  click("質問する");
  assert(count() === 1, "startup only");
  results.push({
    width,
    ryuThreeStrengths: true,
    duplicateAcrossModes: true,
    absentODConsumesQuestion: true,
    ingridVirtualOD: true,
    jamieUnknownNormalFoundHard: true,
  });
}
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results));
