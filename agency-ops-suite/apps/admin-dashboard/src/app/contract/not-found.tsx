import Link from 'next/link';

export default function ContractNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Contract Not Found</h1>
        <p className="text-slate-400">The contract you're looking for doesn't exist.</p>
      </div>
      <Link
        href="/contract"
        className="px-6 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 font-semibold"
      >
        Back to Contracts
      </Link>
    </div>
  );
}
