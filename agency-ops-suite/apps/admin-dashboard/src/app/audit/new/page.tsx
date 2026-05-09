import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuditForm } from '@/components/AuditForm';

export default async function NewAuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Generate Website Audit</h1>
        <p className="text-slate-400 mt-2">Enter any website URL to generate a comprehensive performance, SEO, and accessibility audit</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <AuditForm />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="font-semibold text-white">What's Included</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>Performance metrics (speed, optimization)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>SEO analysis (metadata, mobile-friendliness)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>Accessibility issues (WCAG compliance)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>Best practices review</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>Estimated fix cost and effort</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-400">✓</span>
            <span>Shareable public link (no login required)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
