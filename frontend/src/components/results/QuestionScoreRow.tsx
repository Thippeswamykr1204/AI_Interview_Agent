import { useState } from "react";
import { InterviewQuestionEntry } from "../../types/interview.types";

interface QuestionScoreRowProps {
  entry: InterviewQuestionEntry;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20";
  if (score >= 4) return "text-amber-400 bg-amber-500/10 ring-amber-500/20";
  return "text-rose-400 bg-rose-500/10 ring-rose-500/20";
}

export function QuestionScoreRow({ entry }: QuestionScoreRowProps) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = getScoreColor(entry.score ?? 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 transition-colors hover:border-slate-700">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
        aria-expanded={expanded}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ring-1 ${scoreColor}`}
        >
          {entry.score ?? "–"}
        </span>

        <span className="flex-1 truncate text-sm font-medium text-slate-200">
          Q{entry.index + 1}. {entry.question}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-3 border-t border-slate-800 px-4 py-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Your Answer</p>
            <p className="text-sm leading-relaxed text-slate-300">
              {entry.answer && entry.answer.trim().length > 0 ? entry.answer : "No answer provided."}
            </p>
          </div>

          {entry.feedback && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Feedback</p>
              <p className="text-sm leading-relaxed text-slate-300">{entry.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}