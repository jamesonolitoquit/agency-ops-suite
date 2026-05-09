interface PortfolioCardProps {
  title: string;
  description: string;
  label: string;
}

export default function PortfolioCard({ title, description, label }: PortfolioCardProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-7 shadow-glow transition hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-glow">
      <span className="inline-flex rounded-full bg-slate-800/50 border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-400">
        {label}
      </span>
      <h3 className="mt-5 text-2xl font-semibold text-brand-text">{title}</h3>
      <p className="mt-4 text-gray-400">{description}</p>
    </div>
  );
}
