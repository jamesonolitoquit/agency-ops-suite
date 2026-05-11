import { NextResponse } from 'next/server';
import { startOnboarding } from '@/lib/onboarding';

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    console.error('[/api/test-onboarding] POST error:', error);
    return NextResponse.json({ error: 'onboarding_failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
