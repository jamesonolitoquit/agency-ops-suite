import { getBilling, getClients } from "@/lib/db";
import { createBillingAction, updateBillingAction, updateBillingPaidAction } from "@/app/actions";
import { ActionNotice } from "@/components/ActionNotice";

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const [billingRecords, clients] = await Promise.all([getBilling(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));
  const upcomingBills = [...billingRecords].sort((left, right) => left.dueDate.localeCompare(right.dueDate));
  const collectedAmount = upcomingBills.filter((bill) => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = upcomingBills.filter((bill) => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const projectedMrr = clients.filter((client) => client.status === "active").reduce((sum, client) => sum + client.monthlyFee, 0);

  return (
    <section className="space-y-6">
      <ActionNotice ok={params.ok} err={params.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Billing</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Billing tracker</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Track live due dates, payment method, paid state, and collection progress for each client.
        </p>

        <form action={createBillingAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select required name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input required type="date" name="dueDate" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <input
            required
            type="number"
            min="1"
            step="0.01"
            name="amount"
            placeholder="Amount"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />

          <select name="paymentMethod" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="gcash">gcash</option>
            <option value="bank">bank</option>
          </select>

          <select name="paid" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="false">pending</option>
            <option value="true">paid</option>
          </select>

          <input name="notes" placeholder="Billing notes" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add billing record
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Due this cycle</p>
          <p className="mt-2 text-3xl font-semibold text-white">{upcomingBills.filter((bill) => !bill.paid).length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Collected amount</p>
          <p className="mt-2 text-3xl font-semibold text-white">${collectedAmount.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pending amount</p>
          <p className="mt-2 text-3xl font-semibold text-white">${pendingAmount.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Projected MRR</p>
          <p className="mt-2 text-3xl font-semibold text-white">${projectedMrr.toLocaleString()}</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-black/20 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Due date</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Notes</th>
              <th className="px-6 py-4 font-medium">Update</th>
              <th className="px-6 py-4 font-medium">Quick action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {upcomingBills.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-300">
                  No billing records yet. Add your first record above.
                </td>
              </tr>
            )}
            {upcomingBills.map((bill) => (
              <tr key={bill.id} className="text-slate-200">
                <td className="px-6 py-4 font-medium text-white">{clientNamesById.get(bill.clientId) ?? bill.clientId}</td>
                <td className="px-6 py-4">{bill.dueDate}</td>
                <td className="px-6 py-4">${bill.amount.toLocaleString()}</td>
                <td className="px-6 py-4 uppercase tracking-[0.2em]">{bill.paymentMethod}</td>
                <td className="px-6 py-4 capitalize">{bill.paid ? "paid" : "pending"}</td>
                <td className="px-6 py-4 text-slate-300">{bill.notes}</td>
                <td className="px-6 py-4">
                  <form action={updateBillingAction} className="grid gap-2">
                    <input type="hidden" name="id" value={bill.id} />
                    <input type="date" name="dueDate" defaultValue={bill.dueDate} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      name="amount"
                      defaultValue={bill.amount}
                      className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"
                    />
                    <select name="paymentMethod" defaultValue={bill.paymentMethod} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                      <option value="gcash">gcash</option>
                      <option value="bank">bank</option>
                    </select>
                    <select name="paid" defaultValue={bill.paid ? "true" : "false"} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white">
                      <option value="false">pending</option>
                      <option value="true">paid</option>
                    </select>
                    <input name="notes" defaultValue={bill.notes} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white" />
                    <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-100 hover:border-accent-300">
                      Save edit
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4">
                  <form action={updateBillingPaidAction}>
                    <input type="hidden" name="billingId" value={bill.id} />
                    <input type="hidden" name="paid" value={bill.paid ? "false" : "true"} />
                    <button type="submit" className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-100 hover:border-accent-300">
                      {bill.paid ? "Mark pending" : "Mark paid"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}