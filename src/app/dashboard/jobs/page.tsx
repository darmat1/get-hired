import { prisma } from '@/lib/prisma';
import { Button, buttonVariants } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Pagination } from "@/components/ui/pagination";
import { Briefcase, MapPin, RefreshCw, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Job Board - Start Applying',
};

export default async function JobsPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user as any)?.role?.toLowerCase();
  const isAdmin = ["superadmin", "admin"].includes(role || "");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const pageSize = 12;
  const page = Number((await searchParams).page) || 1;

  const totalCount = await prisma.greenhouseJob.count({
    where: { active: true },
  });

  const jobs = await prisma.greenhouseJob.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Jobs">
      <div className="space-y-6 text-foreground">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Available Positions
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Discover and apply to roles directly from our platform.
            </p>
          </div>
          <Button variant="outline" className="self-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh List
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.length === 0 ? (
            <div className="col-span-full border border-dashed border-border rounded-xl p-12 text-center bg-card shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">No jobs available</h3>
              <p className="text-muted-foreground text-sm">
                We couldn't find any jobs right now. Try triggering a sync from the API.
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-all p-5 sm:p-6 group flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded-full">
                      {job.boardToken}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                </div>
                
                <div className="text-sm text-muted-foreground mb-6 flex flex-col gap-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{job.location || 'Remote / Unspecified'}</span>
                  </div>
                  {job.departments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground/70" />
                      <span className="truncate">{job.departments.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/dashboard/jobs/${job.id}`}
                  className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            className="mt-8 mb-12"
          />
        )}
      </div>
    </AppShell>
  );
}
