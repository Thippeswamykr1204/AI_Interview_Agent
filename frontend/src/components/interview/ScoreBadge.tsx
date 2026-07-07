interface ScoreBadgeProps {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  maxScore?: number;
}

function getScoreTone(score: number, maxScore: number): { text: string; ring: string; bg: string } {
  const ratio = score / maxScore;
  if (ratio >= 0.7) return { text: "text-emerald-400", ring: "ring-emerald-500/30", bg: "bg-emerald-500/10" };
  if (ratio >= 0.4) return { text: "text-amber-400", ring: "ring-amber-500/30", bg: "bg-amber-500/10" };
  return { text: "text-rose-400", ring: "ring-rose-500/30", bg: "bg-rose-500/10" };
}

export function ScoreBadge({ score, feedback, strengths, gaps, maxScore = 10 }: ScoreBadgeProps) {
  const tone = getScoreTone(score, maxScore);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${tone.bg} ${tone.ring}`}
        >
          <span className={`text-xl font-bold leading-none ${tone.text}`}>{score}</span>
          <span className="text-[10px] text-slate-500">/ {maxScore}</span>
        </div>

        <div className="flex-1">
          <p className="text-sm leading-relaxed text-slate-300">{feedback}</p>

          {(strengths.length > 0 || gaps.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strengths.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-400/80">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-xs text-slate-400">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {gaps.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-rose-400/80">
                    Gaps
                  </p>
                  <ul className="space-y-1">
                    {gaps.map((g, i) => (
                      <li key={i} className="text-xs text-slate-400">
                        · {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}