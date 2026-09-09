import { CATEGORY_STYLES, DISCLAIMER_TEXT } from "@/lib/constants";
import type { TriageResult } from "@/lib/schema";

export function ResultCard({ result }: { result: TriageResult }) {
  if (!result.can_assess || result.category === null) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/[.03] p-5">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg">
            ⚠️
          </span>
          <h2 className="font-semibold text-zinc-100">Unable to assess</h2>
        </div>
        <p className="text-sm text-zinc-300">{result.reasoning}</p>
        <p className="text-xs text-zinc-500">
          Try a clearer, well-lit photo of the defect from a straight-on angle.
        </p>
        <p className="text-xs text-zinc-500">{DISCLAIMER_TEXT}</p>
      </div>
    );
  }

  const style = CATEGORY_STYLES[result.category];

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border-2 p-5 shadow-sm ${style.bg} ${style.border}`}>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-bold shadow-sm ${style.badge}`}>
          Category {result.category}
        </span>
        <h2 className={`text-lg font-semibold ${style.text}`}>{style.label}</h2>
      </div>
      <p className={`text-sm ${style.text}`}>{result.reasoning}</p>
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        Confidence: <span className="font-semibold">{result.confidence}</span>
      </p>
      <p className="text-xs text-zinc-500">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
