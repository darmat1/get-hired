interface TrendLineChartProps {
  title: string;
  data: { day: string; count: number }[];
  color?: string;
}

// Default color: the project's own terracotta-600 (src/app/globals.scss),
// validated colorblind-safe / contrast-safe against both surfaces via the
// dataviz skill's palette validator — not the generic placeholder hex.
export function TrendLineChart({ title, data, color = "#A34F22" }: TrendLineChartProps) {
  const width = 600;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.count));

  const coords = data.map((d, i) => {
    const x =
      data.length <= 1
        ? padding
        : padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return { x, y };
  });
  const points = coords.map((p) => `${p.x},${p.y}`);
  const last = coords[coords.length - 1];

  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="mb-2 text-sm font-medium text-warm-700 dark:text-warm-300">{title}</div>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-warm-400">No data in range</div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`${title}: line chart, ${data.length} day${data.length === 1 ? "" : "s"}, latest value ${data[data.length - 1].count}`}
        >
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* end marker: >=8px diameter, 2px surface-color ring so it stays legible over the line */}
          {last && (
            <circle
              cx={last.x}
              cy={last.y}
              r={4}
              fill={color}
              strokeWidth={2}
              className="stroke-white dark:stroke-warm-900"
            />
          )}
        </svg>
      )}
      {/* text alternative for the plotted series, since the SVG polyline carries no accessible values */}
      {data.length > 0 && (
        <ul className="sr-only">
          {data.map((d) => (
            <li key={d.day}>
              {d.day}: {d.count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
