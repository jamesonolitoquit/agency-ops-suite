import { NextResponse } from 'next/server';
import { buildOperationalReport } from '@/lib/report';
import { generateClientReportHTML } from '@/lib/report-generator';
import { getReportRunById } from '@/lib/db';
import { getClientById, getDeploymentChecklist, getRequestCountByClient, getOverdueBilling } from '@/lib/agency-db';

function renderOperationalReportHTML(report: Awaited<ReturnType<typeof buildOperationalReport>>) {
  const topClients = report.topClients
    .map((client) => `<li><strong>${client.name}</strong> <span>(${client.status})</span> - $${client.monthlyFee.toLocaleString()}</li>`)
    .join('');
  const recentContent = report.recentContent
    .map((entry) => `<li><strong>${entry.businessType}</strong> in ${entry.location} - ${entry.offer}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agency Ops Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f6f8; color: #111827; }
    .wrap { max-width: 900px; margin: 0 auto; padding: 32px 20px; }
    .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08); margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .value { font-size: 28px; font-weight: 700; margin-top: 8px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Agency Ops Report</h1>
      <p>Generated ${new Date(report.generatedAt).toLocaleString()}</p>
      <p>Window: ${report.windowLabel}</p>
    </div>

    <div class="grid">
      <div class="metric"><div class="label">Active clients</div><div class="value">${report.metrics.activeClients}</div></div>
      <div class="metric"><div class="label">Monthly revenue</div><div class="value">$${report.metrics.monthlyRevenue.toLocaleString()}</div></div>
      <div class="metric"><div class="label">Pending payments</div><div class="value">${report.metrics.pendingPayments}</div></div>
      <div class="metric"><div class="label">Open requests</div><div class="value">${report.metrics.openRequests}</div></div>
      <div class="metric"><div class="label">Lead count</div><div class="value">${report.metrics.leadCount}</div></div>
      <div class="metric"><div class="label">Content outputs</div><div class="value">${report.metrics.contentOutputs}</div></div>
    </div>

    <div class="card">
      <h2>Billing</h2>
      <p>Paid: ${report.billing.paid} | Unpaid: ${report.billing.unpaid}</p>
    </div>

    <div class="card">
      <h2>Top Clients</h2>
      <ul>${topClients || '<li>No client data</li>'}</ul>
    </div>

    <div class="card">
      <h2>Recent Content</h2>
      <ul>${recentContent || '<li>No saved content</li>'}</ul>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportRunId = searchParams.get('reportRunId');
  const clientId = searchParams.get('client_id');
  const format = (searchParams.get('format') || 'html').toLowerCase();

  try {
    if (reportRunId) {
      const reportRun = await getReportRunById(reportRunId);

      if (!reportRun) {
        return NextResponse.json({ error: 'Report run not found' }, { status: 404 });
      }

      if (reportRun.reportSnapshot) {
        if (format === 'json') {
          return NextResponse.json({ ok: true, report: reportRun.reportSnapshot, reportRunId: reportRun.id });
        }

        const html = renderOperationalReportHTML(reportRun.reportSnapshot as Awaited<ReturnType<typeof buildOperationalReport>>);
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="report-${reportRun.id}.html"`,
          },
        });
      }

      if (reportRun.clientId) {
        const clientId = reportRun.clientId;
        const client = await getClientById(clientId);
        if (!client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const checklist = await getDeploymentChecklist(clientId);
        const requestCount = await getRequestCountByClient(clientId);
        const billingRecords = await getOverdueBilling();
        const clientBillingDue = billingRecords
          .filter((b) => b.clientId === clientId && !b.paid)
          .reduce((sum, b) => sum + b.amount, 0);

        const reportData = {
          clientId: client.id,
          clientName: client.name,
          domain: client.domain,
          plan: client.plan,
          monthlyFee: client.monthlyFee,
          status: client.status,
          reportPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          generatedAt: reportRun.generatedAt,
          deploymentReadiness: {
            ready: client.readyForDeploy,
            liveUrl: client.liveUrl || `https://${client.domain}`,
          },
          operationalMetrics: {
            requestsCompleted: 0,
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
          return new NextResponse(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Content-Disposition': `attachment; filename="${client.name.toLowerCase().replace(/\s+/g, '-')}-report-${reportRun.id}.html"`,
            },
          });
        }

        return NextResponse.json({ ok: true, report: reportData, reportRunId: reportRun.id });
      }

      return NextResponse.json({ error: 'Report run does not have export data' }, { status: 404 });
    }

    if (!clientId) {
      const report = await buildOperationalReport();

      if (format === 'html') {
        const html = renderOperationalReportHTML(report);
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': 'attachment; filename="agency-ops-report.html"',
          },
        });
      }

      return NextResponse.json({ ok: true, report });
    }

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
