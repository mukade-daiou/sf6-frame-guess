import ken from "../../../staging/adoption-inputs/ken.json";
import marisa from "../../../staging/adoption-inputs/marisa.json";
import audit from "../../../staging/dev-review-policy.json";
import { validateDataset, type Dataset } from "./loader";
import { inputKey } from "./input";

const checked = validateDataset(
  {
    schemaVersion: "1.0.0",
    kind: "production",
    gameVersion: "UNVERIFIED",
    label: "開発専用・未検証の実データ",
  },
  { ken, marisa },
);
// Separate playable selection for development, without modifying the records or production validation.
export const reviewDataset: Dataset = {
  ...checked,
  eligible: checked.errors.length ? [] : checked.characters,
  inputs: [
    ...new Map(
      checked.characters.flatMap((c) =>
        c.moves.map((m) => [inputKey(m.input), m.input] as const),
      ),
    ).values(),
  ],
  review: { absentInputs: audit.absentInputs },
};
