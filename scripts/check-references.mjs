import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((p) =>
        p.isDirectory()
          ? files(path.join(dir, p.name))
          : path.join(dir, p.name),
      ),
    )
  ).flat();
}
const missing = [];
for (const file of (
  await Promise.all(
    ["src", "scripts", "tests", "archive/scripts", "archive/tests"].map(files),
  )
).flat()) {
  if (!/\.(?:ts|tsx|mjs)$/.test(file)) continue;
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(
    /(?:from\s*|import\s*\()\s*["'](\.[^"']+)["']/g,
  )) {
    const target = path.resolve(path.dirname(file), match[1]);
    const candidates = [
      target,
      ...[".ts", ".tsx", ".mjs", ".json", "/index.ts"].map((s) => target + s),
    ];
    if (
      !(
        await Promise.all(
          candidates.map((p) =>
            access(p).then(
              () => true,
              () => false,
            ),
          ),
        )
      ).some(Boolean)
    )
      missing.push({ file, reference: match[1] });
  }
}
for (const file of [
  "README.md",
  "archive/README.md",
  ...(await files("docs")),
  ...(await files("archive/docs")),
].filter((p) => p.endsWith(".md"))) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (match[1].includes(":") || match[1].startsWith("#")) continue;
    const target = path.resolve(path.dirname(file), match[1].split("#")[0]);
    if (
      !(await access(target).then(
        () => true,
        () => false,
      ))
    )
      missing.push({ file, reference: match[1] });
  }
}
console.log(JSON.stringify({ missingReferences: missing }, null, 2));
if (missing.length) process.exitCode = 1;
