import { test, expect } from '@playwright/test';
import { signupViaApi, teardownUsers, type TrackedUser } from './helpers';

const unique = {
  email: `e2e-signup-${Date.now()}@example.test`,
  password: 'E2e-Strong-Pass!2026',
  name: 'E2E Signup',
};

const createdUsers: TrackedUser[] = [];

test.afterAll(async ({ playwright }) => {
  await teardownUsers(playwright, createdUsers);
});

test.describe('auth smoke', () => {
  // C3a — full signup journey (auth IS the integration under test here)
  test('signup → redirected into the app → signout', async ({ page }) => {
    createdUsers.push({ email: unique.email, password: unique.password });

    await page.goto('/auth/signup');

    await page.getByPlaceholder('Full name').fill(unique.name);
    await page.getByPlaceholder('Email address').fill(unique.email);
    await page.getByPlaceholder('Password (min 8 characters)').fill(unique.password);
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    await expect(page).toHaveURL(/dashboard|resume-builder|\/resume(?![\/a-z])/i, { timeout: 15_000 });

    // Sign out lives in the header user-menu, only rendered outside the app shell.
    await page.goto('/');
    await page.getByRole('button', { name: unique.name }).first().click();
    await page.getByRole('button', { name: /sign ?out/i }).click();

    await expect(page.getByRole('link', { name: /sign ?in/i })).toBeVisible({ timeout: 15_000 });
  });

  // C3b — signin path, asserted by redirect + session cookie-free check
  test('signin with existing user lands on the builder', async ({ page, request }) => {
    const email = `e2e-signin-${Date.now()}@example.test`;
    const password = 'E2e-Strong-Pass!2026';
    createdUsers.push({ email, password });

    // Use the standalone `request` fixture — page.request shares cookies with the
    // page context, which would auto-login the browser before we reach the form.
    await signupViaApi(request, { email, password, name: 'E2E Signin' });

    await page.goto('/auth/signin');
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/dashboard|resume-builder/i, { timeout: 15_000 });
    await expect(page.getByPlaceholder('Email address')).not.toBeVisible();
  });
});