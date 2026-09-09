import { DISCLAIMER_TEXT } from "@/lib/constants";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <p>{DISCLAIMER_TEXT}</p>
    </div>
  );
}
