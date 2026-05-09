import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from 'react-email';
import BusinessNotification from '../../../emails/BusinessNotification';
import UserConfirmation from '../../../emails/UserConfirmation';
import { forwardLeadToSuite } from '../../../lib/suite-intake';

type LeadPayload = {
  name?: string;
  email?: string;
  businessName?: string;
  serviceNeeded?: string;
  budgetRange?: string;
  projectDetails?: string;
  honeypot?: string;
};

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const businessName = body.businessName?.trim() ?? '';
  const serviceNeeded = body.serviceNeeded?.trim() ?? '';
  const budgetRange = body.budgetRange?.trim() ?? '';
  const projectDetails = body.projectDetails?.trim() ?? '';

  if (!name || !email || !serviceNeeded || !budgetRange || !projectDetails) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
  }

  const suiteResult = await forwardLeadToSuite({
    name,
    businessType: serviceNeeded,
    email,
    message: [
      `Business name: ${businessName || 'Not provided'}`,
      `Budget range: ${budgetRange}`,
      `Project details: ${projectDetails}`,
    ].join('\n'),
    source: 'deployhub-contact-form',
  });

  if (suiteResult.error) {
    return NextResponse.json(
      { error: suiteResult.error, message: suiteResult.message || 'Unable to submit lead.' },
      { status: 503 }
    );
  }

  const businessHtml = await render(
    BusinessNotification({
      fromName: name,
      fromEmail: email,
      businessName: businessName || 'Not provided',
      serviceNeeded,
      budgetRange,
      projectDetails,
    })
  );

  const confirmationHtml = await render(
    UserConfirmation({
      fromName: name,
      serviceNeeded,
      budgetRange,
      projectDetails,
    })
  );

  const [businessResult, confirmationResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: 'deployhubph@gmail.com',
      subject: `New Inquiry from ${name}`,
      html: businessHtml,
      replyTo: email,
    }),
    resend.emails.send({
      from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
      to: email,
      subject: "We've received your inquiry — Deploy Hub",
      html: confirmationHtml,
    }),
  ]);

  if (businessResult.status === 'rejected') {
    const msg = businessResult.reason instanceof Error ? businessResult.reason.message : JSON.stringify(businessResult.reason);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (confirmationResult.status === 'rejected') {
    console.error('Confirmation email failed:', confirmationResult.reason);
  }

  return NextResponse.json({ success: true, leadId: suiteResult.leadId }, { status: 201 });
}
