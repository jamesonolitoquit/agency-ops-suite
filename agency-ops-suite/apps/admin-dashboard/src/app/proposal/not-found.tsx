import Link from 'next/link';

export default function ProposalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-slate-400 mb-6">Proposal not found</p>
        <Link href="/proposal" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 font-medium">
          Back to Proposals
        </Link>
      </div>
    </div>
  );
}
