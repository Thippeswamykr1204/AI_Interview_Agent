import { useState } from "react";
import { Button } from "../ui/Button";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

const MAX_LENGTH = 8000;

export function AnswerInput({ onSubmit, isSubmitting }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    if (isSubmitting) return;
    onSubmit(answer);
    setAnswer("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="mt-6">
      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-inner transition-colors focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder="Type your answer here..."
          rows={7}
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3.5 text-slate-100 placeholder-slate-500 outline-none disabled:opacity-60"
        />

        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5">
          <span className="text-xs text-slate-500">
            {answer.length}/{MAX_LENGTH} · ⌘/Ctrl + Enter to submit
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Answer
          </Button>
        </div>
      </div>
    </div>
  );
}