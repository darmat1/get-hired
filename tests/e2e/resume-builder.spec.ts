import { test, expect, type Page } from '@playwright/test';

async function signInAs(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.getByPlaceholder('Email address').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/dashboard|resume-builder/i, { timeout: 15_000 });
}

test.describe('resume builder smoke', () => {
  test('create resume → redirected to editor → visible in dashboard', async ({ page, request }) => {
    const email = `e2e-builder-${Date.now()}@example.test`;
    const password = 'E2e-Strong-Pass!2026';
    const signup = await request.post('/api/auth/sign-up/email', {
      data: { email, password, name: 'E2E Builder' },
    });
    expect(signup.ok()).toBeTruthy();
    await signInAs(page, email, password);

    // Dashboard CTA → the resume is created with a bare title, then we land on the editor.
    await page.goto('/dashboard/my-resumes');
    await page.getByRole('button', { name: /create resume/i }).first().click();

    const testId = `qa-${Date.now()}`;
    const title = `E2E Resume ${testId}`;
    await page.getByLabel('Resume Title').fill(title);
    await page.getByRole('button', { name: /create resume/i }).click();

    await expect(page).toHaveURL(/\/resume\/[^/]+\/edit/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title, { timeout: 15_000 });

    // Back on the dashboard the new resume is listed.
    await page.goto('/dashboard/my-resumes');
    await expect(page.getByRole('link', { name: new RegExp(title) }).first()).toBeVisible({ timeout: 15_000 });
  });
});