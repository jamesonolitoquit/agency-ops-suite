import { test, expect } from '@playwright/test';
import { signInAsAdmin } from './test-auth';

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test('clients page loads and shows the client form', async ({ page }) => {
  await page.goto('/clients');
  await expect(page.getByRole('heading', { name: 'Client CRM foundation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add client' })).toBeVisible();
});

test('billing page loads and exposes the create billing form', async ({ page }) => {
  await page.goto('/billing');
  await expect(page.getByRole('heading', { name: 'Billing tracker' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add billing record' })).toBeVisible();
});
