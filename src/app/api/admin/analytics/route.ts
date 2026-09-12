import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, type AnalyticsRange } from "@/lib/admin/analytics";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(role || "")) {
    return null;
  }
  return { session, role: role! };
}

function parseRange(value: string | null): AnalyticsRange {
  return value === "7d" || value === "90d" ? value : "30d";
}

export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(request.nextUrl.searchParams.get("range"));

  try {
    const summary = await getAnalyticsSummary(range);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("ADMIN ANALYTICS GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
