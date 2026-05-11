import { NextResponse } from 'next/server';

export function requireAdmin(request: Request) {
  const bypass = process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true';
  if (bypass) return; // dev allow

  const configured = (process.env.ADMIN_DOWNLOAD_SECRET || '').trim();
  const provided = request.headers.get('x-admin-secret') || '';

  if (!configured) {
    throw NextResponse.json({ error: 'admin_secret_not_configured' }, { status: 500 });
  }

  if (provided !== configured) {
    throw NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

export function isAdmin(request: Request) {
  try {
    requireAdmin(request);
    return true;
  } catch {
    return false;
  }
}
