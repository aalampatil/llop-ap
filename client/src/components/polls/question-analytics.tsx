import type { AnalyticsQuestion } from "../../types/poll";
import { Badge } from "../ui/badge";

export function QuestionAnalytics({ question }: { question: AnalyticsQuestion }) {
  return (
    <article className="neo-panel bg-white/72 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black tracking-tight">{question.question}</h2>
        <Badge>{question.totalAnswers} answers</Badge>
      </div>
      <div className="space-y-3">
        {question.options.map((option) => (
          <div key={option.id}>
            <div className="mb-2 flex justify-between gap-3 font-black">
              <span>{option.label}</span>
              <span>
                {option.count} - {option.percentage}%
              </span>
            </div>
            <div className="premium-bar h-4 bg-black/8">
              <div className="h-full bg-main" style={{ width: `${option.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
      {question.skipped ? (
        <p className="mt-4 font-black text-black/50">{question.skipped} skipped</p>
      ) : null}
    </article>
  );
}
