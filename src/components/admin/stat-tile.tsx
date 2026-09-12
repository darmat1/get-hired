interface StatTileProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white p-4 dark:border-warm-800 dark:bg-warm-900">
      <div className="text-xs font-medium uppercase tracking-wide text-warm-500 dark:text-warm-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-warm-900 dark:text-warm-50">
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs text-warm-500 dark:text-warm-400">{sublabel}</div>
      )}
    </div>
  );
}
