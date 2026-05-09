import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { AuditResults } from '@/components/AuditResults';

interface PageParams {
  id: string;
}

export default async function AuditDetailPage(props: { params: Promise<PageParams> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: audit, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', params.id)
    .eq('created_by', user.id)
    .single();

  if (error || !audit) {
    redirect('/audit');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/audit" className="text-slate-400 hover:text-white transition">
          ← Back to Audits
        </Link>
        <span className="text-slate-600">•</span>
        <span className="text-sm text-slate-400">ID: {params.id.slice(0, 8)}...</span>
      </div>

      <AuditResults audit={audit} />

      <div className="flex gap-4">
        <Link href={`/audit/report/${audit.public_token}`} target="_blank" className="flex-1 px-4 py-2 rounded-lg bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 border border-accent-500/30 font-medium text-center transition">
          View Public Report
        </Link>
        <Link href="/audit/new" className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium text-center transition">
          New Audit
        </Link>
      </div>
    </div>
  );
}
