import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
const click = (label) =>
  ev(async (label) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    if (!b || b.disabled) throw new Error(`Missing/disabled ${label}`);
    b.click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  }, label);
const ids = (await readdir("data/characters"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => f.slice(0, -5));
const out = "staging/verification/charge";
await mkdir(out, { recursive: true });
const results = [];
for (const width of [1280, 768, 390, 320]) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  assert(
    ev(() => document.title) === "SF6フレームアキネーター",
    "Title mismatch",
  );
  ev(
    (draw) => {
      Math.random = () => draw;
      return true;
    },
    (ids.indexOf("guile") + 0.5) / ids.length,
  );
  click("ゲーム開始");
  click("必殺技");
  const box = ev(() => {
    const l = document.querySelector(".lever");
    l.scrollIntoView({ block: "center" });
    return l.getBoundingClientRect().toJSON();
  });
  run("mouse", "move", String(box.x + 15), String(box.y + 78));
  run("mouse", "down");
  for (const [x, y] of [
    [78, 78],
    [140, 78],
  ])
    run("mouse", "move", String(box.x + x), String(box.y + y));
  run("mouse", "up");
  assert(
    ev(() =>
      document
        .querySelector(".command-strip .command-directions")
        .getAttribute("aria-label"),
    ) === "左（溜め）、右",
    `Native mouse 46 failed: ${ev(() => document.querySelector(".command-strip .command-directions").getAttribute("aria-label"))}`,
  );
  click("弱P");
  run("screenshot", `${out}/${width}-preview.png`, "--full");
  click("質問する");
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  run("press", "ArrowLeft");
  run("press", "ArrowRight");
  click("弱P＋中P");
  click("質問する");
  ev(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  run("press", "ArrowDown");
  run("press", "ArrowUp");
  click("弱K");
  click("質問する");
  const socket = new WebSocket(run("get", "cdp-url").trim());
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error
        ? p.reject(new Error(JSON.stringify(m.error)))
        : p.resolve(m.result);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const next = ++id;
      pending.set(next, { resolve, reject });
      socket.send(JSON.stringify({ id: next, method, params, sessionId }));
    });
  try {
    const { targetInfos } = await send("Target.getTargets");
    const page = targetInfos.find(
      (t) => t.type === "page" && t.url.includes("4173"),
    );
    const { sessionId } = await send("Target.attachToTarget", {
      targetId: page.targetId,
      flatten: true,
    });
    await send(
      "Emulation.setTouchEmulationEnabled",
      { enabled: true },
      sessionId,
    );
    const b = ev(() =>
      document.querySelector(".lever").getBoundingClientRect().toJSON(),
    );
    const touch = (type, x, y) =>
      send(
        "Input.dispatchTouchEvent",
        {
          type,
          touchPoints:
            type === "touchEnd" ? [] : [{ x: b.x + x, y: b.y + y, id: 1 }],
        },
        sessionId,
      );
    await touch("touchStart", 78, 140);
    await touch("touchMove", 78, 78);
    await touch("touchMove", 78, 15);
    await touch("touchEnd");
  } finally {
    socket.close();
  }
  assert(
    ev(() =>
      document
        .querySelector(".command-strip .command-directions")
        .getAttribute("aria-label"),
    ) === "下（溜め）、上",
    "Native touch 28 failed",
  );
  click("弱K＋中K");
  click("質問する");
  assert(
    ev(
      () => document.querySelectorAll("ol.history .charge-direction").length,
    ) === 4,
    "Charge history lost colored arrows",
  );
  assert(
    ev(() =>
      [...document.querySelectorAll("ol.history .command-directions")].every(
        (el) =>
          el.querySelectorAll("svg").length === 2 &&
          el.querySelectorAll(".charge-direction").length === 1,
      ),
    ),
    "Charge arrow duplication/color mismatch",
  );
  click("Hard");
  assert(
    ev(() => document.querySelectorAll("ol.history dd").length) === 4,
    "Hard history mismatch",
  );
  click("Normal");
  assert(
    ev(() => document.querySelectorAll("ol.history dd").length) === 16,
    "Normal history mismatch",
  );
  run("screenshot", `${out}/${width}-history.png`, "--full");
  click("左");
  click("コマンド [4]6");
  assert(
    ev(
      () => document.querySelector(".command-strip .charge-direction") !== null,
    ),
    "Charge candidate completion failed",
  );
  click("クリア");
  click("通常技");
  click("弱P");
  click("質問する");
  ev(() => {
    document.querySelector('input[name="answer"][value="guile"]').click();
    return true;
  });
  click("回答確定");
  assert(
    ev(() => document.querySelector(".verdict").textContent) === "正解！",
    "Charge game answer failed",
  );
  click("再プレイ");
  assert(
    ev(() => document.documentElement.scrollWidth <= innerWidth),
    "Horizontal overflow",
  );
  results.push({
    width,
    mouse46: true,
    keyboard46and28: true,
    touch28: true,
    normalOD: true,
    chargeColor: true,
    candidate: true,
    liveModes: true,
    history: true,
    answer: true,
    replay: true,
  });
  console.log(`${width}: charge inputs and full game passed`);
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
