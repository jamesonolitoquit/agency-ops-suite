import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ContractResults } from '@/components/ContractResults';
import { getContractById } from '@/lib/contract-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const contract = await getContractById(id, user.id);

  if (!contract) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Contract Not Found</h1>
          <p className="text-slate-400 mt-2">The contract you're looking for doesn't exist or you don't have access to it.</p>
        </div>
        <Link
          href="/contract"
          className="inline-block px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 font-semibold"
        >
          Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/contract" className="text-accent-400 hover:text-accent-300 text-sm font-semibold">
        ← Back to Contracts
      </Link>
      <ContractResults contract={contract} />
    </div>
  );
}
