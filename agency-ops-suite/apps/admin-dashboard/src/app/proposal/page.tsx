import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProposalCard } from '@/components/ProposalCard';
import { listProposals } from '@/lib/proposal-service';

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const proposals = await listProposals(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Proposals</h1>
            <p className="text-slate-400">Manage and track your client proposals</p>
          </div>
          <Link
            href="/proposal/new"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700"
          >
            + New Proposal
          </Link>
        </div>

        {/* Content */}
        {!proposals || proposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-12">
              <h2 className="text-xl font-semibold text-white mb-2">No proposals yet</h2>
              <p className="text-slate-400 mb-6">Create your first proposal to get started</p>
              <Link
                href="/proposal/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 font-medium"
              >
                Create Proposal
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                id={proposal.id}
                projectName={proposal.project_name}
                prospectCompany={proposal.prospect_company}
                prospectName={proposal.prospect_name}
                scope={proposal.project_scope}
                estimatedCostLow={proposal.estimated_cost_low}
                estimatedCostHigh={proposal.estimated_cost_high}
                finalQuote={proposal.final_quote}
                status={proposal.status}
                createdAt={proposal.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
