import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/interview/ProgressBar";
import { QuestionCard } from "../components/interview/QuestionCard";
import { AnswerInput } from "../components/interview/AnswerInput";
import { ScoreBadge } from "../components/interview/ScoreBadge";
import { useInterviewSession } from "../hooks/useInterviewSession";

export function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    session,
    lastFeedback,
    fetchSession,
    isFetchingSession,
    fetchSessionError,
    submitAnswer,
    isSubmitting,
    submitError,
  } = useInterviewSession();

  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [reviewingQuestionNumber, setReviewingQuestionNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (session?.id !== sessionId) {
      fetchSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (isFetchingSession || !session) {
    return (
      <PageShell maxWidth="md">
        {fetchSessionError ? (
          <ErrorBanner message={fetchSessionError} onRetry={() => sessionId && fetchSession(sessionId)} />
        ) : (
          <Spinner fullscreen label="Loading your interview..." />
        )}
      </PageShell>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];

  async function handleSubmitAnswer(answer: string) {
    if (!sessionId) return;
    setReviewingQuestionNumber(session!.currentQuestionIndex + 1);
    setAwaitingContinue(false);
    const result = await submitAnswer(sessionId, answer);
    if (result) {
      setAwaitingContinue(true);
    } else {
      setReviewingQuestionNumber(null);
    }
  }

  function handleContinue() {
    setAwaitingContinue(false);
    setReviewingQuestionNumber(null);
    if (session?.status === "completed") {
      navigate(`/results/${sessionId}`);
    }
  }

  const showFeedback = awaitingContinue && lastFeedback;
  const isSessionComplete = session.status === "completed";

  return (
    <PageShell maxWidth="md">
      <ProgressBar
        current={reviewingQuestionNumber ?? session.currentQuestionIndex + 1}
        total={session.totalQuestions}
        isComplete={isSessionComplete}
      />

      <Card>
        {submitError && (
          <div className="mb-5">
            <ErrorBanner message={submitError} />
          </div>
        )}

        {showFeedback ? (
          <div className="space-y-6">
            <ScoreBadge
              score={lastFeedback.score}
              feedback={lastFeedback.feedback}
              strengths={lastFeedback.strengths}
              gaps={lastFeedback.gaps}
            />
            <Button size="lg" className="w-full" onClick={handleContinue}>
              {isSessionComplete ? "View Final Results" : "Next Question"}
            </Button>
          </div>
        ) : currentQuestion ? (
          <>
            <QuestionCard
              question={currentQuestion.question}
              category={currentQuestion.category}
              questionNumber={currentQuestion.index}
            />
            <AnswerInput onSubmit={handleSubmitAnswer} isSubmitting={isSubmitting} />
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-slate-400">This interview is already complete.</p>
            <Button className="mt-4" onClick={() => navigate(`/results/${sessionId}`)}>
              View Results
            </Button>
          </div>
        )}
      </Card>
    </PageShell>
  );
}