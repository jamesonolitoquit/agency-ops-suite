'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const AUDIT_TYPES = [
  { value: 'penetration-test', label: 'Penetration Test', description: 'Simulate real attacks to find exploitable vulnerabilities' },
  { value: 'security-review', label: 'Security Review', description: 'Full review of headers, SSL, configs, and exposure points' },
  { value: 'seo-audit', label: 'SEO Audit', description: 'Deep dive into on-page SEO, structure, and ranking factors' },
  { value: 'performance-audit', label: 'Performance Audit', description: 'Identify bottlenecks slowing down your site' },
  { value: 'full-audit', label: 'Full Audit', description: 'All of the above — comprehensive pre-launch review' },
];

type Status = 'idle' | 'loading' | 'success' | 'error';

function BookAuditForm() {
  const searchParams = useSearchParams();
  const prefillUrl = searchParams.get('url') ?? '';
  const fromDeployCheck = searchParams.get('from') === 'deploy-check';

  const [form, setForm] = useState({
    name: '',
    email: '',
    websiteUrl: prefillUrl,
    auditType: '',
    details: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (prefillUrl) setForm((prev) => ({ ...prev, websiteUrl: prefillUrl }));
  }, [prefillUrl]);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.websiteUrl.trim()) e.websiteUrl = 'Website URL is required';
    if (!form.auditType) e.auditType = 'Please select an audit type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof form]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/book-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fromDeployCheck }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 sm:px-8 text-center">
        <div className="rounded-2xl border border-green-500/20 bg-slate-800/30 p-12">
          <p className="text-5xl mb-6">🎉</p>
          <h1 className="text-3xl font-semibold text-white">Booking confirmed!</h1>
          <p className="mt-4 text-slate-400">
            We've received your manual audit request and sent a confirmation to <span className="text-cyan-400">{form.email}</span>. Our team will reach out within 24 hours to schedule your session.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400"
            >
              Run another scan
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-8 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      {/* Hero */}
      <section className="max-w-2xl">
        <div className="flex items-center gap-3">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">Manual Audit</p>
          {fromDeployCheck && (
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              ⚡ From Deploy Check
            </span>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Book a manual audit</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Our team will do a hands-on security review, penetration test, or full pre-launch audit tailored to your website.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name & Email */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan dela Cruz"
                className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${errors.name ? 'border-red-500/50' : 'border-cyan-500/10'}`}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@business.com"
                className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${errors.email ? 'border-red-500/50' : 'border-cyan-500/10'}`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Website URL *</label>
            <input
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${errors.websiteUrl ? 'border-red-500/50' : 'border-cyan-500/10'}`}
            />
            {errors.websiteUrl && <p className="text-xs text-red-400">{errors.websiteUrl}</p>}
          </div>

          {/* Audit Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Audit Type *</label>
            <div className="grid gap-3">
              {AUDIT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => { setForm((prev) => ({ ...prev, auditType: type.value })); setErrors((prev) => ({ ...prev, auditType: undefined })); }}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition ${
                    form.auditType === type.value
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-cyan-500/10 bg-slate-900/30 hover:border-cyan-500/30'
                  }`}
                >
                  <span className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition ${form.auditType === type.value ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${form.auditType === type.value ? 'text-cyan-400' : 'text-slate-200'}`}>{type.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.auditType && <p className="text-xs text-red-400">{errors.auditType}</p>}
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Additional Details <span className="text-slate-500">(optional)</span></label>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              rows={4}
              placeholder="Any specific concerns, areas to focus on, or context about your site..."
              className="w-full resize-none rounded-xl border border-cyan-500/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>

          {status === 'error' && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Something went wrong. Please try again or email us at deployhubph@gmail.com
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2"><span className="animate-spin">↻</span> Submitting...</span>
            ) : 'Book Manual Audit'}
          </button>
        </form>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">What to expect</p>
            <ul className="mt-4 space-y-4">
              {[
                { step: '01', text: 'Submit your booking request' },
                { step: '02', text: 'We review and reach out within 24 hours' },
                { step: '03', text: 'Schedule your audit session' },
                { step: '04', text: 'Receive a detailed findings report' },
                { step: '05', text: 'Optional: fix support and follow-up scan' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">{step}</span>
                  <span className="text-sm text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Included in manual audit</p>
            <ul className="mt-4 space-y-2">
              {[
                'Hands-on penetration testing',
                'Hosting & server configuration review',
                'Authentication & access control check',
                'Detailed written findings report',
                'Priority fix recommendations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function BookAuditPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-16 text-slate-400">Loading...</div>}>
      <BookAuditForm />
    </Suspense>
  );
}
