import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from 'react-email';
import AuditReportEmail from '../../../emails/AuditReport';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, auditData } = await req.json();

  if (!email || !auditData) {
    return NextResponse.json({ error: 'Missing email or audit data' }, { status: 400 });
  }

  const { url, pagespeed, headers, mixedContent, images, brokenLinks } = auditData;
  const scores = pagespeed.mobile;
  const passedHeaders = Object.values(headers as Record<string, boolean>).filter(Boolean).length;
  const totalHeaders = Object.values(headers as Record<string, boolean>).length;

  const html = await render(
    AuditReportEmail({
      url,
      performance: scores.performance,
      seo: scores.seo,
      accessibility: scores.accessibility,
      bestPractices: scores.bestPractices,
      brokenLinks: brokenLinks.broken.length,
      mixedContentIssues: mixedContent.issues?.length ?? 0,
      passedHeaders,
      totalHeaders,
      imageIssues: (images.missingAlt?.length ?? 0) + (images.emptyAlt?.length ?? 0),
    })
  );

  const { error } = await resend.emails.send({
    from: 'Deploy Hub <noreply@jeremiahmagdael.com>',
    to: email,
    subject: `Your Deploy Check Report — ${url}`,
    html,
  });

  if (error) {
    console.error('Send report error:', error);
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
