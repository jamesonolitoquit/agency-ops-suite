import { ActionNotice } from "@/components/ActionNotice";
import { getClients, getProvisioningRuns } from "@/lib/db";
import { triggerProvisioningAction } from "@/app/actions";
import { getTemplates } from "@/lib/templates";

type ProvisioningPageProps = {
  searchParams: Promise<{
    ok?: string;
    err?: string;
    clientId?: string;
    status?: "pending" | "success" | "failed";
  }>;
};

export default async function ProvisioningPage({ searchParams }: ProvisioningPageProps) {
  const params = await searchParams;
  const selectedClientId = params.clientId?.trim() || "";
  const selectedStatus = params.status?.trim() || "";

  const [clients, runs] = await Promise.all([
    getClients(),
    getProvisioningRuns({
      clientId: selectedClientId || undefined,
      status: selectedStatus ? (selectedStatus as "pending" | "success" | "failed") : undefined,
      limit: 200
    })
  ]);
  const templates = getTemplates();

  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));
  const statusCounts = {
    pending: runs.filter((run) => run.status === "pending").length,
    success: runs.filter((run) => run.status === "success").length,
    failed: runs.filter((run) => run.status === "failed").length
  };

  return (
    <section className="space-y-6">
      <ActionNotice ok={params.ok} err={params.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Provisioning</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Provisioning runs</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Track CLI provisioning outcomes by client and status so deployment reliability is visible without checking local logs.
        </p>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-sm font-medium text-slate-200">Trigger provisioning run</p>
          <p className="mt-1 text-xs text-slate-400">Client must be marked ready to deploy before triggering.</p>
          <form action={triggerProvisioningAction} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
            <select
              required
              name="clientId"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            >
              <option value="">Select client</option>
              {clients.filter((c) => c.readyForDeploy).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input
              required
              name="domain"
              placeholder="Domain"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <select
              required
              name="templateType"
              defaultValue=""
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            >
              <option value="">Select template</option>
              {templates.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40"
            >
              Start run
            </button>
          </form>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {templates.slice(0, 3).map((template) => (
              <article key={template.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-accent-200">{template.vertical}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{template.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{template.description}</p>
                <div className="mt-4 space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="font-medium text-white">Pages:</span> {template.pages.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium text-white">CTA:</span> {template.cta}
                  </div>
                  <div>
                    <span className="font-medium text-white">SEO:</span> {template.seoChecklist.join(' · ')}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form method="get" className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <select
            name="clientId"
            defaultValue={selectedClientId}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={selectedStatus}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <button
            type="submit"
            className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40"
          >
            Apply filter
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{runs.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">{statusCounts.pending}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Success</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{statusCounts.success}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Failed</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{statusCounts.failed}</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-black/20 text-left uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Started</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Template</th>
              <th className="px-6 py-4 font-medium">Domain</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {runs.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={6}>
                  No provisioning runs found for the current filter.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id}>
                  <td className="px-6 py-4">{new Date(run.startedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-white">{run.clientId ? clientNamesById.get(run.clientId) ?? run.clientId : "Unscoped"}</td>
                  <td className="px-6 py-4">{run.templateType}</td>
                  <td className="px-6 py-4">{run.domain}</td>
                  <td className="px-6 py-4 uppercase tracking-[0.2em]">
                    <span
                      className={
                        run.status === "success"
                          ? "text-emerald-300"
                          : run.status === "failed"
                            ? "text-rose-300"
                            : "text-amber-300"
                      }
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {run.status === "failed" && run.errorMessage ? run.errorMessage : run.outputPath ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
