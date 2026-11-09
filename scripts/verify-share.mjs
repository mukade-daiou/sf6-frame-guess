import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const run = (...args) =>
  execFileSync("agent-browser", args, {
    encoding: "utf8",
    env: { ...process.env, AGENT_BROWSER_SOCKET_DIR: "/tmp/sf6-share" },
  });
const ev = (code) => JSON.parse(run("eval", code));
for (const width of [1280, 320]) {
  run("open", process.env.VERIFY_URL || "http://127.0.0.1:4173/");
  run("set", "viewport", String(width), "1000");
  ev("window.confirm=()=>true; true");
  for (const label of ["ゲーム開始", "回答へ進む", "ギブアップ"])
    ev(
      `(() => { [...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}).click(); return true; })()`,
    );
  ev(
    "window.open=(url,target,features)=>{window.shareCapture={url,target,features};return null}; true",
  );
  ev(
    "(() => { [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Xで結果をシェア').click(); return true; })()",
  );
  const capture = ev("window.shareCapture");
  assert.equal(capture.target, "_blank");
  assert.equal(capture.features, "noopener,noreferrer");
  const url = new URL(capture.url);
  assert.equal(url.origin + url.pathname, "https://twitter.com/intent/tweet");
  assert.match(url.searchParams.get("text"), /SF6 フレーム探偵\nギブアップ/);
  assert.match(url.searchParams.get("text"), /質問なし/);
  assert.equal(ev("document.documentElement.scrollWidth<=innerWidth"), true);
  run("screenshot", `/tmp/sf6-share-${width}.png`, "--full");
  if (width === 320 && process.env.VERIFY_X) {
    run("tab", "new", capture.url);
    console.log(run("snapshot", "-i"));
  }
}
console.log(
  "PC/320px share button, encoded intent text, new-tab flags and preserved result passed",
);
