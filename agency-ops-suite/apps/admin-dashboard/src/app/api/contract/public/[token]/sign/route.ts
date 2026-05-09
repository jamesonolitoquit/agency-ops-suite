import { NextRequest, NextResponse } from 'next/server';
import { signContract } from '@/lib/contract-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { signature } = body;

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const result = await signContract({
      token,
      signature_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      signature_user_agent: req.headers.get('user-agent') || 'unknown',
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Contract not found or already signed' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        signed_at: result.signedAt,
        message: 'Contract signed successfully. Thank you!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
