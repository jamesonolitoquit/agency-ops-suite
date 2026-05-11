export type TemplateDefinition = {
  key: string;
  name: string;
  vertical: string;
  description: string;
  pages: string[];
  sections: string[];
  seoChecklist: string[];
  cta: string;
};

const templates: TemplateDefinition[] = [
  {
    key: 'restaurant',
    name: 'Restaurant Template',
    vertical: 'restaurant',
    description: 'Built for menus, reservations, featured dishes, and local SEO.',
    pages: ['Home', 'Menu', 'About', 'Reservations', 'Contact'],
    sections: ['Hero', 'Featured Menu', 'Testimonials', 'Hours & Location', 'Reservation CTA'],
    seoChecklist: ['Local business schema', 'Location meta tags', 'Menu page indexing', 'Call tracking-ready CTA'],
    cta: 'Reserve a Table',
  },
  {
    key: 'salon',
    name: 'Salon Template',
    vertical: 'salon',
    description: 'Optimized for service packages, stylist showcases, and appointment booking.',
    pages: ['Home', 'Services', 'Team', 'Gallery', 'Contact'],
    sections: ['Hero', 'Service Cards', 'Stylist Profiles', 'Testimonials', 'Booking CTA'],
    seoChecklist: ['Service schema', 'Appointment CTA', 'Image alt coverage', 'Google Business ready'],
    cta: 'Book an Appointment',
  },
  {
    key: 'dental',
    name: 'Dental Template',
    vertical: 'dental',
    description: 'Built for trust-first healthcare sites, treatment pages, and lead capture.',
    pages: ['Home', 'Services', 'About', 'FAQs', 'Contact'],
    sections: ['Hero', 'Treatments', 'Insurance/Payments', 'Testimonials', 'New Patient CTA'],
    seoChecklist: ['Local SEO', 'FAQ schema', 'Treatment page metas', 'Accessibility baseline'],
    cta: 'Schedule a Consultation',
  },
  {
    key: 'construction',
    name: 'Construction Template',
    vertical: 'construction',
    description: 'Good for service areas, estimate requests, and project galleries.',
    pages: ['Home', 'Services', 'Projects', 'About', 'Contact'],
    sections: ['Hero', 'Services Grid', 'Project Gallery', 'Testimonials', 'Estimate CTA'],
    seoChecklist: ['Service-area pages', 'Quote form CTA', 'Project image alt text', 'Local schema'],
    cta: 'Request a Free Estimate',
  },
  {
    key: 'local-business',
    name: 'Local Business Template',
    vertical: 'local business',
    description: 'Flexible template for small businesses needing a fast, conversion-focused launch.',
    pages: ['Home', 'Services', 'About', 'Contact'],
    sections: ['Hero', 'Services', 'Trust Section', 'Testimonials', 'Contact CTA'],
    seoChecklist: ['Homepage title/meta', 'Contact schema', 'Fast load baseline', 'Mobile-friendly layout'],
    cta: 'Get a Quote',
  },
];

export function getTemplates() {
  return templates;
}

export function getTemplateByKey(key: string) {
  return templates.find((template) => template.key === key);
}
