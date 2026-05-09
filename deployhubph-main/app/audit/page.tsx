'use client';

import { useState, FormEvent } from 'react';
import CTAButton from '../../components/CTAButton';

interface PentestFinding {
  id: string;
  owasp: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  passed: boolean;
  detail: string;
  recommendation: string;
}

interface PentestResult {
  summary: { total: number; passed: number; failed: number; critical: number; high: number; medium: number; low: number };
  findings: PentestFinding[];
}

interface PageSpeedResult {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
}

interface AuditResult {
  url: string;
  pagespeed: { mobile: PageSpeedResult; desktop: PageSpeedResult };
  headers: {
    https: boolean;
    hsts: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    csp: boolean;
    referrerPolicy: boolean;
  };
  seo: {
    title: { value: string; present: boolean; optimal: boolean; length: number };
    description: { value: string; present: boolean; optimal: boolean; length: number };
    h1: { count: number; present: boolean; optimal: boolean; values: string[] };
    canonical: { value: string; present: boolean };
    openGraph: { title: boolean; description: boolean; image: boolean };
    robots: { value: string; present: boolean; indexable: boolean };
    viewport: { present: boolean };
  };
  mixedContent: { applicable: boolean; issues: { type: string; url: string }[] };
  images: { total: number; missingAlt: string[]; emptyAlt: string[]; passed: boolean };
  brokenLinks: { total: number; broken: { url: string; status: number }[]; passed: number };
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreRing(score: number) {
  if (score >= 90) return 'border-green-400';
  if (score >= 50) return 'border-yellow-400';
  return 'border-red-400';
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs work';
  return 'Poor';
}

function ScoreCircle({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${scoreRing(score)}`}>
        <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
      </div>
      <span className="text-center text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-medium ${scoreColor(score)}`}>{scoreLabel(score)}</span>
    </div>
  );
}

function CheckRow({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-700/50 last:border-0">
      <div>
        <span className="text-sm text-slate-300">{label}</span>
        {detail && <p className="mt-0.5 text-xs text-slate-500 break-all">{detail}</p>}
      </div>
      {passed ? (
        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-400" /> Pass
        </span>
      ) : (
        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-400" /> Fail
        </span>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-200">{value}</span>
    </div>
  );
}

function SectionCard({ title, badge, children }: { title: string; badge?: { label: string; ok: boolean }; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        {badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${badge.ok ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {badge.label}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('desktop');
  const [screenshots, setScreenshots] = useState<{ mobile: string | null; desktop: string | null } | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [pentest, setPentest] = useState<PentestResult | null>(null);
  const [pentestLoading, setPentestLoading] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');
    setScreenshots(null);
    setPentest(null);

    // Fetch screenshot immediately in parallel — fast via Screenshotone
    const normalizedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    setScreenshotLoading(true);
    fetch('/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalizedUrl }),
    })
      .then((r) => r.json())
      .then((s) => setScreenshots(s))
      .catch(() => setScreenshots({ mobile: null, desktop: null }))
      .finally(() => setScreenshotLoading(false));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setResult(data);

      // Run OWASP pentest in parallel after results load
      setPentestLoading(true);
      fetch('/api/pentest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })
        .then((r) => r.json())
        .then((p) => setPentest(p))
        .catch(() => setPentest(null))
        .finally(() => setPentestLoading(false));
    } catch {
      setError('Failed to run audit. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportEmail.trim() || !result) return;
    setReportStatus('loading');
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reportEmail.trim(), auditData: result }),
      });
      setReportStatus(res.ok ? 'success' : 'error');
    } catch {
      setReportStatus('error');
    }
  };

  const scores = result?.pagespeed[strategy];
  const passedHeaders = result ? Object.values(result.headers).filter(Boolean).length : 0;
  const totalHeaders = result ? Object.values(result.headers).length : 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">Free tool</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Deploy Check</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Test your website's performance, SEO, security, mixed content, and broken links before going live. Instant report — no sign up required.
        </p>
      </section>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="flex-1 rounded-full border border-cyan-500/20 bg-slate-800/50 px-6 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin">↻</span>
              Scanning...
            </span>
          ) : 'Run Audit'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-12 rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-10 text-center">
          <p className="text-lg font-medium text-slate-200">Running full audit on <span className="text-cyan-400">{url}</span></p>
          <p className="mt-2 text-sm text-slate-400">Checking performance, SEO, security headers, mixed content, and broken links...</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && scores && (
        <div className="mt-12 space-y-8">

          {/* Summary bar */}
          <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Audit complete</p>
              <p className="mt-1 text-sm font-medium text-slate-200 break-all">{result.url}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${result.headers.https ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {result.headers.https ? '🔒 HTTPS' : '⚠️ No HTTPS'}
              </span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">
                {passedHeaders}/{totalHeaders} security headers
              </span>
              {result.mixedContent.applicable && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${result.mixedContent.issues.length === 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {result.mixedContent.issues.length === 0 ? '✓ No mixed content' : `⚠️ ${result.mixedContent.issues.length} mixed content`}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${result.brokenLinks.broken.length === 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {result.brokenLinks.broken.length === 0 ? '✓ No broken links' : `⚠️ ${result.brokenLinks.broken.length} broken links`}
              </span>
            </div>
          </div>

          {/* Website Preview */}
          <SectionCard title="Website Preview">
            <div className="flex flex-col items-center gap-4">
              {screenshotLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Capturing screenshot...</p>
                </div>
              ) : screenshots?.[strategy] ? (
                <>
                  <div className={`overflow-hidden rounded-xl border border-slate-700 shadow-lg ${strategy === 'mobile' ? 'w-64' : 'w-full'}`}>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-red-500/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                      <span className="h-2 w-2 rounded-full bg-green-500/70" />
                      <span className="ml-2 flex-1 truncate rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-500">{result.url}</span>
                    </div>
                    <img src={screenshots[strategy]!} alt={`Screenshot of ${result.url}`} className="w-full" />
                  </div>
                  <p className="text-xs text-slate-500">Captured by Screenshotone — {strategy} view</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-slate-400">Screenshot not available for this site.</p>
                  <p className="text-xs text-slate-600 max-w-sm">Some sites block automated crawlers (e.g. Facebook, Instagram) or require login. The audit results above are still accurate.</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Strategy toggle */}
          <div className="flex gap-2">
            {(['mobile', 'desktop'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition capitalize ${
                  strategy === s
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 border border-slate-700 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Lighthouse Scores */}
          <SectionCard title="Lighthouse Scores">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <ScoreCircle label="Performance" score={scores.performance} />
              <ScoreCircle label="SEO" score={scores.seo} />
              <ScoreCircle label="Accessibility" score={scores.accessibility} />
              <ScoreCircle label="Best Practices" score={scores.bestPractices} />
            </div>
          </SectionCard>

          {/* Core Web Vitals */}
          <SectionCard title="Core Web Vitals">
            <MetricRow label="First Contentful Paint (FCP)" value={scores.fcp} />
            <MetricRow label="Largest Contentful Paint (LCP)" value={scores.lcp} />
            <MetricRow label="Total Blocking Time (TBT)" value={scores.tbt} />
            <MetricRow label="Cumulative Layout Shift (CLS)" value={scores.cls} />
          </SectionCard>

          {/* SEO */}
          <SectionCard
            title="SEO Checks"
            badge={{
              label: [result.seo.title.present, result.seo.description.present, result.seo.h1.optimal, result.seo.viewport.present].every(Boolean) ? 'All clear' : 'Issues found',
              ok: [result.seo.title.present, result.seo.description.present, result.seo.h1.optimal, result.seo.viewport.present].every(Boolean),
            }}
          >
            <CheckRow
              label="Meta Title"
              passed={result.seo.title.present && result.seo.title.optimal}
              detail={result.seo.title.value ? `"${result.seo.title.value}" (${result.seo.title.length} chars — optimal: 30–60)` : 'Missing'}
            />
            <CheckRow
              label="Meta Description"
              passed={result.seo.description.present && result.seo.description.optimal}
              detail={result.seo.description.value ? `${result.seo.description.length} chars — optimal: 120–160` : 'Missing'}
            />
            <CheckRow
              label="H1 Tag"
              passed={result.seo.h1.optimal}
              detail={result.seo.h1.count === 0 ? 'No H1 found' : result.seo.h1.count > 1 ? `${result.seo.h1.count} H1 tags found (should be 1)` : `"${result.seo.h1.values[0]}"`}
            />
            <CheckRow label="Canonical URL" passed={result.seo.canonical.present} detail={result.seo.canonical.value || 'Not set'} />
            <CheckRow label="Viewport Meta Tag" passed={result.seo.viewport.present} />
            <CheckRow label="Robots Meta Tag" passed={result.seo.robots.indexable} detail={result.seo.robots.value || 'Not set (defaults to indexable)'} />
            <CheckRow label="Open Graph Title" passed={result.seo.openGraph.title} />
            <CheckRow label="Open Graph Description" passed={result.seo.openGraph.description} />
            <CheckRow label="Open Graph Image" passed={result.seo.openGraph.image} />
          </SectionCard>

          {/* Mixed Content */}
          <SectionCard
            title="Mixed Content"
            badge={{
              label: !result.mixedContent.applicable ? 'N/A (HTTP)' : result.mixedContent.issues.length === 0 ? 'All clear' : `${result.mixedContent.issues.length} issues`,
              ok: !result.mixedContent.applicable || result.mixedContent.issues.length === 0,
            }}
          >
            {!result.mixedContent.applicable ? (
              <p className="text-sm text-slate-400">Site is not on HTTPS — mixed content check not applicable.</p>
            ) : result.mixedContent.issues.length === 0 ? (
              <p className="text-sm text-green-400">No mixed content detected. All resources load over HTTPS.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 mb-4">The following resources are loaded over HTTP on an HTTPS page:</p>
                {result.mixedContent.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3">
                    <span className="flex-shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">{issue.type}</span>
                    <span className="text-xs text-slate-400 break-all">{issue.url}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Image Audit */}
          <SectionCard
            title="Image Audit"
            badge={{ label: result.images.passed ? 'All clear' : 'Issues found', ok: result.images.passed }}
          >
            <MetricRow label="Total images found" value={String(result.images.total)} />
            {result.images.missingAlt.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-red-400 mb-2">{result.images.missingAlt.length} image(s) missing alt attribute:</p>
                {result.images.missingAlt.slice(0, 5).map((src, i) => (
                  <p key={i} className="text-xs text-slate-500 break-all py-1">{src || '(no src)'}</p>
                ))}
              </div>
            )}
            {result.images.emptyAlt.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-yellow-400 mb-2">{result.images.emptyAlt.length} image(s) with empty alt attribute:</p>
                {result.images.emptyAlt.slice(0, 5).map((src, i) => (
                  <p key={i} className="text-xs text-slate-500 break-all py-1">{src || '(no src)'}</p>
                ))}
              </div>
            )}
            {result.images.passed && (
              <p className="text-sm text-green-400">All images have proper alt attributes.</p>
            )}
          </SectionCard>

          {/* Broken Links */}
          <SectionCard
            title="Broken Links"
            badge={{
              label: result.brokenLinks.broken.length === 0 ? 'All clear' : `${result.brokenLinks.broken.length} broken`,
              ok: result.brokenLinks.broken.length === 0,
            }}
          >
            <MetricRow label="Links checked" value={String(result.brokenLinks.total)} />
            <MetricRow label="Links passing" value={String(result.brokenLinks.passed)} />
            {result.brokenLinks.broken.length > 0 && (
              <div className="mt-4 space-y-2">
                {result.brokenLinks.broken.map((link, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3">
                    <span className="flex-shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      {link.status === 0 ? 'Timeout' : link.status}
                    </span>
                    <span className="text-xs text-slate-400 break-all">{link.url}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Security Headers */}
          <SectionCard
            title="Security Headers"
            badge={{ label: `${passedHeaders}/${totalHeaders} passed`, ok: passedHeaders === totalHeaders }}
          >
            <CheckRow label="HTTPS / SSL" passed={result.headers.https} />
            <CheckRow label="HTTP Strict Transport Security (HSTS)" passed={result.headers.hsts} />
            <CheckRow label="X-Frame-Options" passed={result.headers.xFrameOptions} />
            <CheckRow label="X-Content-Type-Options" passed={result.headers.xContentTypeOptions} />
            <CheckRow label="Content Security Policy (CSP)" passed={result.headers.csp} />
            <CheckRow label="Referrer Policy" passed={result.headers.referrerPolicy} />
          </SectionCard>

          {/* OWASP Security Scan */}
          <SectionCard
            title="OWASP Security Scan"
            badge={pentestLoading ? { label: 'Scanning...', ok: true } : pentest ? { label: pentest.summary.failed === 0 ? 'All clear' : `${pentest.summary.failed} issues`, ok: pentest.summary.failed === 0 } : undefined}
          >
            {pentestLoading ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Running OWASP security checks...</p>
              </div>
            ) : pentest ? (
              <div className="space-y-2">
                {/* Summary pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {pentest.summary.critical > 0 && <span className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">{pentest.summary.critical} Critical</span>}
                  {pentest.summary.high > 0 && <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-semibold text-orange-400">{pentest.summary.high} High</span>}
                  {pentest.summary.medium > 0 && <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-400">{pentest.summary.medium} Medium</span>}
                  {pentest.summary.low > 0 && <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">{pentest.summary.low} Low</span>}
                  <span className="rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1 text-xs font-semibold text-green-400">{pentest.summary.passed} Passed</span>
                </div>
                {/* Findings */}
                {pentest.findings.map((f) => (
                  <div key={f.id} className={`rounded-xl border p-4 ${
                    f.passed ? 'border-green-500/10 bg-slate-900/30' : {
                      critical: 'border-red-500/30 bg-red-500/5',
                      high: 'border-orange-500/30 bg-orange-500/5',
                      medium: 'border-yellow-500/30 bg-yellow-500/5',
                      low: 'border-blue-500/30 bg-blue-500/5',
                      info: 'border-slate-600/30 bg-slate-900/30',
                    }[f.severity]
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200">{f.title}</span>
                          {!f.passed && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              { critical: 'bg-red-500/20 text-red-400', high: 'bg-orange-500/20 text-orange-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-blue-500/20 text-blue-400', info: 'bg-slate-500/20 text-slate-400' }[f.severity]
                            }`}>{f.severity.toUpperCase()}</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{f.owasp}</p>
                        <p className="mt-2 text-sm text-slate-400">{f.detail}</p>
                        {!f.passed && (
                          <p className="mt-2 text-xs text-cyan-400">💡 {f.recommendation}</p>
                        )}
                      </div>
                      {f.passed ? (
                        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-green-400">
                          <span className="h-2 w-2 rounded-full bg-green-400" /> Pass
                        </span>
                      ) : (
                        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <span className="h-2 w-2 rounded-full bg-red-400" /> Fail
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">OWASP scan not available.</p>
            )}
          </SectionCard>

          {/* Email Report */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-800/50 p-8">
            <p className="text-lg font-semibold text-white">📩 Get this report in your inbox</p>
            <p className="mt-2 text-sm text-slate-400">Enter your email and we'll send you a full summary of this audit.</p>
            {reportStatus === 'success' ? (
              <p className="mt-4 text-sm font-medium text-green-400">✅ Report sent! Check your inbox.</p>
            ) : (
              <form onSubmit={handleSendReport} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="flex-1 rounded-full border border-cyan-500/20 bg-slate-900/50 px-5 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                />
                <button
                  type="submit"
                  disabled={reportStatus === 'loading'}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportStatus === 'loading' ? 'Sending...' : 'Send Report'}
                </button>
              </form>
            )}
            {reportStatus === 'error' && (
              <p className="mt-3 text-xs text-red-400">Failed to send. Please try again.</p>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-800/50 p-8 text-center">
            <p className="text-lg font-semibold text-white">Want a full manual security audit?</p>
            <p className="mt-2 text-sm text-slate-400">
              Our team will do a hands-on penetration test, hosting review, and give you a detailed fix report.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={`/audit/book?url=${encodeURIComponent(result.url)}&from=deploy-check`}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400"
              >
                Book a Manual Audit
              </a>
              <CTAButton href="/contact">Contact us</CTAButton>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
