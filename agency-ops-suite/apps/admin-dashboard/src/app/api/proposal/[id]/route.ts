import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProposalById, updateProposal, updateProposalStatus } from '@/lib/proposal-service';
import type { ProposalStatus } from '@/lib/proposal-service';

// GET /api/proposal/[id] - Fetch specific proposal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposal = await getProposalById(id);

    // Verify ownership
    if (proposal.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ proposal }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Proposal not found' },
      { status: 404 }
    );
  }
}

// PATCH /api/proposal/[id] - Update proposal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingProposal = await getProposalById(id);
    if (existingProposal.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, final_quote, prospect_name, prospect_email, prospect_company, project_name, deliverables } = body;

    const updates: any = {};
    if (status) updates.status = status;
    if (final_quote) updates.final_quote = final_quote;
    if (prospect_name) updates.prospect_name = prospect_name;
    if (prospect_email) updates.prospect_email = prospect_email;
    if (prospect_company) updates.prospect_company = prospect_company;
    if (project_name) updates.project_name = project_name;
    if (deliverables) updates.deliverables = deliverables;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedProposal = await updateProposal(id, updates);

    return NextResponse.json({ proposal: updatedProposal }, { status: 200 });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
