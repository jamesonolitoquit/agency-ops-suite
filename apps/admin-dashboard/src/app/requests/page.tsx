import { getClients, getRequests } from "@/lib/db";
import { createRequestAction, updateRequestStatusAction } from "@/app/actions";
import { ActionNotice } from "@/components/ActionNotice";

const statusOrder = ["pending", "in_progress", "done"] as const;

export default async function RequestsPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const [requests, clients] = await Promise.all([getRequests(), getClients()]);
  const counts = statusOrder.map((status) => ({
    status,
    count: requests.filter((request) => request.status === status).length
  }));

  return (
    <section className="space-y-6">
      <ActionNotice ok={params.ok} err={params.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Requests</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Client request queue</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Keep every client request in one queue with a clear status so delivery work stays out of chat threads.
        </p>

        <form action={createRequestAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select required name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <input required name="title" placeholder="Request title" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />
          <textarea
            required
            name="description"
            placeholder="Describe the request"
            rows={3}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-3"
          />
          <select name="status" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="pending">pending</option>
            <option value="in_progress">in progress</option>
            <option value="done">done</option>
          </select>
          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40 md:col-span-2">
            Add request
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {counts.map((item) => (
          <article key={item.status} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.status}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.count}</p>
          </article>
        ))}
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <article key={request.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <form action={updateRequestStatusAction} className="inline-flex items-center gap-2">
                  <input type="hidden" name="requestId" value={request.id} />
                  <select name="status" defaultValue={request.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white uppercase tracking-[0.15em]">
                    <option value="pending">pending</option>
                    <option value="in_progress">in progress</option>
                    <option value="done">done</option>
                  </select>
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:border-accent-300">
                    Save
                  </button>
                </form>
                <h2 className="mt-1 text-lg font-semibold text-white">{request.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{request.description}</p>
              </div>
              <div className="text-sm text-slate-400 md:text-right">
                <p>{request.createdAt}</p>
                <p className="mt-1">Client: {request.clientId}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}