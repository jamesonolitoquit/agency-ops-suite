import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface AuditReport {
  id: string;
  website_url: string;
  project_type: string;
  performance: number;
  seo: number;
  created_at: string;
}

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: audits, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const hasAudits = !error && audits && audits.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Website Audits</h1>
          <p className="text-slate-400 mt-1">Generate performance & SEO reports for any website</p>
        </div>
        <Link href="/audit/new" className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition">
          New Audit
        </Link>
      </div>

      {hasAudits ? (
        <div className="grid gap-4">
          {audits!.map((audit: AuditReport) => (
            <Link key={audit.id} href={`/audit/${audit.id}`} className="block p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold truncate">{audit.website_url}</p>
                  <p className="text-sm text-slate-400 mt-1 capitalize">{audit.project_type?.replace('-', ' ')}</p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  {audit.performance !== null && <div className="text-right">
                    <p className="text-xs text-slate-400">Performance</p>
                    <p className="text-lg font-bold text-white">{audit.performance}</p>
                  </div>}
                  {audit.seo !== null && <div className="text-right">
                    <p className="text-xs text-slate-400">SEO</p>
                    <p className="text-lg font-bold text-white">{audit.seo}</p>
                  </div>}
                  <p className="text-xs text-slate-500 text-right whitespace-nowrap">{new Date(audit.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400 mb-4">No audits yet</p>
          <Link href="/audit/new" className="inline-block px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition">
            Create Your First Audit
          </Link>
        </div>
      )}
    </div>
  );
}
