import { useState } from "react";
import { Button } from "../ui/Button";
import { useSpeechToText } from "../../hooks/useSpeechToText";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

const MAX_LENGTH = 8000;

export function AnswerInput({ onSubmit, isSubmitting }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");

  const { isSupported, isListening, interimTranscript, error, start, stop } = useSpeechToText(
    (finalChunk) => {
      setAnswer((prev) => {
        const separator = prev.length > 0 && !prev.endsWith(" ") ? " " : "";
        return (prev + separator + finalChunk).slice(0, MAX_LENGTH);
      });
    }
  );

  function handleSubmit() {
    if (isSubmitting) return;
    if (isListening) stop();
    onSubmit(answer);
    setAnswer("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function toggleMic() {
    if (isListening) {
      stop();
    } else {
      start();
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
          value={answer + (interimTranscript ? (answer ? " " : "") + interimTranscript : "")}
          onChange={(e) => setAnswer(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder={
            isSupported ? "Type your answer, or tap the mic to speak it..." : "Type your answer here..."
          }
          rows={7}
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3.5 text-slate-100 placeholder-slate-500 outline-none disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-2.5">
          <span className="flex items-center gap-2 text-xs text-slate-500">
            {isListening ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                Listening…
              </span>
            ) : (
              <span>
                {answer.length}/{MAX_LENGTH} · ⌘/Ctrl + Enter to submit
              </span>
            )}
          </span>

          <div className="flex items-center gap-2">
            {isSupported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={isSubmitting}
                aria-pressed={isListening}
                aria-label={isListening ? "Stop voice input" : "Answer by voice"}
                title={isListening ? "Stop voice input" : "Answer by voice"}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                    : "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white"
                }`}
              >
                <MicIcon className="h-4 w-4" />
              </button>
            )}

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

      {error && (
        <p className="mt-1.5 text-xs text-rose-400">
          {error === "not-allowed"
            ? "Microphone access was blocked. Enable it in your browser settings to use voice input."
            : error === "no-speech"
            ? "No speech detected. Try again."
            : `Voice input error: ${error}`}
        </p>
      )}
      {!isSupported && (
        <p className="mt-1.5 text-xs text-slate-600">
          Voice input isn't supported in this browser — try Chrome, Edge, or Safari.
        </p>
      )}
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}