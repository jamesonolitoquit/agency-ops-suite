import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getContractById,
  updateContractStatus,
  createContractVersion,
  ContractStatus,
} from '@/lib/contract-service';

export async function GET(
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

    const contract = await getContractById(id, user.id);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract }, { status: 200 });
  } catch (error) {
    console.error('Get contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { status, final_cost, payment_terms, prospect_name, prospect_email } = body;

    if (status) {
      // Validate status
      const validStatuses: ContractStatus[] = ['draft', 'sent', 'reviewed', 'signed', 'completed', 'declined'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const contract = await updateContractStatus(id, status, user.id, {
        final_cost,
        payment_terms,
      });

      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      return NextResponse.json({ contract }, { status: 200 });
    }

    // Update other fields
    const updateData: Record<string, any> = {};
    if (final_cost !== undefined) updateData.final_cost = final_cost;
    if (payment_terms) updateData.payment_terms = payment_terms;
    if (prospect_name) updateData.prospect_name = prospect_name;
    if (prospect_email) updateData.prospect_email = prospect_email;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract }, { status: 200 });
  } catch (error) {
    console.error('Update contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
