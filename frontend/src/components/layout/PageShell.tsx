import { ReactNode } from "react";
import { Header } from "./Header";

interface PageShellProps {
  children: ReactNode;
  maxWidth?: "md" | "lg" | "xl";
}

const maxWidthMap: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export function PageShell({ children, maxWidth = "lg" }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_70%)]"
        aria-hidden="true"
      />

      <Header />

      <main className={`mx-auto w-full ${maxWidthMap[maxWidth]} px-4 py-10 sm:px-6 sm:py-14`}>
        {children}
      </main>
    </div>
  );
}