import { KeyboardEvent, useEffect, useRef, useState } from "react";

interface AutosuggestInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  hint?: string;
  mode?: "single" | "commaList";
  required?: boolean;
}

/**
 * Text input with a filtered suggestion dropdown.
 * mode="single": suggestion replaces the whole value (e.g. Role).
 * mode="commaList": suggestion completes the last comma-separated token,
 * then appends ", " so the user can keep typing the next item (e.g. Skills).
 */
export function AutosuggestInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  hint,
  mode = "single",
  required,
}: AutosuggestInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentToken = mode === "commaList" ? getLastToken(value) : value;
  const trimmedToken = currentToken.trim().toLowerCase();

  const filtered =
    trimmedToken.length === 0
      ? []
      : suggestions
          .filter((s) => s.toLowerCase().includes(trimmedToken))
          .filter((s) => !isAlreadyUsed(value, s, mode))
          .slice(0, 6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: string) {
    onChange(mode === "commaList" ? replaceLastToken(value, suggestion) : suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label} {hint && <span className="text-slate-500">{hint}</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        required={required}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
          {filtered.map((suggestion, idx) => (
            <li
              key={suggestion}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                idx === activeIndex
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getLastToken(value: string): string {
  const parts = value.split(",");
  return parts[parts.length - 1];
}

function replaceLastToken(value: string, replacement: string): string {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((_, idx, arr) => idx < arr.length - 1 || true);

  parts[parts.length - 1] = replacement;

  return parts.filter(Boolean).join(", ") + ", ";
}

function isAlreadyUsed(value: string, candidate: string, mode: "single" | "commaList"): boolean {
  if (mode !== "commaList") return false;

  const used = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return used.includes(candidate.toLowerCase());
}