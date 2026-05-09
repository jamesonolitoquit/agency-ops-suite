import { NextRequest, NextResponse } from 'next/server';
import { getPublicProposal, logProposalAction } from '@/lib/proposal-service';

// GET /api/proposal/public/[token] - Fetch public proposal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Log the view
    try {
      const proposal = await getPublicProposal(token);
      if (proposal) {
        await logProposalAction(proposal.id, 'viewed');
      }
    } catch {
      // Ignore logging errors
    }

    const proposal = await getPublicProposal(token);

    return NextResponse.json({ proposal }, { status: 200 });
  } catch (error) {
    console.error('Error fetching public proposal:', error);
    return NextResponse.json(
      { error: 'Proposal not found' },
      { status: 404 }
    );
  }
}
