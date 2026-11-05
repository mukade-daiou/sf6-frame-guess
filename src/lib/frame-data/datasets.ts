import metadata from "../../../data/metadata.json";
import fixtureMetadata from "../../data/fixtures/metadata.json";
import { validateDataset } from "./loader";

// Vite discovers added JSON files at build time; emitted URLs respect base.
const productionFiles = import.meta.glob("../../../data/characters/*.json", {
  eager: true,
  import: "default",
});
const fixtureFiles = import.meta.glob("../../data/fixtures/characters/*.json", {
  eager: true,
  import: "default",
});
export const production = validateDataset(metadata, productionFiles);
export const fixtures = validateDataset(fixtureMetadata, fixtureFiles);
