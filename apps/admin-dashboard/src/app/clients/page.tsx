import { getClients } from "@/lib/db";
import { createClientAction, updateClientAction, updateClientStatusAction, setClientDeployReadinessAction } from "@/app/actions";
import { ActionNotice } from "@/components/ActionNotice";

export default async function ClientsPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const clients = await getClients();

  return (
    <section className="space-y-6">
      <ActionNotice ok={params.ok} err={params.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Clients</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Client CRM foundation</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          This page holds the first working client table, including plan, fee, billing cycle, status, and notes.
        </p>

        <form action={createClientAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <input required name="name" placeholder="Client name" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <input required name="businessType" placeholder="Business type" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <input required name="domain" placeholder="Domain" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <select name="plan" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="starter">starter</option>
            <option value="growth">growth</option>
            <option value="pro">pro</option>
          </select>

          <input
            required
            type="number"
            min="1"
            step="0.01"
            name="monthlyFee"
            placeholder="Monthly fee"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />

          <select name="billingCycle" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="monthly">monthly</option>
            <option value="quarterly">quarterly</option>
          </select>

          <select name="status" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="churned">churned</option>
          </select>

          <input name="notes" placeholder="Notes" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add client
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {clients.map((client) => (
          <article key={client.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              {/* Identity + status */}
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{client.name}</h2>
                  <span className="rounded-full border border-white/10 px-3 py-0.5 text-xs uppercase tracking-[0.2em] text-accent-200">
                    {client.status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                      client.readyForDeploy
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {client.readyForDeploy ? "Ready to deploy" : "Blocked from deploy"}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {client.domain} · {client.plan} · ${client.monthlyFee.toLocaleString()}/{client.billingCycle}
                </p>
                {client.liveUrl && (
                  <p className="text-xs text-slate-500">
                    Live: <span className="text-slate-300">{client.liveUrl}</span>
                  </p>
                )}
                {client.notes && <p className="text-sm text-slate-300">{client.notes}</p>}
              </div>

              {/* Deploy readiness toggle */}
              <div className="shrink-0 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Deploy gate</p>
                <form action={setClientDeployReadinessAction} className="grid gap-2">
                  <input type="hidden" name="clientId" value={client.id} />
                  <input
                    name="liveUrl"
                    defaultValue={client.liveUrl}
                    placeholder={`https://${client.domain}`}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-accent-300 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      name="readyForDeploy"
                      value="true"
                      className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/25"
                    >
                      Mark ready
                    </button>
                    <button
                      type="submit"
                      name="readyForDeploy"
                      value="false"
                      className="flex-1 rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300 hover:border-white/30"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {/* Edit form */}
              <div className="shrink-0 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Edit</p>
                <form action={updateClientAction} className="grid gap-2">
                  <input type="hidden" name="id" value={client.id} />
                  <input required name="name" defaultValue={client.name} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                  <input required name="businessType" defaultValue={client.businessType} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                  <input required name="domain" defaultValue={client.domain} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                  <select name="plan" defaultValue={client.plan} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                    <option value="starter">starter</option>
                    <option value="growth">growth</option>
                    <option value="pro">pro</option>
                  </select>
                  <input required type="number" min="1" step="0.01" name="monthlyFee" defaultValue={client.monthlyFee} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                  <select name="billingCycle" defaultValue={client.billingCycle} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                    <option value="monthly">monthly</option>
                    <option value="quarterly">quarterly</option>
                  </select>
                  <select name="status" defaultValue={client.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="churned">churned</option>
                  </select>
                  <textarea name="notes" defaultValue={client.notes} rows={2} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:border-accent-300">
                    Update client
                  </button>
                </form>
              </div>

            </div>
          </article>
        ))}
      </div>
    </section>
  );
}