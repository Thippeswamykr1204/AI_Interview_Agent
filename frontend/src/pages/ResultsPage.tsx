import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Button } from "../components/ui/Button";
import { SummaryCard } from "../components/results/SummaryCard";
import { StrengthsGapsList } from "../components/results/StrengthsGapsList";
import { QuestionScoreRow } from "../components/results/QuestionScoreRow";
import { useInterviewSession } from "../hooks/useInterviewSession";

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { session, fetchSummary, isFetchingSummary, summaryError, reset } = useInterviewSession();

  useEffect(() => {
    if (!sessionId) return;
    if (session?.id !== sessionId || !session.finalEvaluation) {
      fetchSummary(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function handleStartNew() {
    reset();
    navigate("/setup");
  }

  if (isFetchingSummary || !session || !session.finalEvaluation) {
    return (
      <PageShell maxWidth="lg">
        {summaryError ? (
          <ErrorBanner message={summaryError} onRetry={() => sessionId && fetchSummary(sessionId)} />
        ) : (
          <Spinner fullscreen label="Generating your evaluation..." />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="lg">
      <div className="space-y-8">
        <SummaryCard role={session.role} difficulty={session.difficulty} evaluation={session.finalEvaluation} />

        <StrengthsGapsList
          strengths={session.finalEvaluation.strengths}
          gaps={session.finalEvaluation.gaps}
        />

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Question-by-question transcript
          </h3>
          <div className="space-y-2">
            {session.questions.map((entry) => (
              <QuestionScoreRow key={entry.index} entry={entry} />
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleStartNew}>
            Start Another Interview
          </Button>
        </div>
      </div>
    </PageShell>
  );
}