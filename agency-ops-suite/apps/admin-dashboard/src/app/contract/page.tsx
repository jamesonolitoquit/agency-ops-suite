import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ContractCard } from '@/components/ContractCard';
import { listContracts } from '@/lib/contract-service';

export default async function ContractsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const contracts = await listContracts(user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Contracts</h1>
          <p className="text-slate-400 mt-2">Manage and track service contracts</p>
        </div>
        <Link
          href="/contract/new"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700"
        >
          New Contract
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{contracts.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Drafts</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">
            {contracts.filter((c: any) => c.status === 'draft').length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Signed</p>
          <p className="text-3xl font-bold text-green-400 mt-1">
            {contracts.filter((c: any) => c.status === 'signed').length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">
            {contracts.filter((c: any) => c.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400 mb-4">No contracts yet</p>
          <Link
            href="/contract/new"
            className="inline-block px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 font-semibold"
          >
            Create Your First Contract
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {contracts.map((contract: any) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}
