import { SignUpButton } from "@clerk/react";
import { Activity, Eye, Loader2, Plus, Rocket, Send, ShieldCheck, Sparkles, Vote, Zap } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignedInView, SignedOutView } from "../components/auth/auth-views";
import { AuthWall } from "../components/home/auth-wall";
import { EmptyState } from "../components/home/empty-state";
import { PollCard } from "../components/polls/poll-card";
import { Metric } from "../components/ui/metric";
import { getApiError, useApiClient } from "../lib/api";
import { usePollStore } from "../store/poll-store";
import type { PollSummary } from "../types/poll";

/* ─────────────────────────────────────────────
   Inject global styles once (idempotent)
───────────────────────────────────────────── */
const STYLE_ID = "m-checkboxes-theme";
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
      --error:         #ff4444;
    }

    /* ── grid background ── */
    .hp-root {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Mono', monospace;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    .hp-root::before {
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

    /* ── layout ── */
    .hp-layout {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* ── badge ── */
    .hp-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 1rem;
      animation: hp-fadeUp 0.5s ease both 0.05s;
    }
    .hp-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: hp-pulse 2s ease infinite;
    }

    /* ── hero ── */
    .hp-hero {
      display: grid;
      gap: 3rem;
      padding: 3rem 0 4rem;
      animation: hp-fadeUp 0.5s ease both 0.1s;
    }
    @media (min-width: 900px) {
      .hp-hero { grid-template-columns: 1.1fr 0.9fr; align-items: center; }
    }

    .hp-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(3.5rem, 9vw, 6.5rem);
      line-height: 0.95;
      letter-spacing: 0.02em;
      color: var(--text);
      margin: 0 0 1.25rem;
    }
    .hp-title-accent { color: var(--accent); }

    .hp-subtitle {
      font-size: 0.78rem;
      color: var(--muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.8;
      margin-bottom: 2rem;
    }

    /* ── buttons ── */
    .hp-btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .hp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.75rem 1.5rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, transform 0.1s;
      text-decoration: none;
    }
    .hp-btn:active { transform: scale(0.97); }
    .hp-btn-primary {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }
    .hp-btn-primary:hover { background: var(--accent-dim); border-color: var(--accent-dim); }
    .hp-btn-secondary {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }
    .hp-btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

    /* ── strip ── */
    .hp-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
      border: 1px solid var(--border);
    }
    .hp-strip span {
      font-size: 0.6rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      padding: 0.5rem 1rem;
      border-right: 1px solid var(--border);
    }
    .hp-strip span:last-child { border-right: none; }

    /* ── hero card ── */
    .hp-card {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1.75rem;
    }
    .hp-card::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 48px; height: 4px;
      background: var(--accent);
    }
    .hp-card::after {
      content: '';
      position: absolute;
      top: -1px; left: -1px;
      width: 4px; height: 48px;
      background: var(--accent);
    }

    .hp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .hp-card-label {
      font-size: 0.6rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.35rem;
    }
    .hp-card-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.6rem;
      letter-spacing: 0.04em;
      color: var(--text);
    }
    .hp-card-icon {
      width: 40px;
      height: 40px;
      background: var(--accent);
      color: var(--bg);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    /* ── metric grid ── */
    .hp-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 1.25rem;
    }
    .hp-metric {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 0.75rem;
    }
    .hp-metric-label {
      font-size: 0.55rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .hp-metric-label svg { width: 12px; height: 12px; color: var(--accent); }
    .hp-metric-value {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.4rem;
      color: var(--text);
      letter-spacing: 0.04em;
    }

    /* ── analytics panel ── */
    .hp-analytics {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 1.25rem;
    }
    .hp-analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .hp-analytics-title {
      font-size: 0.6rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 500;
    }
    .hp-pill {
      font-size: 0.55rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 3px 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .hp-pill svg { width: 10px; height: 10px; color: var(--accent); }

    .hp-bar-row { margin-bottom: 1rem; }
    .hp-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.65rem;
      color: var(--text);
      margin-bottom: 6px;
      letter-spacing: 0.04em;
    }
    .hp-bar-track {
      height: 6px;
      background: var(--border);
      position: relative;
    }
    .hp-bar-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.6s ease;
    }

    /* ── workspace section ── */
    .hp-section {
      padding: 3rem 0;
      animation: hp-fadeUp 0.5s ease both 0.2s;
    }
    .hp-section-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .hp-section-kicker {
      font-size: 0.6rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.4rem;
    }
    .hp-section-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2rem, 5vw, 3rem);
      letter-spacing: 0.02em;
      color: var(--text);
    }
    .hp-section-sub {
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      color: var(--muted);
      text-transform: uppercase;
      margin-top: 0.3rem;
    }

    /* ── poll grid wrapper ── */
    .hp-poll-grid {
      display: grid;
      gap: 1rem;
    }
    @media (min-width: 900px) {
      .hp-poll-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── loading / empty panel ── */
    .hp-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      min-height: 16rem;
      display: grid;
      place-items: center;
    }
    .hp-spinner {
      color: var(--accent);
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── footer ── */
    .hp-footer {
      font-size: 0.6rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid var(--border);
    }

    @keyframes hp-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes hp-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   Sub-components (inline, theme-matched)
───────────────────────────────────────────── */
function ThemeMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="hp-metric">
      <div className="hp-metric-label">
        {icon}
        {label}
      </div>
      <div className="hp-metric-value">{value}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HomePage
───────────────────────────────────────────── */
export function HomePage() {
  const api = useApiClient();
  const navigate = useNavigate();
  const { polls, setPolls, loading, setLoading } = usePollStore();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const data = await api.get<{ polls: PollSummary[] }>("/api/poll");
        if (active) setPolls(data.polls);
      } catch (error) {
        console.warn(getApiError(error, "Could not load polls"));
        if (active) setPolls([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [api, setLoading, setPolls]);

  useEffect(() => {
    if (window.location.hash === "#workspace") {
      document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const totalResponses = polls.reduce((sum, poll) => sum + poll.analytics.totalResponses, 0);

  const scrollToWorkspace = () =>
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="hp-root">
      <div className="hp-layout">

        {/* ── Hero ── */}
        <section className="hp-hero">

          {/* Left column */}
          <div>
            <div className="hp-badge">
              <span className="hp-badge-dot" />
              Decision intelligence · Live workspace
            </div>

            <h1 className="hp-title">
              Launch polls like a{" "}
              <span className="hp-title-accent">command center.</span>
            </h1>

            <p className="hp-subtitle">
              Create high-signal polls, enforce clean participation,<br />
              and publish boardroom-ready outcomes — all in one place.
            </p>

            <div className="hp-btn-row">
              <SignedInView>
                <button
                  className="hp-btn hp-btn-primary"
                  onClick={() => navigate("/builder")}
                  type="button"
                >
                  <Rocket size={15} /> Create poll
                </button>
              </SignedInView>
              <SignedOutView>
                <SignUpButton mode="modal">
                  <button className="hp-btn hp-btn-primary" type="button">
                    <Rocket size={15} /> Create poll
                  </button>
                </SignUpButton>
              </SignedOutView>
              <button
                className="hp-btn hp-btn-secondary"
                onClick={scrollToWorkspace}
                type="button"
              >
                <Eye size={15} /> View workspace
              </button>
            </div>

            <div className="hp-strip">
              <span>
                <ShieldCheck size={10} style={{ display: "inline", marginRight: 4 }} />
                Clerk secured
              </span>
              <span>Realtime analytics</span>
              <span>One response per user</span>
            </div>
          </div>

          {/* Right column — live card */}
          <div className="hp-card">
            <div className="hp-card-header">
              <div>
                <p className="hp-card-label">Live operations</p>
                <p className="hp-card-title">Poll Intelligence</p>
              </div>
              <div className="hp-card-icon">
                <Activity size={18} />
              </div>
            </div>

            <div className="hp-metrics">
              <ThemeMetric icon={<Vote size={12} />} label="Polls" value={polls.length.toString()} />
              <ThemeMetric icon={<Send size={12} />} label="Responses" value={totalResponses.toString()} />
              <ThemeMetric icon={<Sparkles size={12} />} label="Mode" value="Live" />
            </div>

            <div className="hp-analytics">
              <div className="hp-analytics-header">
                <span className="hp-analytics-title">Live analytics</span>
                <span className="hp-pill">
                  <Zap size={10} /> real time
                </span>
              </div>
              {["Product direction", "Launch name", "Pricing signal"].map((item, i) => (
                <div className="hp-bar-row" key={item}>
                  <div className="hp-bar-label">
                    <span>{item}</span>
                    <span>{82 - i * 17}%</span>
                  </div>
                  <div className="hp-bar-track">
                    <div className="hp-bar-fill" style={{ width: `${82 - i * 17}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workspace section ── */}
        <section id="workspace" className="hp-section">
          <div className="hp-section-header">
            <div>
              <p className="hp-section-kicker">
                <span className="hp-badge-dot" style={{ display: "inline-block", marginRight: 6 }} />
                Active workspace
              </p>
              <h2 className="hp-section-title">Creator workspace</h2>
              <p className="hp-section-sub">
                Ship · Share · Monitor · Publish — without leaving this screen.
              </p>
            </div>
            <SignedInView>
              <button
                className="hp-btn hp-btn-primary"
                onClick={() => navigate("/builder")}
                type="button"
              >
                <Plus size={14} /> New poll
              </button>
            </SignedInView>
          </div>

          <SignedOutView>
            <AuthWall />
          </SignedOutView>

          <SignedInView>
            {loading ? (
              <div className="hp-panel">
                <Loader2 size={28} className="hp-spinner" />
              </div>
            ) : polls.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="hp-poll-grid">
                {polls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </SignedInView>
        </section>

        {/* ── Footer ── */}
        <footer className="hp-footer">
          Updates broadcast via Socket.io &nbsp;·&nbsp; Realtime analytics &nbsp;·&nbsp; Clerk auth
        </footer>

      </div>
    </main>
  );
}