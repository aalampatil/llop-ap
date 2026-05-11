import { useAuth } from "@clerk/react";
import { useEffect, useMemo, useState } from "react";
import { getApiError, useApiClient } from "../lib/api";
import { usePollStore } from "../store/poll-store";
import type { Analytics, Poll, PublicState } from "../types/poll";
import { usePollSocket } from "./use-poll-socket";
import { getSubmissionToken } from "../lib/submission-token";

export function usePublicPoll(slug?: string) {
  const api = useApiClient();
  const { isSignedIn } = useAuth();
  const {
    publicPoll,
    publicState,
    analytics,
    setPublic,
    setAnalytics,
    setLoading,
    loading,
  } = usePollStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  usePollSocket(publicPoll?.id);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get<{
          poll: Poll;
          state: PublicState;
          analytics: Analytics | null;
        }>(`/api/poll/public/${slug}`);
        if (mounted) setPublic(data.poll, data.state, data.analytics);
      } catch (err) {
        if (mounted) setError(getApiError(err, "Poll not found"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [api, setLoading, setPublic, slug]);

  const missingRequired = useMemo(() => {
    if (!publicPoll) return [];
    return publicPoll.questions.filter(
      (question) => question.isMandatory && !answers[question.id],
    );
  }, [answers, publicPoll]);

  const submit = async () => {
    if (!publicPoll || !slug) return;
    setError("");
    setMessage("");

    if (missingRequired.length > 0) {
      setError("Please answer every mandatory question.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post<{ message: string; analytics: Analytics | null }>(
        `/api/poll/public/${slug}/submit`,
        {
          respondentName,
          respondentEmail: respondentEmail || undefined,
          submissionToken: getSubmissionToken(publicPoll.id),
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
        },
      );
      setMessage(data.message);
      if (data.analytics) setAnalytics(data.analytics);
    } catch (err) {
      setError(getApiError(err, "Could not submit response"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    publicPoll,
    publicState,
    analytics,
    loading,
    answers,
    respondentName,
    respondentEmail,
    message,
    error,
    submitting,
    blockedByAuth: Boolean(publicState?.authRequired && !isSignedIn),
    showResults: Boolean(publicState?.resultsVisible || message),
    setAnswers,
    setRespondentName,
    setRespondentEmail,
    submit,
  };
}
