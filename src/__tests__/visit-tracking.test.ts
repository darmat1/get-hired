import { describe, it, expect } from "vitest";
import { shouldContinueVisit, VISIT_GAP_MS } from "@/lib/visit-tracking";

describe("shouldContinueVisit", () => {
  it("continues the visit when the gap is under the threshold", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date(lastSeenAt.getTime() + VISIT_GAP_MS - 1000);
    expect(shouldContinueVisit(lastSeenAt, now)).toBe(true);
  });

  it("starts a new visit when the gap is at or over the threshold", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date(lastSeenAt.getTime() + VISIT_GAP_MS);
    expect(shouldContinueVisit(lastSeenAt, now)).toBe(false);
  });

  it("continues a visit at zero gap", () => {
    const lastSeenAt = new Date("2026-01-01T00:00:00Z");
    expect(shouldContinueVisit(lastSeenAt, lastSeenAt)).toBe(true);
  });
});
