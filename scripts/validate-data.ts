import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { characterSchema, metadataSchema } from "../src/lib/frame-data/schema";
import { validateDataset } from "../src/lib/frame-data/loader";

if (process.argv.includes("--write-schema")) {
  writeFileSync(
    "docs/character.schema.json",
    JSON.stringify(z.toJSONSchema(characterSchema), null, 2) + "\n",
  );
  writeFileSync(
    "docs/metadata.schema.json",
    JSON.stringify(z.toJSONSchema(metadataSchema), null, 2) + "\n",
  );
}
let failed = false;
for (const root of ["data", "src/data/fixtures"]) {
  const metadata = JSON.parse(readFileSync(`${root}/metadata.json`, "utf8"));
  const files = Object.fromEntries(
    readdirSync(`${root}/characters`)
      .filter((file) => file.endsWith(".json"))
      .map((file) => [
        file,
        JSON.parse(readFileSync(`${root}/characters/${file}`, "utf8")),
      ]),
  );
  const dataset = validateDataset(metadata, files);
  console.log(
    `${root}: ${dataset.characters.length} characters, ${dataset.eligible.length} eligible, ${dataset.inputs.length} inputs`,
  );
  if (dataset.errors.length) {
    console.error(dataset.errors.join("\n"));
    failed = true;
  }
}
if (failed) process.exitCode = 1;
