import { Check, Clock, Eye, Link2, Loader2, Lock, Send, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QuestionAnalytics } from "../components/polls/question-analytics";
import { CopyPublicLinkButton } from "../components/ui/copy-public-link-button";
import { Metric } from "../components/ui/metric";
import { PreviewRow } from "../components/ui/preview-row";
import { usePollSocket } from "../hooks/use-poll-socket";
import { getApiError, useApiClient } from "../lib/api";
import { formatDate, publicPollUrl } from "../lib/poll-utils";
import { usePollStore } from "../store/poll-store";
import type { Analytics, Poll } from "../types/poll";

/* ─────────────────────────────────────────────
   Inject global styles (idempotent)
───────────────────────────────────────────── */
const STYLE_ID = "m-dashboard-theme";
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
    }

    .db-root {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Mono', monospace;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    .db-root::before {
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

    .db-layout {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* ── loading / error states ── */
    .db-center {
      display: grid;
      place-items: center;
      min-height: 60vh;
    }
    .db-spinner {
      color: var(--accent);
      animation: db-spin 1s linear infinite;
    }
    @keyframes db-spin { to { transform: rotate(360deg); } }

    .db-error {
      border: 1px solid var(--error-border);
      background: var(--error-bg);
      padding: 1.25rem 1.5rem;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--error-text);
    }

    /* ── page header ── */
    .db-page-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      animation: db-fadeUp .5s ease both;
    }

    .db-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.6rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }
    .db-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: db-pulse 2s ease infinite;
    }

    .db-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-bottom: 0.75rem;
      transition: color 0.15s;
    }
    .db-back:hover { color: var(--accent); }
    .db-back::before { content: '←'; margin-right: 4px; }

    .db-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      line-height: 0.95;
      letter-spacing: 0.02em;
      color: var(--text);
      margin-bottom: 0.6rem;
    }

    .db-desc {
      font-size: 0.68rem;
      color: var(--muted);
      letter-spacing: 0.04em;
      line-height: 1.8;
      max-width: 600px;
    }

    .db-head-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: flex-start;
    }

    /* ── buttons ── */
    .db-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.65rem 1.25rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
    }
    .db-btn:active { transform: scale(0.97); }
    .db-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .db-btn-primary {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }
    .db-btn-primary:hover:not(:disabled) { background: var(--accent-dim); border-color: var(--accent-dim); }
    .db-btn-secondary {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }
    .db-btn-secondary:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

    /* ── metrics row ── */
    .db-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 1.5rem;
      animation: db-fadeUp .5s ease both .1s;
    }
    @media (min-width: 640px) { .db-metrics { grid-template-columns: repeat(4, 1fr); } }

    .db-metric {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1rem 1.25rem;
    }
    .db-metric::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 24px; height: 3px;
      background: var(--accent);
    }
    .db-metric-label {
      font-size: 0.55rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 0.5rem;
    }
    .db-metric-label svg { width: 12px; height: 12px; color: var(--accent); }
    .db-metric-value {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      letter-spacing: 0.04em;
      color: var(--text);
    }

    /* ── main grid ── */
    .db-grid {
      display: grid;
      gap: 1.25rem;
      animation: db-fadeUp .5s ease both .2s;
    }
    @media (min-width: 1024px) {
      .db-grid { grid-template-columns: 1fr 0.38fr; align-items: start; }
    }

    /* ── question section ── */
    .db-questions { display: flex; flex-direction: column; gap: 1rem; }

    /* ── sidebar ── */
    .db-sidebar {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1.5rem;
    }
    .db-sidebar::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 40px; height: 4px;
      background: var(--accent);
    }
    .db-sidebar::after {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 4px; height: 40px;
      background: var(--accent);
    }

    .db-sidebar-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: var(--text);
      margin-bottom: 1.25rem;
    }

    .db-url-box {
      background: var(--bg);
      border: 1px solid var(--accent);
      padding: 0.9rem 1rem;
      font-size: 0.62rem;
      letter-spacing: 0.04em;
      word-break: break-all;
      color: var(--accent);
      margin-bottom: 0.75rem;
      line-height: 1.7;
    }

    .db-divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 1.25rem 0;
    }

    /* ── preview rows ── */
    .db-preview-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
      gap: 1rem;
    }
    .db-preview-row:last-child { border-bottom: none; }
    .db-preview-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.58rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      flex-shrink: 0;
    }
    .db-preview-label svg { width: 12px; height: 12px; }
    .db-preview-value {
      font-size: 0.6rem;
      letter-spacing: 0.06em;
      color: var(--text);
      text-align: right;
      word-break: break-all;
    }

    @keyframes db-fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes db-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   Themed sub-components
───────────────────────────────────────────── */
function DbMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="db-metric">
      <div className="db-metric-label">{icon}{label}</div>
      <div className="db-metric-value">{value}</div>
    </div>
  );
}

function DbPreviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="db-preview-row">
      <span className="db-preview-label">{icon}{label}</span>
      <span className="db-preview-value">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DashboardPage
───────────────────────────────────────────── */
export function DashboardPage() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const api = useApiClient();
  const { activePoll, analytics, setActive, setLoading, loading } = usePollStore();
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  usePollSocket(activePoll?.id);

  useEffect(() => {
    if (!pollId) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get<{ poll: Poll; analytics: Analytics }>(`/api/poll/${pollId}/analytics`);
        if (mounted) setActive(data.poll, data.analytics);
      } catch (err) {
        if (mounted) setError(getApiError(err, "Could not load dashboard"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [api, pollId, setActive, setLoading]);

  const publish = async () => {
    if (!activePoll) return;
    setPublishing(true);
    setError("");
    try {
      const data = await api.post<{ poll: Poll; analytics: Analytics }>(`/api/poll/${activePoll.id}/publish`);
      setActive({ ...activePoll, ...data.poll }, data.analytics);
    } catch (err) {
      setError(getApiError(err, "Could not publish results"));
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <main className="db-root">
        <div className="db-layout db-center">
          <Loader2 size={32} className="db-spinner" />
        </div>
      </main>
    );
  }

  if (error || !activePoll || !analytics) {
    return (
      <main className="db-root">
        <div className="db-layout" style={{ paddingTop: "3rem" }}>
          <div className="db-error">⚠ {error || "Dashboard unavailable"}</div>
        </div>
      </main>
    );
  }

  const shareUrl = publicPollUrl(activePoll.slug);

  return (
    <main className="db-root">
      <div className="db-layout">

        {/* ── Page header ── */}
        <div className="db-page-head">
          <div>
            <div className="db-badge">
              <span className="db-badge-dot" />
              Analytics · Live creator workspace
            </div>
            <button className="db-back" onClick={() => navigate("/")} type="button">
              Back to workspace
            </button>
            <h1 className="db-title">{activePoll.title}</h1>
            <p className="db-desc">{activePoll.description}</p>
          </div>
          <div className="db-head-actions">
            <CopyPublicLinkButton url={shareUrl} className="db-btn db-btn-secondary" />
            <button
              className="db-btn db-btn-primary"
              disabled={publishing || activePoll.status === "published"}
              onClick={publish}
              type="button"
            >
              {publishing
                ? <Loader2 size={14} className="db-spinner" />
                : <Eye size={14} />}
              Publish results
            </button>
          </div>
        </div>

        {/* ── Metrics ── */}
        <div className="db-metrics">
          <DbMetric icon={<Send size={12} />} label="Responses" value={analytics.totalResponses.toString()} />
          <DbMetric icon={<Check size={12} />} label="Completion" value={`${analytics.completionRate}%`} />
          <DbMetric icon={<ShieldCheck size={12} />} label="Anonymous" value={analytics.anonymousResponses.toString()} />
          <DbMetric icon={<UserCheck size={12} />} label="Signed in" value={analytics.authenticatedResponses.toString()} />
        </div>

        {/* ── Main grid ── */}
        <div className="db-grid">

          {/* Questions */}
          <section className="db-questions">
            {analytics.questions.map((question) => (
              <QuestionAnalytics key={question.id} question={question} />
            ))}
          </section>

          {/* Sidebar */}
          <aside className="db-sidebar">
            <h2 className="db-sidebar-title">Share room</h2>
            <div className="db-url-box">{shareUrl}</div>
            <CopyPublicLinkButton url={shareUrl} className="db-btn db-btn-secondary" style={{ width: "100%", justifyContent: "center" }} />
            <hr className="db-divider" />
            <DbPreviewRow icon={<Clock size={12} />} label="Expires" value={formatDate(activePoll.expiresAt)} />
            <DbPreviewRow icon={<Lock size={12} />} label="Mode" value={activePoll.isAnonymous ? "Anonymous" : "Authenticated"} />
            <DbPreviewRow icon={<Eye size={12} />} label="Public results" value={activePoll.status === "published" ? "Published" : "Hidden"} />
            <DbPreviewRow icon={<Link2 size={12} />} label="Slug" value={activePoll.slug} />
          </aside>
        </div>

      </div>
    </main>
  );
}