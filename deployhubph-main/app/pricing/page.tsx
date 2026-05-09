import CTAButton from '../../components/CTAButton';
import PricingCard from '../../components/PricingCard';

const pricing = [
  {
    name: 'Starter',
    price: '₱35,000',
    description: 'Small businesses launch with a polished website and secure setup.',
    features: [
      'Perfect for a small website (up to 5 pages)',
      'Mobile-ready landing pages',
      'SEO foundation and performance tuning',
      '1 month launch support',
    ],
    ctaLabel: 'Start with Starter',
  },
  {
    name: 'Business',
    price: '₱65,000',
    description: 'Best value for growing brands that need custom design and hosting support.',
    features: [
      'Custom design tailored to your brand',
      'Easy content updates and page management',
      'Secure deployment with hosting setup',
      '3 months support and monitoring',
    ],
    ctaLabel: 'Choose Business',
    featured: true,
  },
  {
    name: 'Pro',
    price: '₱120,000',
    description: 'Complete managed website service with premium care and security.',
    features: [
      'Lead capture and analytics-ready pages',
      'Priority support and regular updates',
      'SSL, backups, and security checks',
      '6 months of maintenance coverage',
    ],
    ctaLabel: 'Get Pro plan',
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pricing</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Straightforward packages, no surprises.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Choose the tier that matches your current goals. Each plan includes website build, launch guidance, and support options that make it easy to stay online.
        </p>
      </section>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {pricing.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            ctaLabel={plan.ctaLabel}
            featured={plan.featured}
          />
        ))}
      </div>

      <section className="mt-14 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 sm:p-10 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Need a custom scope?</h2>
            <p className="mt-3 text-slate-400">
              We can tailor a proposal for your business, whether it's an online store, professional service site, or managed hosting package.
            </p>
          </div>
          <div className="flex-shrink-0">
            <CTAButton href="/contact">Request custom quote</CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}
