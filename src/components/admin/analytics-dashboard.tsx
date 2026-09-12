"use client";

import { useRef, useState } from "react";
// Type-only import — erased at compile time, so this client component never
// bundles `@/lib/admin/analytics` (which imports the server-only Prisma
// client) into browser JS. Keep this a `import type`, never a value import.
import type { AnalyticsRange, getAnalyticsSummary } from "@/lib/admin/analytics";
import { StatTile } from "@/components/admin/stat-tile";
import { TrendLineChart } from "@/components/admin/trend-line-chart";
import { BreakdownBarChart } from "@/components/admin/breakdown-bar-chart";

type AnalyticsSummary = Awaited<ReturnType<typeof getAnalyticsSummary>>;

interface AnalyticsDashboardProps {
  initialSummary: AnalyticsSummary;
  initialRange: AnalyticsRange;
}

const RANGES: AnalyticsRange[] = ["7d", "30d", "90d"];

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function AnalyticsDashboard({ initialSummary, initialRange }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsRange>(initialRange);
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestIdRef = useRef(0);

  const handleRangeChange = async (next: AnalyticsRange) => {
    const requestId = ++requestIdRef.current;
    setRange(next);
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/analytics?range=${next}`);
      if (requestId !== requestIdRef.current) return; // a newer request has since started; discard this stale response
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setSummary(await res.json());
    } catch {
      if (requestId === requestIdRef.current) setError(true);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const profilePct = (n: number) =>
    summary.profiles.totalProfiles === 0
      ? "0%"
      : `${Math.round((n / summary.profiles.totalProfiles) * 100)}%`;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => handleRangeChange(r)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              range === r
                ? "bg-terracotta-600 text-white"
                : "bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-400"
            }`}
          >
            {r}
          </button>
        ))}
        {loading && <span className="self-center text-xs text-warm-400">Loading…</span>}
        {error && (
          <span className="self-center text-xs text-red-600 dark:text-red-400">
            Failed to load — showing previous data
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Users" value={summary.profiles.totalUsers} />
        <StatTile
          label="Profiles filled"
          value={profilePct(summary.profiles.hasWorkExperience)}
          sublabel="have work experience"
        />
        <StatTile label="Resumes" value={summary.resumes.total} />
        <StatTile label="Cover letters" value={summary.coverLetters.total} />
        <StatTile label="Active agent tokens" value={summary.agentTokens.active} />
        <StatTile label="Online now" value={summary.activity.onlineNow} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendLineChart title="Resumes created" data={summary.resumes.trend} />
        <TrendLineChart title="Cover letters created" data={summary.coverLetters.trend} />
        <TrendLineChart title="Site visits" data={summary.activity.visitTrend} />
        <TrendLineChart title="Agent requests" data={summary.agentTokens.requestTrend} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBarChart
          title="Resumes by source"
          data={summary.resumes.bySource.map((s) => ({ label: s.source, count: s.count }))}
        />
        <BreakdownBarChart
          title="Cover letters by source"
          data={summary.coverLetters.bySource.map((s) => ({ label: s.source, count: s.count }))}
        />
        <BreakdownBarChart
          title="AI providers used"
          data={summary.providers.map((p) => ({ label: p.provider, count: p.count }))}
        />
        <BreakdownBarChart
          title="Agent connections by transport"
          data={summary.agentTokens.transportSplit.map((t) => ({
            label: t.transport,
            count: t.count,
          }))}
        />
      </div>

      <div className="text-xs text-warm-500 dark:text-warm-400">
        Avg visit duration: {formatDuration(summary.activity.avgVisitDurationMs)} · Agent tokens
        used in range: {summary.agentTokens.usedInRange}
      </div>
    </div>
  );
}
