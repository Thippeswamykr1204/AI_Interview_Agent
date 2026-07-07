import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { DifficultyLevel } from "../types/interview.types";

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
];

const QUESTION_COUNT_OPTIONS = [5, 6, 7, 8, 10];

export function SetupPage() {
  const navigate = useNavigate();
  const { start, isStarting, startError } = useInterviewSession();

  const [role, setRole] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("mid");
  const [totalQuestions, setTotalQuestions] = useState(5);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const session = await start({ role: role.trim(), skills, difficulty, totalQuestions });

    if (session) {
      navigate(`/interview/${session.id}`);
    }
  }

  return (
    <PageShell maxWidth="md">
      <Card glow>
        <CardHeader
          title="Set up your mock interview"
          subtitle="Tell us the role and we'll generate relevant questions"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          }
        />

        {startError && <div className="mb-5"><ErrorBanner message={startError} /></div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
              Role
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-slate-300">
              Key skills <span className="text-slate-500">(comma-separated)</span>
            </label>
            <input
              id="skills"
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, Node.js, MongoDB"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className="mb-1.5 block text-sm font-medium text-slate-300">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-slate-100 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="totalQuestions" className="mb-1.5 block text-sm font-medium text-slate-300">
                Questions
              </label>
              <select
                id="totalQuestions"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-slate-100 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              >
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={isStarting} className="w-full">
            Generate Questions & Start
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}