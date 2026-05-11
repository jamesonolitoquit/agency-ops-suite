import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ProposalResults } from '@/components/ProposalResults';
import { createClient } from '@/lib/supabase/server';
import { getProposalById } from '@/lib/proposal-service';

interface Params {
  id: string;
}

export default async function ProposalDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const proposal = await getProposalById(id);

  if (!proposal || proposal.created_by !== user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/proposal" className="text-accent-400 hover:text-accent-300 mb-4 inline-flex items-center gap-1">
            ← Back to Proposals
          </Link>
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
          isEditable={true}
        />
      </div>
    </div>
  );
}
