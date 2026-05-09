import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from 'react-email';
import BusinessNotification from '../../../emails/BusinessNotification';
import UserConfirmation from '../../../emails/UserConfirmation';
import { forwardLeadToSuite } from '../../../lib/suite-intake';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { fromName, fromEmail, businessName, serviceNeeded, budgetRange, projectDetails } =
    await req.json();

  const suiteResult = await forwardLeadToSuite({
    name: String(fromName ?? '').trim(),
    businessType: String(serviceNeeded ?? '').trim(),
    email: String(fromEmail ?? '').trim(),
    message: [
      `Business name: ${String(businessName ?? 'Not provided')}`,
      `Budget range: ${String(budgetRange ?? '')}`,
      `Project details: ${String(projectDetails ?? '')}`,
    ].join('\n'),
    source: 'deployhub-send-route',
  });

  if (suiteResult.error) {
    return NextResponse.json(
      { error: suiteResult.error, message: suiteResult.message || 'Failed to forward lead.' },
      { status: 503 }
    );
  }

  const businessHtml = await render(
    BusinessNotification({ fromName, fromEmail, businessName, serviceNeeded, budgetRange, projectDetails })
  );

  const confirmationHtml = await render(
    UserConfirmation({ fromName, serviceNeeded, budgetRange, projectDetails })
  );

  const [businessResult, confirmationResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: 'deployhubph@gmail.com',
      subject: `New Inquiry from ${fromName}`,
      html: businessHtml,
      replyTo: fromEmail,
    }),
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: fromEmail,
      subject: "We've received your inquiry — Deploy Hub",
      html: confirmationHtml,
    }),
  ]);

  if (businessResult.status === 'rejected') {
    console.error('Business email failed:', businessResult.reason);
    const msg = businessResult.reason instanceof Error ? businessResult.reason.message : JSON.stringify(businessResult.reason);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (confirmationResult.status === 'rejected') {
    console.error('Confirmation email failed:', confirmationResult.reason);
  }

  return NextResponse.json({ success: true, leadId: suiteResult.leadId }, { status: 201 });
}
