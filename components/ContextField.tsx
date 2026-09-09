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
      <label htmlFor="context" className="text-sm font-medium text-zinc-300">
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
        className="resize-none rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300/15 disabled:opacity-60"
      />
    </div>
  );
}
