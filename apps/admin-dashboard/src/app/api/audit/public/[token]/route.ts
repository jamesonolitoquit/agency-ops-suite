import { NextRequest, NextResponse } from 'next/server';
import { getPublicAudit } from '@/lib/audit-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Fetch public audit (no auth required)
    const audit = await getPublicAudit(token);

    return NextResponse.json({ audit }, { status: 200 });
  } catch (error) {
    console.error('Error fetching public audit:', error);
    return NextResponse.json(
      { error: 'Audit not found' },
      { status: 404 }
    );
  }
}
