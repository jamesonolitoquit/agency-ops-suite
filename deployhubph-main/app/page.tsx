import Link from 'next/link';
import CTAButton from '../components/CTAButton';
import ServiceCard from '../components/ServiceCard';
import PricingCard from '../components/PricingCard';
import PortfolioCard from '../components/PortfolioCard';

const services = [
  {
    title: 'Website development',
    description:
      'Custom websites built for performance, conversion, and mobile-first user experience.',
  },
  {
    title: 'Deployment & hosting',
    description:
      'Fast, reliable deployments with managed hosting and all the infrastructure handled for you.',
  },
  {
    title: 'SSL setup & security',
    description:
      'Secure HTTPS setup, certificate management, and best practices to protect your brand online.',
  },
  {
    title: 'Maintenance & support',
    description:
      'Ongoing updates, backups, and support so your website stays live and polished.',
  },
];

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

const portfolio = [
  {
    title: 'Greenfield Interiors',
    description: 'Modern studio site with service pages, booking, and polished design.',
    label: 'Interior design',
  },
  {
    title: 'Summit Logistics',
    description: 'B2B web presence with clear service breakdown and trust signals.',
    label: 'Logistics',
  },
  {
    title: 'Harbor Cafe',
    description: 'Restaurant website with menu showcase and contact conversion flow.',
    label: 'Hospitality',
  },
];

export default function HomePage() {
  return (
    <main>

      <section className="relative overflow-hidden border-t border-slate-800 bg-slate-950 px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex rounded-full bg-slate-800 px-4 py-2 text-sm uppercase tracking-[0.24em] text-slate-300">
              Business website solutions
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-6xl">
              Build, launch, and maintain a professional website with one trusted partner.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Deploy Hub helps small and medium businesses move from concept to live site quickly, with managed hosting, SSL setup, and ongoing support tailored to your growth.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTAButton href="/contact">Get Started</CTAButton>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft backdrop-blur-sm sm:p-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Featured service</p>
              <h2 className="text-2xl font-semibold text-white">Launch-ready website packages</h2>
              <p className="text-slate-400">
                Complete site build, secure deployment, and hosting management designed to keep your business visible and fast.
              </p>
              <div className="grid gap-3 pt-4 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="font-semibold text-slate-100">Fast deployment</p>
                  <p className="text-slate-400">Launch in weeks with a streamlined process.</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="font-semibold text-slate-100">Managed hosting</p>
                  <p className="text-slate-400">Secure infrastructure and uptime monitoring.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Services</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Designed for businesses that want clarity and results.
          </h2>
          <p className="mt-4 text-slate-400">
            From polished landing pages to full website management, every solution is built to be secure, modern, and easy to own.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.title} title={service.title} description={service.description} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Portfolio preview</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Websites built for clarity and growth.</h2>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Explore portfolio
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {portfolio.map((item) => (
              <PortfolioCard key={item.title} title={item.title} description={item.description} label={item.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pricing highlights</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Simple packages for every stage.</h2>
          <p className="mt-4 text-slate-400">
            Starter, Business, and Pro tiers give clear scope and a practical path to launch. Each plan includes expert setup, hosting guidance, and hands-on support.
          </p>
        </div>
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
      </section>

      <section className="border-t border-slate-800 bg-slate-900 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-950/90 p-10 shadow-soft backdrop-blur-sm sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Start your project</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Ready for a website that works as hard as you do?</h2>
              <p className="mt-4 text-slate-400">
                Book a free consultation and get a clear roadmap for design, launch, and maintenance.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <CTAButton href="/contact">Request a quote</CTAButton>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
