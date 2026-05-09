import { NextResponse } from 'next/server';
import { generateClientReportHTML } from '@/lib/report-generator';
import { getClientById, getDeploymentChecklist, getRequestCountByClient, getOverdueBilling } from '@/lib/agency-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const format = (searchParams.get('format') || 'html').toLowerCase();

  // If no client specified, return an error
  if (!clientId) {
    return NextResponse.json({ error: 'client_id parameter required' }, { status: 400 });
  }

  try {
    // Fetch client data
    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch deployment checklist
    const checklist = await getDeploymentChecklist(clientId);

    // Fetch request counts
    const requestCount = await getRequestCountByClient(clientId);

    // Fetch billing info
    const billingRecords = await getOverdueBilling();
    const clientBillingDue = billingRecords
      .filter((b) => b.clientId === clientId && !b.paid)
      .reduce((sum, b) => sum + b.amount, 0);

    // Generate report data
    const reportData = {
      clientId: client.id,
      clientName: client.name,
      domain: client.domain,
      plan: client.plan,
      monthlyFee: client.monthlyFee,
      status: client.status,
      reportPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      generatedAt: new Date().toISOString(),
      deploymentReadiness: {
        ready: client.readyForDeploy,
        liveUrl: client.liveUrl || `https://${client.domain}`,
      },
      operationalMetrics: {
        requestsCompleted: 0, // Would come from completed request history
        requestsPending: requestCount || 0,
        upcomingBillingDue: clientBillingDue,
      },
      deploymentChecklist: {
        domainConnected: checklist?.domainConnected ?? false,
        sslActive: checklist?.sslActive ?? false,
        ctaWorks: checklist?.ctaWorks ?? false,
        mobileResponsive: checklist?.mobileResponsive ?? false,
        seoMetaTags: checklist?.seoMetaTags ?? false,
        completionPercent: checklist?.completionPercent ?? 0,
      },
    };

    if (format === 'html') {
      const html = generateClientReportHTML(reportData);
      const fileName = `${client.name.toLowerCase().replace(/\s+/g, '-')}-report-${Date.now()}.html`;
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // JSON format (default)
    return NextResponse.json({ ok: true, report: reportData });
  } catch (error) {
    console.error('[report/export] error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
