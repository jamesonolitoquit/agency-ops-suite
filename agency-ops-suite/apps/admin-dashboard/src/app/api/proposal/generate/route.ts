import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateProposalFromAudit,
  createProposal,
  listProposals,
  type GenerateProposalParams,
  type ProposalScope,
} from '@/lib/proposal-service';

// POST /api/proposal/generate - Generate proposal from audit
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { auditId, scope, prospectName, prospectEmail, prospectCompany, projectName } = body;

    // Validate required fields
    if (!auditId || !scope || !prospectName || !prospectEmail || !prospectCompany) {
      return NextResponse.json(
        { error: 'Missing required fields: auditId, scope, prospectName, prospectEmail, prospectCompany' },
        { status: 400 }
      );
    }

    // Validate scope
    if (!['Basic', 'Standard', 'Premium', 'Custom'].includes(scope)) {
      return NextResponse.json(
        { error: 'Invalid scope. Must be one of: Basic, Standard, Premium, Custom' },
        { status: 400 }
      );
    }

    // Generate proposal
    const result = await generateProposalFromAudit({
      auditId,
      scope: scope as ProposalScope,
      prospectName,
      prospectEmail,
      prospectCompany,
      projectName,
      userId: user.id,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}

// GET /api/proposal - List user's proposals
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposals = await listProposals(user.id);

    return NextResponse.json({ proposals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
