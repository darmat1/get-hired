'use server';

import { prisma } from '@/lib/prisma';
import { submitApplication } from '@/lib/greenhouse';
import { auth } from '@/lib/auth'; // Ensure this exists to fetch current user
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function applyToGreenhouseJob(jobId: string, formDataEntries: Record<string, any>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const role = (session.user as any)?.role?.toLowerCase();
    const isAdmin = ["superadmin", "admin"].includes(role || "");

    if (!isAdmin) {
      return { success: false, error: 'Feature only available for admins during development.' };
    }

    const job = await prisma.greenhouseJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Attempt to parse existing user profile info or use form data
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    });

    // We build the FormData payload for Greenhouse Job Board API.
    // The API requires multipart/form-data.
    const formPayload = new FormData();
    
    // Default mapping fields that Greenhouse uses
    formPayload.append('first_name', formDataEntries.firstName || 'Candidate');
    formPayload.append('last_name', formDataEntries.lastName || 'Name');
    formPayload.append('email', session.user.email);
    formPayload.append('phone', formDataEntries.phone || '');

    // Assuming formDataEntries contains values for custom questions
    // In a real app, you would iterate over job.questions and append their corresponding values.
    if (job.questions && Array.isArray(job.questions)) {
      job.questions.forEach((q: any) => {
        q.fields.forEach((field: any) => {
          const value = formDataEntries[field.name];
          if (value !== undefined && value !== null) {
             formPayload.append(field.name, value);
          }
        });
      });
    }

    // Note: To attach a resume or cover letter from DB, we'd need to fetch the file contents 
    // and convert to a File object/Blob, e.g., formPayload.append('resume', fileBlob, 'resume.pdf');

    // Create a pending application record
    const application = await prisma.greenhouseApplication.create({
      data: {
        jobId: job.id,
        userId: session.user.id,
        status: 'pending'
      }
    });

    try {
      // Send the request
      const response = await submitApplication(job.boardToken, job.externalId, formPayload);
      
      await prisma.greenhouseApplication.update({
        where: { id: application.id },
        data: {
          status: 'submitted',
          appliedAt: new Date(),
          logs: response
        }
      });

      revalidatePath(`/dashboard/jobs/${job.id}`);
      return { success: true };

    } catch (apiError: any) {
      await prisma.greenhouseApplication.update({
        where: { id: application.id },
        data: {
          status: 'failed',
          logs: apiError.message
        }
      });
      console.error('Greenhouse apply failed:', apiError);
      return { success: false, error: 'Greenhouse API rejected the application. It may require Captcha.' };
    }

  } catch (err: any) {
    console.error('Action applyToGreenhouseJob error:', err);
    return { success: false, error: 'Internal Server Error' };
  }
}
