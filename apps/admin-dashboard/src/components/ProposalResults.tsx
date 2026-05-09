'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

interface Deliverable {
  name: string;
  hours: number;
  cost: number;
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
}

interface ProposalData {
  id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  project_name: string;
  project_scope: string;
  deliverables: Deliverable[];
  estimated_cost_low: number;
  estimated_cost_high: number;
  final_quote: number | null;
  status: ProposalStatus;
  public_token: string;
  created_at: string;
}

interface ProposalResultsProps {
  proposal: ProposalData;
  onStatusChange?: (newStatus: ProposalStatus) => void;
  isEditable?: boolean;
}

export function ProposalResults({ proposal, onStatusChange, isEditable = false }: ProposalResultsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  const statusColors: Record<ProposalStatus, string> = {
    draft: 'bg-slate-500',
    sent: 'bg-blue-500',
    accepted: 'bg-green-500',
    declined: 'bg-red-500',
  };

  async function handleStatusChange(newStatus: ProposalStatus) {
    setError('');
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/proposal/${proposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onStatusChange?.(newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
    }
  }

  function copyPublicLink() {
    const publicUrl = `${window.location.origin}/proposal/report/${proposal.public_token}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{proposal.project_name}</h2>
            <p className="text-slate-400">{proposal.prospect_company}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${statusColors[proposal.status]}`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-xs text-slate-400 mb-1">Contact</p>
            <p className="text-white font-medium">{proposal.prospect_name}</p>
            <p className="text-sm text-slate-400">{proposal.prospect_email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Scope</p>
            <p className="text-white font-medium">{proposal.project_scope}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Estimated Cost</p>
            <p className="text-accent-400 font-bold">
              ${proposal.estimated_cost_low.toLocaleString()} - ${proposal.estimated_cost_high.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Deliverables</h3>
        <div className="space-y-3">
          {proposal.deliverables.map((deliverable, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">{deliverable.name}</p>
                    <span className="px-2 py-0.5 rounded text-xs bg-accent-500/20 text-accent-300 capitalize">
                      {deliverable.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{deliverable.hours} hours</p>
                </div>
                <p className="text-accent-400 font-semibold">${deliverable.cost.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="rounded-lg border border-accent-500/20 bg-accent-500/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pricing Summary</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Estimated Range:</span>
            <span className="text-accent-300">
              ${proposal.estimated_cost_low.toLocaleString()} - ${proposal.estimated_cost_high.toLocaleString()}
            </span>
          </div>
          {proposal.final_quote && (
            <div className="flex justify-between text-sm border-t border-accent-500/20 pt-2">
              <span className="text-white font-semibold">Final Quote:</span>
              <span className="text-accent-400 font-bold">${proposal.final_quote.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sharing */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Share Proposal</h3>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/proposal/report/${proposal.public_token}`}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
          />
          <button
            type="button"
            onClick={copyPublicLink}
            className="px-4 py-2 rounded-lg border border-accent-500 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 font-medium"
          >
            {copiedToken ? '✓ Copied' : 'Copy Link'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Anyone with this link can view the proposal</p>
      </div>

      {/* Status Actions */}
      {isEditable && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <div className="flex gap-2 flex-wrap">
            {proposal.status === 'draft' && (
              <button
                type="button"
                onClick={() => handleStatusChange('sent')}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium disabled:opacity-50"
              >
                Send Proposal
              </button>
            )}
            {proposal.status === 'sent' && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium disabled:opacity-50"
                >
                  Mark Accepted
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('declined')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:opacity-50"
                >
                  Mark Declined
                </button>
              </>
            )}
          </div>
          {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
