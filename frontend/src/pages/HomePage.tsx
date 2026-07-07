import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/Button";

const FEATURES = [
  {
    title: "Role-specific questions",
    description: "Generated dynamically for the role and skills you specify.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L15 12l-5.25-5M15 17H4" />
    ),
  },
  {
    title: "Instant AI scoring",
    description: "Every answer is scored 0-10 with specific, actionable feedback.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Full evaluation report",
    description: "A final score, strengths, gaps, and hiring recommendation.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    ),
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <PageShell maxWidth="lg">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          AI Interview Agent
        </span>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Practice interviews that feel <span className="text-indigo-400">real</span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
          Get role-specific questions, honest scoring, and a detailed evaluation
          — in five minutes, for any role.
        </p>

        <div className="mt-8">
          <Button size="lg" onClick={() => navigate("/setup")}>
            Start Mock Interview
          </Button>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {feature.icon}
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}