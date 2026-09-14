import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { isProfileComplete } from "@/lib/admin/profile-completion";

export type AnalyticsRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function rangeStart(range: AnalyticsRange): Date {
  return new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
}

interface DailyCount {
  day: string;
  count: number;
}

async function dailyCounts(
  // Note the mixed casing: "Resume" has no @@map in schema.prisma (table name
  // defaults to the model name verbatim), the others do have @@map to snake_case.
  table: "Resume" | "cover_letter" | "user_visit" | "agent_request_event",
  since: Date,
  // Excludes rows belonging to E2E test users (see isTestUser on User).
  excludeUserIds: string[],
  // UserVisit has no createdAt column — a visit is dated by when it started.
  dateColumn: "createdAt" | "startedAt" = "createdAt",
): Promise<DailyCount[]> {
  // table/dateColumn are restricted to the hardcoded literal unions above
  // (never derived from request input), so Prisma.raw() is safe here — the
  // only externally-influenced values (`since`, `excludeUserIds`) go through
  // normal $queryRaw parameter binding, not raw interpolation.
  const dateColumnIdent = Prisma.raw(`"${dateColumn}"`);
  const excludeClause =
    excludeUserIds.length > 0
      ? Prisma.sql`AND "userId" <> ALL(${excludeUserIds})`
      : Prisma.empty;
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>(
    Prisma.sql`SELECT date_trunc('day', ${dateColumnIdent}) AS day, COUNT(*) AS count
     FROM ${Prisma.raw(`"${table}"`)}
     WHERE ${dateColumnIdent} >= ${since}
     ${excludeClause}
     GROUP BY 1
     ORDER BY 1`,
  );
  const byDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));

  // Zero-fill every calendar day in range so TrendLineChart's index-based x-spacing
  // corresponds to evenly-spaced days — a plain GROUP BY silently drops zero-activity days.
  const result: DailyCount[] = [];
  const cursor = new Date(since);
  cursor.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ day: key, count: byDay.get(key) || 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export async function getAnalyticsSummary(range: AnalyticsRange) {
  const since = rangeStart(range);
  const onlineSince = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  // Test users (E2E suite, see isTestUser on User / src/lib/auth.ts) are
  // excluded from every metric below so they never skew real usage numbers.
  const testUsers = await prisma.user.findMany({
    where: { isTestUser: true },
    select: { id: true },
  });
  const testUserIds = testUsers.map((u) => u.id);
  // Safe for every model here except AiUsageEvent: their userId is always a
  // real string, so `notIn` (-> SQL `userId NOT IN (...)`) can't hit SQL's
  // NULL-comparison pitfall. AiUsageEvent.userId IS nullable (anonymous/
  // system-key calls) — `userId NOT IN (...)` evaluates to NULL, not TRUE,
  // for those rows, silently dropping them, so that one query below adds an
  // explicit `OR userId IS NULL` instead of reusing this filter.
  const notTestUser = { userId: { notIn: testUserIds } };

  const [
    totalUsers,
    profiles,
    totalResumes,
    resumesInRange,
    resumesBySource,
    resumeTrend,
    totalCoverLetters,
    coverLettersInRange,
    coverLettersBySource,
    coverLetterTrend,
    onlineNow,
    visitTrend,
    visitDurations,
    totalAgentTokens,
    activeAgentTokens,
    tokensUsedRecently,
    agentRequestTrend,
    agentTransportSplit,
    providerBreakdown,
  ] = await Promise.all([
    prisma.user.count({ where: { isTestUser: false } }),
    prisma.userProfile.findMany({
      where: notTestUser,
      select: { workExperience: true, education: true, skills: true },
    }),
    prisma.resume.count({ where: notTestUser }),
    prisma.resume.count({ where: { ...notTestUser, createdAt: { gte: since } } }),
    prisma.resume.groupBy({ by: ["source"], where: notTestUser, _count: { _all: true } }),
    dailyCounts("Resume", since, testUserIds),
    prisma.coverLetter.count({ where: notTestUser }),
    prisma.coverLetter.count({ where: { ...notTestUser, createdAt: { gte: since } } }),
    prisma.coverLetter.groupBy({ by: ["source"], where: notTestUser, _count: { _all: true } }),
    dailyCounts("cover_letter", since, testUserIds),
    prisma.userVisit.count({ where: { ...notTestUser, lastSeenAt: { gte: onlineSince } } }),
    dailyCounts("user_visit", since, testUserIds, "startedAt"),
    prisma.userVisit.findMany({
      where: { ...notTestUser, startedAt: { gte: since } },
      select: { startedAt: true, lastSeenAt: true },
    }),
    prisma.agentToken.count({ where: notTestUser }),
    prisma.agentToken.count({ where: { ...notTestUser, revokedAt: null } }),
    prisma.agentToken.count({
      where: { ...notTestUser, revokedAt: null, lastUsedAt: { gte: since } },
    }),
    dailyCounts("agent_request_event", since, testUserIds),
    prisma.agentRequestEvent.groupBy({
      by: ["transport"],
      where: { ...notTestUser, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.aiUsageEvent.groupBy({
      by: ["provider"],
      where: {
        createdAt: { gte: since },
        OR: [{ userId: null }, { userId: { notIn: testUserIds } }],
      },
      _count: { _all: true },
    }),
  ]);

  const profileCompletion = profiles.reduce(
    (acc, p) => {
      const c = isProfileComplete(p);
      if (c.hasWorkExperience) acc.hasWorkExperience++;
      if (c.hasEducation) acc.hasEducation++;
      if (c.hasSkills) acc.hasSkills++;
      return acc;
    },
    { hasWorkExperience: 0, hasEducation: 0, hasSkills: 0 },
  );

  const avgVisitDurationMs =
    visitDurations.length === 0
      ? 0
      : visitDurations.reduce(
          (sum, v) => sum + (v.lastSeenAt.getTime() - v.startedAt.getTime()),
          0,
        ) / visitDurations.length;

  return {
    range,
    profiles: {
      totalUsers,
      totalProfiles: profiles.length,
      ...profileCompletion,
    },
    resumes: {
      total: totalResumes,
      inRange: resumesInRange,
      bySource: resumesBySource.map((r) => ({ source: r.source, count: r._count._all })),
      trend: resumeTrend,
    },
    coverLetters: {
      total: totalCoverLetters,
      inRange: coverLettersInRange,
      bySource: coverLettersBySource.map((r) => ({ source: r.source, count: r._count._all })),
      trend: coverLetterTrend,
    },
    activity: {
      onlineNow,
      visitTrend,
      uniqueVisitDays: visitTrend.filter((d) => d.count > 0).length,
      avgVisitDurationMs,
    },
    agentTokens: {
      total: totalAgentTokens,
      active: activeAgentTokens,
      usedInRange: tokensUsedRecently,
      requestTrend: agentRequestTrend,
      transportSplit: agentTransportSplit.map((t) => ({
        transport: t.transport,
        count: t._count._all,
      })),
    },
    providers: providerBreakdown.map((p) => ({ provider: p.provider, count: p._count._all })),
  };
}
