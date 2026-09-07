import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, TRIAGE_MODEL } from "@/lib/anthropicClient";
import { SYSTEM_PROMPT } from "@/lib/rubric";
import { TriageResultSchema, type ErrorCode, type TriageResponse } from "@/lib/schema";
import { ACCEPTED_IMAGE_TYPES, MAX_CONTEXT_CHARS, MAX_UPLOAD_BYTES } from "@/lib/constants";

export const maxDuration = 60;

function fail(code: ErrorCode, message: string, status: number) {
  const body: TriageResponse = { ok: false, error: { code, message } };
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("missing_api_key", "Server is not configured with an API key.", 500);
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const contextRaw = formData.get("context");

  if (!(image instanceof File) || image.size === 0) {
    return fail("no_image", "No image was uploaded.", 400);
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(image.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return fail("invalid_file_type", "Only JPEG, PNG, or WebP images are supported.", 400);
  }

  if (image.size > MAX_UPLOAD_BYTES) {
    return fail("file_too_large", "Image is too large. Please use a smaller photo.", 400);
  }

  const contextText =
    typeof contextRaw === "string" && contextRaw.trim().length > 0
      ? contextRaw.trim().slice(0, MAX_CONTEXT_CHARS)
      : null;

  const base64Data = Buffer.from(await image.arrayBuffer()).toString("base64");

  try {
    const response = await anthropic.messages.parse({
      model: TRIAGE_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: { format: zodOutputFormat(TriageResultSchema) },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.type as "image/jpeg" | "image/png" | "image/webp",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: contextText
                ? `Inspector-provided context: ${contextText}`
                : "No additional context was provided.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return fail(
        "model_declined",
        "The model declined to assess this image.",
        200
      );
    }

    if (!response.parsed_output) {
      return fail(
        "model_output_invalid",
        "The model's response could not be parsed into a triage result.",
        200
      );
    }

    const body: TriageResponse = { ok: true, data: response.parsed_output };
    return Response.json(body, { status: 200 });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("missing_api_key", "Server API key was rejected.", 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("rate_limited", "Rate limited by the API. Please try again shortly.", 429);
    }
    if (error instanceof Anthropic.APIError) {
      return fail("upstream_error", "The triage model is temporarily unavailable.", 502);
    }
    return fail("upstream_error", "Unexpected error contacting the triage model.", 502);
  }
}
