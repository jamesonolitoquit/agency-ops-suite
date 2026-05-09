'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ProposalScope = 'Basic' | 'Standard' | 'Premium' | 'Custom';

interface Audit {
  id: string;
  website_url: string;
  project_type: string;
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
  estimated_cost_low: number;
  estimated_cost_high: number;
}

interface ProposalFormProps {
  onSuccess?: (proposalId: string) => void;
}

export function ProposalForm({ onSuccess }: ProposalFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Audit selection
  const [selectedAuditId, setSelectedAuditId] = useState('');

  // Step 2: Scope selection
  const [scope, setScope] = useState<ProposalScope>('Standard');
  const [estimatedCost, setEstimatedCost] = useState({ low: 0, high: 0 });

  // Step 3: Prospect details
  const [prospectName, setProspectName] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectCompany, setProspectCompany] = useState('');
  const [projectName, setProjectName] = useState('');

  // Step 4: Review
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  useEffect(() => {
    async function loadAudits() {
      try {
        const response = await fetch('/api/audit/generate');
        if (!response.ok) {
          throw new Error('Failed to load audits');
        }
        const data = await response.json();
        setAudits(data.audits || []);
      } catch (err) {
        console.error('Error loading audits:', err);
        setError('Failed to load your audits');
      } finally {
        setIsLoadingAudits(false);
      }
    }

    loadAudits();
  }, []);

  function handleSelectAudit(auditId: string) {
    setSelectedAuditId(auditId);
    const audit = audits.find((a) => a.id === auditId);
    if (audit) {
      setSelectedAudit(audit);
      setProjectName(`${audit.project_type} Improvements`);
    }
  }

  function handleScopeChange(newScope: ProposalScope) {
    setScope(newScope);
    if (selectedAudit) {
      // Calculate estimated cost based on scope multiplier
      const scopeMultipliers = {
        Basic: 1.0,
        Standard: 1.3,
        Premium: 1.6,
        Custom: 1.0,
      };
      const multiplier = scopeMultipliers[newScope];
      setEstimatedCost({
        low: Math.round(selectedAudit.estimated_cost_low * multiplier),
        high: Math.round(selectedAudit.estimated_cost_high * multiplier),
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/proposal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: selectedAuditId,
          scope,
          prospectName,
          prospectEmail,
          prospectCompany,
          projectName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate proposal');
      }

      const data = await response.json();
      onSuccess?.(data.proposalId);
      router.push(`/proposal/${data.proposalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function canGoNext() {
    if (step === 1) return selectedAuditId;
    if (step === 2) return scope;
    if (step === 3) return prospectName && prospectEmail && prospectCompany;
    return true;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress indicator */}
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
                className={`flex-1 h-1 mx-2 rounded-full ${
                  s < step ? 'bg-green-500' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Audit */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 1: Select Audit</h3>
            <p className="text-sm text-slate-400 mb-4">Choose an audit to base your proposal on</p>

            {isLoadingAudits ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Loading your audits...</p>
              </div>
            ) : audits.length === 0 ? (
              <div className="rounded-lg border border-slate-600 bg-slate-900/30 p-6 text-center">
                <p className="text-slate-300 mb-4">No audits found</p>
                <a
                  href="/audit/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 font-medium"
                >
                  Create an Audit First
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {audits.map((audit) => (
                  <button
                    key={audit.id}
                    type="button"
                    onClick={() => handleSelectAudit(audit.id)}
                    className={`p-4 rounded-lg border text-left transition ${
                      selectedAuditId === audit.id
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">{audit.website_url}</p>
                        <p className="text-xs text-slate-400 capitalize">{audit.project_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent-400">
                          ${audit.estimated_cost_low.toLocaleString()} - ${audit.estimated_cost_high.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">Performance</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${audit.performance}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">SEO</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${audit.seo}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Scope */}
      {step === 2 && selectedAudit && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Step 2: Choose Scope</h3>
            <p className="text-sm text-slate-400 mb-6">
              Select how many issues you'll address in the proposal
            </p>

            <div className="grid grid-cols-2 gap-4">
              {(['Basic', 'Standard', 'Premium', 'Custom'] as const).map((s) => {
                const descriptions = {
                  Basic: 'Critical issues only',
                  Standard: 'Critical + High priority',
                  Premium: 'All issues addressed',
                  Custom: 'Custom scope',
                };
                const multipliers = { Basic: 1.0, Standard: 1.3, Premium: 1.6, Custom: 1.0 };

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleScopeChange(s)}
                    className={`p-4 rounded-lg border text-left transition ${
                      scope === s
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold text-white mb-1">{s}</p>
                    <p className="text-xs text-slate-400 mb-3">{descriptions[s]}</p>
                    <p className="text-sm text-accent-400 font-medium">
                      ${Math.round(selectedAudit.estimated_cost_low * multipliers[s]).toLocaleString()} -
                      ${Math.round(selectedAudit.estimated_cost_high * multipliers[s]).toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Prospect Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Step 3: Prospect Information</h3>
            <p className="text-sm text-slate-400 mb-6">Who is this proposal for?</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="prospectName" className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Name *
                </label>
                <input
                  id="prospectName"
                  type="text"
                  placeholder="John Doe"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="prospectEmail" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="prospectEmail"
                  type="email"
                  placeholder="john@company.com"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="prospectCompany" className="block text-sm font-medium text-slate-300 mb-2">
                  Company *
                </label>
                <input
                  id="prospectCompany"
                  type="text"
                  placeholder="Acme Corporation"
                  value={prospectCompany}
                  onChange={(e) => setProspectCompany(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  placeholder="Website Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedAudit && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Step 4: Review & Send</h3>

            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-400 mb-3">Proposal Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">For:</span>
                    <span className="text-white font-medium">{prospectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-white font-medium">{prospectCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white font-medium">{prospectEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project:</span>
                    <span className="text-white font-medium">{projectName}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm text-slate-400 mb-3">Scope & Pricing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scope:</span>
                    <span className="text-white font-medium">{scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Cost:</span>
                    <span className="text-accent-400 font-semibold">
                      ${estimatedCost.low.toLocaleString()} - ${estimatedCost.high.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || isLoading}
          className="px-6 py-2 rounded-lg border border-white/10 text-white hover:border-white/20 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext() || isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 font-semibold text-white shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 font-semibold text-white shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              'Create Proposal'
            )}
          </button>
        )}
      </div>
    </form>
  );
}
