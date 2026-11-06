import { execFileSync } from "node:child_process";
import { mkdir, writeFile, readdir } from "node:fs/promises";
const rosterIds = (await readdir("data/characters"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => f.slice(0, -5));
const out = "staging/verification/browser";
await mkdir(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
const evaluate = (fn, arg) =>
  JSON.parse(
    run(
      "eval",
      `(${fn.toString()})(${JSON.stringify(arg?.target ? { ...arg, rosterSize: rosterIds.length, draw: (rosterIds.indexOf(arg.target) + 0.5) / rosterIds.length } : arg)})`,
    ),
  );
async function exercise(config) {
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const assert = (v, message) => {
    if (!v) throw new Error(message);
  };
  const click = async (label) => {
    const questionsBefore = document.querySelectorAll("ol.history li").length;
    const el = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    assert(el && !el.disabled, `Disabled/missing: ${label}`);
    el.click();
    await tick();
    if (label === "質問する" && document.querySelector(".attack-buttons")) {
      assert(
        !document.querySelector(".input-preview [role=img]"),
        "Asked input preview not cleared",
      );
      assert(
        document.querySelector(".submit-row button[type=submit]").disabled,
        "Ask button still enabled after submission",
      );
      const strip = document.querySelector(".command-strip [aria-label]");
      if (strip)
        assert(
          strip.getAttribute("aria-label") === "未入力",
          "Command not cleared after submission",
        );
      assert(
        !document.querySelector(".motion-suggestions"),
        "Suggestions not cleared after submission",
      );
      assert(
        document.querySelectorAll("ol.history li").length >= questionsBefore,
        "Clear removed history",
      );
    }
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
  Math.random = () => config.draw;
  await click("ゲーム開始");
  assert(
    document.querySelectorAll(".attack-buttons button").length === 8,
    "Not eight attack buttons",
  );
  const iconImages = [
    ...document.querySelectorAll(".attack-buttons .attack-icon image"),
  ];
  assert(
    iconImages.length === 10 && !document.querySelector(".attack-icon text"),
    "Attack image replacement incomplete",
  );
  for (const href of new Set(iconImages.map((i) => i.getAttribute("href")))) {
    const asset = await fetch(href);
    assert(
      asset.ok && (await asset.text()).includes("<svg"),
      "Local attack SVG failed to load",
    );
  }
  assert(
    document.querySelector('[aria-label="弱P＋中P"]').disabled,
    "Normal OD enabled",
  );
  if (config.target === "ken") {
    await command("623");
    await click("弱K＋中K");
    assert(preview() === "623KK", "OD kick cannot be selected");
  }
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
  assert(
    document.querySelector(".query-unknown")?.textContent === "不明",
    "Unknown has no visible result",
  );
  await click("発生のみ");
  assert(
    !document.querySelector(".query-unknown"),
    "Stale unknown after mode switch",
  );
  await normal("2", config.target === "ken" ? "強K" : "中K");
  await click("質問する");
  assert(count() === 1, "Startup question missing");
  const frameList = document.querySelector("ol.history .frames");
  assert(
    getComputedStyle(frameList).textAlign === "center",
    "Frames not centered",
  );
  const valueBox = frameList.querySelector("dd").getBoundingClientRect();
  const frameBox = frameList.getBoundingClientRect();
  assert(
    Math.abs(
      valueBox.x + valueBox.width / 2 - (frameBox.x + frameBox.width / 2),
    ) < 1,
    "Startup frame not centered in history",
  );
  await click("ノーマル");
  await normal("2", config.target === "ken" ? "強K" : "中K");
  await click("質問する");
  assert(
    count() === 1 &&
      document.querySelector(".feedback").textContent.includes("質問済み"),
    "Mode-switch duplicate",
  );
  assert(
    document.querySelector("ol.history li").querySelectorAll("dd").length ===
      4 && document.querySelector("ol.history li").textContent.includes("不明"),
    "History did not switch to normal with unknown total",
  );
  if (config.mode === "startup") await click("発生のみ");
  await click("必殺技");
  assert(
    [...document.querySelectorAll(".attack-buttons button")].every(
      (b) => b.disabled,
    ),
    "Motionless attack enabled",
  );
  assert(
    !document.querySelector(".motion-suggestions"),
    "Suggestions shown before direction input",
  );
  for (const [prefix, completion] of [
    ["2", "236"],
    ["21", "214"],
    ["6", "623"],
  ]) {
    await command(prefix);
    const questionsBefore = count();
    assert(
      document.querySelector(".motion-suggestions"),
      "Prefix suggestions missing",
    );
    await click(`コマンド ${completion}`);
    assert(
      document
        .querySelector('.motion-suggestion[aria-pressed="true"]')
        ?.getAttribute("aria-label") === `コマンド ${completion}`,
      "Suggestion not selected",
    );
    assert(
      count() === questionsBefore && !preview(),
      "Suggestion submitted or selected attack",
    );
    await click("弱P");
    assert(
      preview() === `${completion}LP`,
      "Suggestion did not complete motion",
    );
  }
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
    !document.querySelector(".motion-suggestions"),
    "Unmatched command has suggestions",
  );
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
  assert(
    !document
      .querySelector(".feedback")
      .textContent.includes("フレームデータを取得しました"),
    "Redundant success message",
  );
  await command("623");
  await click("強P");
  await click("質問する");
  assert(count() === 4, "623HP");
  if (config.target === "ken") {
    await command("623");
    await click("弱K＋中K");
  } else await normal("5", "中P");
  await click("質問する");
  assert(count() === 5, "Five questions");
  if (config.target === "ken")
    assert(
      document.querySelector("ol.history li:last-child dd")?.textContent ===
        "9",
      "OD kick startup is not 9",
    );
  const entries = [...document.querySelectorAll("ol.history li")];
  assert(
    entries[0].querySelectorAll("dd").length ===
      (config.mode === "normal" ? 4 : 1),
    "First history did not follow current mode",
  );
  assert(
    entries.every(
      (e) =>
        e.querySelectorAll("dd").length === 0 ||
        e.querySelectorAll("dd").length === (config.mode === "normal" ? 4 : 1),
    ),
    "History mode mismatch",
  );
  assert(
    [...document.querySelectorAll(".mode-toggle button")].every(
      (b) => !b.disabled,
    ),
    "Answer mode disabled",
  );
  await click(config.mode === "normal" ? "発生のみ" : "ノーマル");
  assert(
    count() === 5 &&
      entries[0].querySelectorAll("dd").length ===
        (config.mode === "normal" ? 1 : 4),
    "Answer history did not switch",
  );
  await click(config.mode === "normal" ? "ノーマル" : "発生のみ");
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
  await click(config.mode === "normal" ? "発生のみ" : "ノーマル");
  assert(
    count() === 5 &&
      entries[0].querySelectorAll("dd").length ===
        (config.mode === "normal" ? 1 : 4),
    "Result history did not switch",
  );
  await click(config.mode === "normal" ? "ノーマル" : "発生のみ");
  document.querySelector(".data-info").open = true;
  await tick();
  assert(
    document
      .querySelector(".info-content")
      .textContent.includes("CC-BY-SA-4.0"),
    "Attribution missing",
  );
  assert(
    document.querySelector(".info-content").textContent.includes("Lorc") &&
      document.querySelector(
        ".info-content a[href='https://creativecommons.org/licenses/by/3.0/']",
      ),
    "Attack icon attribution missing",
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
    liveHistoryMode: true,
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
  await click("再プレイ");
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
async function earlyAnswer(config) {
  const wait = () => new Promise((r) => setTimeout(r, 30));
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const click = async (label) => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => (b.getAttribute("aria-label") || b.textContent.trim()) === label,
    );
    assert(button && !button.disabled, `Early answer missing: ${label}`);
    button.click();
    await wait();
  };
  Math.random = () => config.draw;
  await click("ゲーム開始");
  if (config.mode === "startup") await click("発生のみ");
  for (const button of ["弱P", "中P"].slice(0, config.questions)) {
    await click(button);
    await click("質問する");
  }
  const history = document.querySelector("ol.history")?.innerHTML || "";
  await click("回答へ進む");
  assert(
    document.querySelectorAll('input[name="answer"]').length ===
      config.rosterSize,
    "Answer roster mismatch",
  );
  assert(
    !document.querySelector(".attack-buttons") &&
      !document.querySelector(".result"),
    "Early answer phase incorrect",
  );
  assert(
    (document.querySelector("ol.history")?.innerHTML || "") === history,
    "Early answer changed history",
  );
  assert(
    document.querySelectorAll("ol.history li").length === config.questions,
    "Early answer changed count",
  );
  assert(
    !document.querySelector(".history-mode"),
    "History mode label remains",
  );
  await click("質問に戻る");
  assert(
    (document.querySelector("ol.history")?.innerHTML || "") === history,
    "Returning changed history",
  );
  assert(
    document.querySelectorAll("ol.history li").length === config.questions,
    "Returning changed question count",
  );
  for (const button of ["弱P", "中P", "強P", "弱K", "中K"].slice(
    config.questions,
  )) {
    await click(button);
    await click("質問する");
  }
  assert(
    document.querySelectorAll("ol.history li").length === 5,
    "Did not reach five questions after returning",
  );
  assert(
    ![...document.querySelectorAll("button")].some(
      (b) => b.textContent.trim() === "質問に戻る",
    ),
    "Return available after five questions",
  );
  assert(
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "回答確定",
    ).disabled,
    "Answer enabled without choice",
  );
  const id = config.correct
    ? config.target
    : config.target === "ken"
      ? "marisa"
      : "ken";
  document.querySelector(`input[name=answer][value=${id}]`).click();
  await wait();
  await click("回答確定");
  assert(
    ![...document.querySelectorAll("button")].some(
      (b) => b.textContent.trim() === "質問に戻る",
    ),
    "Return available after answer",
  );
  assert(
    document.querySelector(".verdict").textContent ===
      (config.correct ? "正解！" : "不正解"),
    "Early verdict mismatch",
  );
  assert(
    document.querySelector(".result dd").textContent ===
      (config.target === "ken" ? "ケン" : "マリーザ"),
    "Early target changed",
  );
  assert(
    document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
    "Early answer overflow",
  );
  await click("再プレイ");
  await click("ゲーム開始");
  assert(
    !document.querySelector("ol.history li"),
    "Early replay did not reset",
  );
  return { ...config, earlyAnswer: true, passed: true };
}
const results = [];
const controlsOnly = process.argv.includes("--controls-only");
const widths = controlsOnly
  ? []
  : process.argv.slice(2).length
    ? process.argv.slice(2).map(Number)
    : [1280, 768, 390, 320];
if (!controlsOnly)
  for (const config of [
    {
      width: widths[0],
      mode: "normal",
      questions: 0,
      target: "ken",
      correct: true,
    },
    {
      width: widths.at(-1),
      mode: "startup",
      questions: 2,
      target: "marisa",
      correct: false,
    },
  ]) {
    run("open", "http://127.0.0.1:4173/");
    run("set", "viewport", String(config.width), "1000");
    results.push(evaluate(earlyAnswer, config));
    console.log(
      `${config.width} early answer (${config.questions} questions): passed`,
    );
  }
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
    evaluate(async () => {
      document.querySelector(".command-strip button").click();
      await new Promise((r) => setTimeout(r, 30));
      document.querySelector('.lever-direction[aria-label="下"]').click();
      await new Promise((r) => setTimeout(r, 30));
    });
    run("screenshot", `${out}/${width}-${mode}-candidates.png`, "--full");
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
