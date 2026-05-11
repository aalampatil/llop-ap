import { Check, Plus, Trash2 } from "lucide-react";
import type { BuilderQuestion } from "../../types/poll";
import { Badge } from "../ui/badge";
import { Field } from "../ui/field";
import { Toggle } from "../ui/toggle";

type Props = {
  question: BuilderQuestion;
  questionIndex: number;
  canRemove: boolean;
  updateQuestion: (questionId: string, patch: Partial<BuilderQuestion>) => void;
  removeQuestion: (questionId: string) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionId: string, label: string) => void;
  removeOption: (questionId: string, optionId: string) => void;
};

export function QuestionCard({
  question,
  questionIndex,
  canRemove,
  updateQuestion,
  removeQuestion,
  addOption,
  updateOption,
  removeOption,
}: Props) {
  return (
    <div className="neo-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge>Question {questionIndex + 1}</Badge>
        <div className="flex items-center gap-2">
          <Toggle
            compact
            checked={question.isMandatory}
            icon={<Check />}
            label="Mandatory"
            onChange={(value) => updateQuestion(question.id, { isMandatory: value })}
          />
          {canRemove ? (
            <button
              className="icon-button"
              onClick={() => removeQuestion(question.id)}
              title="Remove question"
              type="button"
            >
              <Trash2 className="size-5" />
            </button>
          ) : null}
        </div>
      </div>
      <Field label="Question">
        <input
          className="neo-input"
          value={question.question}
          onChange={(event) => updateQuestion(question.id, { question: event.target.value })}
        />
      </Field>
      <div className="mt-4 space-y-3">
        {question.options.map((option, optionIndex) => (
          <div className="flex gap-2" key={option.id}>
            <span className="grid size-12 shrink-0 place-items-center border border-main bg-main text-main-foreground font-black">
              {optionIndex + 1}
            </span>
            <input
              className="neo-input"
              placeholder={`Option ${optionIndex + 1}`}
              value={option.label}
              onChange={(event) => updateOption(question.id, option.id, event.target.value)}
            />
            <button
              className="icon-button"
              onClick={() => removeOption(question.id, option.id)}
              title="Remove option"
              type="button"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        ))}
      </div>
      <button className="neo-button mt-4 bg-main" onClick={() => addOption(question.id)} type="button">
        <Plus className="size-4" /> Add option
      </button>
    </div>
  );
}
