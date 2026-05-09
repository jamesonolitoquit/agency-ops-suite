import { getLeads } from "@/lib/db";
import { createLeadAction, updateLeadStatusAction } from "@/app/actions";
import { ActionNotice } from "@/components/ActionNotice";

const statusOrder = ["new", "contacted", "replied", "closed"] as const;

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const leads = await getLeads();
  const counts = statusOrder.map((status) => ({
    status,
    count: leads.filter((lead) => lead.status === status).length
  }));

  return (
    <section className="space-y-6">
      <ActionNotice ok={params.ok} err={params.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Leads</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Lead tracker</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Track outreach by source, stage, and notes so the sales pipeline stays visible from first contact to close.
        </p>

        <form action={createLeadAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <input required name="name" placeholder="Lead name" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <input required name="businessType" placeholder="Business type" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />
          <select name="source" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="facebook">facebook</option>
            <option value="google">google</option>
          </select>
          <select name="status" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="new">new</option>
            <option value="contacted">contacted</option>
            <option value="replied">replied</option>
            <option value="closed">closed</option>
          </select>
          <input name="notes" placeholder="Notes" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />
          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add lead
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {counts.map((item) => (
          <article key={item.status} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.status}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.count}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-black/20 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Lead</th>
              <th className="px-6 py-4 font-medium">Business type</th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {leads.map((lead) => (
              <tr key={lead.id} className="text-slate-200">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.createdAt}</p>
                </td>
                <td className="px-6 py-4">{lead.businessType}</td>
                <td className="px-6 py-4 capitalize">{lead.source}</td>
                <td className="px-6 py-4 capitalize">
                  <form action={updateLeadStatusAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select name="status" defaultValue={lead.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="replied">replied</option>
                      <option value="closed">closed</option>
                    </select>
                    <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:border-accent-300">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 text-slate-300">{lead.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}