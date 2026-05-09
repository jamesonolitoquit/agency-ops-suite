import { NextResponse } from 'next/server';
import {
  contractSentTemplate,
  invoiceCreatedTemplate,
  paymentReceivedTemplate,
  onboardingWelcomeTemplate,
} from '@/lib/email-templates';

/**
 * GET /api/admin/email-preview?template=contract_sent&...
 * 
 * Admin endpoint to preview email templates.
 * Returns HTML for viewing in browser.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template');

  if (!template) {
    return NextResponse.json(
      {
        error: 'missing_template',
        message: 'Specify ?template=contract_sent|invoice_created|payment_received|onboarding_welcome',
      },
      { status: 400 }
    );
  }

  let emailTemplate;

  switch (template) {
    case 'contract_sent':
      emailTemplate = contractSentTemplate(
        'John Client',
        'CTR-202605-ABC123',
        'https://example.com/contracts/sign/test-token',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      );
      break;

    case 'invoice_created':
      emailTemplate = invoiceCreatedTemplate(
        'John Client',
        'INV-202605-001',
        99900, // $999.00
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        'https://example.com/invoices/inv-001'
      );
      break;

    case 'payment_received':
      emailTemplate = paymentReceivedTemplate('John Client', 'INV-202605-001', 99900);
      break;

    case 'onboarding_welcome':
      emailTemplate = onboardingWelcomeTemplate('John Client', 'https://example.com/portal');
      break;

    default:
      return NextResponse.json(
        {
          error: 'invalid_template',
          message: 'Must be one of: contract_sent, invoice_created, payment_received, onboarding_welcome',
        },
        { status: 400 }
      );
  }

  // Return HTML wrapped in a preview container
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Email Preview: ${template}</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .preview-container {
          max-width: 650px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .preview-header {
          background: #111;
          color: white;
          padding: 20px;
        }
        .preview-header h1 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }
        .preview-header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .preview-content {
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          <h1>Email Preview</h1>
          <p><strong>Template:</strong> ${template}</p>
          <p><strong>Subject:</strong> ${emailTemplate.subject}</p>
        </div>
        <div class="preview-content">
          ${emailTemplate.html}
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
