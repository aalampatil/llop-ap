import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import { formatDate } from "../../lib/poll-utils";
import type { Analytics, Poll } from "../../types/poll";
import { PreviewRow } from "../ui/preview-row";

export function PollStatusPanel({
  poll,
  analytics,
}: {
  poll: Poll;
  analytics: Analytics | null;
}) {
  return (
    <aside className="premium-analytics-card h-fit p-5 text-white">
      <h2 className="text-2xl font-black tracking-tight">Poll status</h2>
      <div className="mt-5 space-y-3">
        <PreviewRow icon={<Clock />} label="Expires" value={formatDate(poll.expiresAt)} />
        <PreviewRow
          icon={<ShieldCheck />}
          label="Validation"
          value="Required questions enforced"
        />
        <PreviewRow
          icon={<Sparkles />}
          label="Live count"
          value={`${analytics?.totalResponses ?? 0} responses`}
        />
      </div>
    </aside>
  );
}
