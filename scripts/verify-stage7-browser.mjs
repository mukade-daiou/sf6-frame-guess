import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const out = "staging/sf6-frame-data-stage7/browser";
await mkdir(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" },
  });
async function exercise(config) {
  const tick = () => new Promise((r) => setTimeout(r, 80));
  const assert = (v, message) => {
    if (!v) throw new Error(message);
  };
  assert(innerWidth === config.width, "Viewport mismatch");
  const label = (text) =>
    [...document.querySelectorAll("label")]
      .find((l) => l.textContent.includes(text))
      ?.querySelector("input");
  const button = async (text) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === text,
    );
    assert(b && !b.disabled, text);
    b.click();
    await tick();
  };
  for (
    let n = 0;
    n < 30 &&
    (!label("未検証の実データ") || label("未検証の実データ").disabled);
    n++
  )
    await tick();
  assert(!label("未検証の実データ").checked, "Must opt in");
  label("未検証の実データ").click();
  await tick();
  if (config.mode === "startup") {
    label("発生のみ").click();
    await tick();
  }
  Math.random = () => (config.target === "ken" ? 0 : 0.999);
  await button("ゲーム開始");
  const select = async (index, value) => {
    const s = document.querySelectorAll("select")[index];
    assert(
      [...s.options].some((o) => o.value === value),
      `Option ${value}`,
    );
    s.value = value;
    s.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
  };
  const type = async (value) => {
    document.querySelector(`input[name=type][value=${value}]`).click();
    await tick();
  };
  let unknownChecked = false;
  if (config.target === "ken") {
    await type("special");
    await select(0, "623");
    await select(1, "K");
    await select(2, "OD");
    await button("質問する");
    unknownChecked = true;
  } else if (config.mode === "normal") {
    await select(0, "2");
    await select(1, "K");
    await select(2, "M");
    await button("質問する");
    unknownChecked = true;
  }
  if (unknownChecked) {
    assert(
      document.querySelectorAll("ol.history li").length === 0,
      "Unknown consumed a question",
    );
    assert(
      document.body.innerText.includes("質問は消費しません"),
      "Unknown feedback missing",
    );
  }
  await type("special");
  await select(0, "none");
  await button("質問する");
  await select(0, "214");
  await select(1, "P");
  await select(2, "L");
  await button("質問する");
  await select(0, "236");
  await select(1, "P");
  await select(2, "OD");
  await button("質問する");
  await select(0, "623");
  await select(1, "P");
  await select(2, "H");
  await button("質問する");
  await type("normal");
  await select(0, "5");
  await select(1, "P");
  await select(2, "M");
  await button("質問する");
  assert(
    document.querySelectorAll("ol.history li").length === 5,
    "Five valid questions required",
  );
  assert(document.body.innerText.includes("最終回答"), "Answer phase missing");
  const history = document.querySelector("ol.history").innerText;
  assert(
    history.includes("全体F") === (config.mode === "normal"),
    "Mode mismatch",
  );
  assert(history.includes("原典の対象範囲では技なし"), "Absence missing");
  assert(
    !history.includes("11(9)"),
    "Follow-up window exposed as attack startup",
  );
  assert(
    document.documentElement.scrollWidth <= innerWidth,
    "Horizontal overflow",
  );
  const choice = config.correct
    ? config.target
    : config.target === "ken"
      ? "marisa"
      : "ken";
  document.querySelector(`input[name=answer][value=${choice}]`).click();
  await tick();
  await button("回答確定");
  assert(
    document.querySelector("dl.result dd").textContent.trim() ===
      (config.target === "ken" ? "ケン" : "マリーザ"),
    "Wrong draw",
  );
  assert(
    document.body.innerText.includes(config.correct ? "正解！" : "不正解"),
    "Wrong outcome",
  );
  await button("再プレイ・設定に戻る");
  assert(!document.querySelector("ol.history"), "Replay did not reset");
  return {
    ...config,
    passed: true,
    questions: 5,
    unknownChecked,
    history,
    replayReset: true,
  };
}
const results = [];
for (const config of [
  { width: 1280, mode: "normal", target: "ken", correct: true },
  { width: 1280, mode: "startup", target: "marisa", correct: false },
  { width: 390, mode: "normal", target: "marisa", correct: true },
  { width: 390, mode: "startup", target: "ken", correct: false },
]) {
  run("open", "http://127.0.0.1:5173/");
  run("set", "viewport", String(config.width), "900");
  results.push(
    JSON.parse(
      run("eval", `(${exercise.toString()})(${JSON.stringify(config)})`),
    ),
  );
  run("screenshot", `${out}/${config.width}-${config.mode}.png`);
  console.log(`${config.width} ${config.mode}: passed`);
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
