import { Loader2, Radio, Send } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Poll, PublicState } from "../../types/poll";
import { Badge } from "../ui/badge";
import { Field } from "../ui/field";

type Props = {
  poll: Poll;
  state: PublicState;
  answers: Record<string, string>;
  respondentName: string;
  respondentEmail: string;
  error: string;
  message: string;
  submitting: boolean;
  setAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  setRespondentName: (value: string) => void;
  setRespondentEmail: (value: string) => void;
  submit: () => void;
};

export function ResponseForm({
  poll,
  state,
  answers,
  respondentName,
  respondentEmail,
  error,
  message,
  submitting,
  setAnswers,
  setRespondentName,
  setRespondentEmail,
  submit,
}: Props) {
  return (
    <section className="space-y-5">
      {poll.isAnonymous ? (
        <div className="neo-panel grid gap-4 bg-white/72 p-5 md:grid-cols-2">
          <Field label="Name">
            <input
              className="neo-input"
              placeholder="Optional"
              value={respondentName}
              onChange={(event) => setRespondentName(event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className="neo-input"
              placeholder="Optional"
              value={respondentEmail}
              onChange={(event) => setRespondentEmail(event.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {poll.questions.map((question, index) => (
        <div className="neo-panel bg-white/72 p-5" key={question.id}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge>Question {index + 1}</Badge>
            <span className="font-black text-black/60">
              {question.isMandatory ? "Required" : "Optional"}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{question.question}</h2>
          <div className="mt-4 grid gap-3">
            {question.options.map((option) => (
              <button
                className={`choice-button ${answers[question.id] === option.id ? "is-selected" : ""}`}
                key={option.id}
                onClick={() =>
                  setAnswers((current) => ({ ...current, [question.id]: option.id }))
                }
                type="button"
              >
                <Radio className="size-5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        className="neo-button bg-main text-lg"
        disabled={submitting || !state.acceptingResponses}
        onClick={submit}
        type="button"
      >
        {submitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />} Submit response
      </button>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-black text-red-700 shadow-[0_12px_28px_rgba(220,38,38,0.1)]">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl bg-main p-4 font-black shadow-[0_16px_34px_rgba(102,180,35,0.18)] ring-1 ring-black/10">
          {message}
        </div>
      ) : null}
    </section>
  );
}
