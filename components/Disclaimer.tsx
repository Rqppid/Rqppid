import { DISCLAIMER_TEXT } from "@/lib/constants";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-lime-300/20 bg-lime-300/[.06] px-4 py-3 text-sm text-zinc-300">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-lime-300"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <p>{DISCLAIMER_TEXT}</p>
    </div>
  );
}
