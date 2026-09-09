import { MAX_CONTEXT_CHARS } from "@/lib/constants";

export function ContextField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="context" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Location or notes <span className="font-normal text-zinc-500">(optional)</span>
      </label>
      <textarea
        id="context"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CONTEXT_CHARS))}
        placeholder="e.g. Ormeau Road, near the junction"
        rows={2}
        maxLength={MAX_CONTEXT_CHARS}
        className="resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-100"
      />
    </div>
  );
}
