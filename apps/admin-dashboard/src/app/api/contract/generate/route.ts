import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateContractFromProposal,
  createContract,
  listContracts,
  ContractType,
  ContractData,
} from '@/lib/contract-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { proposalId, contractType, includeNda, prospect_name, prospect_email, prospect_company, project_name } = body;

    // If generating from proposal
    if (proposalId) {
      if (!contractType) {
        return NextResponse.json({ error: 'Missing contract type' }, { status: 400 });
      }

      const result = await generateContractFromProposal({
        proposalId,
        contractType: contractType as ContractType,
        userId: user.id,
        includeNda: includeNda || false,
      });

      if (!result.success) {
        return NextResponse.json({ error: 'Proposal not found or not accepted' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        contractId: result.contractId,
        publicToken: result.publicToken,
        data: result.data,
      }, { status: 200 });
    }

    // Custom contract creation
    if (!prospect_name || !prospect_email || !prospect_company || !project_name || !contractType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contractData: ContractData = {
      contract_type: contractType as ContractType,
      prospect_name,
      prospect_email,
      prospect_company,
      project_name,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      end_date: body.end_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeline_weeks: body.timeline_weeks || 12,
      deliverables: body.deliverables || [],
      contract_cost_low: body.contract_cost_low || 0,
      contract_cost_high: body.contract_cost_high || 0,
      payment_terms: body.payment_terms || '50% upfront, 50% on completion',
      acceptance_criteria: body.acceptance_criteria || [],
      terms_and_conditions: body.terms_and_conditions || '',
      nda_included: body.nda_included || false,
    };

    const contract = await createContract(contractData, user.id);

    if (!contract) {
      return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      publicToken: contract.public_token,
      data: contract,
    }, { status: 200 });
  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const proposalId = url.searchParams.get('proposal_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const contracts = await listContracts(user.id, {
      status: status as any,
      proposal_id: proposalId || undefined,
      limit,
    });

    return NextResponse.json({
      contracts,
      total: contracts.length,
    }, { status: 200 });
  } catch (error) {
    console.error('List contracts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
