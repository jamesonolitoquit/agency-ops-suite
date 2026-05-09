'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface Contract {
  id: string;
  contract_number: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  project_name: string;
  status: 'draft' | 'sent' | 'reviewed' | 'signed' | 'completed' | 'declined' | 'archived';
  contract_cost_low: number;
  contract_cost_high: number;
  start_date: string;
  end_date: string;
  created_at: string;
  signed_at?: string;
  public_token: string;
  signature?: any;
  deliverables: any[];
}

interface ContractResultsProps {
  contract: Contract;
  isPublic?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export function ContractResults({ contract, isPublic = false, onStatusChange }: ContractResultsProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/contract/report/${contract.public_token}`;
  const signUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/contract/public/${contract.public_token}/sign`;

  function copyToClipboard() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateStatus(newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/contract/${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      onStatusChange?.(newStatus);
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  }

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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{contract.contract_number}</h1>
            <p className="text-slate-400">{contract.project_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[contract.status]}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Client</p>
            <p className="text-white font-medium">{contract.prospect_name}</p>
            <p className="text-sm text-slate-400">{contract.prospect_company}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Timeline</p>
            <p className="text-white font-medium">
              {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Contract Value</p>
            <p className="text-accent-400 font-semibold">
              ${contract.contract_cost_low.toLocaleString()} - ${contract.contract_cost_high.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Created</p>
            <p className="text-white font-medium">{new Date(contract.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      {contract.deliverables && contract.deliverables.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Deliverables</h2>
          <div className="space-y-2">
            {contract.deliverables.map((deliverable: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium">{deliverable.name || deliverable.title}</p>
                  {deliverable.description && (
                    <p className="text-sm text-slate-400 mt-1">{deliverable.description}</p>
                  )}
                  {deliverable.timeline && (
                    <p className="text-xs text-slate-500 mt-1">Timeline: {deliverable.timeline}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Section */}
      {!isPublic && !contract.signature && contract.status !== 'signed' && (
        <div className="rounded-lg border border-accent-500/20 bg-accent-500/10 p-6">
          <h3 className="text-lg font-semibold text-accent-300 mb-2">Ready for Signature</h3>
          <p className="text-sm text-slate-400 mb-4">
            Share the signing link with your client to collect e-signature
          </p>
          <Link
            href={signUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold hover:shadow-lg"
          >
            View Signing Page
          </Link>
        </div>
      )}

      {contract.signature && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6">
          <h3 className="text-lg font-semibold text-green-300 mb-2">Contract Signed</h3>
          <div className="text-sm text-slate-400 space-y-1">
            <p>Signed by: {contract.signature.signed_by || 'Client'}</p>
            <p>Date: {new Date(contract.signature.signed_at).toLocaleString()}</p>
            {contract.signature.signature_ip && (
              <p>IP Address: {contract.signature.signature_ip}</p>
            )}
          </div>
        </div>
      )}

      {/* Public Link Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Share Contract</h3>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Public Link</p>
            <p className="text-sm text-slate-300 break-all">{publicUrl}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-lg border border-accent-500/20 bg-accent-500/10 text-accent-300 hover:bg-accent-500/20 font-semibold"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Status Management */}
      {!isPublic && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Status Management</h3>
          <div className="flex gap-2 flex-wrap">
            {['draft', 'sent', 'reviewed', 'signed', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={isUpdating || contract.status === status}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  contract.status === status
                    ? 'bg-accent-500/20 text-accent-300 cursor-default'
                    : 'border border-white/10 text-white hover:bg-white/5'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
