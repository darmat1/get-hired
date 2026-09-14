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

export async function deleteUsersViaApi(request: APIRequestContext, users: TrackedUser[]): Promise<void> {
  const emails = users
    .filter((u) => u.email.startsWith('e2e-'))
    .map((u) => u.email);
  if (emails.length === 0) return;
  const res = await request.delete('/api/e2e/users', { data: { emails } });
  expect(res.ok()).toBeTruthy();
}

export async function teardownUsers(playwright: PlaywrightLike, users: TrackedUser[]): Promise<void> {
  const request = await playwright.request.newContext({ baseURL: E2E_BASE_URL });
  try {
    await deleteUsersViaApi(request, users);
  } finally {
    await request.dispose();
  }
}