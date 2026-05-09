import { getMaintenance, getClients } from "@/lib/db";
import { createMaintenanceAction, updateMaintenanceAction } from "@/app/actions";
import { ActionNotice } from "@/components/ActionNotice";

export default async function MaintenancePage({
  searchParams
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const [maintenance, clients] = await Promise.all([getMaintenance(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));
  const hasMaintenance = maintenance.length > 0;
  const averageUptime =
    hasMaintenance ? maintenance.reduce((total, site) => total + site.uptimePercent, 0) / maintenance.length : 0;
  const totalPendingTasks = maintenance.reduce((total, site) => total + site.pendingTasks, 0);
  const totalVisits = maintenance.reduce((total, site) => total + site.monthlyVisits, 0);

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Maintenance</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Maintenance dashboard</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Track uptime, update cadence, and pending tasks so monthly retainers are supported by visible maintenance proof.
        </p>

        <form action={createMaintenanceAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select required name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            step="0.01"
            min="0"
            max="100"
            name="uptimePercent"
            placeholder="Uptime %"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />

          <input
            required
            type="number"
            min="0"
            step="1"
            name="pendingTasks"
            placeholder="Pending tasks"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />

          <input
            required
            type="number"
            min="0"
            step="1"
            name="monthlyVisits"
            placeholder="Monthly visits"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />

          <input name="note" placeholder="Maintenance note" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add maintenance record
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Average uptime</p>
          <p className="mt-2 text-3xl font-semibold text-white">{averageUptime.toFixed(2)}%</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pending tasks</p>
          <p className="mt-2 text-3xl font-semibold text-white">{totalPendingTasks}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Monthly visits</p>
          <p className="mt-2 text-3xl font-semibold text-white">{totalVisits.toLocaleString()}</p>
        </article>
      </div>

      <div className="space-y-3">
        {maintenance.map((site) => (
          <article key={site.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{site.uptimePercent.toFixed(2)}% uptime</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{clientNamesById.get(site.clientId) ?? site.clientId}</h2>
                <p className="mt-2 text-sm text-slate-300">{site.note}</p>

                <form action={updateMaintenanceAction} className="mt-4 grid gap-2 md:grid-cols-4">
                  <input type="hidden" name="id" value={site.id} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="uptimePercent"
                    defaultValue={site.uptimePercent}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    name="pendingTasks"
                    defaultValue={site.pendingTasks}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    name="monthlyVisits"
                    defaultValue={site.monthlyVisits}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"
                  />
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:border-accent-300">
                    Save
                  </button>
                  <input
                    name="note"
                    defaultValue={site.note}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white md:col-span-4"
                  />
                </form>
              </div>
              <div className="text-sm text-slate-400 md:text-right">
                <p>Last update: {site.lastUpdatedAt}</p>
                <p className="mt-1">Pending tasks: {site.pendingTasks}</p>
                <p className="mt-1">Visits: {site.monthlyVisits.toLocaleString()}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}