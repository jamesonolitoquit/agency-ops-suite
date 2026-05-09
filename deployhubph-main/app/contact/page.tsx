import ContactForm from '../../components/ContactForm';

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <section>
        <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold text-brand-text sm:text-5xl">Talk to a website expert.</h1>
        <p className="mt-5 text-lg leading-8 text-gray-300">
          Share your project details and we’ll provide a practical proposal for your website, hosting, and ongoing support.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <aside className="rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-6 sm:p-8 text-gray-300 shadow-glow">
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-text">What we handle</h2>
          <ul className="mt-6 space-y-4">
            <li>Complete website development from design to deployment</li>
            <li>Managed hosting with uptime monitoring</li>
            <li>SSL setup, certificate renewals, and security reviews</li>
            <li>Ongoing maintenance, content updates, and support</li>
          </ul>
          <div className="mt-8 rounded-xl border border-cyan-500/10 bg-slate-900/50 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">Need help now?</p>
            <p className="mt-3 text-gray-200">
              Send a quick message with your timeline and we’ll respond with the fastest next step.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
