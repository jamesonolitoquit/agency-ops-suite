import { ContractResults } from '@/components/ContractResults';
import { getPublicContract } from '@/lib/contract-service';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicContractPage({ params }: PageProps) {
  const { token } = await params;

  const contract = await getPublicContract(token);

  if (!contract) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Contract Not Found</h1>
          <p className="text-slate-400 mt-2">The contract you're trying to view doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ContractResults contract={contract} isPublic={true} />
    </div>
  );
}
