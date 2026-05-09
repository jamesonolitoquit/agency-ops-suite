export type ContentInput = {
  businessType: string;
  location: string;
  offer: string;
};

export type GeneratedContent = {
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  cta: string;
};

const toneByBusiness: Record<string, { adjective: string; promise: string }> = {
  clinic: {
    adjective: "trusted",
    promise: "professional care with a smooth booking experience"
  },
  restaurant: {
    adjective: "flavor-first",
    promise: "fast table decisions and direct reservations"
  },
  resort: {
    adjective: "escape-ready",
    promise: "more direct bookings and fewer OTA dependency fees"
  },
  default: {
    adjective: "conversion-focused",
    promise: "clear messaging that turns visitors into customers"
  }
};

function resolveTone(businessType: string) {
  const key = businessType.trim().toLowerCase();
  return toneByBusiness[key] ?? toneByBusiness.default;
}

export function generateLandingCopy(input: ContentInput): GeneratedContent {
  const business = input.businessType.trim();
  const location = input.location.trim();
  const offer = input.offer.trim();
  const tone = resolveTone(business);

  return {
    heroTitle: `${business} growth in ${location}, powered by a ${tone.adjective} site`,
    heroSubtitle: `Launch your ${offer} campaign with a page built for ${tone.promise}.`,
    about: `${business} teams in ${location} need websites that do more than look polished. We build high-clarity pages that explain your offer fast, prove trust quickly, and guide visitors toward the next action without friction.`,
    cta: `Start your ${offer} launch in ${location}`
  };
}