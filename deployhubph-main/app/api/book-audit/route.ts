import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from 'react-email';
import ManualAuditBookingEmail from '../../../emails/ManualAuditBooking';
import ManualAuditConfirmation from '../../../emails/ManualAuditConfirmation';
import { forwardLeadToSuite } from '../../../lib/suite-intake';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, websiteUrl, auditType, details, fromDeployCheck } = await req.json();

  if (!name || !email || !websiteUrl || !auditType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const suiteResult = await forwardLeadToSuite({
    name: name.trim(),
    businessType: auditType.trim(),
    email: email.trim(),
    message: [
      `Website URL: ${websiteUrl.trim()}`,
      details?.trim() ? `Details: ${details.trim()}` : null,
      fromDeployCheck ? 'Source: deploy-check flow' : 'Source: landing page audit booking',
    ].filter(Boolean).join('\n'),
    source: fromDeployCheck ? 'deployhub-deploy-check' : 'deployhub-manual-audit',
  });

  if (suiteResult.error) {
    return NextResponse.json(
      { error: suiteResult.error, message: suiteResult.message || 'Failed to create suite lead.' },
      { status: 503 }
    );
  }

  const [businessHtml, confirmationHtml] = await Promise.all([
    render(ManualAuditBookingEmail({ name, email, websiteUrl, auditType, details: details || '', fromDeployCheck: !!fromDeployCheck })),
    render(ManualAuditConfirmation({ name, websiteUrl, auditType })),
  ]);

  const [businessResult, confirmationResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: 'deployhubph@gmail.com',
      subject: `New Manual Audit Booking from ${name}`,
      html: businessHtml,
      replyTo: email,
    }),
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: email,
      subject: 'Your manual audit booking is confirmed — Deploy Hub',
      html: confirmationHtml,
    }),
  ]);

  if (businessResult.status === 'rejected') {
    console.error('Booking email failed:', businessResult.reason);
    return NextResponse.json({ error: 'Failed to send booking' }, { status: 500 });
  }

  if (confirmationResult.status === 'rejected') {
    console.error('Confirmation email failed:', confirmationResult.reason);
  }

  return NextResponse.json({ success: true, leadId: suiteResult.leadId }, { status: 201 });
}
