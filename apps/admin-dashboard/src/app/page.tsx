import {
  getClients,
  getBilling,
  getRequests,
  getTasks,
  getDomains,
  getProvisioningRuns,
  getReportRuns,
  getAuditLogs
} from "@/lib/db";
import Link from "next/link";
import { generateReportAction } from "@/app/actions";

function getCurrentMonthRange() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10)
  };
}

export default async function DashboardHome() {
  const [clients, billing, requests, tasks, domains, provisioningRuns, reportRuns, auditLogs] = await Promise.all([
    getClients(),
    getBilling(),
    getRequests(),
    getTasks(),
    getDomains(),
    getProvisioningRuns({ limit: 50 }),
    getReportRuns({ limit: 50 }),
    getAuditLogs({ limit: 50 })
  ]);
  const { periodStart, periodEnd } = getCurrentMonthRange();
  const activeClients = clients.filter((client) => client.status === "active");
  const monthlyRevenue = activeClients.reduce((sum, client) => sum + client.monthlyFee, 0);
  const pendingPayments = billing.filter((item) => !item.paid).length;
  const openRequests = requests.filter((item) => item.status !== "done").length;
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const expiringDomains = domains.filter((domain) => domain.status === "expiring_soon" || domain.status === "expired").length;
  const pendingProvisioningRuns = provisioningRuns.filter((run) => run.status === "pending").length;
  const recentReportRuns = reportRuns.length;
  const recentAuditEvents = auditLogs.length;
  const contentLoad = activeClients.length > 0 ? Math.round((reportRuns.length / activeClients.length) * 100) : 0;
  const totalBillings = billing.length;
  const paidBillings = billing.filter((item) => item.paid).length;
  const collectionRate = totalBillings > 0 ? Math.round((paidBillings / totalBillings) * 100) : 0;
  const latestReportTimestamp = reportRuns[0]?.generatedAt ?? null;

  const metrics = [
    { label: "Active clients", value: String(activeClients.length) },
    { label: "Monthly revenue", value: `$${monthlyRevenue.toLocaleString()}` },
    { label: "Pending payments", value: String(pendingPayments) },
    { label: "Open requests", value: String(openRequests) },
    { label: "Open tasks", value: String(openTasks) },
    { label: "Domains at risk", value: String(expiringDomains) },
    { label: "Provisioning pending", value: String(pendingProvisioningRuns) },
    { label: "Collection rate", value: `${collectionRate}%` },
    { label: "Recent audit events", value: String(recentAuditEvents) }
  ];

  const workstreams = [
    {
      title: "CRM + billing",
      copy: "Single source of truth for clients, plans, invoices, and status."
    },
    {
      title: "Lead pipeline",
      copy: "Track outreach, replies, and closes without losing context in chat threads."
    },
    {
      title: "Maintenance proof",
      copy: "Show uptime, task status, and recent work to justify retention."
    }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Internal operations</p>
          <h1 className="text-3xl font-semibold text-white md:text-5xl">Agency control center for delivery, billing, and retention.</h1>
          <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            Start here with a private admin workspace that keeps clients, leads, payments, requests, and maintenance in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/api/report/export"
              className="rounded-full border border-accent-300 bg-accent-500/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-500/35"
            >
              Export report
            </Link>
            <Link
              href="/api/report/export?format=json"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-accent-300 hover:bg-accent-500/15"
            >
              Export JSON
            </Link>
            <form action={generateReportAction} className="flex items-center gap-2">
              <input type="hidden" name="clientId" value="" />
              <input type="hidden" name="periodStart" value={periodStart} />
              <input type="hidden" name="periodEnd" value={periodEnd} />
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-accent-300 hover:bg-accent-500/15"
              >
                Generate Report
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Executive snapshot</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            A quick read on current delivery pressure: revenue, run rate, operational load, and the amount of work waiting to move.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Report runs</p>
              <p className="mt-2 text-2xl font-semibold text-white">{recentReportRuns}</p>
              <p className="mt-1 text-xs text-slate-400">
                {latestReportTimestamp ? `Last: ${new Date(latestReportTimestamp).toLocaleString()}` : "No reports yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Audit coverage</p>
              <p className="mt-2 text-2xl font-semibold text-white">{recentAuditEvents}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ops load</p>
              <p className="mt-2 text-2xl font-semibold text-white">{contentLoad}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Provisioning queue</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pendingProvisioningRuns}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Domains at risk</p>
              <p className="mt-2 text-2xl font-semibold text-white">{expiringDomains}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open tasks</p>
              <p className="mt-2 text-2xl font-semibold text-white">{openTasks}</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Live signals</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Active clients</p>
              <p className="mt-1 text-xl font-semibold text-white">{activeClients.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Pending payments</p>
              <p className="mt-1 text-xl font-semibold text-white">{pendingPayments}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Open requests</p>
              <p className="mt-1 text-xl font-semibold text-white">{openRequests}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {workstreams.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Recent clients</h2>
          <div className="mt-4 space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-sm text-slate-400">{client.businessType} · {client.domain}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent-200">
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Upcoming billing</h2>
          <div className="mt-4 space-y-3">
            {billing.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{entry.clientId}</p>
                    <p className="text-sm text-slate-400">Due {entry.dueDate} · {entry.paymentMethod}</p>
                  </div>
                  <span className={entry.paid ? "text-emerald-300" : "text-amber-300"}>{entry.paid ? "paid" : "pending"}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}