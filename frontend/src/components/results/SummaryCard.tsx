import { FinalEvaluation } from "../../types/interview.types";

interface SummaryCardProps {
  role: string;
  difficulty: string;
  evaluation: FinalEvaluation;
}

function getScoreTone(score: number): { text: string; ring: string; from: string; to: string } {
  if (score >= 70) return { text: "text-emerald-400", ring: "ring-emerald-500/20", from: "from-emerald-500", to: "to-emerald-400" };
  if (score >= 40) return { text: "text-amber-400", ring: "ring-amber-500/20", from: "from-amber-500", to: "to-amber-400" };
  return { text: "text-rose-400", ring: "ring-rose-500/20", from: "from-rose-500", to: "to-rose-400" };
}

export function SummaryCard({ role, difficulty, evaluation }: SummaryCardProps) {
  const tone = getScoreTone(evaluation.overallScore);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone.from} ${tone.to} p-[3px] shadow-lg`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
            <span className={`text-3xl font-bold ${tone.text}`}>{evaluation.overallScore}</span>
            <span className="text-[11px] text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {role} · {difficulty} level
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Interview Evaluation</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{evaluation.recommendation}</p>

          <p className="mt-3 text-xs text-slate-500">
            Average per-question score: <span className="text-slate-300">{evaluation.averageScore} / 10</span>
          </p>
        </div>
      </div>
    </div>
  );
}