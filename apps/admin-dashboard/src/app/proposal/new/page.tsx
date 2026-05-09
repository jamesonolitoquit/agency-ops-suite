import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProposalForm } from '@/components/ProposalForm';

export default async function NewProposalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/proposal" className="text-accent-400 hover:text-accent-300 mb-4 inline-flex items-center gap-1">
            ← Back to Proposals
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Proposal</h1>
          <p className="text-slate-400">Generate a professional proposal from an audit in 4 simple steps</p>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-2xl mb-2">📋</p>
            <h3 className="font-semibold text-white mb-1">Select Audit</h3>
            <p className="text-sm text-slate-400">Choose from your existing website audits</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-2xl mb-2">🎯</p>
            <h3 className="font-semibold text-white mb-1">Choose Scope</h3>
            <p className="text-sm text-slate-400">Select Basic, Standard, Premium, or Custom</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-2xl mb-2">👤</p>
            <h3 className="font-semibold text-white mb-1">Client Info</h3>
            <p className="text-sm text-slate-400">Enter prospect and project details</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-8">
          <ProposalForm />
        </div>
      </div>
    </div>
  );
}
