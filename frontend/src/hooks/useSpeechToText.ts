import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal typings for the (non-standard, browser-only) Web Speech API.
 * Not shipped in lib.dom.d.ts, so we declare just what we use.
 */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechToTextResult {
  /** True if the browser supports live transcription at all. */
  isSupported: boolean;
  /** True while the mic is actively listening. */
  isListening: boolean;
  /** Finalized transcript chunks are appended via onTranscriptChunk as they land. */
  interimTranscript: string;
  /** Surfaces the last recognition error, if any (e.g. "not-allowed", "no-speech"). */
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Wraps the browser's built-in SpeechRecognition API (Chrome, Edge, Safari 14.1+)
 * to provide push-to-talk style voice transcription for answer input.
 *
 * No audio ever leaves the browser to our backend — transcription happens
 * client-side via the OS/browser speech engine. Unsupported browsers (e.g.
 * Firefox) simply get isSupported = false and fall back to typed input.
 */
export function useSpeechToText(onTranscriptChunk: (finalText: string) => void): UseSpeechToTextResult {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onChunkRef = useRef(onTranscriptChunk);
  onChunkRef.current = onTranscriptChunk;

  const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
  const isSupported = SpeechRecognitionCtor !== null;

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor || recognitionRef.current) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          onChunkRef.current(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    setError(null);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [SpeechRecognitionCtor]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}