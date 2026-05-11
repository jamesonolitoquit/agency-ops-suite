import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClientSession } from '@/lib/client-auth';
import { logClientAction } from '@/lib/client-actions';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  const body = await request.json();
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token || password.length < 8) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: role, error } = await supabase
    .from('client_roles')
    .select('client_id, user_email, user_name, role, invite_expires_at, status')
    .eq('invite_token', token)
    .single();

  if (error || !role) {
    return NextResponse.json({ error: 'invalid_invite' }, { status: 404 });
  }

  if (role.status === 'active') {
    return NextResponse.json({ error: 'invite_already_used' }, { status: 409 });
  }

  if (!role.invite_expires_at || new Date(role.invite_expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'invite_expired' }, { status: 410 });
  }

  const passwordHash = hashPassword(password);

  const { error: activateError } = await supabase
    .from('client_roles')
    .update({
      status: 'active',
      accepted_at: new Date().toISOString(),
      invite_token: null,
      password_hash: passwordHash,
    })
    .eq('invite_token', token);

  if (activateError) {
    return NextResponse.json({ error: 'invite_activation_failed', message: activateError.message }, { status: 500 });
  }

  await createClientSession(role.client_id, role.user_email, role.user_name ?? undefined);

  await logClientAction({
    clientId: role.client_id,
    userEmail: role.user_email,
    action: 'client_invite_accepted',
    metadata: { role: role.role },
  });

  return NextResponse.json({ ok: true });
}
