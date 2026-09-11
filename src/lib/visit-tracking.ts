export const VISIT_GAP_MS = 5 * 60 * 1000;

export function shouldContinueVisit(lastSeenAt: Date, now: Date): boolean {
  return now.getTime() - lastSeenAt.getTime() < VISIT_GAP_MS;
}
