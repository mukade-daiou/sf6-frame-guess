import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
const evaluate = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const click = (label) =>
  evaluate(async (label) => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    if (!button || button.disabled)
      throw new Error(`Missing/disabled: ${label}`);
    button.click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  }, label);
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const roster = [];
for (const file of (await readdir("data/characters"))
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const c = JSON.parse(await readFile(`data/characters/${file}`, "utf8"));
  if (c.coverage.special.status === "complete") roster.push(c.id);
}
const out = "staging/verification/rotation";
await mkdir(out, { recursive: true });
const results = [];
for (const width of [1280, 768, 390, 320]) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  evaluate(
    (draw) => {
      Math.random = () => draw;
      return true;
    },
    (roster.indexOf("zangief") + 0.5) / roster.length,
  );
  click("ゲーム開始");
  click("必殺技・SA");
  const box = evaluate(() => {
    document.querySelector(".lever").scrollIntoView({ block: "center" });
    document.querySelector(".lever").focus();
    const b = document.querySelector(".lever").getBoundingClientRect();
    return { x: b.x, y: b.y, size: b.width };
  });
  const point = (d) => {
    const [x, y] = {
      6: [1, 0],
      3: [1, 1],
      2: [0, 1],
      1: [-1, 1],
      4: [-1, 0],
      7: [-1, -1],
      8: [0, -1],
      9: [1, -1],
    }[d];
    return [
      Math.round(box.x + box.size * (0.5 + x * 0.38)),
      Math.round(box.y + box.size * (0.5 + y * 0.38)),
    ];
  };
  const completed = () =>
    evaluate(() =>
      document
        .querySelector(".command-strip .command-directions")
        .getAttribute("aria-label"),
    ) === "1回転";
  click("右");
  assert(
    evaluate(
      () =>
        document.querySelectorAll(
          '.motion-suggestion[aria-label^="コマンド 360"]',
        ).length === 1,
    ),
    "Rotation candidate must appear exactly once",
  );
  run("screenshot", `${out}/${width}-rotation-candidates.png`, "--full");
  click("コマンド 360");
  assert(completed(), "Clockwise candidate completion failed");
  click("クリア");
  click("右");
  click("右上");
  assert(
    evaluate(
      () =>
        document.querySelectorAll(
          '.motion-suggestion[aria-label="コマンド 360"]',
        ).length,
    ) === 1,
    "Counterclockwise prefix duplicated/missed rotation candidate",
  );
  click("コマンド 360");
  assert(completed(), "Counterclockwise candidate completion failed");
  click("クリア");
  evaluate(() => {
    document.querySelector(".lever").focus();
    return true;
  });
  for (const d of "632147896") run("press", d);
  assert(completed(), "Native keyboard rotation failed");
  assert(
    evaluate(
      () =>
        !!document.querySelector(
          '.motion-suggestion[aria-label^="コマンド 360"] .rotation-icon',
        ),
    ),
    "Rotation candidate icon missing",
  );
  click("弱P");
  click("質問する");
  click("クリア");
  run("mouse", "move", ...point("6").map(String));
  run("mouse", "down");
  for (const d of "698741236") run("mouse", "move", ...point(d).map(String));
  run("mouse", "up");
  assert(completed(), "Native mouse counterclockwise rotation failed");
  assert(
    evaluate(
      () =>
        !!document.querySelector('.command-strip g[transform*="scale(-1 1)"]'),
    ),
    "Counterclockwise icon missing",
  );
  click("弱P＋中P");
  click("質問する");
  const socket = new WebSocket(run("get", "cdp-url").trim());
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let sequence = 0;
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
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
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
    const touch = (type, d) => {
      const [x, y] = point(d || "6");
      return send(
        "Input.dispatchTouchEvent",
        { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] },
        sessionId,
      );
    };
    click("クリア");
    await touch("touchStart", "6");
    for (const d of "632147896") await touch("touchMove", d);
    await touch("touchEnd");
    assert(completed(), "Native touch rotation failed");
  } finally {
    socket.close();
  }
  click("中P");
  click("質問する");
  click("クリア");
  for (const direction of [
    "右",
    "右上",
    "上",
    "左上",
    "左",
    "左下",
    "下",
    "右下",
    "右",
  ])
    click(direction);
  assert(completed(), "Individual tap rotation failed");
  click("強P");
  run("screenshot", `${out}/${width}-rotation.png`, "--full");
  click("質問する");
  assert(
    evaluate(
      () => document.querySelectorAll("ol.history .rotation-icon").length,
    ) === 4,
    "Rotation histories missing",
  );
  for (const direction of ["右", "右下", "下", "左下", "左"]) click(direction);
  click("弱K＋中K");
  click("質問する");
  assert(
    evaluate(() =>
      [...document.querySelectorAll("ol.history li:first-child dd")]
        .map((el) => el.textContent)
        .join(","),
    ) === "54,95,D,-",
    "Far-distance OD Express frames mismatch",
  );
  evaluate(() => {
    const input = document.querySelector(
      'input[name="answer"][value="zangief"]',
    );
    input.click();
    return true;
  });
  click("回答確定");
  assert(
    evaluate(() => document.querySelector(".verdict").textContent) === "正解！",
    "SPD final answer failed",
  );
  run("screenshot", `${out}/${width}-result.png`, "--full");
  assert(
    evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Horizontal overflow",
  );
  click("再プレイ");
  results.push({
    width,
    keyboardClockwise: true,
    mouseCounterclockwise: true,
    touchClockwise: true,
    tapsCounterclockwise: true,
    spdNormalOD: true,
    farDistanceODExpress: true,
    history: true,
    answer: true,
    replay: true,
  });
  console.log(`${width}: rotation controls and full game passed`);
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
