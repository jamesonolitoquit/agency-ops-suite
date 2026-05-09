import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendClientInviteEmail } from '@/lib/client-auth';

export async function POST(request: Request) {
  const body = await request.json();
  const clientId = typeof body.clientId === 'string' ? body.clientId : '';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail.trim().toLowerCase() : '';
  const userName = typeof body.userName === 'string' ? body.userName.trim() : null;
  const role = typeof body.role === 'string' ? body.role : 'viewer';

  if (!clientId || !userEmail || !['admin', 'viewer', 'uploader'].includes(role)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
  }

  const inviteToken = randomBytes(24).toString('hex');
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: upsertError } = await supabase.from('client_roles').upsert(
    {
      client_id: clientId,
      user_email: userEmail,
      user_name: userName,
      role,
      status: 'pending',
      invite_token: inviteToken,
      invite_expires_at: inviteExpiresAt,
    },
    { onConflict: 'client_id,user_email' }
  );

  if (upsertError) {
    return NextResponse.json({ error: 'invite_save_failed', message: upsertError.message }, { status: 500 });
  }

  try {
    await sendClientInviteEmail(clientId, client.name, userEmail, inviteToken);
  } catch (err: any) {
    return NextResponse.json({ error: 'invite_email_failed', message: err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inviteExpiresAt });
}
