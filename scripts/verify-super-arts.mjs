import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
const run = (...a) =>
  execFileSync("agent-browser", a, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-sa-browser" },
  }).trim();
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const assert = (ok, m) => {
  if (!ok) throw new Error(m);
};
const click = (label) =>
  ev(async (label) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    if (!b || b.disabled) throw new Error(`Missing ${label}`);
    b.click();
    await new Promise((r) => setTimeout(r, 35));
    return true;
  }, label);
const count = () => ev(() => document.querySelectorAll("ol.history li").length);
const ids = readdirSync("data/characters")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();
const start = (id) => {
  run("open", "http://127.0.0.1:4173/");
  ev(
    (draw) => {
      Math.random = () => draw;
      return true;
    },
    (ids.indexOf(id) + 0.5) / 32,
  );
  click("ゲーム開始");
  click("SA");
};
const command = (seq) => {
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  for (const d of seq) run("press", d);
};
const out = "staging/sa-integration/browser";
mkdirSync(out, { recursive: true });
const results = [];
for (const width of process.argv.includes("--native-only")
  ? []
  : [1280, 768, 390, 320]) {
  run("set", "viewport", String(width), "1000");
  start("ryu");
  for (const [i, s] of ["弱P", "中P", "強P"].entries()) {
    command("236236");
    click(s);
    if (i === 0) run("screenshot", `${out}/${width}-preview.png`, "--full");
    click("質問する");
    assert(count() === i + 1, `strength ${s}`);
  }
  click("Hard");
  command("236236");
  click("弱P");
  click("質問する");
  assert(count() === 3, "duplicate across mode");
  click("Normal");
  click("回答へ進む");
  assert(
    ev(() => document.querySelectorAll('input[name="answer"]').length) === 32,
    "roster",
  );
  click("質問に戻る");
  command("214214");
  click("弱P");
  click("質問する");
  command("214214");
  click("中P");
  click("質問する");
  assert(count() === 5, "five questions");
  ev(async () => {
    document.querySelector('input[value="ryu"]').click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  });
  click("回答確定");
  const verdict = ev(() =>
    document.querySelector(".verdict")?.textContent.trim(),
  );
  assert(
    verdict === "正解！",
    `result: ${verdict} ${ev(() => document.querySelector(".result")?.textContent)}`,
  );
  click("再プレイ");
  start("guile");
  command("4646");
  click("強P");
  click("質問する");
  assert(count() === 1, "charge SA");
  start("zangief");
  click("SA3");
  command("632147896");
  assert(
    ev(() =>
      document
        .querySelector(".command-strip .command-directions")
        .getAttribute("aria-label"),
    ) !== "2回転",
    "one turn not 720",
  );
  command("32147896");
  click("弱P");
  click("質問する");
  assert(count() === 1, "native keyboard720");
  command("69874123698741236");
  click("中P");
  click("質問する");
  assert(count() === 2, "reverse720");
  command("6");
  click("コマンド 720");
  click("強P");
  click("質問する");
  assert(count() === 3, "candidate720");
  run("screenshot", `${out}/${width}-720.png`, "--full");
  start("juri");
  click("SA2");
  command("214214");
  click("弱P");
  click("質問する");
  assert(
    ev(() =>
      [...document.querySelectorAll(".history dd")].map((x) => x.textContent),
    ).join(",") === "1,7,-,-",
    "activation",
  );
  assert(
    ev(() => document.documentElement.scrollWidth <= innerWidth),
    `overflow ${width}`,
  );
  results.push({
    width,
    strengthIndependent: true,
    duplicateAcrossModes: true,
    charge: true,
    clockwise720: true,
    reverse720: true,
    candidate720: true,
    activation: true,
    roster32: true,
    fiveQuestions: true,
  });
}
// Native pointer input in addition to the keyboard flow above.
start("zangief");
click("SA3");
const box = ev(() => {
  const l = document.querySelector(".lever");
  l.scrollIntoView({ block: "center" });
  return l.getBoundingClientRect().toJSON();
});
const positions = {
  6: [0.9, 0.5],
  3: [0.9, 0.9],
  2: [0.5, 0.9],
  1: [0.1, 0.9],
  4: [0.1, 0.5],
  7: [0.1, 0.1],
  8: [0.5, 0.1],
  9: [0.9, 0.1],
};
const point = (d) => [
  Math.round(box.x + positions[d][0] * box.width),
  Math.round(box.y + positions[d][1] * box.height),
];
run("mouse", "move", ...point("6").map(String));
run("mouse", "down");
for (const d of "63214789632147896")
  run("mouse", "move", ...point(d).map(String));
run("mouse", "up");
click("弱P");
click("質問する");
assert(count() === 1, "native mouse 720");
start("guile");
const touchBox = ev(() => {
  const l = document.querySelector(".lever");
  l.scrollIntoView({ block: "center" });
  return l.getBoundingClientRect().toJSON();
});
const ws = new WebSocket(run("get", "cdp-url"));
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  const p = pending.get(m.id);
  if (p) {
    pending.delete(m.id);
    m.error
      ? p.reject(new Error(JSON.stringify(m.error)))
      : p.resolve(m.result);
  }
});
let pageSession;
const cdp = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId: pageSession }));
  });
const { targetInfos } = await cdp("Target.getTargets");
const target = targetInfos.find(
  (t) => t.type === "page" && t.url.includes("4173"),
);
const attached = await cdp("Target.attachToTarget", {
  targetId: target.targetId,
  flatten: true,
});
pageSession = attached.sessionId;
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true });
for (const [i, d] of [..."4646"].entries())
  await cdp("Input.dispatchTouchEvent", {
    type: i === 0 ? "touchStart" : "touchMove",
    touchPoints: [
      {
        x: touchBox.x + (d === "4" ? 0.1 : 0.9) * touchBox.width,
        y: touchBox.y + 0.5 * touchBox.height,
      },
    ],
  });
await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
ws.close();
click("強P");
click("質問する");
assert(count() === 1, "native touch charge SA");
results.push({ nativeMouse720: true, nativeTouchCharge: true });
writeFileSync(
  `${out}/${process.argv.includes("--native-only") ? "native-results" : "results"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results));
