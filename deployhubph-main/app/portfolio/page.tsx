import PortfolioCard from '../../components/PortfolioCard';
import CTAButton from '../../components/CTAButton';

const projects = [
  {
    title: 'Greenfield Interiors',
    description: 'Interior design website with polished visuals, service pages, and a contact flow optimized for leads.',
    label: 'Interior design',
  },
  {
    title: 'Summit Logistics',
    description: 'B2B site designed for trust and clarity, with service details and easy inquiry paths.',
    label: 'Logistics',
  },
  {
    title: 'Harbor Cafe',
    description: 'Restaurant landing page with menu highlights, location details, and reservation prompts.',
    label: 'Hospitality',
  },
  {
    title: 'Campus Health',
    description: 'Service-oriented site for a medical clinic with user-friendly appointment conversion.',
    label: 'Healthcare',
  },
];

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Portfolio</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Examples of websites built for businesses like yours.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Mock projects showcase the clean layout, conversion-focused content, and secure delivery clients can expect.
        </p>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <PortfolioCard
            key={project.title}
            title={project.title}
            description={project.description}
            label={project.label}
          />
        ))}
      </div>

      <section className="mt-14 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 sm:p-10 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Ready to build your own website?</h2>
            <p className="mt-3 text-slate-400">
              Let&apos;s translate your brand into a website that reflects your business and brings in real inquiries.
            </p>
          </div>
          <div className="flex-shrink-0">
            <CTAButton href="/contact">Start a conversation</CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}
