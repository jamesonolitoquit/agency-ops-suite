import Link from "next/link";
import { getClients } from "@/lib/db";
import { getDeploymentChecklist } from "@/lib/agency-db";

type DeploymentChecklistPageProps = {
  searchParams: {
    clientId?: string;
  };
};

const ITEMS = [
  { key: "domainConnected", label: "Domain connected" },
  { key: "sslActive", label: "SSL active" },
  { key: "ctaWorks", label: "CTA works" },
  { key: "mobileResponsive", label: "Mobile responsive" },
  { key: "seoMetaTags", label: "SEO meta tags" },
] as const;

export default async function DeploymentChecklistPage({ searchParams }: DeploymentChecklistPageProps) {
  const clients = await getClients();
  const selectedClientId = searchParams.clientId?.trim() || clients[0]?.id || "";
  const checklist = selectedClientId ? await getDeploymentChecklist(selectedClientId) : null;
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Checklist</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Deployment checklist</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Track the final launch checks for each client site so readiness is visible before handoff.
        </p>

        <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
          <select
            name="clientId"
            defaultValue={selectedClientId}
            className="min-w-[280px] rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40"
          >
            View checklist
          </button>
          <Link href="/clients" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:border-accent-300">
            Back to clients
          </Link>
        </form>
      </div>

      {selectedClient ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Selected client</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedClient.name}</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedClient.businessType} · {selectedClient.domain}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-slate-200">
                {checklist ? `${checklist.completionPercent}% complete` : "No checklist yet"}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {ITEMS.map((item) => {
                const completed = Boolean(checklist?.[item.key]);
                const completedAt = checklist?.[`${item.key}At` as keyof typeof checklist] as string | null | undefined;

                return (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{completedAt ? `Completed ${new Date(completedAt).toLocaleString()}` : "Not completed yet"}</p>
                    </div>
                    <span className={completed ? "text-emerald-300" : "text-slate-500"}>{completed ? "Done" : "Pending"}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Readiness summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This page uses the existing deployment checklist API and client records, so the dashboard route now has a real destination instead of a 404.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>Client ID: {selectedClient.id}</p>
              <p>Plan: {selectedClient.plan}</p>
              <p>Status: {selectedClient.status}</p>
              <p>Ready for deploy: {selectedClient.readyForDeploy ? "Yes" : "No"}</p>
            </div>
          </article>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
          No clients found to display a checklist.
        </div>
      )}
    </section>
  );
}