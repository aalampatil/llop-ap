import { Activity, AlertTriangle, Loader2, Search, ShieldCheck, Users, Vote, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiError, useApiClient } from "../lib/api";
import { formatDate } from "../lib/poll-utils";
import type { AdminOverview } from "../types/poll";

function AdminMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="db-metric">
      <div className="db-metric-label">
        {icon}
        {label}
      </div>
      <div className="db-metric-value">{value}</div>
    </div>
  );
}

export function AdminPage() {
  const api = useApiClient();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingPollId, setClosingPollId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadOverview() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<AdminOverview>("/api/admin/overview");
      setOverview(data);
    } catch (err) {
      setError(getApiError(err, "Could not load admin panel"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, [api]);

  const filteredPolls = useMemo(() => {
    if (!overview) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return overview.polls.filter((poll) => {
      const matchesStatus = statusFilter === "all" || poll.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        poll.title.toLowerCase().includes(normalizedQuery) ||
        poll.slug.toLowerCase().includes(normalizedQuery) ||
        poll.category.toLowerCase().includes(normalizedQuery) ||
        poll.owner?.email.toLowerCase().includes(normalizedQuery) ||
        poll.owner?.name.toLowerCase().includes(normalizedQuery) ||
        poll.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [overview, query, statusFilter]);

  const closePoll = async (pollId: string) => {
    setClosingPollId(pollId);
    setError("");
    try {
      await api.post(`/api/admin/polls/${pollId}/close`);
      await loadOverview();
    } catch (err) {
      setError(getApiError(err, "Could not close poll"));
    } finally {
      setClosingPollId("");
    }
  };

  if (loading && !overview) {
    return (
      <main className="db-root">
        <div className="db-layout db-center">
          <Loader2 size={32} className="db-spinner" />
        </div>
      </main>
    );
  }

  if (!overview) {
    return (
      <main className="db-root">
        <div className="db-layout" style={{ paddingTop: "3rem" }}>
          <div className="db-error">{error || "Admin panel unavailable"}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="db-root">
      <div className="db-layout">
        <div className="db-page-head">
          <div>
            <div className="db-badge">
              <span className="db-badge-dot" />
              Admin · Platform control
            </div>
            <h1 className="db-title">Admin panel</h1>
            <p className="db-desc">Review users, monitor polls, and close problematic active polls.</p>
          </div>
          <button className="db-btn db-btn-secondary" disabled={loading} onClick={loadOverview} type="button">
            {loading ? <Loader2 size={14} className="db-spinner" /> : <Activity size={14} />}
            Refresh
          </button>
        </div>

        {error ? (
          <div className="db-error mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4" />
            {error}
          </div>
        ) : null}

        <div className="db-metrics">
          <AdminMetric icon={<Users size={12} />} label="Users" value={overview.stats.totalUsers.toString()} />
          <AdminMetric icon={<Vote size={12} />} label="Polls" value={overview.stats.totalPolls.toString()} />
          <AdminMetric icon={<Activity size={12} />} label="Active" value={overview.stats.activePolls.toString()} />
          <AdminMetric icon={<ShieldCheck size={12} />} label="Responses" value={overview.stats.totalResponses.toString()} />
        </div>

        <section className="neo-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black">Poll moderation</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {filteredPolls.length} of {overview.polls.length} polls shown
              </p>
            </div>
            <div className="grid w-full gap-3 md:w-auto md:grid-cols-[280px_180px]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="neo-input pl-10"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search polls or owners"
                  type="search"
                  value={query}
                />
              </label>
              <select
                className="neo-input"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="expired">Expired</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredPolls.map((poll) => (
              <article className="border border-border bg-background p-4" key={poll.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{poll.title}</h3>
                      <span className="premium-badge">{poll.status}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      {poll.owner?.name ?? "Unknown owner"} · {poll.owner?.email ?? "No email"}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                      {poll.responseCount} responses · {poll.category} · updated {formatDate(poll.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="db-btn db-btn-secondary" to={`/dashboard/${poll.id}`}>
                      View
                    </Link>
                    <button
                      className="db-btn db-btn-secondary"
                      disabled={closingPollId === poll.id || poll.status !== "active"}
                      onClick={() => closePoll(poll.id)}
                      type="button"
                    >
                      {closingPollId === poll.id ? (
                        <Loader2 size={14} className="db-spinner" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Close
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="neo-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-black">Users</h2>
            <span className="premium-badge">{overview.users.length} accounts</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {overview.users.map((user) => (
              <article className="border border-border bg-background p-4" key={user.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{user.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="premium-badge">{user.role}</span>
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                  {user.pollCount} polls · {user.responseCount} signed-in responses · joined {formatDate(user.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
