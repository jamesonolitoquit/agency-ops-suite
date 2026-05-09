interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  ctaLabel,
  featured = false,
}: PricingCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-8 transition ${
        featured
          ? 'border-cyan-500/40 bg-slate-800/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
          : 'border-cyan-500/10 bg-slate-800/30 shadow-glow'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{name}</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-brand-text">{price}</p>
        </div>
        {featured ? (
          <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950">
            Most popular
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-gray-400">{description}</p>

      <ul className="mt-8 space-y-4 text-gray-300">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm leading-6">
            <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-cyan-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <a
          href="/contact"
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
