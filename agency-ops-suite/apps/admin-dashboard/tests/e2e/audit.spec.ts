import { test, expect, type Page } from '@playwright/test';
import { signInAsAdmin } from './test-auth';

// Helper to get auth cookies
async function getAuthCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}

test.describe('Audit Generator API', () => {
  test('audit generation API endpoint works', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
      headers: { Cookie: cookies },
      data: {
        url: 'https://example.com',
        projectType: 'landing-page',
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('auditId');
    expect(data).toHaveProperty('publicToken');
    expect(data).toHaveProperty('data');

    const audit = data.data;
    expect(audit.website_url).toBe('https://example.com');
    expect(audit.project_type).toBe('landing-page');
    expect(typeof audit.performance).toBe('number');
    expect(typeof audit.seo).toBe('number');
    expect(typeof audit.accessibility).toBe('number');
    expect(typeof audit.best_practices).toBe('number');
    expect(Array.isArray(audit.issues)).toBe(true);
    expect(typeof audit.estimated_cost_low).toBe('number');
    expect(typeof audit.estimated_cost_high).toBe('number');
  });

  test('audit generation rejects invalid URLs', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
      headers: { Cookie: cookies },
      data: {
        url: 'not-a-valid-url',
        projectType: 'landing-page',
      },
    });

    // Should return error (400 or 500)
    expect([400, 500]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('audit generation rejects missing fields', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
      headers: { Cookie: cookies },
      data: {
        url: 'https://example.com',
        // missing projectType
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing required fields');
  });

  test('audit API endpoint requires authentication', async ({ request }) => {
    // Try to access without auth
    const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
      data: {
        url: 'https://example.com',
        projectType: 'landing-page',
      },
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('public audit endpoint is accessible without auth', async ({ request }) => {
    // Invalid token should return 404, not 401
    const response = await request.get('http://127.0.0.1:3000/api/audit/public/invalid-token-12345');

    expect([404, 500]).toContain(response.status());
  });

  test('audit supports all project types', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const projectTypes = ['landing-page', 'ecommerce', 'corporate', 'saas', 'blog'];

    for (const projectType of projectTypes) {
      const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
        headers: { Cookie: cookies },
        data: {
          url: `https://example-${projectType}.com`,
          projectType,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data.project_type).toBe(projectType);
    }
  });
});
