import { NextResponse } from "next/server";
import { info } from '@/lib/server-logger';
import { createReportRecord, listReports } from '@/lib/agency-db';

function toReportShape(report: any, clientName = '') {
  return {
    id: report.id,
    clientId: report.client_id,
    clientName,
    reportType: report.report_type ?? 'monthly_summary',
    period: report.period_label ?? '',
    metrics: {
      uptime: 0,
      avgResponseTime: 0,
      totalRequests: report.requests_completed ?? 0,
      completedRequests: report.requests_completed ?? 0,
      issues: 0,
      revenue: 0,
    },
    summary: report.summary ?? '',
    generatedAt: report.generated_at,
    exportFormat: report.export_format ?? 'json',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  const reports = await listReports(clientId ?? undefined);

  return NextResponse.json({
    reports: reports.map((report) => toReportShape(report)),
    count: reports.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, clientName, reportType = 'monthly_summary', period = 'April 2026', exportFormat = 'json' } = body;

  if (!clientId || !clientName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const report = await createReportRecord({
    clientId,
    period,
    reportType,
    exportFormat,
  });

  await info(`Report generated: ${clientName}`, { reportType, period });

  return NextResponse.json({
    ok: true,
    report: toReportShape(report, clientName),
  }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('id');

  if (!reportId) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
  }

  const { error } = await (await import('@/lib/supabase')).supabase.from('reports').delete().eq('id', reportId);
  if (error) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
