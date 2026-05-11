import { expect, type Page } from '@playwright/test';

export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'jumpstarthost@gmail.com';
export const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
export const E2E_NON_ADMIN_EMAIL = process.env.E2E_NON_ADMIN_EMAIL ?? 'e2e.nonadmin@example.com';
export const E2E_NON_ADMIN_PASSWORD = process.env.E2E_NON_ADMIN_PASSWORD ?? 'admin123';

export async function signInAsAdmin(page: Page) {
  if (!E2E_ADMIN_PASSWORD) {
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      console.warn('DEV_AUTH_BYPASS=true and E2E_ADMIN_PASSWORD not set — proceeding without interactive sign-in (developer bypass).');
      return;
    }
    throw new Error('Set E2E_ADMIN_PASSWORD before running Playwright tests. Or set DEV_AUTH_BYPASS=true for a local developer bypass.');
  }

  await page.goto('/login');
  await page.getByLabel('Email address').fill(E2E_ADMIN_EMAIL);
  await page.getByLabel('Password').fill(E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);
}