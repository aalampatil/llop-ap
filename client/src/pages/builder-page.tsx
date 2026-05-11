import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ResultsPanel } from "../components/polls/results-panel";
import { AuthRequiredPanel } from "../components/public-poll/auth-required-panel";
import { PollStatusPanel } from "../components/public-poll/poll-status-panel";
import { PublicPollHeader } from "../components/public-poll/public-poll-header";
import { ResponseForm } from "../components/public-poll/response-form";
import { usePublicPoll } from "../hooks/use-public-poll";

/* ─────────────────────────────────────────────
   Inject global styles (idempotent)
───────────────────────────────────────────── */
const STYLE_ID = "m-public-poll-theme";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

    :root {
      --bg:            #0e0e0e;
      --surface:       #161616;
      --border:        #2a2a2a;
      --accent:        #d4ff00;
      --accent-dim:    #a8cc00;
      --text:          #f0f0f0;
      --muted:         #666;
      --error-bg:      #1a0000;
      --error-border:  #4a0000;
      --error-text:    #ff4444;
      --warn-bg:       #1a1400;
      --warn-border:   #4a3a00;
      --warn-text:     #c8a000;
    }

    .pp-root {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Mono', monospace;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    .pp-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 48px 48px;
      opacity: 0.4;
      pointer-events: none;
      z-index: 0;
    }

    .pp-layout {
      position: relative;
      z-index: 1;
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* ── loading ── */
    .pp-center {
      display: grid;
      place-items: center;
      min-height: 60vh;
    }
    .pp-spinner {
      color: var(--accent);
      animation: pp-spin 1s linear infinite;
    }
    @keyframes pp-spin { to { transform: rotate(360deg); } }

    /* ── status panels ── */
    .pp-error {
      border: 1px solid var(--error-border);
      background: var(--error-bg);
      padding: 1.25rem 1.5rem;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--error-text);
      animation: pp-fadeUp .4s ease both;
    }
    .pp-error::before { content: '⚠ '; }

    .pp-warn {
      position: relative;
      border: 1px solid var(--warn-border);
      background: var(--warn-bg);
      padding: 1.25rem 1.5rem;
      font-size: 0.68rem;
      letter-spacing: 0.05em;
      line-height: 1.8;
      color: var(--warn-text);
      animation: pp-fadeUp .4s ease both;
    }
    .pp-warn::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 32px; height: 3px;
      background: var(--warn-text);
    }
    .pp-warn-label {
      font-size: 0.55rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--warn-text);
      margin-bottom: 0.4rem;
      opacity: 0.7;
    }

    /* ── main grid ── */
    .pp-grid {
      display: grid;
      gap: 1.25rem;
      animation: pp-fadeUp .5s ease both .1s;
    }
    @media (min-width: 1024px) {
      .pp-grid { grid-template-columns: 1fr 0.4fr; align-items: start; }
    }

    /* ── live results block ── */
    .pp-live-results {
      margin-top: 1.5rem;
      animation: pp-fadeUp .5s ease both .15s;
    }

    /* ── footer bar ── */
    .pp-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2rem;
      padding: 0.9rem 1.25rem;
      border: 1px solid var(--border);
      background: var(--surface);
      animation: pp-fadeUp .5s ease both .2s;
    }
    .pp-footer-label {
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .pp-footer-btn {
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pp-footer-btn::after { content: ' →'; }
    .pp-footer-btn:hover { color: var(--accent-dim); }

    @keyframes pp-fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   PublicPollPage
───────────────────────────────────────────── */
export function PublicPollPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const poll = usePublicPoll(slug);

  if (poll.loading) {
    return (
      <main className="pp-root">
        <div className="pp-layout pp-center">
          <Loader2 size={32} className="pp-spinner" />
        </div>
      </main>
    );
  }

  if (poll.error && !poll.publicPoll) {
    return (
      <main className="pp-root">
        <div className="pp-layout" style={{ paddingTop: "3rem" }}>
          <div className="pp-error">{poll.error}</div>
        </div>
      </main>
    );
  }

  if (!poll.publicPoll || !poll.publicState) return null;

  return (
    <main className="pp-root">
      <div className="pp-layout">

        {/* Header — rendered by PublicPollHeader; wrap gives it animation context */}
        <div style={{ animation: "pp-fadeUp .45s ease both" }}>
          <PublicPollHeader poll={poll.publicPoll} state={poll.publicState} />
        </div>

        {/* ── Conditional body ── */}
        {poll.publicPoll.status === "published" ? (
          <div style={{ animation: "pp-fadeUp .5s ease both .1s" }}>
            <ResultsPanel analytics={poll.analytics} title="Final results" />
          </div>
        ) : poll.publicState.expired ? (
          <div className="pp-warn">
            <div className="pp-warn-label">◎ Poll expired</div>
            This poll has expired. Results will appear here after the creator publishes them.
          </div>
        ) : poll.blockedByAuth ? (
          <div style={{ animation: "pp-fadeUp .5s ease both .1s" }}>
            <AuthRequiredPanel />
          </div>
        ) : (
          <div className="pp-grid">
            <ResponseForm
              answers={poll.answers}
              error={poll.error}
              message={poll.message}
              poll={poll.publicPoll}
              respondentEmail={poll.respondentEmail}
              respondentName={poll.respondentName}
              setAnswers={poll.setAnswers}
              setRespondentEmail={poll.setRespondentEmail}
              setRespondentName={poll.setRespondentName}
              state={poll.publicState}
              submitting={poll.submitting}
              submit={poll.submit}
            />
            <PollStatusPanel analytics={poll.analytics} poll={poll.publicPoll} />
          </div>
        )}

        {/* ── Live results ── */}
        {poll.showResults && poll.publicPoll.status !== "published" ? (
          <div className="pp-live-results">
            <ResultsPanel analytics={poll.analytics} title="Live results" />
          </div>
        ) : null}

        {/* ── Footer bar ── */}
        <div className="pp-footer">
          <span className="pp-footer-label">Public response view</span>
          <button className="pp-footer-btn" onClick={() => navigate("/")} type="button">
            Powered by LLOP
          </button>
        </div>

      </div>
    </main>
  );
}