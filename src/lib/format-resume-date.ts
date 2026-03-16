const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format YYYY-MM or YYYY-MM-DD to "Sep 2025"
 */
export function formatResumeDate(monthYear: string | undefined | null): string {
  if (!monthYear || typeof monthYear !== "string") return "";
  const trimmed = monthYear.trim();
  if (!trimmed) return "";
  const parts = trimmed.split("-");
  const year = parts[0];
  const monthNum = parts[1] ? parseInt(parts[1], 10) : 1;
  if (!year || isNaN(monthNum) || monthNum < 1 || monthNum > 12) return trimmed;
  return `${MONTH_ABBR[monthNum - 1]} ${year}`;
}
