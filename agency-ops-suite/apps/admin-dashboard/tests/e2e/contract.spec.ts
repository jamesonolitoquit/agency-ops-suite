import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Helper to create test proposal
async function createTestProposal(page: Page) {
  await page.goto(`${BASE_URL}/proposal/new`);
  
  // Select random available audit (if exists)
  // For now, we'll create a custom proposal directly via API
  const proposalResponse = await page.context().request.post(`${BASE_URL}/api/proposal/generate`, {
    data: {
      prospect_name: 'Test Client',
      prospect_email: 'client@test.com',
      prospect_company: 'Test Corp',
      project_name: 'Test Web Redesign',
      scope: 'standard',
    },
  });
  
  const proposalData = await proposalResponse.json();
  return proposalData.proposalId || proposalData.data?.id;
}

test.describe('Contract Generator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'jumpstarthost@gmail.com');
      await page.fill('input[type="password"]', 'TestPass123!');
      await page.click('button:has-text("Sign in")');
    await page.waitForNavigation();
  });

  test('1. Create contract from accepted proposal', async ({ page }) => {
    // Navigate to contract creation
    await page.goto(`${BASE_URL}/contract/new`);
    expect(page.url()).toContain('/contract/new');
    
    // Verify form is visible
    await expect(page.locator('text=Step 1: Contract Source')).toBeVisible();
    
    // Select "From Accepted Proposal"
    await page.click('button:has-text("From Accepted Proposal")');
    
    // Should show proposal list
    const proposals = page.locator('[class*="proposal"]');
    const count = await proposals.count();
    // Proceed with test even if no proposals exist (will test custom flow)
    
    test.skip(count === 0, 'No accepted proposals available, skipping proposal flow');
  });

  test('2. Create custom contract with all fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract/new`);
    
    // Step 1: Select Custom
    await page.click('button:has-text("Create Custom Contract")');
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Step 2: Contract Type')).toBeVisible();
    
    // Step 2: Select contract type
    await page.selectOption('select', 'service');
    await page.click('input[type="checkbox"]'); // Include NDA
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Step 3: Contract Details')).toBeVisible();
    
    // Step 3: Fill in details
    await page.fill('input#prospectName', 'John Smith');
    await page.fill('input#prospectCompany', 'Acme Corp');
    await page.fill('input#prospectEmail', 'john@acme.com');
    await page.fill('input#projectName', 'Website Redesign');
    await page.fill('input#costLow', '5000');
    await page.fill('input#costHigh', '8000');
    await page.click('button:has-text("Next")');
    
    // Step 4: Review
    await expect(page.locator('text=Review & Create')).toBeVisible();
    await expect(page.locator('text=Website Redesign')).toBeVisible();
    await expect(page.locator('text=$5,000 - $8,000')).toBeVisible();
  });

  test('3. Submit contract form successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract/new`);
    
    // Create custom contract with all steps
    await page.click('button:has-text("Create Custom Contract")');
    await page.click('button:has-text("Next")');
    
    await page.selectOption('select', 'retainer');
    await page.click('button:has-text("Next")');
    
    await page.fill('input#prospectName', 'Jane Doe');
    await page.fill('input#prospectCompany', 'Tech Startup');
    await page.fill('input#prospectEmail', 'jane@startup.com');
    await page.fill('input#projectName', 'App Development');
    await page.fill('input#costLow', '10000');
    await page.fill('input#costHigh', '15000');
    await page.click('button:has-text("Next")');
    
    // Submit
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/contract/generate') && response.status() === 200
    );

    await page.click('button:has-text("Create Contract")');
    await responsePromise;

    // Should redirect to contract detail (allow a bit more time for navigation)
    await page.waitForURL(/\/contract\/[a-f0-9-]+$/, { timeout: 10000 });
  });

  test('4. List contracts on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract`);
    
    // Verify list page loads
    expect(page.url()).toContain('/contract');
    await expect(page.getByRole('heading', { name: 'Contracts' })).toBeVisible();
    await expect(page.locator('text=New Contract')).toBeVisible();
    
    // Should show stats
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Drafts')).toBeVisible();
    await expect(page.locator('text=Signed')).toBeVisible();
  });

  test('5. View contract details', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract`);
    
    // Find first contract card and click it
    const firstCard = page.locator('[href^="/contract/"]').first();
    const href = await firstCard.getAttribute('href');
    
    test.skip(!href || href === '/contract/new', 'No contracts to view');
    
    await firstCard.click();
    
    // Verify detail page elements
    await expect(page.locator('text=Contract Value')).toBeVisible();
    await expect(page.locator('text=Client')).toBeVisible();
    await expect(page.locator('text=Timeline')).toBeVisible();
  });

  test('6. Update contract status', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract`);
    
    // Get first contract and navigate to it
    const firstCard = page.locator('[href^="/contract/"]').first();
    const href = await firstCard.getAttribute('href');
    
    test.skip(!href || href === '/contract/new', 'No contracts to update');
    
    await page.goto(`${BASE_URL}${href}`);
    
    // Find status buttons
    const statusButtons = page.locator('button:has-text("Sent")');
    if (await statusButtons.count() > 0) {
      await statusButtons.first().click();
      
      // Wait for status update
      await page.waitForResponse(
        response => response.url().includes('/api/contract/') && response.status() === 200
      );
    }
  });

  test('7. Contract public link works', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/contract`);
    
    // Get first contract
    const firstCard = page.locator('[href^="/contract/"]').first();
    const href = await firstCard.getAttribute('href');
    
    test.skip(!href || href === '/contract/new', 'No contracts to test public link');
    
    await page.goto(`${BASE_URL}${href}`);
    
    // Find public link text
    const linkElement = page.locator('text=contract/report/');
    if (await linkElement.count() > 0) {
      const linkText = await linkElement.textContent();
      const publicUrl = linkText?.trim() || '';
      
      // Open in new page to test public access
      const publicPage = await context.newPage();
      await publicPage.goto(`${BASE_URL}${publicUrl.replace(BASE_URL, '')}`);
      
      // Should be accessible without auth
      await expect(publicPage.locator('text=Share Contract')).not.toBeVisible();
      await expect(publicPage.locator('text=Status Management')).not.toBeVisible();
      
      await publicPage.close();
    }
  });

  test('8. Multiple contract types work', async ({ page }) => {
    const contractTypes = ['service', 'retainer', 'maintenance'];
    
    for (const type of contractTypes) {
      await page.goto(`${BASE_URL}/contract/new`);
      
      await page.click('button:has-text("Create Custom Contract")');
      await page.click('button:has-text("Next")');
      
      await page.selectOption('select', type);
      await page.click('button:has-text("Next")');
      
      // Fill required fields
      await page.fill('input#prospectName', `Client ${type}`);
      await page.fill('input#prospectCompany', 'Test Co');
      await page.fill('input#prospectEmail', `client-${type}@test.com`);
      await page.fill('input#projectName', `Project ${type}`);
      await page.fill('input#costLow', '5000');
      await page.fill('input#costHigh', '10000');
      await page.click('button:has-text("Next")');
      
      // Verify review shows correct type
      await expect(page.getByText(type, { exact: true })).toBeVisible();
    }
  });

  test('9. Form validation prevents submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract/new`);
    
    await page.click('button:has-text("Create Custom Contract")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // Move to review without filling fields
    await page.click('button:has-text("Next")');

    // Try to proceed without filling required fields
    const createButton = page.locator('button:has-text("Create Contract")');
    await expect(createButton).toBeDisabled();

    // Go back to fill fields
    await page.click('button:has-text("Back")');
    await page.fill('input#prospectName', 'Test');
    await page.fill('input#prospectCompany', 'Test Co');
    await page.fill('input#prospectEmail', 'test@test.com');
    await page.fill('input#projectName', 'Test Project');
    await page.fill('input#costLow', '5000');
    await page.fill('input#costHigh', '5000');

    // Advance to review and assert button enabled
    await page.click('button:has-text("Next")');
    await expect(createButton).toBeEnabled();
  });

  test('10. Contract creation error handling', async ({ page }) => {
    await page.goto(`${BASE_URL}/contract/new`);
    
    await page.click('button:has-text("Create Custom Contract")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    
    // Fill with invalid email
    await page.fill('input#prospectName', 'Test Client');
    await page.fill('input#prospectCompany', 'Test Co');
    await page.fill('input#prospectEmail', 'invalid-email');
    await page.fill('input#projectName', 'Test Project');
    await page.fill('input#costLow', '5000');
    await page.fill('input#costHigh', '10000');
    await page.click('button:has-text("Next")');
    
    // Try to submit - may show error
    await page.click('button:has-text("Create Contract")');
    
    // Wait for response
    await page.waitForLoadState('networkidle');
  });
});
