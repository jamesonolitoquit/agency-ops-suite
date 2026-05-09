import { NextResponse } from "next/server";
import { info } from '@/lib/server-logger';
import { createProvisioningRunRecord, listProvisioningRuns, updateProvisioningRunRecord } from '@/lib/agency-db';

export async function GET() {
  const runs = await listProvisioningRuns();
  return NextResponse.json({
    runs,
    count: runs.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, clientName, pages = ['index', 'about', 'services', 'contact'], template = 'default', domain, liveUrl } = body;

  if (!clientId || !clientName) {
    return NextResponse.json({ error: 'Client ID and name required' }, { status: 400 });
  }

  try {
    const run = await createProvisioningRunRecord({ clientId, template, domain, liveUrl, pages });
    await info(`Provisioning completed: ${clientName}`, { runId: run.id, pages, outputPath: run.outputPath });
    return NextResponse.json({ ok: true, run }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : typeof error === 'object' ? JSON.stringify(error) : String(error);
    await info(`Provisioning failed: ${clientName}`, { clientId, error: message });
    return NextResponse.json(
      { error: 'Provisioning failed', details: message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, errorMessage, httpCheckPassed, outputPath } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Provisioning run not found' }, { status: 404 });
  }

  try {
    const run = await updateProvisioningRunRecord(id, {
      status,
      errorMessage,
      httpCheckPassed,
      outputPath,
    });
    return NextResponse.json({ ok: true, run });
  } catch {
    return NextResponse.json({ error: 'Provisioning run not found' }, { status: 404 });
  }
}
