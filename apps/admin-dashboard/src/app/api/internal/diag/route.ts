export async function GET(request: Request) {
  const header = request.headers.get('x-diagnostics-secret') || '';
  const required = [
    'INTAKE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  if (!process.env.DIAGNOSTICS_SECRET) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'DIAGNOSTICS_SECRET not configured on server',
    }), { status: 500, headers: { 'content-type': 'application/json' } });
  }

  if (header !== process.env.DIAGNOSTICS_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  const missing = required.filter((k) => !process.env[k] || process.env[k] === '');

  return new Response(JSON.stringify({ ok: missing.length === 0, missing }), {
    status: missing.length === 0 ? 200 : 500,
    headers: { 'content-type': 'application/json' },
  });
}
