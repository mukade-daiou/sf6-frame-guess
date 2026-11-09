import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const out = "staging/verification/moves";
mkdirSync(out, { recursive: true });
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-moves-browser" },
  }).trim();
const ev = (fn, arg) =>
  JSON.parse(run("eval", `(${fn.toString()})(${JSON.stringify(arg)})`));
const assert = (v, m) => {
  if (!v) throw new Error(m);
};
const results = [];
for (const width of [1280, 768, 390, 320]) {
  run("open", "http://127.0.0.1:4173/#/moves");
  run("wait", ".moves-table");
  run("set", "viewport", String(width), "1000");
  const initial = ev(() => ({
    title: document.title,
    options: document.querySelector("#moves-character").options.length,
    keys: [...document.querySelectorAll("[data-input-key]")].map(
      (r) => r.dataset.inputKey,
    ),
    noindex: document.querySelector('meta[name="robots"]')?.content,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  assert(
    initial.title === "技データ一覧 | SF6フレーム探偵" &&
      initial.options === 32 &&
      initial.noindex === "noindex" &&
      !initial.overflow,
    "Initial moves page",
  );
  run("select", "#moves-character", "aki");
  const aki = ev(() => ({
    keys: [...document.querySelectorAll("[data-input-key]")].map(
      (r) => r.dataset.inputKey,
    ),
    excluded: [...document.querySelectorAll("tbody tr")]
      .filter((r) => r.lastElementChild.textContent === "除外")
      .map((r) => r.textContent),
  }));
  assert(
    JSON.stringify(aki.keys) === JSON.stringify(initial.keys),
    "Stable union",
  );
  run("select", "#moves-character", "dee_jay");
  assert(
    aki.excluded.some((text) => text.includes("11") && text.includes("216")),
    "Excluded numeric frames",
  );
  assert(
    ev(() =>
      [...document.querySelectorAll("tbody tr")].some(
        (r) =>
          r.textContent.includes("Speedy Maracas") &&
          r.lastElementChild.textContent === "除外",
      ),
    ),
    "Excluded Maracas",
  );
  run("fill", "input[type=search]", "22");
  assert(
    ev(() => document.querySelectorAll("[data-input-key]").length > 0),
    "Search",
  );
  run("click", "input[type=search]");
  run("press", "Control+a");
  run("press", "Backspace");
  assert(
    ev(() => document.querySelector('input[type="search"]').value === ""),
    "Clear search",
  );
  ev(async () => {
    const selects = document.querySelectorAll("select");
    selects[1].value = "除外";
    selects[1].dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    return true;
  });
  assert(
    ev(() => document.querySelectorAll("tbody tr").length > 0),
    "Filter",
  );
  for (const [value, status] of [
    ["採用", "技あり"],
    ["無し", "技なし"],
    ["除外", "除外"],
  ]) {
    const states = ev(async (value) => {
      const el = document.querySelectorAll("select")[1];
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
      return [...document.querySelectorAll("tbody tr")].map(
        (r) => r.lastElementChild.textContent,
      );
    }, value);
    assert(
      states.length > 0 && states.every((s) => s === status),
      `State filter ${value}`,
    );
  }
  run("select", "#moves-character", "aki");
  assert(
    ev(() =>
      [...document.querySelectorAll("tbody tr")].every(
        (r) => r.lastElementChild.textContent === "除外",
      ),
    ),
    "Filter persists with character",
  );
  run("select", "#moves-character", "dee_jay");
  const scroll = ev(() => {
    const el = document.querySelector(".moves-scroll");
    el.scrollLeft = 500;
    return {
      left: el.scrollLeft,
      scroll: el.scrollWidth,
      client: el.clientWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert(
    !scroll.overflow && (width > 768 || scroll.left > 0),
    "Table-only overflow",
  );
  run("screenshot", `${out}/${width}.png`, "--full");
  run("reload");
  run("wait", ".moves-table");
  assert(
    ev(() => !!document.querySelector(".moves-table")),
    "Reload",
  );
  ev(async () => {
    location.hash = "";
    await new Promise((r) => setTimeout(r, 100));
    return true;
  });
  assert(
    ev(
      () =>
        document.title === "SF6フレーム探偵" &&
        !document.querySelector('meta[name="robots"]') &&
        ![...document.querySelectorAll("a")].some((a) =>
          a.getAttribute("href")?.includes("#/moves"),
        ),
    ),
    "Game isolation",
  );
  run("back");
  run("wait", ".moves-table");
  assert(
    ev(() => !!document.querySelector(".moves-table")),
    "Back to moves",
  );
  run("forward");
  assert(
    ev(() => !document.querySelector(".moves-table")),
    "Forward to game",
  );
  ev(async () => {
    const b = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "ゲーム開始",
    );
    b.click();
    await new Promise((r) => setTimeout(r, 40));
    return true;
  });
  assert(
    ev(() => !!document.querySelector(".lever")),
    "Game starts",
  );
  results.push({
    width,
    patterns: initial.keys.length,
    stableUnion: true,
    excluded: true,
    search: true,
    filter: true,
    reload: true,
    backForward: true,
    gameUnchanged: true,
  });
}
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results));
