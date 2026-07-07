interface StrengthsGapsListProps {
  strengths: string[];
  gaps: string[];
}

export function StrengthsGapsList({ strengths, gaps }: StrengthsGapsListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-sm font-semibold text-emerald-300">Strengths</h3>
        </div>

        {strengths.length === 0 ? (
          <p className="text-sm text-slate-500">No clear strengths identified.</p>
        ) : (
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-rose-300">Gaps</h3>
        </div>

        {gaps.length === 0 ? (
          <p className="text-sm text-slate-500">No significant gaps identified.</p>
        ) : (
          <ul className="space-y-2">
            {gaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}