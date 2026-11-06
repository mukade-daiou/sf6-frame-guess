import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const out = "staging/verification/browser";
await mkdir(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
const evaluate = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
async function exercise(config) {
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const assert = (v, message) => {
    if (!v) throw new Error(message);
  };
  const click = async (label) => {
    const el = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    assert(el && !el.disabled, `Disabled/missing: ${label}`);
    el.click();
    await tick();
  };
  const count = () => document.querySelectorAll("ol.history li").length;
  const preview = () =>
    document
      .querySelector(".input-preview [role=img]")
      ?.getAttribute("aria-label");
  const command = async (motion) => {
    await click("必殺技");
    await click("クリア");
    for (const d of motion)
      await click({ 2: "下", 3: "右下", 6: "右", 1: "左下", 4: "左" }[d]);
  };
  const normal = async (direction, button) => {
    await click("通常技");
    await click(direction === "2" ? "下" : "中央");
    await click(button);
  };
  assert(
    !document.querySelector("aside.notice") &&
      !document.querySelector("footer"),
    "Obsolete cards/footer",
  );
  assert(!document.querySelector(".mode-toggle"), "Start mode selector");
  assert(
    !document.querySelector("input[type=checkbox]").checked,
    "Fixture selected",
  );
  assert(
    !document.body.innerText.includes("未検証の実データで試遊（開発専用）"),
    "Development data leaked",
  );
  Math.random = () => (config.target === "ken" ? 0 : 0.999);
  await click("ゲーム開始");
  assert(
    document.querySelectorAll(".attack-buttons button").length === 8,
    "Not eight attack buttons",
  );
  assert(
    document.querySelector('[aria-label="弱P＋中P"]').disabled,
    "Normal OD enabled",
  );
  await normal("5", "弱P");
  assert(preview() === "5LP", "Standing LP");
  await normal("5", "強P");
  assert(preview() === "5HP", "Standing HP");
  await normal("2", "中K");
  assert(preview() === "2MK", "Crouching MK");
  await normal("2", "強K");
  assert(preview() === "2HK", "Crouching HK");
  await normal("2", config.target === "ken" ? "強K" : "中K");
  await click("質問する");
  assert(count() === 0, "Unknown consumed");
  await click("発生のみ");
  await click("質問する");
  assert(count() === 1, "Startup question missing");
  await click("ノーマル");
  await click("質問する");
  assert(
    count() === 1 &&
      document.querySelector(".feedback").textContent.includes("質問済み"),
    "Mode-switch duplicate",
  );
  assert(
    document.querySelector("ol.history li").querySelectorAll("dd").length === 1,
    "History re-evaluated",
  );
  if (config.mode === "startup") await click("発生のみ");
  await click("必殺技");
  assert(
    [...document.querySelectorAll(".attack-buttons button")].every(
      (b) => b.disabled,
    ),
    "Motionless attack enabled",
  );
  for (const m of ["236", "214", "623"]) {
    await command(m);
    assert(
      document
        .querySelector(".command-strip [aria-label]")
        .getAttribute("aria-label")
        .split("、").length === 3,
      `Motion ${m}`,
    );
    assert(
      document.querySelector(".command-strip").innerText.includes("候補一致"),
      `Not matched ${m}`,
    );
  }
  await command("22");
  assert(
    document
      .querySelector(".command-strip [aria-label]")
      .getAttribute("aria-label") === "下、下",
    "Intentional repeated direction lost",
  );
  await command("2366");
  assert(
    [...document.querySelectorAll(".attack-buttons button")].every(
      (b) => b.disabled,
    ),
    "Unmatched corrected",
  );
  await click("クリア");
  assert(count() === 1, "Clear consumed");
  await command("214");
  await click("弱P");
  await click("質問する");
  assert(count() === 2, "214LP");
  await command("236");
  await click("弱P＋中P");
  assert(preview() === "236PP", "OD mapping");
  await click("質問する");
  assert(count() === 3, "236PP");
  await command("623");
  await click("強P");
  await click("質問する");
  assert(count() === 4, "623HP");
  await normal("5", "中P");
  await click("質問する");
  assert(count() === 5, "Five questions");
  const entries = [...document.querySelectorAll("ol.history li")];
  assert(
    entries[0].querySelectorAll("dd").length === 1,
    "First history changed",
  );
  assert(
    entries
      .slice(1)
      .every(
        (e) =>
          e.querySelectorAll("dd").length === 0 ||
          e.querySelectorAll("dd").length ===
            (config.mode === "normal" ? 4 : 1),
      ),
    "History mode mismatch",
  );
  assert(
    [...document.querySelectorAll(".mode-toggle button")].every(
      (b) => b.disabled,
    ),
    "Answer mode enabled",
  );
  const choice = config.correct
    ? config.target
    : config.target === "ken"
      ? "marisa"
      : "ken";
  document.querySelector(`input[name=answer][value=${choice}]`).click();
  await tick();
  await click("回答確定");
  assert(
    document.querySelector(".verdict").textContent ===
      (config.correct ? "正解！" : "不正解"),
    "Wrong verdict",
  );
  assert(
    document.querySelector("dl.result dd").textContent ===
      (config.target === "ken" ? "ケン" : "マリーザ"),
    "Wrong target",
  );
  document.querySelector(".data-info").open = true;
  await tick();
  assert(
    document
      .querySelector(".info-content")
      .textContent.includes("CC-BY-SA-4.0"),
    "Attribution missing",
  );
  document.querySelector(".data-info").open = false;
  assert(
    document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
    "Horizontal overflow",
  );
  const history = document.querySelector("ol.history").innerText;
  return {
    ...config,
    passed: true,
    questions: 5,
    mixedModeHistory: true,
    unknownNotConsumed: true,
    fixture: false,
    history,
  };
}
async function replay() {
  const click = async (label) => {
    [...document.querySelectorAll("button")]
      .find(
        (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
      )
      .click();
    await new Promise((r) => setTimeout(r, 30));
  };
  await click("再プレイ・設定に戻る");
  if (document.querySelector("ol.history")) throw new Error("Replay history");
  await click("ゲーム開始");
  if (
    document
      .querySelector(".mode-toggle button")
      .getAttribute("aria-pressed") !== "true"
  )
    throw new Error("Replay mode");
  await click("必殺技");
  for (const label of ["下", "右下", "右", "弱P＋中P"]) await click(label);
  return true;
}
async function pointerChecks() {
  const click = async (label) => {
    [...document.querySelectorAll("button")]
      .find(
        (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
      )
      .click();
    await new Promise((r) => setTimeout(r, 60));
  };
  await click("クリア");
  const lever = document.querySelector(".lever");
  lever.scrollIntoView({ block: "center" });
  lever.focus();
  return lever.getBoundingClientRect().toJSON();
}
const results = [];
const controlsOnly = process.argv.includes("--controls-only");
const widths = controlsOnly
  ? []
  : process.argv.slice(2).length
    ? process.argv.slice(2).map(Number)
    : [1280, 768, 390, 320];
for (const width of widths)
  for (const mode of ["normal", "startup"]) {
    const config = {
      width,
      mode,
      target: width === 1280 || width === 320 ? "ken" : "marisa",
      correct: mode === "normal",
    };
    run("open", "http://127.0.0.1:4173/");
    run("set", "viewport", String(width), "1000");
    results.push(evaluate(exercise, config));
    run("screenshot", `${out}/${width}-${mode}-history.png`, "--full");
    results.at(-1).replay = evaluate(replay);
    run("screenshot", `${out}/${width}-${mode}.png`, "--full");
    console.log(`${width} ${mode}: passed`);
  }
await writeFile(
  `${out}/results-${widths.join("-") || "controls"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
if (controlsOnly) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", "390", "1000");
  evaluate(async () => {
    const click = async (label) => {
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === label)
        .click();
      await new Promise((r) => setTimeout(r, 40));
    };
    await click("ゲーム開始");
    await click("必殺技");
  });
}
const box = evaluate(pointerChecks);
// Native mouse drag: repeat movement in one direction must not duplicate it.
run(
  "mouse",
  "move",
  String(Math.round(box.x + 78)),
  String(Math.round(box.y + 78)),
);
run("mouse", "down");
for (const [x, y] of [
  [78, 140],
  [80, 141],
  [140, 140],
  [140, 78],
])
  run(
    "mouse",
    "move",
    String(Math.round(box.x + x)),
    String(Math.round(box.y + y)),
  );
run("mouse", "up");
const native = evaluate(() =>
  document
    .querySelector(".command-strip [aria-label]")
    .getAttribute("aria-label"),
);
if (native !== "下、右下、右") throw new Error(`Native drag: ${native}`);
evaluate(async () => {
  document.querySelector(".command-strip button").click();
  await new Promise((r) => setTimeout(r, 60));
  document.querySelector(".lever").focus();
});
for (const key of ["ArrowRight", "ArrowDown", "PageDown"]) run("press", key);
if (
  evaluate(() =>
    document
      .querySelector(".command-strip [aria-label]")
      .getAttribute("aria-label"),
  ) !== "右、下、右下"
)
  throw new Error("Native keyboard 623 failed");
results.push({ nativeMouse236: true, nativeKeyboard623: true });
// Chromium's native touch pipeline generates pointer capture and compatibility clicks.
const socket = new WebSocket(run("get", "cdp-url").trim());
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
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
  const b = evaluate(pointerChecks);
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
  await touch("touchStart", 78, 78);
  for (const [x, y] of [
    [78, 140],
    [79, 141],
    [15, 140],
    [15, 78],
  ])
    await touch("touchMove", x, y);
  await touch("touchEnd");
  if (
    evaluate(() =>
      document
        .querySelector(".command-strip [aria-label]")
        .getAttribute("aria-label"),
    ) !== "下、左下、左"
  )
    throw new Error("Native touch 214 failed");
  evaluate(pointerChecks);
  for (let n = 0; n < 2; n++) {
    await touch("touchStart", 78, 140);
    await touch("touchEnd");
  }
  if (
    evaluate(() =>
      document
        .querySelector(".command-strip [aria-label]")
        .getAttribute("aria-label"),
    ) !== "下、下"
  )
    throw new Error("Native repeated touch failed");
  results.push({ nativeTouch214: true, nativeTouch22: true });
} finally {
  socket.close();
}
await writeFile(
  `${out}/results-${widths.join("-") || "controls"}.json`,
  JSON.stringify(results, null, 2) + "\n",
);
