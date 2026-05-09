import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-slate-800">404</div>
        <h1 className="text-2xl font-bold text-white">Audit Not Found</h1>
        <p className="text-slate-400">This audit report either doesn't exist, has expired, or is not publicly shared.</p>
        <Link href="/audit" className="inline-block mt-4 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition">
          View All Audits
        </Link>
      </div>
    </div>
  );
}
