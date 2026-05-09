import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SecurityForms } from '@/components/SecurityForms';

export default async function SecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-accent-200">Account security</p>
        <h1 className="text-4xl font-bold text-white">Password management</h1>
        <p className="text-sm leading-6 text-slate-300">
          Keep a direct in-app change flow for quick rotation, plus a reset link for lockout cases.
        </p>
      </div>

      <SecurityForms email={user.email ?? ''} />
    </div>
  );
}
