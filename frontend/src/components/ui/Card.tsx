import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  glow?: boolean;
}

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({ children, padded = true, glow = false, className, ...rest }: CardProps) {
  return (
    <div
      className={joinClasses(
        "relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm",
        "shadow-xl shadow-black/20",
        glow && "shadow-indigo-500/10 ring-1 ring-indigo-500/10",
        padded && "p-6 sm:p-8",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, icon }: CardHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-3">
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}