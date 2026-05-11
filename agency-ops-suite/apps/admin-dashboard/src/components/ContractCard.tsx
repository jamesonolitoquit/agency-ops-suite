'use client';

import Link from 'next/link';

export interface ContractCardProps {
  contract: {
    id: string;
    contract_number: string;
    prospect_name: string;
    prospect_company: string;
    project_name: string;
    status: 'draft' | 'sent' | 'reviewed' | 'signed' | 'completed' | 'declined' | 'archived';
    contract_cost_low: number;
    contract_cost_high: number;
    created_at: string;
    signed_at?: string;
  };
}

export function ContractCard({ contract }: ContractCardProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-300',
    sent: 'bg-blue-500/20 text-blue-300',
    reviewed: 'bg-amber-500/20 text-amber-300',
    signed: 'bg-green-500/20 text-green-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    declined: 'bg-rose-500/20 text-rose-300',
    archived: 'bg-gray-500/20 text-gray-300',
  };

  return (
    <Link href={`/contract/${contract.id}`}>
      <div className="group rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold group-hover:text-accent-400 transition">
              {contract.contract_number}
            </h3>
            <p className="text-sm text-slate-400">{contract.project_name}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${statusColors[contract.status]}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <p className="text-slate-500">Client</p>
            <p className="text-white">{contract.prospect_name}</p>
            <p className="text-xs text-slate-400">{contract.prospect_company}</p>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-xs text-slate-500">Contract Value</p>
              <p className="text-accent-400 font-semibold">
                ${contract.contract_cost_low.toLocaleString()} - ${contract.contract_cost_high.toLocaleString()}
              </p>
            </div>
            {contract.signed_at ? (
              <div className="text-right">
                <p className="text-xs text-green-500 font-medium">Signed</p>
                <p className="text-xs text-slate-400">{new Date(contract.signed_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-xs text-slate-400">{new Date(contract.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
