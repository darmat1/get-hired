interface BreakdownBarChartProps {
  title: string;
  data: { label: string; count: number }[];
  color?: string;
}

// Default color: the project's own terracotta-600 (src/app/globals.scss),
// validated colorblind-safe / contrast-safe against both surfaces via the
// dataviz skill's palette validator — not the generic placeholder hex.
export function BreakdownBarChart({ title, data, color = "#A34F22" }: BreakdownBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="mb-3 text-sm font-medium text-warm-700 dark:text-warm-300">{title}</div>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-warm-400">No data in range</div>
      ) : (
        <div className="space-y-2" role="list" aria-label={title}>
          {data.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2"
              role="listitem"
              aria-label={`${d.label}: ${d.count}`}
            >
              <div className="w-24 shrink-0 truncate text-xs text-warm-500 dark:text-warm-400">
                {d.label}
              </div>
              <div className="h-4 flex-1 overflow-hidden rounded bg-warm-100 dark:bg-warm-800">
                <div
                  className="h-full rounded-r"
                  style={{ width: `${(d.count / max) * 100}%`, backgroundColor: color }}
                />
              </div>
              <div className="w-8 shrink-0 text-right text-xs text-warm-500 dark:text-warm-400">
                {d.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
