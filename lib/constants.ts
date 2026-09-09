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

// Colors are always-dark (the app no longer follows system light/dark) and
// deliberately avoid lime/green-300, which is reserved for brand/interactive
// accents elsewhere in the UI - a risk badge must never read as a button.
export const CATEGORY_STYLES: Record<1 | 2 | 3 | 4 | 5, CategoryStyle> = {
  1: {
    label: "Emergency",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    text: "text-red-300",
    badge: "bg-red-500 text-white",
  },
  2: {
    label: "High",
    bg: "bg-orange-500/10",
    border: "border-orange-500/40",
    text: "text-orange-300",
    badge: "bg-orange-500 text-[#071014]",
  },
  3: {
    label: "Medium",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/40",
    text: "text-yellow-200",
    badge: "bg-yellow-400 text-[#071014]",
  },
  4: {
    label: "Low",
    bg: "bg-green-500/10",
    border: "border-green-500/40",
    text: "text-green-300",
    badge: "bg-green-500 text-white",
  },
  5: {
    label: "No action",
    bg: "bg-white/5",
    border: "border-white/15",
    text: "text-zinc-300",
    badge: "bg-white/10 text-zinc-300",
  },
};

export const DISCLAIMER_TEXT =
  "This is an AI-generated triage suggestion for human review only. It is not a final assessment and must be verified by a qualified inspector before any action is taken.";
