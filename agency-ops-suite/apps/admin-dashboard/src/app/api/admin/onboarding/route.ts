import { NextResponse, NextRequest } from 'next/server';
import { requireAuth, formatAuthError, getClientIP } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { startOnboarding } from '@/lib/onboarding';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ip = await getClientIP();
    const body = await request.json();

    const name = String(body.name ?? '').trim();
    const businessType = String(body.businessType ?? '').trim();
    const domain = String(body.domain ?? '').trim();

    if (!name || !businessType || !domain) {
      return NextResponse.json({ error: 'missing_required_fields', details: 'name, businessType, and domain are required' }, { status: 400 });
    }

    const result = await startOnboarding({
      name,
      businessType,
      domain,
      plan: body.plan,
      packageName: body.packageName ?? body.package ?? body.plan,
      monthlyFee: body.monthlyFee ? Number(body.monthlyFee) : undefined,
      liveUrl: body.liveUrl,
      templateType: body.templateType,
      notes: body.notes,
      email: body.email,
      phone: body.phone,
      pages: body.pages,
    });

    const supabase = createServiceClient();
    try {
      await supabase.from('audit_logs').insert({
        entity_type: 'client',
        entity_id: result.client.id,
        action: 'admin_onboarding_started',
        summary: `Admin onboarding started for ${name}`,
        metadata: {
          clientId: result.client.id,
          userId: user.sub,
          userEmail: user.email,
          ip,
        },
      });
    } catch {
      // Non-blocking audit write.
    }

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error('[/api/admin/onboarding] POST error:', err);
    return NextResponse.json({ error: 'onboarding_failed', message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
