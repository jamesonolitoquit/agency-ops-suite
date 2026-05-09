import { NextResponse } from 'next/server';
import { createClientSession } from '@/lib/client-auth';
import { getClient } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/password';

/**
 * POST /api/client/login
 * Client login endpoint
 */
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await getClient();

    // Find client role by email
    const { data: role, error: roleError } = await supabase
      .from('client_roles')
      .select('*, clients(id, name), password_hash')
      .eq('user_email', email)
      .eq('status', 'active')
      .single();

    if (roleError || !role) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!role.password_hash || !verifyPassword(password, role.password_hash)) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const userAgent = request.headers.get('user-agent');
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = xForwardedFor?.split(',')[0] || 'unknown';

    await createClientSession(
      role.clients.id,
      email,
      role.user_name,
      ipAddress,
      userAgent || undefined
    );

    return NextResponse.json(
      { success: true, clientId: role.clients.id, message: 'Login successful' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
