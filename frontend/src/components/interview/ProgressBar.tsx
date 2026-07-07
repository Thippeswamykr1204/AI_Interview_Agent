interface ProgressBarProps {
  current: number;
  total: number;
  isComplete?: boolean;
}

export function ProgressBar({ current, total, isComplete = false }: ProgressBarProps) {
  const percentage = isComplete
    ? 100
    : Math.min(100, Math.round(((Math.min(current, total) - 1) / total) * 100));

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">
          Question {Math.min(current, total)} of {total}
        </span>
        <span className="text-slate-500">{percentage}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}