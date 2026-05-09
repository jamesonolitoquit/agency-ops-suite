import { test, expect, type Page } from '@playwright/test';

function decodeSessionCookie(value: string) {
  const rawValue = value.startsWith('base64-') ? value.slice('base64-'.length) : value;
  return JSON.parse(Buffer.from(rawValue, 'base64').toString('utf8')) as {
    expires_at?: number;
    expires_in?: number;
  };
}

function encodeSessionCookie(session: Record<string, unknown>) {
  return `base64-${Buffer.from(JSON.stringify(session)).toString('base64')}`;
}

async function signInAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('jumpstarthost@gmail.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('non-admin login is rejected with not_allowed', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('testuser-nonadmin@example.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/(login(\?error=not_allowed)?|)$/);
  await expect(page.locator('#login-not-allowed')).toContainText('not authorized for admin access');
});

test('allowlisted admin reaches the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('jumpstarthost@gmail.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Agency control center/i })).toBeVisible();
});

test('login page stays usable on a mobile viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);

  await context.close();
});

test('expired session is refreshed by middleware', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await signInAsAdmin(page);

  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'));

  expect(sessionCookie).toBeTruthy();
  if (!sessionCookie) {
    await context.close();
    return;
  }

  const expiredSession = decodeSessionCookie(sessionCookie.value);
  expiredSession.expires_at = Math.floor(Date.now() / 1000) - 60;
  expiredSession.expires_in = -60;

  await context.addCookies([
    {
      ...sessionCookie,
      value: encodeSessionCookie(expiredSession),
    },
  ]);

  await page.goto('/clients');
  await expect(page.getByRole('heading', { name: 'Client CRM foundation' })).toBeVisible();

  const refreshedCookies = await context.cookies();
  const refreshedSessionCookie = refreshedCookies.find((cookie) => cookie.name === sessionCookie.name);

  expect(refreshedSessionCookie).toBeTruthy();
  if (refreshedSessionCookie) {
    const refreshedSession = decodeSessionCookie(refreshedSessionCookie.value);
    expect(refreshedSession.expires_at ?? 0).toBeGreaterThan(Math.floor(Date.now() / 1000));
  }

  await context.close();
});
