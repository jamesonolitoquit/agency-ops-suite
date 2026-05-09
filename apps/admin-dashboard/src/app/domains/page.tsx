import { ActionNotice } from "@/components/ActionNotice";
import { createDomainAction, updateDomainAction } from "@/app/actions";
import { getClients, getDomains } from "@/lib/db";

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

export default async function DomainsPage({
  searchParams
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const [domains, clients] = await Promise.all([getDomains(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));

  const counts = {
    active: domains.filter((domain) => domain.status === "active").length,
    expiringSoon: domains.filter((domain) => domain.status === "expiring_soon").length,
    expired: domains.filter((domain) => domain.status === "expired").length,
    pendingTransfer: domains.filter((domain) => domain.status === "pending_transfer").length
  };

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Domains</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Domain and hosting tracker</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Keep renewal dates, registrar ownership, and hosting providers in one view so domain handoffs stay visible.
        </p>

        <form action={createDomainAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input required name="domain" placeholder="Domain" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <input required name="registrar" placeholder="Registrar" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <input required name="hostingProvider" placeholder="Hosting provider" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <select name="status" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="active">active</option>
            <option value="expiring_soon">expiring_soon</option>
            <option value="expired">expired</option>
            <option value="pending_transfer">pending_transfer</option>
          </select>

          <input required type="date" name="expiryDate" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-slate-200 md:col-span-1">
            <input type="checkbox" name="autoRenew" value="true" className="h-4 w-4 rounded border-white/20 bg-black/20" />
            Auto renew
          </label>

          <input name="notes" placeholder="Notes" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add domain
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{counts.active}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Expiring soon</p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">{counts.expiringSoon}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Expired</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{counts.expired}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pending transfer</p>
          <p className="mt-2 text-3xl font-semibold text-sky-300">{counts.pendingTransfer}</p>
        </article>
      </div>

      <div className="space-y-3">
        {domains.map((domain) => (
          <article key={domain.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{domain.status}</p>
                <h2 className="text-lg font-semibold text-white">{domain.domain}</h2>
                <p className="text-sm text-slate-300">{domain.notes || "No notes"}</p>
                <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>Registrar: {domain.registrar}</p>
                  <p>Hosting: {domain.hostingProvider}</p>
                  <p>Expiry: {new Date(domain.expiryDate).toLocaleDateString()}</p>
                  <p>Auto renew: {domain.autoRenew ? "Yes" : "No"}</p>
                </div>

                <form action={updateDomainAction} className="mt-3 grid gap-2 md:grid-cols-4">
                  <input type="hidden" name="id" value={domain.id} />
                  <input name="domain" defaultValue={domain.domain} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white" />
                  <input name="registrar" defaultValue={domain.registrar} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white" />
                  <input name="hostingProvider" defaultValue={domain.hostingProvider} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white" />
                  <select name="status" defaultValue={domain.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white">
                    <option value="active">active</option>
                    <option value="expiring_soon">expiring_soon</option>
                    <option value="expired">expired</option>
                    <option value="pending_transfer">pending_transfer</option>
                  </select>
                  <input
                    type="date"
                    name="expiryDate"
                    defaultValue={toDateInputValue(domain.expiryDate)}
                    className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white"
                  />
                  <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-slate-200">
                    <input type="checkbox" name="autoRenew" value="true" defaultChecked={domain.autoRenew} className="h-4 w-4 rounded border-white/20 bg-black/20" />
                    Auto renew
                  </label>
                  <input name="notes" defaultValue={domain.notes} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white md:col-span-4" />
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-100 hover:border-accent-300 md:col-span-4">
                    Save domain
                  </button>
                </form>
              </div>

              <div className="text-sm text-slate-400 md:text-right">
                <p>Created: {new Date(domain.createdAt).toLocaleString()}</p>
                <p className="mt-1">Client: {domain.clientId ? clientNamesById.get(domain.clientId) ?? domain.clientId : "Unassigned"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}