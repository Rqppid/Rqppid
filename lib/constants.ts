export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB server-side cap, under Vercel's 4.5MB body limit
export const MAX_CONTEXT_CHARS = 500;

export const RESIZE_MAX_DIMENSION = 1568; // matches Claude's vision tiling sweet spot
export const RESIZE_JPEG_QUALITY = 0.8;

export type CategoryStyle = {
  label: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
};

export const CATEGORY_STYLES: Record<1 | 2 | 3 | 4 | 5, CategoryStyle> = {
  1: {
    label: "Emergency",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-400 dark:border-red-700",
    text: "text-red-900 dark:text-red-100",
    badge: "bg-red-600 text-white",
  },
  2: {
    label: "High",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-400 dark:border-orange-700",
    text: "text-orange-900 dark:text-orange-100",
    badge: "bg-orange-500 text-white",
  },
  3: {
    label: "Medium",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-400 dark:border-yellow-700",
    text: "text-yellow-900 dark:text-yellow-100",
    badge: "bg-yellow-500 text-black",
  },
  4: {
    label: "Low",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-400 dark:border-green-700",
    text: "text-green-900 dark:text-green-100",
    badge: "bg-green-600 text-white",
  },
  5: {
    label: "No action",
    bg: "bg-zinc-50 dark:bg-zinc-900",
    border: "border-zinc-300 dark:border-zinc-700",
    text: "text-zinc-900 dark:text-zinc-100",
    badge: "bg-zinc-500 text-white",
  },
};

export const DISCLAIMER_TEXT =
  "This is an AI-generated triage suggestion for human review only. It is not a final assessment and must be verified by a qualified inspector before any action is taken.";
