import type { AgencyData } from "./model";

export const seedData: AgencyData = {
  clients: [
    {
      id: "client_01",
      name: "Coastline Resort Group",
      businessType: "Hospitality",
      domain: "coastline-resort.example",
      plan: "pro",
      monthlyFee: 1800,
      status: "active",
      createdAt: "2026-02-10",
      billingCycle: "monthly",
      notes: "Priority support and weekly maintenance checks.",
      readyForDeploy: true,
      liveUrl: "https://coastline-resort.example"
    },
    {
      id: "client_02",
      name: "Northside Dental Studio",
      businessType: "Clinic",
      domain: "northside-dental.example",
      plan: "growth",
      monthlyFee: 1200,
      status: "active",
      createdAt: "2026-03-04",
      billingCycle: "monthly",
      notes: "Needs monthly copy refresh and lead follow-up tracking.",
      readyForDeploy: true,
      liveUrl: "https://northside-dental.example"
    },
    {
      id: "client_03",
      name: "Blue Plate Kitchen",
      businessType: "Restaurant",
      domain: "blueplate.example",
      plan: "starter",
      monthlyFee: 700,
      status: "paused",
      createdAt: "2026-01-22",
      billingCycle: "quarterly",
      notes: "Paused pending menu update and new photography.",
      readyForDeploy: false,
      liveUrl: ""
    }
  ],
  billing: [
    {
      id: "bill_01",
      clientId: "client_01",
      dueDate: "2026-04-30",
      amount: 1800,
      paid: false,
      paymentMethod: "bank",
      notes: "Invoice ready, awaiting transfer confirmation."
    },
    {
      id: "bill_02",
      clientId: "client_02",
      dueDate: "2026-04-22",
      amount: 1200,
      paid: false,
      paymentMethod: "gcash",
      notes: "Follow up after WhatsApp confirmation."
    },
    {
      id: "bill_03",
      clientId: "client_03",
      dueDate: "2026-05-15",
      amount: 700,
      paid: true,
      paymentMethod: "bank",
      notes: "Quarterly cycle already settled."
    }
  ],
  leads: [
    {
      id: "lead_01",
      name: "Marvin Santos",
      businessType: "Clinic",
      source: "facebook",
      status: "contacted",
      notes: "Asked for pricing and sample work.",
      createdAt: "2026-04-08"
    },
    {
      id: "lead_02",
      name: "Elaine Gomez",
      businessType: "Restaurant",
      source: "google",
      status: "replied",
      notes: "Wants launch in two weeks.",
      createdAt: "2026-04-15"
    },
    {
      id: "lead_03",
      name: "Jun Rivera",
      businessType: "Resort",
      source: "facebook",
      status: "new",
      notes: "Requested a homepage audit.",
      createdAt: "2026-04-19"
    }
  ],
  requests: [
    {
      id: "req_01",
      clientId: "client_01",
      title: "Homepage hero update",
      description: "Swap the seasonal promo and add a stronger booking CTA.",
      status: "in_progress",
      createdAt: "2026-04-18"
    },
    {
      id: "req_02",
      clientId: "client_02",
      title: "Add testimonial section",
      description: "Need three testimonials and a trust badge row.",
      status: "pending",
      createdAt: "2026-04-20"
    },
    {
      id: "req_03",
      clientId: "client_03",
      title: "Menu redesign",
      description: "Waiting for new menu items before continuing.",
      status: "done",
      createdAt: "2026-03-30"
    }
  ],
  tasks: [
    {
      id: "task_01",
      clientId: "client_01",
      title: "Review booking CTA copy",
      description: "Refine hero and button copy before the next campaign push.",
      status: "in_progress",
      dueDate: "2026-04-28",
      createdAt: "2026-04-22"
    },
    {
      id: "task_02",
      clientId: "client_02",
      title: "Collect testimonial assets",
      description: "Gather written testimonials and photo approvals from the clinic team.",
      status: "todo",
      dueDate: "2026-04-30",
      createdAt: "2026-04-23"
    },
    {
      id: "task_03",
      clientId: null,
      title: "Prepare weekly internal report",
      description: "Compile delivery notes and billing summary for the ops review.",
      status: "done",
      dueDate: "2026-04-24",
      createdAt: "2026-04-20"
    }
  ],
  assets: [
    {
      id: "asset_01",
      clientId: "client_01",
      name: "Summer Promo Hero",
      assetUrl: "https://cdn.example.com/coastline/summer-hero.jpg",
      assetType: "image",
      notes: "Homepage hero visual for May campaign.",
      createdAt: "2026-04-23"
    },
    {
      id: "asset_02",
      clientId: "client_02",
      name: "Clinic Intro Reel",
      assetUrl: "https://cdn.example.com/northside/intro-reel.mp4",
      assetType: "video",
      notes: "Social and landing embed asset.",
      createdAt: "2026-04-24"
    },
    {
      id: "asset_03",
      clientId: null,
      name: "Brand Guidelines PDF",
      assetUrl: "https://cdn.example.com/internal/brand-guidelines.pdf",
      assetType: "document",
      notes: "Internal reference document.",
      createdAt: "2026-04-20"
    }
  ],
  domains: [
    {
      id: "domain_01",
      clientId: "client_01",
      domain: "coastline-resort.com",
      registrar: "Cloudflare",
      hostingProvider: "Vercel",
      status: "active",
      expiryDate: "2026-11-18",
      autoRenew: true,
      notes: "Primary booking domain with auto-renew enabled.",
      createdAt: "2026-04-23"
    },
    {
      id: "domain_02",
      clientId: "client_02",
      domain: "northsidedentalstudio.com",
      registrar: "Namecheap",
      hostingProvider: "Netlify",
      status: "expiring_soon",
      expiryDate: "2026-05-30",
      autoRenew: false,
      notes: "Renewal reminder pending approval from client.",
      createdAt: "2026-04-24"
    },
    {
      id: "domain_03",
      clientId: null,
      domain: "agencyops.internal",
      registrar: "Porkbun",
      hostingProvider: "Railway",
      status: "pending_transfer",
      expiryDate: "2026-08-14",
      autoRenew: false,
      notes: "Internal sandbox domain waiting for transfer paperwork.",
      createdAt: "2026-04-21"
    }
  ],
  maintenance: [
    {
      id: "maint_01",
      clientId: "client_01",
      uptimePercent: 99.97,
      lastUpdatedAt: "2026-04-21",
      pendingTasks: 1,
      monthlyVisits: 4820,
      note: "Booking conversion experiment active on hero CTA."
    },
    {
      id: "maint_02",
      clientId: "client_02",
      uptimePercent: 99.92,
      lastUpdatedAt: "2026-04-20",
      pendingTasks: 2,
      monthlyVisits: 2960,
      note: "Waiting for revised doctor profile photos."
    },
    {
      id: "maint_03",
      clientId: "client_03",
      uptimePercent: 98.81,
      lastUpdatedAt: "2026-04-15",
      pendingTasks: 3,
      monthlyVisits: 1710,
      note: "Traffic dropped after promo ended; content refresh queued."
    }
  ]
};