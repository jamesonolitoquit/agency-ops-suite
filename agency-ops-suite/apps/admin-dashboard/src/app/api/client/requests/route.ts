import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentClientSession } from '@/lib/client-auth';
import { logClientAction } from '@/lib/client-actions';

export async function GET() {
  const session = await getCurrentClientSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('client_requests')
    .select('*')
    .eq('client_id', session.clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'requests_fetch_failed', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, requests: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getCurrentClientSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const priority = typeof body.priority === 'string' ? body.priority : 'medium';

  if (!title) {
    return NextResponse.json({ error: 'invalid_title' }, { status: 400 });
  }

  if (!['low', 'medium', 'high'].includes(priority)) {
    return NextResponse.json({ error: 'invalid_priority' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('client_requests')
    .insert([
      {
        client_id: session.clientId,
        title,
        description: description || null,
        priority,
        created_by_email: session.userEmail,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'request_create_failed', message: error.message }, { status: 500 });
  }

  await logClientAction({
    clientId: session.clientId,
    userEmail: session.userEmail,
    action: 'client_request_created',
    entityType: 'client_request',
    entityId: data.id,
    metadata: { priority, title },
  });

  return NextResponse.json({ ok: true, request: data });
}
