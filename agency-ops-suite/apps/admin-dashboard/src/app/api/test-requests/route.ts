import { NextResponse } from "next/server";
import { info } from '@/lib/server-logger';
import { createRequestRecord, listRequests, updateRequestRecord } from '@/lib/agency-db';

function toRequestShape(request: any) {
  return {
    id: request.id,
    clientId: request.client_id,
    clientName: request.clients?.name ?? '',
    type: request.title,
    description: request.description,
    priority: request.priority,
    status: request.status === 'done' ? 'completed' : request.status === 'pending' ? 'new' : request.status,
    createdAt: request.created_at,
    completedAt: request.completed_at,
    notes: Array.isArray(request.notes) ? request.notes : [],
  };
}

export async function GET() {
  const requests = await listRequests();
  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'pending' || r.status === 'new').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'done' || r.status === 'completed').length,
    on_hold: requests.filter(r => r.status === 'on_hold').length,
  };

  return NextResponse.json({
    requests: requests.map(toRequestShape),
    stats,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, clientName, type = 'general', description, priority = 'medium' } = body;

  if (!clientId || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const req = await createRequestRecord({
    clientId,
    clientName,
    type,
    description,
    priority,
  });

  await info(`Client request created: ${clientName}`, { type, priority });

  return NextResponse.json({
    ok: true,
    request: toRequestShape({ ...req, clients: { name: clientName } }),
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const req = await updateRequestRecord(id, { status: status === 'completed' ? 'done' : status, notes });

  await info(`Request updated: ${req.id} → ${req.status}`);

  return NextResponse.json({
    ok: true,
    request: toRequestShape(req),
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('id');

  if (!requestId) {
    return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
  }

  const { error } = await (await import('@/lib/supabase')).supabase.from('client_requests').delete().eq('id', requestId);
  if (error) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
