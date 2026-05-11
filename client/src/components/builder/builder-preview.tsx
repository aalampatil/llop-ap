import { Clock, Radio, Sparkles, UserCheck } from "lucide-react";
import type { PollBuilderState } from "../../hooks/use-poll-builder";
import { formatDate } from "../../lib/poll-utils";
import { PreviewRow } from "../ui/preview-row";

export function BuilderPreview({ form }: { form: PollBuilderState }) {
  return (
    <aside className="builder-preview lg:sticky lg:top-24 lg:self-start">
      <div className="premium-analytics-card p-5">
        <div className="mb-5 flex items-center gap-2 text-main">
          <Sparkles className="size-5" />
          <span className="font-black uppercase tracking-[0.16em]">Preview</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight">{form.title || "Untitled poll"}</h2>
        <p className="mt-3 font-semibold leading-7 text-muted-foreground">{form.description}</p>
        <div className="mt-5 space-y-3">
          <PreviewRow
            icon={<Clock />}
            label="Expiry"
            value={form.expiresAt ? formatDate(new Date(form.expiresAt).toISOString()) : "No expiry"}
          />
          <PreviewRow
            icon={<UserCheck />}
            label="Mode"
            value={form.isAnonymous ? "Anonymous" : "Authenticated"}
          />
          <PreviewRow icon={<Radio />} label="Questions" value={form.questions.length.toString()} />
        </div>
      </div>
    </aside>
  );
}
