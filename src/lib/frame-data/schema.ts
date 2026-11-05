import { z } from "zod";

const text = z.string().trim().min(1);
export const sourceSchema = z.object({
  url: z.url(),
  retrievedAt: z.iso.datetime(),
  gameVersion: text,
  kind: z.enum(["official", "community"]),
  attribution: text,
  license: text,
  verification: z.enum(["verified", "unverified"]),
});
const valueFields = {
  display: text.nullable(),
  numeric: z.number().finite().optional(),
};
export const frameValueSchema = z
  .discriminatedUnion("status", [
    z.object({ status: z.literal("confirmed"), ...valueFields }),
    z.object({
      status: z.literal("conditional"),
      ...valueFields,
      condition: text,
      range: z
        .object({
          min: z.number().finite(),
          max: z.number().finite(),
          evidence: z.array(z.url()).min(1),
        })
        .optional(),
    }),
    z.object({ status: z.literal("not_applicable"), display: text.nullable() }),
    z.object({ status: z.literal("unknown"), display: text.nullable() }),
  ])
  .superRefine((value, ctx) => {
    if (
      value.status === "conditional" &&
      value.range &&
      (value.range.min > value.range.max ||
        value.display !== `${value.range.min}~${value.range.max}` ||
        value.numeric !== undefined)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "A certified range requires ordered bounds, matching min~max display, evidence and no scalar numeric",
      });
    if (
      "numeric" in value &&
      value.numeric !== undefined &&
      (value.display === null ||
        !/^[+-]?\d+(\.\d+)?$/.test(value.display) ||
        Number(value.display) !== value.numeric)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "numeric requires a matching plain numeric display",
      });
    }
  });
export const inputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("normal"),
      direction: z.enum(["5", "2"]),
      button: z.enum(["P", "K"]),
      strength: z.enum(["L", "M", "H"]),
    }),
    z.object({
      type: z.literal("special"),
      motion: text.regex(
        /^(?:[0-9\[\]]+|none)$/,
        "Use an explicit numpad motion; aliases are not normalized",
      ),
      button: z.enum(["P", "K"]),
      strength: z.enum(["L", "M", "H", "OD", "none"]),
      buttonCombination: z.enum(["LP+MP", "LK+MK"]).optional(),
    }),
  ])
  .superRefine((input, ctx) => {
    if (input.type !== "special") return;
    const simultaneous = input.motion === "none";
    if (
      simultaneous
        ? input.strength !== "none" ||
          input.buttonCombination !== (input.button === "P" ? "LP+MP" : "LK+MK")
        : input.buttonCombination !== undefined
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Simultaneous input requires motion none, strength none and a matching explicit button pair",
      });
  });
export const moveSchema = z
  .object({
    id: text,
    name: text,
    category: z.enum(["normal", "special"]),
    input: inputSchema,
    variant: z.object({
      kind: z.enum(["base", "conditional"]),
      condition: text.nullable(),
    }),
    frames: z.object({
      startup: frameValueSchema,
      total: frameValueSchema.and(
        z.object({
          provenance: z.enum(["source", "verified_calculation"]).nullable(),
          calculation: text.nullable(),
        }),
      ),
      hit: frameValueSchema,
      block: frameValueSchema,
    }),
    notes: z.array(text),
    source: sourceSchema,
  })
  .superRefine((move, ctx) => {
    if (move.category !== move.input.type)
      ctx.addIssue({
        code: "custom",
        message: "category must match input.type",
      });
    if (move.variant.kind === "conditional" && !move.variant.condition)
      ctx.addIssue({
        code: "custom",
        message: "conditional variant requires condition",
      });
    if (move.variant.kind === "base" && move.variant.condition !== null)
      ctx.addIssue({
        code: "custom",
        message: "base variant cannot carry a condition",
      });
    if (
      move.frames.total.status === "confirmed" &&
      move.frames.total.provenance === null
    )
      ctx.addIssue({
        code: "custom",
        message: "confirmed total requires provenance",
      });
    if (
      move.frames.total.provenance === "verified_calculation" &&
      !move.frames.total.calculation
    )
      ctx.addIssue({
        code: "custom",
        message: "calculated total requires evidence",
      });
  });
const coverage = z.object({
  status: z.enum(["complete", "partial", "unrecorded"]),
  verification: z.enum(["verified", "unverified"]),
});
export const characterSchema = z.object({
  id: text,
  nameJa: text,
  nameEn: text,
  gameVersion: text,
  source: sourceSchema,
  coverage: z.object({ normal: coverage, special: coverage }),
  moves: z.array(moveSchema),
});
export const metadataSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  kind: z.enum(["production", "fixture"]),
  gameVersion: text,
  label: text,
});
export type FrameValue = z.infer<typeof frameValueSchema>;
export type MoveInput = z.infer<typeof inputSchema>;
export type Move = z.infer<typeof moveSchema>;
export type Character = z.infer<typeof characterSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Mode = "normal" | "startup";
