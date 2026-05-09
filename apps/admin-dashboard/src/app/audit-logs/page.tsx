import { ActionNotice } from "@/components/ActionNotice";
import { getAuditLogs } from "@/lib/db";

type AuditLogsPageProps = {
  searchParams: {
    ok?: string;
    err?: string;
    entityType?: string;
    action?: string;
  };
};

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const selectedEntityType = searchParams.entityType?.trim() || "";
  const selectedAction = searchParams.action?.trim() || "";

  const logs = await getAuditLogs({
    entityType: selectedEntityType || undefined,
    action: selectedAction || undefined,
    limit: 200
  });

  const entityTypeCounts = logs.reduce<Record<string, number>>((accumulator, log) => {
    accumulator[log.entityType] = (accumulator[log.entityType] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Audit</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Audit logs</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Review the most recent mutating actions across the dashboard and trace what changed, when, and on which entity.
        </p>

        <form method="get" className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            name="entityType"
            defaultValue={selectedEntityType}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="">All entity types</option>
            <option value="client">Clients</option>
            <option value="billing">Billing</option>
            <option value="lead">Leads</option>
            <option value="request">Requests</option>
            <option value="task">Tasks</option>
            <option value="asset">Assets</option>
            <option value="domain">Domains</option>
            <option value="maintenance">Maintenance</option>
            <option value="report">Reports</option>
            <option value="provisioning">Provisioning</option>
          </select>

          <select
            name="action"
            defaultValue={selectedAction}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="update-status">Update status</option>
            <option value="mark-paid">Mark paid</option>
            <option value="generate">Generate</option>
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
          <p className="text-sm text-slate-400">Total logs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{logs.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Latest entity type</p>
          <p className="mt-2 text-3xl font-semibold text-white">{logs[0]?.entityType ?? "None"}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Most common type</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {Object.entries(entityTypeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "None"}
          </p>
        </article>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-black/20 text-left uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium">Entity</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Summary</th>
              <th className="px-6 py-4 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {logs.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-slate-400" colSpan={5}>
                  No audit logs found for the current filter.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    {log.entityType}
                    <span className="ml-2 text-xs font-normal text-slate-400">{log.entityId ?? "unscoped"}</span>
                  </td>
                  <td className="px-6 py-4 uppercase tracking-[0.2em]">{log.action}</td>
                  <td className="px-6 py-4">{log.summary}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <pre className="max-w-[26rem] whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/20 p-3">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
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