import { test, expect } from '@playwright/test';

async function signInAsAdmin(page: Parameters<typeof test['beforeEach']>[0]['page']) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('jumpstarthost@gmail.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test('clients page loads and shows the seeded client form', async ({ page }) => {
  await page.goto('/clients');
  await expect(page.getByRole('heading', { name: 'Client CRM foundation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add client' })).toBeVisible();
});

test('billing page loads and exposes the create billing form', async ({ page }) => {
  await page.goto('/billing');
  await expect(page.getByRole('heading', { name: 'Billing tracker' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add billing record' })).toBeVisible();
});
