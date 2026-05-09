import { Resend } from 'resend';
import { getClient } from './supabase/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@agency-ops-suite.example.com';
const BRAND_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Agency Ops Suite';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Contract Sent Email Template
 */
export function contractSentTemplate(
  clientName: string,
  contractNumber: string,
  signingUrl: string,
  expiresAt: string
): EmailTemplate {
  const expiryDate = new Date(expiresAt).toLocaleDateString();

  return {
    subject: `Contract ${contractNumber} Ready for Your Review`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111; margin-bottom: 24px;">Contract Ready for Signature</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Your contract <strong>${contractNumber}</strong> is ready for review and signature.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; color: #666;">
            <strong>Contract Details:</strong>
          </p>
          <p style="margin: 0; color: #666;">
            Contract Number: <strong>${contractNumber}</strong><br>
            Expires: <strong>${expiryDate}</strong>
          </p>
        </div>
        
        <p style="margin: 24px 0 0 0;">
          <a href="${signingUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Review & Sign Contract
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This link expires on ${expiryDate}. If you have questions, please reach out to us.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
        </p>
      </div>
    `,
    text: `
Contract Ready for Signature

Hi ${clientName},

Your contract ${contractNumber} is ready for review and signature.

Contract Details:
- Contract Number: ${contractNumber}
- Expires: ${expiryDate}

Review & Sign: ${signingUrl}

This link expires on ${expiryDate}. If you have questions, please reach out.
    `.trim(),
  };
}

/**
 * Invoice Created Email Template
 */
export function invoiceCreatedTemplate(
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  invoiceUrl: string
): EmailTemplate {
  const dueFormatted = new Date(dueDate).toLocaleDateString();
  const amountFormatted = (amount / 100).toFixed(2);

  return {
    subject: `Invoice ${invoiceNumber} - Due by ${dueFormatted}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111; margin-bottom: 24px;">Invoice Ready</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Your invoice <strong>${invoiceNumber}</strong> is ready for payment.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; color: #666;">
            <strong>Invoice Details:</strong>
          </p>
          <p style="margin: 0; color: #666;">
            Invoice Number: <strong>${invoiceNumber}</strong><br>
            Amount Due: <strong>$${amountFormatted}</strong><br>
            Due Date: <strong>${dueFormatted}</strong>
          </p>
        </div>
        
        <p style="margin: 24px 0 0 0;">
          <a href="${invoiceUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            View & Pay Invoice
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          We accept online payments via credit card. If you have questions, please contact us.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
        </p>
      </div>
    `,
    text: `
Invoice Ready

Hi ${clientName},

Your invoice ${invoiceNumber} is ready for payment.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Amount Due: $${amountFormatted}
- Due Date: ${dueFormatted}

View & Pay: ${invoiceUrl}

We accept online payments via credit card. If you have questions, please contact us.
    `.trim(),
  };
}

/**
 * Payment Received Email Template
 */
export function paymentReceivedTemplate(
  clientName: string,
  invoiceNumber: string,
  amount: number
): EmailTemplate {
  const amountFormatted = (amount / 100).toFixed(2);

  return {
    subject: `Payment Received - Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a; margin-bottom: 24px;">✓ Payment Received</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Thank you! We've received your payment for invoice <strong>${invoiceNumber}</strong>.
        </p>
        
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 0 0 16px 0; color: #166534;">
            <strong>Payment Confirmed</strong>
          </p>
          <p style="margin: 0; color: #166534;">
            Invoice Number: <strong>${invoiceNumber}</strong><br>
            Amount Paid: <strong>$${amountFormatted}</strong><br>
            Date: <strong>${new Date().toLocaleDateString()}</strong>
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Your payment has been processed and applied to your account. A receipt has been sent to your email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
        </p>
      </div>
    `,
    text: `
Payment Received

Hi ${clientName},

Thank you! We've received your payment for invoice ${invoiceNumber}.

Payment Confirmed:
- Invoice Number: ${invoiceNumber}
- Amount Paid: $${amountFormatted}
- Date: ${new Date().toLocaleDateString()}

Your payment has been processed and applied to your account.
    `.trim(),
  };
}

/**
 * Onboarding Welcome Email Template
 */
export function onboardingWelcomeTemplate(
  clientName: string,
  portalUrl: string
): EmailTemplate {
  return {
    subject: `Welcome to ${BRAND_NAME}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111; margin-bottom: 24px;">Welcome!</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Welcome to ${BRAND_NAME}! We're excited to work with you.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Your client portal is now active. You can use it to:
        </p>
        
        <ul style="color: #666; font-size: 16px; line-height: 1.8;">
          <li>View and pay invoices</li>
          <li>Track project status</li>
          <li>Submit requests</li>
          <li>Download contracts and documents</li>
        </ul>
        
        <p style="margin: 24px 0 0 0;">
          <a href="${portalUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Access Your Portal
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          If you have any questions, don't hesitate to reach out. We're here to help!
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
        </p>
      </div>
    `,
    text: `
Welcome!

Hi ${clientName},

Welcome to ${BRAND_NAME}! We're excited to work with you.

Your client portal is now active. You can use it to:
- View and pay invoices
- Track project status
- Submit requests
- Download contracts and documents

Access Your Portal: ${portalUrl}

If you have any questions, don't hesitate to reach out. We're here to help!
    `.trim(),
  };
}

/**
 * Send Email
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  metadata?: Record<string, any>
) {
  const supabase = await getClient();

  try {
    // Send via Resend
    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    // Log email event
    try {
      await supabase.from('email_events').insert([
        {
          recipient: to,
          subject: template.subject,
          status: 'sent',
          resend_id: (result as any)?.id || (result as any)?.message_id || '',
          metadata: metadata || {},
        },
      ]);
    } catch (e) {
      console.error('Failed to log email event:', e);
    }

    return result;
  } catch (error: any) {
    console.error('Failed to send email:', error);

    // Log failure
    try {
      await supabase.from('email_events').insert([
        {
          recipient: to,
          subject: template.subject,
          status: 'failed',
          error_message: error.message,
          metadata: metadata || {},
        },
      ]);
    } catch (e) {
      console.error('Failed to log email error:', e);
    }

    throw error;
  }
}

/**
 * Send Contract Sent Email
 */
export async function sendContractSentEmail(
  clientEmail: string,
  clientName: string,
  contractNumber: string,
  signingUrl: string,
  expiresAt: string
) {
  const template = contractSentTemplate(clientName, contractNumber, signingUrl, expiresAt);
  return sendEmail(clientEmail, template, {
    type: 'contract_sent',
    contractNumber,
  });
}

/**
 * Send Invoice Created Email
 */
export async function sendInvoiceCreatedEmail(
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  invoiceUrl: string
) {
  const template = invoiceCreatedTemplate(clientName, invoiceNumber, amount, dueDate, invoiceUrl);
  return sendEmail(clientEmail, template, {
    type: 'invoice_created',
    invoiceNumber,
    amount,
  });
}

/**
 * Send Payment Received Email
 */
export async function sendPaymentReceivedEmail(
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  amount: number
) {
  const template = paymentReceivedTemplate(clientName, invoiceNumber, amount);
  return sendEmail(clientEmail, template, {
    type: 'payment_received',
    invoiceNumber,
    amount,
  });
}

/**
 * Send Onboarding Welcome Email
 */
export async function sendOnboardingWelcomeEmail(
  clientEmail: string,
  clientName: string,
  portalUrl: string
) {
  const template = onboardingWelcomeTemplate(clientName, portalUrl);
  return sendEmail(clientEmail, template, {
    type: 'onboarding_welcome',
  });
}
