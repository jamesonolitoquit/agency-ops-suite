interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-7 shadow-glow transition hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-glow">
      <h3 className="text-xl font-semibold text-brand-text">{title}</h3>
      <p className="mt-4 text-gray-400">{description}</p>
    </div>
  );
}
