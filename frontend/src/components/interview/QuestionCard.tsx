import { QuestionCategory } from "../../types/interview.types";

interface QuestionCardProps {
  question: string;
  category: QuestionCategory;
  questionNumber: number;
}

const categoryLabels: Record<QuestionCategory, string> = {
  technical: "Technical",
  "system-design": "System Design",
  behavioral: "Behavioral",
  "problem-solving": "Problem Solving",
  "role-specific": "Role-Specific",
};

const categoryStyles: Record<QuestionCategory, string> = {
  technical: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "system-design": "bg-violet-500/10 text-violet-300 border-violet-500/20",
  behavioral: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  "problem-solving": "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "role-specific": "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
};

export function QuestionCard({ question, category, questionNumber }: QuestionCardProps) {
  return (
    <div
      key={questionNumber}
      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyles[category]}`}
        >
          {categoryLabels[category]}
        </span>
      </div>

      <h2 className="text-xl font-semibold leading-relaxed text-white sm:text-2xl">
        {question}
      </h2>
    </div>
  );
}