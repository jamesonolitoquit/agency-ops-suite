# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps\admin-dashboard\tests\e2e\auth.spec.ts >> login page stays usable on a mobile viewport
- Location: apps\admin-dashboard\tests\e2e\auth.spec.ts:33:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | import { E2E_NON_ADMIN_EMAIL, E2E_NON_ADMIN_PASSWORD, signInAsAdmin } from './test-auth';
  3  | 
  4  | function decodeSessionCookie(value: string) {
  5  |   const rawValue = value.startsWith('base64-') ? value.slice('base64-'.length) : value;
  6  |   return JSON.parse(Buffer.from(rawValue, 'base64').toString('utf8')) as {
  7  |     expires_at?: number;
  8  |     expires_in?: number;
  9  |   };
  10 | }
  11 | 
  12 | function encodeSessionCookie(session: Record<string, unknown>) {
  13 |   return `base64-${Buffer.from(JSON.stringify(session)).toString('base64')}`;
  14 | }
  15 | 
  16 | test('non-admin login is rejected with not_allowed', async ({ page }) => {
  17 |   test.skip(!E2E_NON_ADMIN_EMAIL || !E2E_NON_ADMIN_PASSWORD, 'Set E2E_NON_ADMIN_EMAIL and E2E_NON_ADMIN_PASSWORD to run non-admin auth test.');
  18 | 
  19 |   await page.goto('/login');
  20 |   await page.getByLabel('Email address').fill(E2E_NON_ADMIN_EMAIL ?? '');
  21 |   await page.getByLabel('Password').fill(E2E_NON_ADMIN_PASSWORD ?? '');
  22 |   await page.getByRole('button', { name: 'Sign in' }).click();
  23 | 
  24 |   await expect(page).toHaveURL(/\/(login(\?error=not_allowed)?|)$/);
  25 |   await expect(page.locator('#login-not-allowed')).toContainText('not authorized for admin access');
  26 | });
  27 | 
  28 | test('allowlisted admin reaches the dashboard', async ({ page }) => {
  29 |   await signInAsAdmin(page);
  30 |   await expect(page.getByRole('heading', { name: /Agency control center/i })).toBeVisible();
  31 | });
  32 | 
  33 | test('login page stays usable on a mobile viewport', async ({ browser }) => {
  34 |   const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  35 |   const page = await context.newPage();
  36 | 
> 37 |   await page.goto('/login');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  38 | 
  39 |   await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  40 |   await expect(page.getByLabel('Email address')).toBeVisible();
  41 |   await expect(page.getByLabel('Password')).toBeVisible();
  42 |   await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  43 |   const metrics = await page.evaluate(() => ({
  44 |     scrollWidth: document.body.scrollWidth,
  45 |     innerWidth: window.innerWidth,
  46 |   }));
  47 | 
  48 |   expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
  49 | 
  50 |   await context.close();
  51 | });
  52 | 
  53 | test('expired session is refreshed by middleware', async ({ browser }) => {
  54 |   const context = await browser.newContext();
  55 |   const page = await context.newPage();
  56 | 
  57 |   await signInAsAdmin(page);
  58 | 
  59 |   const cookies = await context.cookies();
  60 |   const sessionCookie = cookies.find((cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'));
  61 | 
  62 |   expect(sessionCookie).toBeTruthy();
  63 |   if (!sessionCookie) {
  64 |     await context.close();
  65 |     return;
  66 |   }
  67 | 
  68 |   const expiredSession = decodeSessionCookie(sessionCookie.value);
  69 |   expiredSession.expires_at = Math.floor(Date.now() / 1000) - 60;
  70 |   expiredSession.expires_in = -60;
  71 | 
  72 |   await context.addCookies([
  73 |     {
  74 |       ...sessionCookie,
  75 |       value: encodeSessionCookie(expiredSession),
  76 |     },
  77 |   ]);
  78 | 
  79 |   await page.goto('/clients');
  80 |   await expect(page.getByRole('heading', { name: 'Client CRM foundation' })).toBeVisible();
  81 | 
  82 |   const refreshedCookies = await context.cookies();
  83 |   const refreshedSessionCookie = refreshedCookies.find((cookie) => cookie.name === sessionCookie.name);
  84 | 
  85 |   expect(refreshedSessionCookie).toBeTruthy();
  86 |   if (refreshedSessionCookie) {
  87 |     const refreshedSession = decodeSessionCookie(refreshedSessionCookie.value);
  88 |     expect(refreshedSession.expires_at ?? 0).toBeGreaterThan(Math.floor(Date.now() / 1000));
  89 |   }
  90 | 
  91 |   await context.close();
  92 | });
  93 | 
```