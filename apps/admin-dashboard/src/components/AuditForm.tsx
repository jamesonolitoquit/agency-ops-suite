'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type ProjectType = 'landing-page' | 'ecommerce' | 'corporate' | 'saas' | 'blog';

interface AuditFormProps {
  onSuccess?: (auditId: string) => void;
}

export function AuditForm({ onSuccess }: AuditFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('landing-page');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, projectType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audit');
      }

      const data = await response.json();
      onSuccess?.(data.auditId);
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
          Website URL
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          required
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-slate-400">Must start with http:// or https://</p>
      </div>

      <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-slate-300 mb-2">
          Project Type
        </label>
        <select
          id="projectType"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value as ProjectType)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
        >
          <option value="landing-page">Landing Page</option>
          <option value="ecommerce">E-Commerce Store</option>
          <option value="corporate">Corporate Website</option>
          <option value="saas">SaaS Platform</option>
          <option value="blog">Blog / Content Site</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !url}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 font-semibold text-white shadow-lg hover:shadow-xl hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating audit...
          </>
        ) : (
          'Generate Audit'
        )}
      </button>
    </form>
  );
}
