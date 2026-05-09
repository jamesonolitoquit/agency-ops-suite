'use client';

import React, { useState } from 'react';

interface AuditIssue {
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

interface AuditData {
  id: string;
  website_url: string;
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
  issues: AuditIssue[];
  estimated_cost_low: number;
  estimated_cost_high: number;
  estimated_hours: number;
  public_token: string;
  generated_at: string;
}

interface AuditResultsProps {
  audit: AuditData;
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'from-green-500 to-green-600';
    if (s >= 70) return 'from-yellow-500 to-yellow-600';
    if (s >= 50) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTextColor = (s: number) => {
    if (s >= 90) return 'text-green-300';
    if (s >= 70) return 'text-yellow-300';
    if (s >= 50) return 'text-orange-300';
    return 'text-red-300';
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-slate-400 mb-3">{label}</p>
      <div className="flex items-end gap-4">
        <div className={`text-5xl font-bold bg-gradient-to-r ${getColor(score)} bg-clip-text text-transparent`}>{score}</div>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${getColor(score)} w-[${score}%]`} style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${colors[severity] || colors.low}`}>{severity.toUpperCase()}</span>;
}

export function AuditResults({ audit }: AuditResultsProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/audit/report/${audit.public_token}`;

  function copyToClipboard() {
    navigator.clipboard.writeText(publicUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  const criticalIssues = audit.issues.filter((i) => i.severity === 'critical').length;
  const highIssues = audit.issues.filter((i) => i.severity === 'high').length;

  return (
    <div className="space-y-8">
      {/* URL & Date */}
      <div>
        <p className="text-sm text-slate-400">Audited Website</p>
        <p className="text-lg font-semibold text-white break-all">{audit.website_url}</p>
        {audit.generated_at && (
          <p className="text-xs text-slate-500 mt-1">Generated {new Date(audit.generated_at).toLocaleDateString()}</p>
        )}
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreCard label="Performance" score={audit.performance} />
        <ScoreCard label="Accessibility" score={audit.accessibility} />
        <ScoreCard label="SEO" score={audit.seo} />
        <ScoreCard label="Best Practices" score={audit.best_practices} />
      </div>

      {/* Issues Summary */}
      {(criticalIssues > 0 || highIssues > 0) && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300">
            {criticalIssues} Critical {criticalIssues === 1 ? 'Issue' : 'Issues'} • {highIssues} High Priority
          </p>
        </div>
      )}

      {/* Issues List */}
      {audit.issues.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Issues Found</h3>
          {audit.issues.map((issue, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">{issue.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                </div>
                <SeverityBadge severity={issue.severity} />
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-slate-300">
                  <strong>Impact:</strong> {issue.impact}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost Estimate */}
      <div className="rounded-lg border border-accent-500/20 bg-accent-500/10 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Estimated Fix Cost</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400">Low Estimate</p>
            <p className="text-3xl font-bold text-accent-300">${audit.estimated_cost_low?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">High Estimate</p>
            <p className="text-3xl font-bold text-accent-300">${audit.estimated_cost_high?.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-sm text-slate-300">Estimated effort: {audit.estimated_hours} hours</p>
      </div>

      {/* Sharing */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Share This Report</h3>
        <div className="flex items-center gap-2">
          <input type="text" value={publicUrl} readOnly className="flex-1 px-3 py-2 rounded bg-white/5 text-slate-300 text-sm border border-white/10" />
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 rounded bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition"
          >
            {copiedToken ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-400">Share this link with clients or prospects (no authentication required)</p>
      </div>
    </div>
  );
}
