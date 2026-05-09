'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ContractType = 'service' | 'retainer' | 'maintenance';

interface Proposal {
  id: string;
  project_name: string;
  prospect_company: string;
  prospect_name: string;
  estimated_cost_low: number;
  estimated_cost_high: number;
}

interface ContractFormProps {
  proposalId?: string;
  onSuccess?: (contractId: string) => void;
}

export function ContractForm({ proposalId, onSuccess }: ContractFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Select proposal or custom
  const [selectedProposalId, setSelectedProposalId] = useState(proposalId || '');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [useCustom, setUseCustom] = useState(!proposalId);

  // Step 2: Contract type
  const [contractType, setContractType] = useState<ContractType>('service');
  const [includeNda, setIncludeNda] = useState(true);

  // Step 3: Custom details (if custom contract)
  const [prospectName, setProspectName] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectCompany, setProspectCompany] = useState('');
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [costLow, setCostLow] = useState(0);
  const [costHigh, setCostHigh] = useState(0);

  // Load proposals
  useEffect(() => {
    async function loadProposals() {
      try {
        const response = await fetch('/api/proposal/generate?status=accepted');
        if (!response.ok) throw new Error('Failed to load proposals');
        const data = await response.json();
        setProposals(data.proposals || []);
      } catch (err) {
        console.error('Error loading proposals:', err);
      } finally {
        setIsLoadingProposals(false);
      }
    }
    loadProposals();
  }, []);

  function handleSelectProposal(id: string) {
    const proposal = proposals.find((p) => p.id === id);
    setSelectedProposalId(id);
    setSelectedProposal(proposal || null);
    if (proposal) {
      setProjectName(proposal.project_name);
      setProspectName(proposal.prospect_name);
      setProspectCompany(proposal.prospect_company);
      setCostLow(proposal.estimated_cost_low);
      setCostHigh(proposal.estimated_cost_high);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const requestData = useCustom
        ? {
            prospect_name: prospectName,
            prospect_email: prospectEmail,
            prospect_company: prospectCompany,
            project_name: projectName,
            contractType,
            start_date: startDate,
            end_date: endDate,
            timeline_weeks: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            contract_cost_low: costLow,
            contract_cost_high: costHigh,
            deliverables: [],
            payment_terms: '50% upfront, 50% on completion',
            acceptance_criteria: [],
            terms_and_conditions: '',
            nda_included: includeNda,
          }
        : {
            proposalId: selectedProposalId,
            contractType,
            includeNda,
          };

      const response = await fetch('/api/contract/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate contract');
      }

      const data = await response.json();
      onSuccess?.(data.contractId);
      router.push(`/contract/${data.contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function canGoNext(): boolean {
    if (step === 1) return useCustom || !!selectedProposalId;
    if (step === 2) return !!contractType;
    if (step === 3) return true;
    return true;
  }

  function canSubmit(): boolean {
    if (!useCustom) {
      return !!selectedProposalId;
    }

    return Boolean(prospectName && prospectEmail && prospectCompany && projectName && costLow && costHigh);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                s === step
                  ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'
                  : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-slate-400'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${s < step ? 'bg-green-500' : 'bg-white/10'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Source Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 1: Contract Source</h3>
            <p className="text-sm text-slate-400 mb-6">Choose how to create this contract</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`w-full p-4 rounded-lg border text-left transition ${
                  !useCustom
                    ? 'border-accent-500 bg-accent-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={!useCustom}
                    onChange={() => setUseCustom(false)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-white">From Accepted Proposal</p>
                    <p className="text-xs text-slate-400">Auto-populate from existing proposal</p>
                  </div>
                </div>
              </button>

              {!useCustom && (
                <div className="pl-8 space-y-2">
                  {isLoadingProposals ? (
                    <p className="text-slate-400">Loading proposals...</p>
                  ) : proposals.length === 0 ? (
                    <p className="text-slate-400 text-sm">No accepted proposals found</p>
                  ) : (
                    proposals.map((proposal) => (
                      <button
                        key={proposal.id}
                        type="button"
                        onClick={() => handleSelectProposal(proposal.id)}
                        className={`w-full p-3 rounded-lg border text-left text-sm transition ${
                          selectedProposalId === proposal.id
                            ? 'border-accent-500 bg-accent-500/5'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-white">{proposal.project_name}</p>
                        <p className="text-xs text-slate-400">{proposal.prospect_company}</p>
                        <p className="text-accent-400 text-xs mt-1">
                          ${proposal.estimated_cost_low.toLocaleString()} - $
                          {proposal.estimated_cost_high.toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`w-full p-4 rounded-lg border text-left transition ${
                  useCustom
                    ? 'border-accent-500 bg-accent-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={useCustom}
                    onChange={() => setUseCustom(true)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-white">Create Custom Contract</p>
                    <p className="text-xs text-slate-400">Enter details manually</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Contract Type & NDA */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 2: Contract Type</h3>
            <p className="text-sm text-slate-400 mb-6">Select contract type and options</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contract Type</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
                >
                  <option value="service">Service Agreement</option>
                  <option value="retainer">Retainer Contract</option>
                  <option value="maintenance">Maintenance Contract</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNda}
                  onChange={(e) => setIncludeNda(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-white font-medium">Include NDA</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Custom Details (if needed) */}
      {step === 3 && useCustom && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Step 3: Contract Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prospectName" className="block text-sm font-medium text-slate-300 mb-1">
                Contact Name *
              </label>
              <input
                id="prospectName"
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div>
              <label htmlFor="prospectCompany" className="block text-sm font-medium text-slate-300 mb-1">
                Company *
              </label>
              <input
                id="prospectCompany"
                type="text"
                value={prospectCompany}
                onChange={(e) => setProspectCompany(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="prospectEmail" className="block text-sm font-medium text-slate-300 mb-1">
                Email *
              </label>
              <input
                id="prospectEmail"
                type="email"
                value={prospectEmail}
                onChange={(e) => setProspectEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div>
              <label htmlFor="costLow" className="block text-sm font-medium text-slate-300 mb-1">
                Cost Low *
              </label>
              <input
                id="costLow"
                type="number"
                value={costLow}
                onChange={(e) => setCostLow(parseInt(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
            <div>
              <label htmlFor="costHigh" className="block text-sm font-medium text-slate-300 mb-1">
                Cost High *
              </label>
              <input
                id="costHigh"
                type="number"
                value={costHigh}
                onChange={(e) => setCostHigh(parseInt(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3/4: Review */}
      {step === (useCustom ? 4 : 3) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Review & Create</h3>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
            {selectedProposal ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Project:</span>
                  <span className="text-white font-medium">{selectedProposal.project_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Company:</span>
                  <span className="text-white font-medium">{selectedProposal.prospect_company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost Range:</span>
                  <span className="text-accent-400 font-semibold">
                    ${selectedProposal.estimated_cost_low.toLocaleString()} - $
                    {selectedProposal.estimated_cost_high.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Project:</span>
                  <span className="text-white font-medium">{projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Company:</span>
                  <span className="text-white font-medium">{prospectCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost Range:</span>
                  <span className="text-accent-400 font-semibold">
                    ${costLow.toLocaleString()} - ${costHigh.toLocaleString()}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-400">Contract Type:</span>
              <span className="text-white font-medium capitalize">{contractType}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || isLoading}
          className="px-6 py-2 rounded-lg border border-white/10 text-white hover:border-white/20 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < (useCustom ? 4 : 3) ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext() || isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !canSubmit()}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              'Create Contract'
            )}
          </button>
        )}
      </div>
    </form>
  );
}
