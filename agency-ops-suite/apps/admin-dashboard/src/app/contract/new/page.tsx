import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ContractForm } from '@/components/ContractForm';

export default async function NewContractPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">New Contract</h1>
        <p className="text-slate-400 mt-2">Create a new service contract for a client</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-8">
        <ContractForm />
      </div>
    </div>
  );
}
