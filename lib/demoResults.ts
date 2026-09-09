import type { TriageResult } from "@/lib/schema";

// Shown when GEMINI_API_KEY is unset, so the app is demoable with zero
// setup. These are NOT generated from the uploaded photo - the UI must
// always label them as simulated so this never reads as a real result.
export const DEMO_RESULTS: TriageResult[] = [
  {
    can_assess: true,
    category: 1,
    category_label: "Emergency",
    reasoning:
      "The defect appears deep with exposed edges in the traffic lane, consistent with an immediate hazard.",
    confidence: "high",
    flag_for_human_review: true,
  },
  {
    can_assess: true,
    category: 2,
    category_label: "High",
    reasoning:
      "A clearly defined pothole with sharp edges spans the wheel path and looks likely to worsen without repair.",
    confidence: "high",
    flag_for_human_review: true,
  },
  {
    can_assess: true,
    category: 3,
    category_label: "Medium",
    reasoning:
      "A visible surface defect is present but appears shallow, away from the main wheel path.",
    confidence: "medium",
    flag_for_human_review: true,
  },
  {
    can_assess: true,
    category: 5,
    category_label: "No action",
    reasoning: "Only ordinary surface wear is visible, consistent with normal aging.",
    confidence: "medium",
    flag_for_human_review: true,
  },
  {
    can_assess: false,
    category: null,
    category_label: null,
    reasoning: "The photo is too blurry to identify any surface defect with confidence.",
    confidence: "low",
    flag_for_human_review: true,
  },
];

export function pickDemoResult(): TriageResult {
  return DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)];
}
