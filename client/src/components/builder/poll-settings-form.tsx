import { Eye, ShieldCheck } from "lucide-react";
import type { PollBuilderState } from "../../hooks/use-poll-builder";
import { Field } from "../ui/field";
import { Toggle } from "../ui/toggle";

type Props = {
  form: PollBuilderState;
  updateField: <Key extends keyof PollBuilderState>(
    key: Key,
    value: PollBuilderState[Key],
  ) => void;
};

export function PollSettingsForm({ form, updateField }: Props) {
  return (
    <div className="neo-panel grid gap-4 p-5">
      <Field label="Title">
        <input
          className="neo-input"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
      </Field>
      <Field label="Description">
        <textarea
          className="neo-input min-h-24"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Category">
          <input
            className="neo-input"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
          />
        </Field>
        <Field label="Tags">
          <input
            className="neo-input"
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
          />
        </Field>
        <Field label="Accent">
          <input
            className="neo-input h-12"
            type="color"
            value={form.accentColor}
            onChange={(event) => updateField("accentColor", event.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Expiry">
          <input
            className="neo-input bg-main text-black"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(event) => updateField("expiresAt", event.target.value)}
          />
        </Field>
        <Toggle
          checked={form.isAnonymous}
          icon={<ShieldCheck />}
          label="Anonymous responses"
          onChange={(value) => updateField("isAnonymous", value)}
        />
        <Toggle
          checked={form.showLiveResults}
          icon={<Eye />}
          label="Live public results"
          onChange={(value) => updateField("showLiveResults", value)}
        />
      </div>
      <Field label="Completion message">
        <input
          className="neo-input"
          value={form.completionMessage}
          onChange={(event) => updateField("completionMessage", event.target.value)}
        />
      </Field>
    </div>
  );
}
