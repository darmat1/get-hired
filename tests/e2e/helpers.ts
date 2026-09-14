import { expect, type APIRequestContext } from '@playwright/test';

export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export interface PlaywrightLike {
  request: {
    newContext: (options?: { baseURL?: string }) => Promise<APIRequestContext>;
  };
}

export interface TrackedUser {
  email: string;
  password: string;
}

export interface SignupUser extends TrackedUser {
  name: string;
}

export async function signupViaApi(request: APIRequestContext, user: SignupUser): Promise<void> {
  const res = await request.post('/api/auth/sign-up/email', { data: user });
  expect(res.ok()).toBeTruthy();
}

export async function signInViaApi(request: APIRequestContext, user: TrackedUser): Promise<boolean> {
  const res = await request.post('/api/auth/sign-in/email', {
    headers: { Origin: E2E_BASE_URL },
    data: user,
  });
  return res.ok();
}

export async function deleteUserResumeData(request: APIRequestContext, user: TrackedUser): Promise<void> {
  if (!user.email.startsWith('e2e-')) return;
  const signedIn = await signInViaApi(request, user);
  if (!signedIn) return;
  const list = await request.get('/api/resumes');
  expect(list.ok()).toBeTruthy();
  const resumes = (await list.json()) as { id: string }[];
  for (const resume of resumes) {
    const del = await request.delete(`/api/resumes/${resume.id}`);
    expect(del.ok()).toBeTruthy();
  }
}

export async function teardownUsers(playwright: PlaywrightLike, users: TrackedUser[]): Promise<void> {
  const request = await playwright.request.newContext({ baseURL: E2E_BASE_URL });
  try {
    for (const user of users) {
      await deleteUserResumeData(request, user);
    }
  } finally {
    await request.dispose();
  }
}