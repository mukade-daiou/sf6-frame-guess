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
async function exercise(config) {
  const tick = () => new Promise((r) => setTimeout(r, 80));
  const assert = (v, text) => {
    if (!v) throw new Error(text);
  };
  await tick();
  assert(innerWidth === config.width, "Viewport mismatch");
  const text = () => document.body.innerText;
  assert(
    !text().includes("未検証の実データで試遊（開発専用）"),
    "Dev review control leaked",
  );
  assert(
    !document.querySelector("input[type=checkbox]").checked,
    "Fixture selected",
  );
  assert(text().includes("出題対象: 2体"), "Production characters missing");
  assert(
    text().includes("公式検証・対象パッチは未確認"),
    "Source qualification missing",
  );
  const click = async (label) => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === label,
    );
    assert(b && !b.disabled, label);
    b.click();
    await tick();
  };
  if (config.mode === "startup") {
    [...document.querySelectorAll("label")]
      .find((l) => l.textContent.includes("発生のみ"))
      .querySelector("input")
      .click();
    await tick();
  }
  Math.random = () => (config.target === "ken" ? 0 : 0.999);
  await click("ゲーム開始");
  const select = async (index, value) => {
    const s = document.querySelectorAll("select")[index];
    assert(
      s && [...s.options].some((o) => o.value === value),
      `Option missing: ${value}`,
    );
    s.value = value;
    s.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
  };
  const type = async (value) => {
    document.querySelector(`input[name=type][value=${value}]`).click();
    await tick();
  };
  if (config.mode === "normal") {
    await select(0, "2");
    await select(1, "K");
    await select(2, config.target === "ken" ? "H" : "M");
    await click("質問する");
    assert(
      document.querySelectorAll("ol.history li").length === 0,
      "Unknown consumed question",
    );
    assert(text().includes("質問は消費しません"), "Unknown feedback missing");
  }
  await type("special");
  await select(0, "none");
  await click("質問する");
  await select(0, "214");
  await select(1, "P");
  await select(2, "L");
  await click("質問する");
  await select(0, "236");
  await select(1, "P");
  await select(2, "OD");
  await click("質問する");
  await select(0, "623");
  await select(1, "P");
  await select(2, "H");
  await click("質問する");
  await type("normal");
  await select(0, "5");
  await select(1, "P");
  await select(2, "M");
  await click("質問する");
  assert(
    document.querySelectorAll("ol.history li").length === 5,
    "Not five questions",
  );
  assert(text().includes("最終回答"), "Answer phase missing");
  const history = document.querySelector("ol.history").innerText;
  assert(
    history.includes("採用データ内に該当する技なし"),
    "Dataset absence not shown",
  );
  assert(!history.includes("未検証の原典候補"), "Review resolver was used");
  assert(
    history.includes("全体F") === (config.mode === "normal"),
    "Mode mismatch",
  );
  assert(history.includes("LK+MK"), "Quick Dash input missing");
  assert(
    document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
    "Horizontal overflow",
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
    document.querySelector("dl.result dd").textContent.trim() ===
      (config.target === "ken" ? "ケン" : "マリーザ"),
    "Draw mismatch",
  );
  assert(
    text().includes(config.correct ? "正解！" : "不正解"),
    "Result mismatch",
  );
  document.querySelector("footer details").open = true;
  await tick();
  assert(
    text().includes("CC-BY-SA-4.0") && text().includes("出典確認: 未検証"),
    "Attribution missing",
  );
  document.querySelector("footer details").open = false;
  return {
    ...config,
    passed: true,
    questions: 5,
    fixture: false,
    developmentReview: false,
    unknownNotConsumed: config.mode === "normal",
    viewportWidth: innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    history,
  };
}
const results = [];
for (const config of [
  { width: 1280, mode: "normal", target: "ken", correct: true },
  { width: 1280, mode: "startup", target: "marisa", correct: false },
  { width: 390, mode: "normal", target: "marisa", correct: true },
  { width: 390, mode: "startup", target: "ken", correct: false },
]) {
  run("open", "http://127.0.0.1:4173/");
  run("set", "viewport", String(config.width), "900");
  results.push(
    JSON.parse(
      run("eval", `(${exercise.toString()})(${JSON.stringify(config)})`),
    ),
  );
  run("screenshot", `${out}/${config.width}-${config.mode}.png`, "--full");
  const replay = JSON.parse(
    run(
      "eval",
      `(async()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.includes('再プレイ')).click();await new Promise(r=>setTimeout(r,80));return !document.querySelector('ol.history') && !document.querySelector('input[type=checkbox]').checked;})()`,
    ),
  );
  if (!replay) throw new Error("Replay reset failed");
  results.at(-1).replayReset = true;
  console.log(`${config.width} ${config.mode}: passed`);
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
