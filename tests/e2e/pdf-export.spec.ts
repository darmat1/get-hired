import { test, expect } from '@playwright/test';

test.describe('PDF export smoke', () => {
  test('created resume returns application/pdf via /api/resumes/[id]/pdf', async ({ request }) => {
    const email = `e2e-pdf-${Date.now()}@example.test`;
    const password = 'E2e-Strong-Pass!2026';

    const signup = await request.post('/api/auth/sign-up/email', {
      data: { email, password, name: 'E2E PDF' },
    });
    expect(signup.ok()).toBeTruthy();

    // better-auth enforces CSRF on sign-in: a non-browser request must send Origin.
    const signin = await request.post('/api/auth/sign-in/email', {
      headers: { Origin: 'http://localhost:3000' },
      data: { email, password },
    });
    expect(signin.ok()).toBeTruthy();

    const created = await request.post('/api/resumes', {
      data: {
        title: `E2E PDF ${Date.now()}`,
        personalInfo: { firstName: 'QA', lastName: 'PDF' },
        workExperience: [],
        skills: [{ name: 'Playwright', level: 'intermediate', category: 'technical' }],
        education: [],
      },
    });
    expect(created.ok()).toBeTruthy();
    const { id } = await created.json();

    const pdf = await request.get(`/api/resumes/${id}/pdf`);
    expect(pdf.ok()).toBeTruthy();
    expect(pdf.headers()['content-type']).toContain('application/pdf');

    const body = await pdf.body();
    expect(body.length).toBeGreaterThan(1_000);
    expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});