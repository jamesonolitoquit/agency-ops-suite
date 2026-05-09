import { getBilling, getClients, getContentOutputs, getLeads, getMaintenance, getRequests } from "@/lib/db";

type ReportFormat = "json" | "markdown";

export type OperationalReport = {
  generatedAt: string;
  windowLabel: string;
  metrics: {
    activeClients: number;
    monthlyRevenue: number;
    pendingPayments: number;
    openRequests: number;
    leadCount: number;
    contentOutputs: number;
    averageUptime: number;
  };
  billing: {
    paid: number;
    unpaid: number;
  };
  leadsByStatus: Record<string, number>;
  requestsByStatus: Record<string, number>;
  topClients: Array<{
    name: string;
    status: string;
    monthlyFee: number;
  }>;
  recentContent: Array<{
    businessType: string;
    location: string;
    offer: string;
  }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function buildCounts<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}

export async function buildOperationalReport(): Promise<OperationalReport> {
  const [clients, billing, leads, requests, maintenance, contentOutputs] = await Promise.all([
    getClients(),
    getBilling(),
    getLeads(),
    getRequests(),
    getMaintenance(),
    getContentOutputs()
  ]);

  const activeClients = clients.filter((client) => client.status === "active");
  const monthlyRevenue = activeClients.reduce((total, client) => total + client.monthlyFee, 0);
  const pendingPayments = billing.filter((entry) => !entry.paid).length;
  const openRequests = requests.filter((entry) => entry.status !== "done").length;
  const averageUptime =
    maintenance.length > 0 ? maintenance.reduce((total, site) => total + site.uptimePercent, 0) / maintenance.length : 0;

  return {
    generatedAt: new Date().toISOString(),
    windowLabel: "Current workspace snapshot",
    metrics: {
      activeClients: activeClients.length,
      monthlyRevenue,
      pendingPayments,
      openRequests,
      leadCount: leads.length,
      contentOutputs: contentOutputs.length,
      averageUptime
    },
    billing: {
      paid: billing.filter((entry) => entry.paid).length,
      unpaid: pendingPayments
    },
    leadsByStatus: buildCounts(leads.map((lead) => lead.status)),
    requestsByStatus: buildCounts(requests.map((request) => request.status)),
    topClients: clients.slice(0, 5).map((client) => ({
      name: client.name,
      status: client.status,
      monthlyFee: client.monthlyFee
    })),
    recentContent: contentOutputs.slice(0, 5).map((entry) => ({
      businessType: entry.businessType,
      location: entry.location,
      offer: entry.offer
    }))
  };
}

export function renderOperationalReportMarkdown(report: OperationalReport) {
  const leadEntries = Object.entries(report.leadsByStatus)
    .map(([status, count]) => `- ${status}: ${count}`)
    .join("\n");
  const requestEntries = Object.entries(report.requestsByStatus)
    .map(([status, count]) => `- ${status}: ${count}`)
    .join("\n");
  const topClients = report.topClients
    .map((client) => `- ${client.name} (${client.status}) - ${formatMoney(client.monthlyFee)}`)
    .join("\n");
  const recentContent = report.recentContent
    .map((entry) => `- ${entry.businessType} in ${entry.location} - ${entry.offer}`)
    .join("\n");

  return [
    `# Agency Ops Report`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Window: ${report.windowLabel}`,
    ``,
    `## Metrics`,
    `- Active clients: ${report.metrics.activeClients}`,
    `- Monthly revenue: ${formatMoney(report.metrics.monthlyRevenue)}`,
    `- Pending payments: ${report.metrics.pendingPayments}`,
    `- Open requests: ${report.metrics.openRequests}`,
    `- Leads tracked: ${report.metrics.leadCount}`,
    `- Saved content drafts: ${report.metrics.contentOutputs}`,
    `- Average uptime: ${report.metrics.averageUptime.toFixed(2)}%`,
    ``,
    `## Billing`,
    `- Paid: ${report.billing.paid}`,
    `- Unpaid: ${report.billing.unpaid}`,
    ``,
    `## Lead Stages`,
    leadEntries || `- No lead data`,
    ``,
    `## Request Stages`,
    requestEntries || `- No request data`,
    ``,
    `## Top Clients`,
    topClients || `- No client data`,
    ``,
    `## Recent Content`,
    recentContent || `- No saved content`
  ].join("\n");
}

export function renderOperationalReportJson(report: OperationalReport) {
  return JSON.stringify(report, null, 2);
}

export type { ReportFormat };