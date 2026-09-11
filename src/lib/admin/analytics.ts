import { prisma } from "@/lib/prisma";
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
  // UserVisit has no createdAt column — a visit is dated by when it started.
  dateColumn: "createdAt" | "startedAt" = "createdAt",
): Promise<DailyCount[]> {
  const rows = await prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
    `SELECT date_trunc('day', "${dateColumn}") AS day, COUNT(*) AS count
     FROM "${table}"
     WHERE "${dateColumn}" >= $1
     GROUP BY 1
     ORDER BY 1`,
    since,
  );
  return rows.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) }));
}

export async function getAnalyticsSummary(range: AnalyticsRange) {
  const since = rangeStart(range);
  const onlineSince = new Date(Date.now() - ONLINE_THRESHOLD_MS);

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
    prisma.user.count(),
    prisma.userProfile.findMany({
      select: { workExperience: true, education: true, skills: true },
    }),
    prisma.resume.count(),
    prisma.resume.count({ where: { createdAt: { gte: since } } }),
    prisma.resume.groupBy({ by: ["source"], _count: { _all: true } }),
    dailyCounts("Resume", since),
    prisma.coverLetter.count(),
    prisma.coverLetter.count({ where: { createdAt: { gte: since } } }),
    prisma.coverLetter.groupBy({ by: ["source"], _count: { _all: true } }),
    dailyCounts("cover_letter", since),
    prisma.userVisit.count({ where: { lastSeenAt: { gte: onlineSince } } }),
    dailyCounts("user_visit", since, "startedAt"),
    prisma.userVisit.findMany({
      where: { startedAt: { gte: since } },
      select: { startedAt: true, lastSeenAt: true },
    }),
    prisma.agentToken.count(),
    prisma.agentToken.count({ where: { revokedAt: null } }),
    prisma.agentToken.count({
      where: { revokedAt: null, lastUsedAt: { gte: since } },
    }),
    dailyCounts("agent_request_event", since),
    prisma.agentRequestEvent.groupBy({
      by: ["transport"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.aiUsageEvent.groupBy({
      by: ["provider"],
      where: { createdAt: { gte: since } },
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
      uniqueVisitDays: visitTrend.length,
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
