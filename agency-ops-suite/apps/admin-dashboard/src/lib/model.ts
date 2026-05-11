export type ClientStatus = "active" | "paused" | "churned";
export type PlanType = "starter" | "growth" | "pro";
export type LeadSource = "facebook" | "google";
export type LeadStatus = "new" | "contacted" | "replied" | "closed" | "lost";
export type RequestStatus = "pending" | "in_progress" | "done";
export type TaskStatus = "todo" | "in_progress" | "done";
export type PaymentMethod = "gcash" | "bank";
export type AssetType = "image" | "video" | "document" | "other";
export type DomainStatus = "active" | "expiring_soon" | "expired" | "pending_transfer";

export type AuditLogRecord = {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ContentOutputRecord = {
  id: string;
  clientId: string | null;
  businessType: string;
  location: string;
  offer: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  cta: string;
  createdAt: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  businessType: string;
  domain: string;
  plan: PlanType;
  monthlyFee: number;
  status: ClientStatus;
  createdAt: string;
  billingCycle: "monthly" | "quarterly";
  notes: string;
  readyForDeploy: boolean;
  liveUrl: string;
};

export type BillingRecord = {
  id: string;
  clientId: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paymentMethod: PaymentMethod;
  notes: string;
};

export type ProvisioningRunRecord = {
  id: string;
  clientId: string | null;
  templateType: string;
  domain: string;
  status: "pending" | "in_progress" | "success" | "failed";
  outputPath: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type ReportRunRecord = {
  id: string;
  clientId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string;
  reportType: string;
  fileUrl: string | null;
  reportSnapshot: Record<string, unknown> | null;
};

export type LeadRecord = {
  id: string;
  name: string;
  businessType: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  createdAt: string;
};

export type RequestRecord = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
};

export type TaskRecord = {
  id: string;
  clientId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
};

export type AssetRecord = {
  id: string;
  clientId: string | null;
  name: string;
  assetUrl: string;
  assetType: AssetType;
  notes: string;
  createdAt: string;
};

export type DomainRecord = {
  id: string;
  clientId: string | null;
  domain: string;
  registrar: string;
  hostingProvider: string;
  status: DomainStatus;
  expiryDate: string;
  autoRenew: boolean;
  notes: string;
  createdAt: string;
};

export type MaintenanceRecord = {
  id: string;
  clientId: string;
  uptimePercent: number;
  lastUpdatedAt: string;
  pendingTasks: number;
  monthlyVisits: number;
  note: string;
};

export type AgencyData = {
  clients: ClientRecord[];
  billing: BillingRecord[];
  leads: LeadRecord[];
  requests: RequestRecord[];
  tasks?: TaskRecord[];
  assets?: AssetRecord[];
  domains?: DomainRecord[];
  auditLogs?: AuditLogRecord[];
  maintenance: MaintenanceRecord[];
  contentOutputs?: ContentOutputRecord[];
};