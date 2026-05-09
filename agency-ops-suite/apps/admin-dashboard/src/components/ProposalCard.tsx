'use client';

import React from 'react';
import Link from 'next/link';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

interface ProposalCardProps {
  id: string;
  projectName: string;
  prospectCompany: string;
  prospectName: string;
  scope: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  finalQuote: number | null;
  status: ProposalStatus;
  createdAt: string;
}

export function ProposalCard({
  id,
  projectName,
  prospectCompany,
  prospectName,
  scope,
  estimatedCostLow,
  estimatedCostHigh,
  finalQuote,
  status,
  createdAt,
}: ProposalCardProps) {
  const statusColors: Record<ProposalStatus, { bg: string; text: string; dot: string }> = {
    draft: { bg: 'bg-slate-500/10', text: 'text-slate-300', dot: 'bg-slate-500' },
    sent: { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-500' },
    accepted: { bg: 'bg-green-500/10', text: 'text-green-300', dot: 'bg-green-500' },
    declined: { bg: 'bg-red-500/10', text: 'text-red-300', dot: 'bg-red-500' },
  };

  const colors = statusColors[status];
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/proposal/${id}`}>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/8 transition cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-accent-300 transition">{projectName}</h3>
            <p className="text-sm text-slate-400">{prospectCompany}</p>
            <p className="text-xs text-slate-500 mt-1">{prospectName}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
          <div>
            <p className="text-xs text-slate-500">Scope</p>
            <p className="text-slate-200 font-medium">{scope}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Cost Range</p>
            <p className="text-accent-400 font-semibold">
              ${estimatedCostLow.toLocaleString()} - ${estimatedCostHigh.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Quote</p>
            <p className="text-accent-300 font-semibold">
              {finalQuote ? `$${finalQuote.toLocaleString()}` : 'Pending'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500">{formattedDate}</p>
      </div>
    </Link>
  );
}
