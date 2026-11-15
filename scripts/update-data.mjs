import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { scan, markdown } from "./lib/source-scan.mjs";

const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const [mode, ...args] = process.argv.slice(2),
  options = {};
for (let i = 0; i < args.length; i += 2) {
  if (
    !["--baseline", "--incoming", "--output", "--run"].includes(args[i]) ||
    !args[i + 1]
  )
    throw new Error("Invalid arguments");
  options[args[i].slice(2)] = args[i + 1];
}
function safeOutput(p) {
  const path = resolve(p),
    within = relative(process.cwd(), path);
  const allowed = relative(resolve("staging/verification/update-scans"), path);
  if (
    !within.startsWith("../") &&
    within !== ".." &&
    (allowed.startsWith("../") || allowed === "..")
  )
    throw new Error(
      "Workspace output must be under staging/verification/update-scans",
    );
  return path;
}
if (mode === "scan" && options.baseline && options.incoming) {
  const production = await Promise.all(
    (await readdir("data/characters"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => read(`data/characters/${f}`)),
  );
  const result = await scan({
    baseline: options.baseline,
    incoming: options.incoming,
    output: safeOutput(options.output ?? "staging/verification/update-scans"),
    production,
    policy: await read("data/adoption-decisions.json"),
  });
  console.log(result.root);
  if (result.manifest.status !== "success") process.exitCode = 1;
} else if (mode === "report" && options.run) {
  const root = safeOutput(options.run);
  await writeFile(
    join(root, "report.md"),
    markdown(
      await read(join(root, "manifest.json")),
      await read(join(root, "diff.json")),
    ),
  );
  console.log(join(root, "report.md"));
} else {
  console.error(
    "scan --baseline DIR --incoming DIR [--output DIR] | report --run RUN_DIR",
  );
  process.exitCode = 2;
}
