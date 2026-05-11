import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublicContract, logContractAction } from '@/lib/contract-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const contract = await getPublicContract(token);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Log the view
    await logContractAction({
      contract_id: contract.id,
      action: 'viewed_public',
      prospect_ip: req.headers.get('x-forwarded-for') || 'unknown',
      details: {
        user_agent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer'),
      },
    });

    return NextResponse.json({ contract }, { status: 200 });
  } catch (error) {
    console.error('Get public contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
