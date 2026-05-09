import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createContractVersion, ContractData } from '@/lib/contract-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { changes, reason } = body;

    if (!changes || !reason) {
      return NextResponse.json({ error: 'Missing changes or reason' }, { status: 400 });
    }

    const newVersion = await createContractVersion(
      id,
      changes as Partial<ContractData>,
      user.id,
      reason
    );

    if (!newVersion) {
      return NextResponse.json({ error: 'Contract not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contractId: newVersion.id,
      version: newVersion.version,
      data: newVersion,
    }, { status: 200 });
  } catch (error) {
    console.error('Create version error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
