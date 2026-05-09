"use client";

import { useMemo, useState } from "react";
import { generateLandingCopy, type GeneratedContent } from "@/lib/content-generator";

type ContentGeneratorPanelProps = {
  defaultBusinessType: string;
  defaultLocation: string;
  defaultOffer: string;
};

export function ContentGeneratorPanel({ defaultBusinessType, defaultLocation, defaultOffer }: ContentGeneratorPanelProps) {
  const [businessType, setBusinessType] = useState(defaultBusinessType);
  const [location, setLocation] = useState(defaultLocation);
  const [offer, setOffer] = useState(defaultOffer);

  const output: GeneratedContent = useMemo(
    () =>
      generateLandingCopy({
        businessType,
        location,
        offer
      }),
    [businessType, location, offer]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <label className="block">
          <span className="text-sm text-slate-300">Business type</span>
          <input
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none ring-accent-300/60 focus:ring"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Location</span>
          <input
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none ring-accent-300/60 focus:ring"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Offer</span>
          <input
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none ring-accent-300/60 focus:ring"
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
          />
        </label>

        <input type="hidden" name="businessType" value={businessType} readOnly />
        <input type="hidden" name="location" value={location} readOnly />
        <input type="hidden" name="offer" value={offer} readOnly />
        <input type="hidden" name="heroTitle" value={output.heroTitle} readOnly />
        <input type="hidden" name="heroSubtitle" value={output.heroSubtitle} readOnly />
        <input type="hidden" name="about" value={output.about} readOnly />
        <input type="hidden" name="cta" value={output.cta} readOnly />
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Hero title</p>
          <p className="mt-2 text-lg font-semibold text-white">{output.heroTitle}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Hero subtitle</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{output.heroSubtitle}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-200">About section</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{output.about}</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-200">CTA</p>
          <p className="mt-2 text-sm font-medium text-white">{output.cta}</p>
        </article>
      </div>
    </div>
  );
}