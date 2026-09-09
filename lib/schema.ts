import { z } from "zod";

export const TriageResultSchema = z.object({
  can_assess: z
    .boolean()
    .describe(
      "False if the photo cannot be usefully triaged (too blurry, too dark, not a road/footway surface, obstructed, etc.)."
    ),
  category: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
    .nullable()
    .describe("1-5 risk category. Null when can_assess is false."),
  category_label: z
    .enum(["Emergency", "High", "Medium", "Low", "No action"])
    .nullable()
    .describe("Label matching category. Null when can_assess is false."),
  reasoning: z
    .string()
    .max(300)
    .describe("Exactly one plain-English sentence referencing what is visible in the photo."),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("Certainty in the category call, based on image clarity and angle."),
  flag_for_human_review: z
    .literal(true)
    .describe("Always true. This tool never issues a final determination."),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

export type ErrorCode =
  | "no_image"
  | "invalid_file_type"
  | "file_too_large"
  | "missing_api_key"
  | "rate_limited"
  | "model_declined"
  | "model_output_invalid"
  | "upstream_error";

export type TriageResponse =
  | { ok: true; data: TriageResult; simulated?: boolean }
  | { ok: false; error: { code: ErrorCode; message: string } };
