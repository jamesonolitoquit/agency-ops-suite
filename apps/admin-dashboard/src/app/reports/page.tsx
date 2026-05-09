import { ActionNotice } from "@/components/ActionNotice";
import { getClients, getReportRuns } from "@/lib/db";
import Link from "next/link";

type ReportsPageProps = {
  searchParams: {
    ok?: string;
    err?: string;
    clientId?: string;
  };
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const selectedClientId = searchParams.clientId?.trim() || "";
  const [clients, runs] = await Promise.all([
    getClients(),
    getReportRuns({
      clientId: selectedClientId || undefined,
      limit: 100
    })
  ]);

  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Reports</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Report history</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Review every generated report run and quickly export the latest snapshot for client updates.
        </p>

        <form method="get" className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
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

          <button
            type="submit"
            className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40"
          >
            Apply filter
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total report runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{runs.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Manual runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{runs.filter((run) => run.reportType === "manual").length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">With export link</p>
          <p className="mt-2 text-3xl font-semibold text-white">{runs.filter((run) => Boolean(run.fileUrl)).length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Snapshot-backed runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{runs.filter((run) => Boolean(run.reportSnapshot)).length}</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-black/20 text-left uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Generated</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Period</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Snapshot</th>
              <th className="px-6 py-4 font-medium">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {runs.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={6}>
                  No report runs found for the current filter.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id}>
                  <td className="px-6 py-4">{new Date(run.generatedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-white">{run.clientId ? clientNamesById.get(run.clientId) ?? run.clientId : "All clients"}</td>
                  <td className="px-6 py-4">{run.periodStart && run.periodEnd ? `${run.periodStart} to ${run.periodEnd}` : "N/A"}</td>
                  <td className="px-6 py-4 uppercase tracking-[0.2em]">{run.reportType}</td>
                  <td className="px-6 py-4">{run.reportSnapshot ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">
                    {run.fileUrl ? (
                      <Link
                        href={`/api/report/export?reportRunId=${run.id}`}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-accent-300"
                      >
                        Download
                      </Link>
                    ) : (
                      <span className="text-slate-500">Unavailable</span>
                    )}
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
