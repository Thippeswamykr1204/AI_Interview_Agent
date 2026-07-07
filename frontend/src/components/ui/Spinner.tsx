interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullscreen?: boolean;
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function Spinner({ size = "md", label, fullscreen = false }: SpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-slate-700 border-t-indigo-400 ${sizeMap[size]}`}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}