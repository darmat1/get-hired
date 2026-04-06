import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GREENHOUSE_COMPANIES, getJobs } from '@/lib/greenhouse';
import { decodeHtmlEntities } from '@/lib/utils/html';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    // Implement simple secret checking if needed for cron
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let totalSynced = 0;
    let totalDeactivated = 0;
    let totalDeleted = 0;
    const errors: any[] = [];

    for (const company of GREENHOUSE_COMPANIES) {
      try {
        const jobs = await getJobs(company.boardToken);
        const activeIds = jobs.map(j => j.id.toString());
        
        for (const job of jobs) {
          // Normalize departments
          const departments = job.departments?.map(d => d.name) || [];

          await prisma.greenhouseJob.upsert({
            where: {
              boardToken_externalId: {
                boardToken: company.boardToken,
                externalId: job.id.toString(),
              }
            },
            update: {
              title: job.title,
              location: job.location?.name,
              content: decodeHtmlEntities(job.content || ""),
              departments,
              url: job.absolute_url,
              active: true, // Mark as active if it's in the API response
              updatedAt: new Date(job.updated_at),
            },
            create: {
              boardToken: company.boardToken,
              externalId: job.id.toString(),
              title: job.title,
              location: job.location?.name,
              content: decodeHtmlEntities(job.content || ""),
              departments,
              url: job.absolute_url,
              active: true,
              createdAt: new Date(job.updated_at),
            }
          });
          totalSynced++;
        }

        // 1. Deactivate jobs for this company that are no longer in the API
        const deactivatedResult = await prisma.greenhouseJob.updateMany({
          where: {
            boardToken: company.boardToken,
            externalId: { notIn: activeIds },
            active: true // only if not already deactivated
          },
          data: { active: false }
        });
        totalDeactivated += deactivatedResult.count;

        // 2. Delete inactive jobs that have no associated applications
        const deletionResult = await prisma.greenhouseJob.deleteMany({
          where: {
            boardToken: company.boardToken,
            active: false,
            applications: { none: {} }
          }
        });
        totalDeleted += deletionResult.count;

      } catch (err: any) {
        console.error(`Failed to sync company ${company.name}:`, err);
        errors.push({ company: company.name, error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalSynced,
      totalDeactivated,
      totalDeleted,
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error: any) {
    console.error('Error syncing Greenhouse jobs:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
