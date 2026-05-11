import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProposalResults } from '@/components/ProposalResults';

interface Params {
  token: string;
}

export default async function PublicProposalPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const supabase = await createClient();

  // Use service role for public access
  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .eq('is_public', true)
    .single();

  if (!proposal) {
    notFound();
  }

  // Log the view
  await supabase
    .from('proposal_audit_log')
    .insert({
      proposal_id: proposal.id,
      action: 'view',
      prospect_ip: '',
      details: { public_view: true },
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Proposal</h1>
          <p className="text-slate-400">Shared proposal - view only</p>
        </div>

        {/* Proposal */}
        <ProposalResults
          proposal={{
            id: proposal.id,
            prospect_name: proposal.prospect_name,
            prospect_email: proposal.prospect_email,
            prospect_company: proposal.prospect_company,
            project_name: proposal.project_name,
            project_scope: proposal.project_scope,
            deliverables: proposal.deliverables,
            estimated_cost_low: proposal.estimated_cost_low,
            estimated_cost_high: proposal.estimated_cost_high,
            final_quote: proposal.final_quote,
            status: proposal.status,
            public_token: proposal.public_token,
            created_at: proposal.created_at,
          }}
          isEditable={false}
        />
      </div>
    </div>
  );
}
