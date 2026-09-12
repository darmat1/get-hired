import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAnalyticsSummary } from "@/lib/admin/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userRole = (session?.user as any)?.role?.toLowerCase();
  if (!session || !["superadmin", "admin"].includes(userRole)) {
    redirect("/");
  }

  const summary = await getAnalyticsSummary("30d");

  return (
    <div className="w-full py-2 sm:py-4">
      <h1 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        Analytics Dashboard
      </h1>
      <AnalyticsDashboard initialSummary={summary} initialRange="30d" />
    </div>
  );
}
