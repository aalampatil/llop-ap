import type { Analytics } from "../../types/poll";
import { QuestionAnalytics } from "./question-analytics";

export function ResultsPanel({
  analytics,
  title,
}: {
  analytics: Analytics | null;
  title: string;
}) {
  if (!analytics) return null;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-4xl font-black">{title}</h2>
        <p className="mt-1 font-bold text-black/60">
          {analytics.totalResponses} total responses
        </p>
      </div>
      {analytics.questions.map((question) => (
        <QuestionAnalytics key={question.id} question={question} />
      ))}
    </section>
  );
}
