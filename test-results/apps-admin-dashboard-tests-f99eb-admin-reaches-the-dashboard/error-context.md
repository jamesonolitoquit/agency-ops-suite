# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps\admin-dashboard\tests\e2e\auth.spec.ts >> allowlisted admin reaches the dashboard
- Location: apps\admin-dashboard\tests\e2e\auth.spec.ts:28:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test';
  2  | 
  3  | export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'jumpstarthost@gmail.com';
  4  | export const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
  5  | export const E2E_NON_ADMIN_EMAIL = process.env.E2E_NON_ADMIN_EMAIL;
  6  | export const E2E_NON_ADMIN_PASSWORD = process.env.E2E_NON_ADMIN_PASSWORD;
  7  | 
  8  | export async function signInAsAdmin(page: Page) {
  9  |   if (!E2E_ADMIN_PASSWORD) {
  10 |     if (process.env.DEV_AUTH_BYPASS === 'true') {
  11 |       console.warn('DEV_AUTH_BYPASS=true and E2E_ADMIN_PASSWORD not set — proceeding without interactive sign-in (developer bypass).');
  12 |       return;
  13 |     }
  14 |     throw new Error('Set E2E_ADMIN_PASSWORD before running Playwright tests. Or set DEV_AUTH_BYPASS=true for a local developer bypass.');
  15 |   }
  16 | 
> 17 |   await page.goto('/login');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  18 |   await page.getByLabel('Email address').fill(E2E_ADMIN_EMAIL);
  19 |   await page.getByLabel('Password').fill(E2E_ADMIN_PASSWORD);
  20 |   await page.getByRole('button', { name: 'Sign in' }).click();
  21 |   await expect(page).toHaveURL(/\/$/);
  22 | }
```