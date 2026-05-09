import { cookies } from 'next/headers';
import { getClient } from './supabase/server';

const CLIENT_AUTH_COOKIE = 'client_auth_token';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ClientAuthSession {
  clientId: string;
  userEmail: string;
  userName?: string;
  role: 'admin' | 'viewer' | 'uploader';
  expiresAt: Date;
}

/**
 * Create a client authentication session
 */
export async function createClientSession(
  clientId: string,
  userEmail: string,
  userName?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<ClientAuthSession> {
  const supabase = await getClient();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const authToken = generateAuthToken();

  // Get client role
  const { data: roleData } = await supabase
    .from('client_roles')
    .select('role')
    .eq('client_id', clientId)
    .eq('user_email', userEmail)
    .eq('status', 'active')
    .single();

  if (!roleData) {
    throw new Error('User not authorized for this client');
  }

  // Create session in database
  const { error } = await supabase.from('client_sessions').insert([
    {
      client_id: clientId,
      user_email: userEmail,
      auth_token: authToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    },
  ]);

  if (error) throw error;

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(CLIENT_AUTH_COOKIE, authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return {
    clientId,
    userEmail,
    userName,
    role: roleData.role,
    expiresAt,
  };
}

/**
 * Get current client session from cookie
 */
export async function getCurrentClientSession(): Promise<ClientAuthSession | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(CLIENT_AUTH_COOKIE)?.value;

  if (!authToken) return null;

  const supabase = await getClient();

  // Look up session
  const { data: session, error } = await supabase
    .from('client_sessions')
    .select('*, client_roles!inner(role)')
    .eq('auth_token', authToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  // Update last activity
  await supabase
    .from('client_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', session.id);

  return {
    clientId: session.client_id,
    userEmail: session.user_email,
    role: session.client_roles.role,
    expiresAt: new Date(session.expires_at),
  };
}

/**
 * Verify client authorization for resource
 */
export async function verifyClientAccess(
  clientId: string,
  requiredRole?: 'admin' | 'viewer' | 'uploader'
): Promise<boolean> {
  const session = await getCurrentClientSession();

  if (!session || session.clientId !== clientId) {
    return false;
  }

  if (requiredRole) {
    const roleHierarchy = { admin: 3, uploader: 2, viewer: 1 };
    const sessionRoleLevel = roleHierarchy[session.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (sessionRoleLevel < requiredRoleLevel) {
      return false;
    }
  }

  return true;
}

/**
 * Clear client session
 */
export async function clearClientSession() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(CLIENT_AUTH_COOKIE)?.value;

  if (authToken) {
    const supabase = await getClient();
    await supabase
      .from('client_sessions')
      .update({ expires_at: new Date().toISOString() })
      .eq('auth_token', authToken);
  }

  cookieStore.delete(CLIENT_AUTH_COOKIE);
}

/**
 * Generate random auth token
 */
function generateAuthToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Send client invite email
 */
export async function sendClientInviteEmail(
  clientId: string,
  clientName: string,
  userEmail: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/join?token=${inviteToken}`;

  try {
    const { sendEmail } = await import('./email-templates');
    await sendEmail(userEmail, {
      subject: `You're invited to ${clientName}'s portal`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; max-width: 600px;">
          <h1>Portal Invitation</h1>
          <p>You've been invited to access ${clientName}'s portal on Agency Ops Suite.</p>
          <p>
            <a href="${inviteUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">This link expires in 7 days.</p>
        </div>
      `,
      text: `You've been invited to ${clientName}'s portal.\n\nAccept: ${inviteUrl}`,
    });
  } catch (e) {
    console.error('Failed to send invite email:', e);
    throw e;
  }
}
