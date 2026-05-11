import { ActionNotice } from "@/components/ActionNotice";
import { createAssetAction, updateAssetAction } from "@/app/actions";
import { getAssets, getClients } from "@/lib/db";

export default async function AssetsPage({
  searchParams
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const [assets, clients] = await Promise.all([getAssets(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));

  const counts = {
    image: assets.filter((asset) => asset.assetType === "image").length,
    video: assets.filter((asset) => asset.assetType === "video").length,
    document: assets.filter((asset) => asset.assetType === "document").length,
    other: assets.filter((asset) => asset.assetType === "other").length
  };

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Assets</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Asset library</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Store client-linked asset URLs and classify them so content production has one searchable source.
        </p>

        <form action={createAssetAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input required name="name" placeholder="Asset name" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <input required type="url" name="assetUrl" placeholder="https://..." className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <select name="assetType" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="image">image</option>
            <option value="video">video</option>
            <option value="document">document</option>
            <option value="other">other</option>
          </select>

          <input name="notes" placeholder="Notes" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add asset
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Images</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.image}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Videos</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.video}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Documents</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.document}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Other</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.other}</p>
        </article>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{asset.assetType}</p>
                <h2 className="text-lg font-semibold text-white">{asset.name}</h2>
                <p className="text-sm text-slate-300">{asset.notes || "No notes"}</p>
                <a href={asset.assetUrl} target="_blank" rel="noreferrer" className="text-sm text-accent-200 underline">
                  {asset.assetUrl}
                </a>

                <form action={updateAssetAction} className="mt-3 grid gap-2 md:grid-cols-4">
                  <input type="hidden" name="id" value={asset.id} />
                  <input name="name" defaultValue={asset.name} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white" />
                  <input type="url" name="assetUrl" defaultValue={asset.assetUrl} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white md:col-span-2" />
                  <select name="assetType" defaultValue={asset.assetType} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white">
                    <option value="image">image</option>
                    <option value="video">video</option>
                    <option value="document">document</option>
                    <option value="other">other</option>
                  </select>
                  <input name="notes" defaultValue={asset.notes} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white md:col-span-4" />
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-100 hover:border-accent-300 md:col-span-4">
                    Save asset
                  </button>
                </form>
              </div>

              <div className="text-sm text-slate-400 md:text-right">
                <p>Created: {asset.createdAt}</p>
                <p className="mt-1">Client: {asset.clientId ? clientNamesById.get(asset.clientId) ?? asset.clientId : "Unassigned"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
