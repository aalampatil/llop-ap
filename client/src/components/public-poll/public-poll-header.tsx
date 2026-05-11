import type { Poll, PublicState } from "../../types/poll";
import { Badge } from "../ui/badge";
import { CopyPublicLinkButton } from "../ui/copy-public-link-button";

export function PublicPollHeader({
  poll,
  state,
}: {
  poll: Poll;
  state: PublicState;
}) {
  return (
    <div className="neo-panel mb-6 p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge>{poll.category}</Badge>
        <Badge>{poll.isAnonymous ? "anonymous" : "authenticated"}</Badge>
        <Badge>{state.acceptingResponses ? "open" : "closed"}</Badge>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{poll.title}</h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-muted-foreground">
            {poll.description}
          </p>
        </div>
        <CopyPublicLinkButton url={window.location.href} />
      </div>
    </div>
  );
}
