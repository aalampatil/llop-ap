import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiError, useApiClient } from "../lib/api";
import { newQuestion } from "../lib/poll-utils";
import type { BuilderQuestion, Poll } from "../types/poll";

export type PollBuilderState = {
  title: string;
  customSlug: string;
  description: string;
  category: string;
  tags: string;
  accentColor: string;
  expiresAt: string;
  isAnonymous: boolean;
  showLiveResults: boolean;
  completionMessage: string;
  questions: BuilderQuestion[];
};

const initialQuestions: BuilderQuestion[] = [
  {
    ...newQuestion(),
    question: "Which direction should we prioritize first?",
    options: [
      { id: crypto.randomUUID(), label: "Speed and simplicity" },
      { id: crypto.randomUUID(), label: "Richer analytics" },
      { id: crypto.randomUUID(), label: "Team collaboration" },
    ],
  },
];

export function usePollBuilder() {
  const api = useApiClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<PollBuilderState>({
    title: "Customer Pulse Sprint",
    customSlug: "",
    description: "Help us choose the next priority.",
    category: "Product",
    tags: "hackathon, launch, feedback",
    accentColor: "#B6FF3B",
    expiresAt: "",
    isAnonymous: true,
    showLiveResults: false,
    completionMessage:
      "Your response has been recorded. Thanks for sharing your input.",
    questions: initialQuestions,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = <Key extends keyof PollBuilderState>(
    key: Key,
    value: PollBuilderState[Key],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const updateQuestion = (questionId: string, patch: Partial<BuilderQuestion>) => {
    updateField(
      "questions",
      form.questions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    );
  };

  const addQuestion = () => updateField("questions", [...form.questions, newQuestion()]);

  const removeQuestion = (questionId: string) => {
    if (form.questions.length <= 1) return;
    updateField(
      "questions",
      form.questions.filter((question) => question.id !== questionId),
    );
  };

  const addOption = (questionId: string) => {
    updateField(
      "questions",
      form.questions.map((question) =>
        question.id === questionId && question.options.length < 8
          ? {
              ...question,
              options: [
                ...question.options,
                { id: crypto.randomUUID(), label: "" },
              ],
            }
          : question,
      ),
    );
  };

  const updateOption = (questionId: string, optionId: string, label: string) => {
    updateField(
      "questions",
      form.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, label } : option,
              ),
            }
          : question,
      ),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    updateField(
      "questions",
      form.questions.map((question) =>
        question.id === questionId && question.options.length > 2
          ? {
              ...question,
              options: question.options.filter((option) => option.id !== optionId),
            }
          : question,
      ),
    );
  };

  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      const data = await api.post<{ poll: Poll }>("/api/poll", {
        title: form.title,
        customSlug: form.customSlug || undefined,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        accentColor: form.accentColor,
        completionMessage: form.completionMessage,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isAnonymous: form.isAnonymous,
        showLiveResults: form.showLiveResults,
        questions: form.questions.map((question) => ({
          question: question.question,
          isMandatory: question.isMandatory,
          options: question.options.filter((option) => option.label.trim()),
        })),
      });
      navigate(`/dashboard/${data.poll.id}`);
    } catch (err) {
      setError(getApiError(err, "Could not create poll"));
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    error,
    saving,
    updateField,
    updateQuestion,
    addQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    submit,
  };
}
