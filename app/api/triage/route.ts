import { z } from "zod";
import { ApiError } from "@google/genai";
import { genai, TRIAGE_MODEL } from "@/lib/geminiClient";
import { SYSTEM_PROMPT } from "@/lib/rubric";
import {
  TriageResultSchema,
  type ErrorCode,
  type TriageResponse,
} from "@/lib/schema";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_CONTEXT_CHARS,
  MAX_UPLOAD_BYTES,
} from "@/lib/constants";
import { pickDemoResult } from "@/lib/demoResults";

export const maxDuration = 60;

const RESPONSE_JSON_SCHEMA = z.toJSONSchema(TriageResultSchema);

// Gemini's per-minute limit trips easily during a live demo, and a short
// burst usually clears within a couple of seconds. One retry turns most of
// those into a slower success instead of a visible failure. Only one, and
// only a 3s wait: a call takes ~10-13s, so a second retry could push past
// this route's 60s ceiling. A sustained quota exhaustion still surfaces
// honestly rather than being retried into the ground.
const RETRYABLE_STATUSES = new Set([429, 500, 503]);
const RETRY_DELAY_MS = 3000;

function isRetryable(error: unknown): boolean {
  return error instanceof ApiError && RETRYABLE_STATUSES.has(error.status);
}

function fail(code: ErrorCode, message: string, status: number) {
  const body: TriageResponse = { ok: false, error: { code, message } };
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("no_image", "No image was uploaded.", 400);
  }
  const image = formData.get("image");
  const contextRaw = formData.get("context");

  if (!(image instanceof File) || image.size === 0) {
    return fail("no_image", "No image was uploaded.", 400);
  }

  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      image.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return fail(
      "invalid_file_type",
      "Only JPEG, PNG, or WebP images are supported.",
      400,
    );
  }

  if (image.size > MAX_UPLOAD_BYTES) {
    return fail(
      "file_too_large",
      "Image is too large. Please use a smaller photo.",
      400,
    );
  }

  // No key configured: return a clearly-labeled simulated result instead of
  // an error, so the app is demoable with zero setup. This only triggers on
  // a missing key (a deliberate, known state) - a real key that fails live
  // still surfaces the honest error below, so a broken key doesn't go
  // unnoticed behind fake-but-plausible output.
  if (!process.env.GEMINI_API_KEY) {
    const body: TriageResponse = {
      ok: true,
      data: pickDemoResult(),
      simulated: true,
    };
    return Response.json(body, { status: 200 });
  }

  const contextText =
    typeof contextRaw === "string" && contextRaw.trim().length > 0
      ? contextRaw.trim().slice(0, MAX_CONTEXT_CHARS)
      : null;

  const base64Data = Buffer.from(await image.arrayBuffer()).toString("base64");

  const generateRequest = {
    model: TRIAGE_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: contextText
              ? `Inspector-provided context: ${contextText}`
              : "No additional context was provided.",
          },
          {
            inlineData: {
              mimeType: image.type,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_JSON_SCHEMA,
    },
  };

  try {
    let response;
    try {
      response = await genai.models.generateContent(generateRequest);
    } catch (error) {
      if (!isRetryable(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      response = await genai.models.generateContent(generateRequest);
    }

    if (response.promptFeedback?.blockReason) {
      return fail(
        "model_declined",
        "The model declined to assess this image.",
        200,
      );
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      return fail(
        finishReason === "SAFETY" || finishReason === "PROHIBITED_CONTENT"
          ? "model_declined"
          : "model_output_invalid",
        finishReason === "SAFETY" || finishReason === "PROHIBITED_CONTENT"
          ? "The model declined to assess this image."
          : "The model's response could not be parsed into a triage result.",
        200,
      );
    }

    if (!response.text) {
      return fail(
        "model_output_invalid",
        "The model's response could not be parsed into a triage result.",
        200,
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(response.text);
    } catch {
      return fail(
        "model_output_invalid",
        "The model's response could not be parsed into a triage result.",
        200,
      );
    }

    const parsed = TriageResultSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return fail(
        "model_output_invalid",
        "The model's response could not be parsed into a triage result.",
        200,
      );
    }

    const body: TriageResponse = { ok: true, data: parsed.data };
    return Response.json(body, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      // Gemini reports an invalid key as 400 INVALID_ARGUMENT with the
      // reason embedded in the message, not as a 401/403.
      if (
        error.status === 400 &&
        (error.message.includes("API_KEY_INVALID") ||
          error.message.includes("API key not valid"))
      ) {
        return fail("missing_api_key", "Server API key was rejected.", 500);
      }
      if (error.status === 403) {
        return fail("missing_api_key", "Server API key was rejected.", 500);
      }
      if (error.status === 429) {
        return fail(
          "rate_limited",
          "Too many requests in the last minute. Wait about 30 seconds and try again.",
          429,
        );
      }
      return fail(
        "upstream_error",
        "The triage model is busy right now. Wait a few seconds and try again.",
        502,
      );
    }
    return fail(
      "upstream_error",
      "Unexpected error contacting the triage model.",
      502,
    );
  }
}
