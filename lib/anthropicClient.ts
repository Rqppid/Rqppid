import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export const TRIAGE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
