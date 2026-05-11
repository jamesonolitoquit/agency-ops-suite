export function StatsCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="rounded-md border border-white/6 bg-black/10 p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-sm text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}
