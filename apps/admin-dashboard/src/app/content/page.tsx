import { ActionNotice } from "@/components/ActionNotice";
import { createContentOutputRecord, getClients, getContentOutputs } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContentGeneratorPanel } from "./ContentGeneratorPanel";

async function saveGeneratedContent(formData: FormData) {
  "use server";

  const businessType = String(formData.get("businessType") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const offer = String(formData.get("offer") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const cta = String(formData.get("cta") ?? "").trim();

  if (!clientId || !businessType || !location || !offer || !heroTitle || !heroSubtitle || !about || !cta) {
    redirect("/content?err=invalid_content_input");
  }

  const result = await createContentOutputRecord({
    clientId,
    businessType,
    location,
    offer,
    heroTitle,
    heroSubtitle,
    about,
    cta
  });

  if (result.error) {
    redirect("/content?err=content_save_failed");
  }

  redirect("/content?ok=content_saved");
}

export default async function ContentPage({
  searchParams
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const [recentOutputs, clients] = await Promise.all([getContentOutputs(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Content</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Landing page content generator</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Generate first-draft hero, about section, and CTA copy in seconds, then save the result for reuse.
        </p>
      </div>

      <form action={saveGeneratedContent} className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <label className="block">
            <span className="text-sm text-slate-300">Client</span>
            <select required name="clientId" className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white">
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ContentGeneratorPanel
          defaultBusinessType="Clinic"
          defaultLocation="Cebu City"
          defaultOffer="teeth whitening package"
        />

        <button
          type="submit"
          className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-500/40"
        >
          Save generated content
        </button>
      </form>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Recent saves</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Saved copy library</h2>
        </div>

        <div className="space-y-3">
          {recentOutputs.length === 0 ? (
            <p className="text-sm text-slate-300">No saved content yet. Generate and save your first draft above.</p>
          ) : (
            recentOutputs.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {clientNamesById.get(entry.clientId ?? "") ?? "Unassigned"} - {entry.businessType} in {entry.location}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.offer}</p>
                  </div>
                  <p className="text-xs text-slate-400">{entry.createdAt}</p>
                </div>
                <p className="mt-3 text-sm text-slate-200">{entry.heroTitle}</p>
                <p className="mt-1 text-sm text-slate-300">{entry.heroSubtitle}</p>
                {entry.clientId ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`/api/export/content?client_id=${encodeURIComponent(entry.clientId)}&format=json`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-accent-300"
                    >
                      Export JSON
                    </a>
                    <a
                      href={`/api/export/content?client_id=${encodeURIComponent(entry.clientId)}&format=md`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-accent-300"
                    >
                      Export MD
                    </a>
                    <a
                      href={`/api/export/content?client_id=${encodeURIComponent(entry.clientId)}&format=csv`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-accent-300"
                    >
                      Export CSV
                    </a>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
