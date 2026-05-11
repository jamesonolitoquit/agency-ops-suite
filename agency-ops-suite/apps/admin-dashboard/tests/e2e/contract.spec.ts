import { test, expect, type Page } from '@playwright/test';
import { signInAsAdmin } from './test-auth';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

async function getAuthCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

async function createContractViaApi(page: Page) {
  const cookies = await getAuthCookie(page);

  const response = await page.request.post(`${BASE_URL}/api/contract/generate`, {
    headers: { Cookie: cookies },
    data: {
      prospect_name: 'E2E Contract Client',
      prospect_email: 'contract-e2e@example.com',
      prospect_company: 'E2E Contract Co',
      project_name: 'E2E Contract Project',
      contractType: 'service',
      start_date: '2026-05-01',
      end_date: '2026-07-01',
      timeline_weeks: 8,
      contract_cost_low: 5000,
      contract_cost_high: 9000,
      deliverables: [],
      payment_terms: '50% upfront, 50% on completion',
      acceptance_criteria: [],
      terms_and_conditions: '',
      nda_included: true,
    },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(data.contractId).toBeTruthy();

  return {
    id: data.contractId as string,
    publicToken: data.publicToken as string,
  };
}

test.describe('Contract Generator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  test('contracts page loads and shows key controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract`);

    await expect(page.getByRole('heading', { name: 'Contracts' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Contract' })).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Drafts')).toBeVisible();
  });

  test('create contract via API then open detail page', async ({ page }) => {
    const contract = await createContractViaApi(page);

    await page.goto(`${BASE_URL}/contract/${contract.id}`);
    await expect(page.getByText('Contract Value')).toBeVisible();
    await expect(page.getByText('Client', { exact: true })).toBeVisible();
    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Share Contract')).toBeVisible();
  });

  test('contract status update endpoint works for authenticated user', async ({ page }) => {
    const contract = await createContractViaApi(page);
    const cookies = await getAuthCookie(page);

    const response = await page.request.patch(`${BASE_URL}/api/contract/${contract.id}`, {
      headers: { Cookie: cookies },
      data: {
        status: 'sent',
      },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.contract.status).toBe('sent');
  });

  test('contract public page is accessible without admin controls', async ({ page, browser }) => {
    const contract = await createContractViaApi(page);

    const publicPage = await browser.newPage();
    await publicPage.goto(`${BASE_URL}/contract/report/${contract.publicToken}`);

    await expect(publicPage.getByText('Share Contract')).not.toBeVisible();
    await expect(publicPage.getByText('Status Management')).not.toBeVisible();

    await publicPage.close();
  });
});
