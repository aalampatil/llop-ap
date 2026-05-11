import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { BuilderPreview } from "../components/builder/builder-preview";
import { PollSettingsForm } from "../components/builder/poll-settings-form";
import { QuestionCard } from "../components/builder/question-card";
import { usePollBuilder } from "../hooks/use-poll-builder";

export function BuilderPage() {
  const {
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
  } = usePollBuilder();

  return (
    <main className="db-root">
      <div className="db-layout">
        <div className="db-page-head">
          <div>
            <h1 className="db-title">Build poll</h1>
            <p className="db-desc">Create a cyberpunk-styled poll with reusable global UI primitives.</p>
          </div>
          <div className="db-head-actions">
            <button className="neo-button bg-black text-main" onClick={addQuestion} type="button">
              <Plus className="size-4" /> Add question
            </button>
            <button className="neo-button bg-main" disabled={saving} onClick={submit} type="button">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Publishing..." : "Create poll"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="db-error mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4" />
            {error}
          </div>
        ) : null}

        <section className="db-grid">
          <div className="space-y-4">
            <PollSettingsForm form={form} updateField={updateField} />
            {form.questions.map((question, index) => (
              <QuestionCard
                addOption={addOption}
                canRemove={form.questions.length > 1}
                key={question.id}
                question={question}
                questionIndex={index}
                removeOption={removeOption}
                removeQuestion={removeQuestion}
                updateOption={updateOption}
                updateQuestion={updateQuestion}
              />
            ))}
          </div>
          <BuilderPreview form={form} />
        </section>
      </div>
    </main>
  );
}