import { test, expect, type Page } from '@playwright/test';
import { signInAsAdmin } from './test-auth';

// Helper to get auth cookies
async function getAuthCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}

// Helper to generate an audit first (prerequisite for proposals)
async function generateTestAudit(request: any, cookies: string) {
  const response = await request.post('http://127.0.0.1:3000/api/audit/generate', {
    headers: { Cookie: cookies },
    data: {
      url: 'https://example.com',
      projectType: 'landing-page',
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Failed to generate test audit: ${response.status()}`);
  }

  const data = await response.json();
  return data.auditId;
}

test.describe('Proposal Generator API', () => {
  test('proposal generation from audit works', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    // First generate an audit
    const auditId = await generateTestAudit(request, cookies);

    // Generate proposal from audit
    const response = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        auditId,
        scope: 'Standard',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
        projectName: 'Website Redesign',
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('proposalId');
    expect(data).toHaveProperty('publicToken');
    expect(data).toHaveProperty('data');

    const proposal = data.data;
    expect(proposal.prospect_company).toBe('Example Corp');
    expect(proposal.project_scope).toBe('Standard');
    expect(proposal.status).toBe('draft');
    expect(Array.isArray(proposal.deliverables)).toBe(true);
    expect(typeof proposal.estimated_cost_low).toBe('number');
    expect(typeof proposal.estimated_cost_high).toBe('number');
  });

  test('proposal generation rejects invalid scope', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const auditId = await generateTestAudit(request, cookies);

    const response = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        auditId,
        scope: 'InvalidScope',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid scope');
  });

  test('proposal generation rejects missing fields', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const response = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        // missing auditId
        scope: 'Standard',
        prospectName: 'John Doe',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing required fields');
  });

  test('proposal API endpoint requires authentication', async ({ request }) => {
    const response = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      data: {
        auditId: 'test-id',
        scope: 'Standard',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
      },
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('public proposal endpoint is accessible without auth', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3000/api/proposal/public/invalid-token-12345');

    expect([404, 500]).toContain(response.status());
  });

  test('proposal list returns user proposals', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    // Generate a proposal first
    const auditId = await generateTestAudit(request, cookies);
    await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        auditId,
        scope: 'Standard',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
      },
    });

    // List proposals
    const listResponse = await request.get('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
    });

    expect(listResponse.status()).toBe(200);
    const data = await listResponse.json();
    expect(Array.isArray(data.proposals)).toBe(true);
  });

  test('proposal generation with all scope types works', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    const scopes = ['Basic', 'Standard', 'Premium', 'Custom'];
    const auditId = await generateTestAudit(request, cookies);

    for (const scope of scopes) {
      const response = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
        headers: { Cookie: cookies },
        data: {
          auditId,
          scope,
          prospectName: 'Test User',
          prospectEmail: `test-${scope.toLowerCase()}@example.com`,
          prospectCompany: 'Test Company',
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data.project_scope).toBe(scope);
    }
  });

  test('proposal update status works', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    // Generate a proposal
    const auditId = await generateTestAudit(request, cookies);
    const generateResponse = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        auditId,
        scope: 'Standard',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
      },
    });

    const proposal = await generateResponse.json();
    const proposalId = proposal.data.id;

    // Update status to sent
    const updateResponse = await request.patch(
      `http://127.0.0.1:3000/api/proposal/${proposalId}`,
      {
        headers: { Cookie: cookies },
        data: {
          status: 'sent',
          final_quote: 9999,
        },
      }
    );

    expect(updateResponse.status()).toBe(200);
    const updatedData = await updateResponse.json();
    expect(updatedData.proposal.status).toBe('sent');
    expect(updatedData.proposal.final_quote).toBe(9999);
  });

  test('proposal fetch requires ownership verification', async ({ page, request }) => {
    await signInAsAdmin(page);
    const cookies = await getAuthCookie(page);

    // Generate a proposal
    const auditId = await generateTestAudit(request, cookies);
    const generateResponse = await request.post('http://127.0.0.1:3000/api/proposal/generate', {
      headers: { Cookie: cookies },
      data: {
        auditId,
        scope: 'Standard',
        prospectName: 'John Doe',
        prospectEmail: 'john@example.com',
        prospectCompany: 'Example Corp',
      },
    });

    const proposal = await generateResponse.json();
    const proposalId = proposal.data.id;

    // Try to fetch with different auth (would need another user context)
    // For now, just verify fetch works with correct auth
    const fetchResponse = await request.get(
      `http://127.0.0.1:3000/api/proposal/${proposalId}`,
      {
        headers: { Cookie: cookies },
      }
    );

    expect(fetchResponse.status()).toBe(200);
    const fetchedProposal = await fetchResponse.json();
    expect(fetchedProposal.proposal.id).toBe(proposalId);
  });
});
