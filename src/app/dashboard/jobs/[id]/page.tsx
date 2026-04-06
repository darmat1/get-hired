import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getJobDetails } from '@/lib/greenhouse';
import Link from 'next/link';
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { decodeHtmlEntities } from "@/lib/utils/html";
import { Briefcase, MapPin, ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default async function JobDetailPage({ params }: PageProps) {
  // await params
  const { id } = await params;
  
  let job = await prisma.greenhouseJob.findUnique({
    where: { id }
  });

  if (!job) {
    notFound();
  }

  // If we haven't fetched questions yet, fetch them from Greenhouse API and save
  if (!job.questions) {
    try {
      const details = await getJobDetails(job.boardToken, job.externalId);
      if (details.questions) {
        job = await prisma.greenhouseJob.update({
          where: { id },
          data: { questions: details.questions as any }
        });
      }
    } catch (err) {
      console.error('Error fetching job details for questions:', err);
    }
  }

  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Job Details">
      <div className="space-y-6 text-foreground">
        <Link 
          href="/dashboard/jobs" 
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 h-8 text-muted-foreground hover:text-foreground no-underline hover:no-underline"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </Link>
        
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 transition-colors">
          <div className="mb-8 border-b border-border pb-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded-full">
                {job.boardToken}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {job.location || 'Remote / Defaults'}
              </div>
              {job.departments.length > 0 && (
                <div className="flex items-center gap-1.5 border-l border-border pl-4">
                  <Briefcase className="w-4 h-4 text-muted-foreground/70" />
                  {job.departments.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div 
            className="prose dark:prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(job.content || 'No description provided.') }}
          />
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 transition-colors mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Apply for this opening</h2>
          {job.questions ? (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Ready to apply?</h3>
              <p className="text-muted-foreground text-sm mb-4">We found the application requirements. In the next step, we'll map your profile to these questions.</p>
              {/* <ApplyForm job={job} /> */}
              <p className="italic text-muted-foreground/60 text-xs">(Auto-apply form component placeholder. The schema contains {Array.isArray(job.questions) ? job.questions.length : 0} fields.)</p>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center py-4">Application fields could not be loaded. Please apply directly on their website: <a href={job.url || '#'} target="_blank" rel="noreferrer" className="text-primary hover:underline">{job.url}</a></div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
