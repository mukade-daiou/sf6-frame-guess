import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const out = "staging/sf6-frame-data-stage6/browser";
await mkdir(out, { recursive: true });
const env = { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-browser" };
const run = (...args) =>
  execFileSync("agent-browser", args, {
    env,
    encoding: "utf8",
    timeout: 30000,
  });
async function exercise(config) {
  const tick = () => new Promise((r) => setTimeout(r, 80));
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  assert(
    innerWidth === config.width,
    `Viewport mismatch: ${innerWidth} vs ${config.width}`,
  );
  const text = () => document.body.innerText;
  const label = (value) =>
    [...document.querySelectorAll("label")]
      .find((l) => l.textContent.includes(value))
      ?.querySelector("input");
  const clickButton = async (value) => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === value,
    );
    assert(button && !button.disabled, `Missing/enabled button: ${value}`);
    button.click();
    await tick();
  };
  for (
    let i = 0;
    i < 30 &&
    (!label("未検証の実データ") || label("未検証の実データ").disabled);
    i++
  )
    await tick();
  assert(!label("未検証の実データ").checked, "Review must be opt-in");
  label("未検証の実データ").click();
  await tick();
  if (config.mode === "startup") {
    label("発生のみ").click();
    await tick();
  }
  assert(text().includes("対象パッチ: 未確認"), "Patch warning missing");
  Math.random = () => (config.target === "ken" ? 0 : 0.999);
  await clickButton("ゲーム開始");
  async function select(index, value) {
    const element = document.querySelectorAll("select")[index];
    assert(
      element && [...element.options].some((o) => o.value === value),
      `Missing select ${index}: ${value}`,
    );
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
  }
  await select(0, "2");
  await select(1, "K");
  await select(2, "H");
  await clickButton("質問する");
  document.querySelector('input[name="type"][value="special"]').click();
  await tick();
  await select(0, "none");
  await clickButton("質問する");
  await select(0, "214");
  await select(1, "P");
  await select(2, "L");
  await clickButton("質問する");
  await select(0, "623");
  await select(1, "K");
  await select(2, "OD");
  await clickButton("質問する");
  await select(0, "236");
  await select(1, "K");
  await select(2, "OD");
  await clickButton("質問する");
  assert(text().includes("最終回答"), "Did not finish 5 questions");
  assert(
    document.querySelectorAll("ol.history > li").length === 5,
    "History must have 5 entries",
  );
  assert(
    text().includes("原典の対象範囲では技なし"),
    "Source absence not distinguished",
  );
  assert(text().includes("LK+MK"), "Simultaneous input missing");
  assert(
    text().includes("条件") || text().includes("派生受付"),
    "Conditional context missing",
  );
  const history = document.querySelector("ol.history").innerText;
  assert(
    history.includes("全体F") === (config.mode === "normal"),
    "Mode fields mismatch",
  );
  assert(
    document.documentElement.scrollWidth <= innerWidth,
    "Horizontal overflow",
  );
  const chosen = config.correct
    ? config.target
    : config.target === "ken"
      ? "marisa"
      : "ken";
  document.querySelector(`input[name="answer"][value="${chosen}"]`).click();
  await tick();
  await clickButton("回答確定");
  assert(
    text().includes(config.correct ? "正解！" : "不正解"),
    "Answer outcome mismatch",
  );
  assert(
    document.querySelector("dl.result dd").textContent.trim() ===
      (config.target === "ken" ? "ケン" : "マリーザ"),
    "Target draw mismatch",
  );
  const outcome = text();
  await clickButton("再プレイ・設定に戻る");
  assert(!document.querySelector("ol.history"), "Replay did not reset history");
  assert(
    label("未検証の実データ").checked,
    "Review selection lost after replay",
  );
  return {
    ...config,
    passed: true,
    questions: 5,
    noHorizontalOverflow: true,
    replayReset: true,
    history,
    result: outcome.slice(outcome.indexOf("結果"), outcome.indexOf("質問履歴")),
  };
}
const scenarios = [
  { width: 1280, mode: "normal", target: "ken", correct: true },
  { width: 1280, mode: "startup", target: "marisa", correct: false },
  { width: 390, mode: "normal", target: "marisa", correct: true },
  { width: 390, mode: "startup", target: "ken", correct: false },
];
const results = [];
for (const scenario of scenarios) {
  run("open", "http://127.0.0.1:5173/");
  run("set", "viewport", String(scenario.width), "900");
  const result = JSON.parse(
    run("eval", `(${exercise.toString()})(${JSON.stringify(scenario)})`),
  );
  results.push(result);
  run("screenshot", `${out}/${scenario.width}-${scenario.mode}.png`);
  console.log(`${scenario.width} ${scenario.mode}: passed`);
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
