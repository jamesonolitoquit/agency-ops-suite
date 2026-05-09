import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "./supabase/server";
import type {
  ClientRecord,
  BillingRecord,
  LeadRecord,
  RequestRecord,
  TaskRecord,
  AssetRecord,
  DomainRecord,
  AuditLogRecord,
  MaintenanceRecord,
  ContentOutputRecord,
  ProvisioningRunRecord,
  ReportRunRecord
} from "./model";

const USE_SEED_DATA = process.env.NEXT_PUBLIC_USE_SEED_DATA === "true";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function isExpectedUnauthedReadError(error: unknown) {
  const value = (error ?? {}) as SupabaseErrorLike;
  const message = (value.message ?? "").toLowerCase();

  return value.code === "42501" || message.includes("permission denied");
}

function logReadFailure(action: string, error: unknown) {
  if (isExpectedUnauthedReadError(error)) {
    console.warn(`[db] Skipping ${action} for unauthenticated session.`);
    return;
  }

  console.error(`Failed to ${action}:`, error);
}

export async function getClients(): Promise<ClientRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.clients;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch clients", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      businessType: row.business_type,
      domain: row.domain,
      plan: row.plan,
      monthlyFee: Number(row.monthly_fee),
      status: row.status,
      createdAt: row.created_at,
      billingCycle: row.billing_cycle ?? "monthly",
      notes: row.notes ?? "",
      readyForDeploy: Boolean(row.ready_for_deploy),
      liveUrl: row.live_url ?? ""
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function setClientDeployReadiness(clientId: string, readyForDeploy: boolean, liveUrl: string) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("clients")
    .update({ ready_for_deploy: readyForDeploy, live_url: liveUrl })
    .eq("id", clientId);
  return { error: error?.message ?? null };
}

export async function createClientRecord(input: {
  name: string;
  businessType: string;
  domain: string;
  plan: "starter" | "growth" | "pro";
  monthlyFee: number;
  billingCycle: "monthly" | "quarterly";
  status: "active" | "paused" | "churned";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").insert({
    name: input.name,
    business_type: input.businessType,
    domain: input.domain,
    plan: input.plan,
    monthly_fee: input.monthlyFee,
    billing_cycle: input.billingCycle,
    status: input.status,
    notes: input.notes
  });

  return { error: error?.message ?? null };
}

export async function updateClientStatus(clientId: string, status: "active" | "paused" | "churned") {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").update({ status }).eq("id", clientId);
  return { error: error?.message ?? null };
}

export async function updateClientRecord(input: {
  id: string;
  name: string;
  businessType: string;
  domain: string;
  plan: "starter" | "growth" | "pro";
  monthlyFee: number;
  status: "active" | "paused" | "churned";
  billingCycle: "monthly" | "quarterly";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name: input.name,
      business_type: input.businessType,
      domain: input.domain,
      plan: input.plan,
      monthly_fee: input.monthlyFee,
      status: input.status,
      billing_cycle: input.billingCycle,
      notes: input.notes
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function getBilling(): Promise<BillingRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.billing;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("billing")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) {
      logReadFailure("fetch billing", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id,
      dueDate: row.due_date,
      amount: Number(row.amount ?? 0),
      paid: row.paid,
      paymentMethod: row.payment_method,
      notes: row.notes
    }));
  } catch (error) {
    console.error("Error fetching billing:", error);
    return [];
  }
}

export async function markBillingPaid(billingId: string, paid: boolean) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("billing").update({ paid }).eq("id", billingId);
  return { error: error?.message ?? null };
}

export async function createBillingRecord(input: {
  clientId: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paymentMethod: "gcash" | "bank";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("billing").insert({
    client_id: input.clientId,
    due_date: input.dueDate,
    amount: input.amount,
    paid: input.paid,
    payment_method: input.paymentMethod,
    notes: input.notes
  });

  return { error: error?.message ?? null };
}

export async function updateBillingRecord(input: {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paymentMethod: "gcash" | "bank";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("billing")
    .update({
      due_date: input.dueDate,
      amount: input.amount,
      paid: input.paid,
      payment_method: input.paymentMethod,
      notes: input.notes
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function getLeads(): Promise<LeadRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.leads;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch leads", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      businessType: row.business_type,
      source: row.source,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export async function updateLeadStatus(leadId: string, status: "new" | "contacted" | "replied" | "closed") {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  return { error: error?.message ?? null };
}

export async function createLeadRecord(input: {
  name: string;
  businessType: string;
  source: "facebook" | "google";
  status: "new" | "contacted" | "replied" | "closed";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { id: null, error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: input.name,
      business_type: input.businessType,
      source: input.source,
      status: input.status,
      notes: input.notes
    })
    .select("id")
    .single();

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function getRequests(): Promise<RequestRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.requests;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch requests", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

export async function updateRequestStatus(requestId: string, status: "pending" | "in_progress" | "done") {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("requests").update({ status }).eq("id", requestId);
  return { error: error?.message ?? null };
}

export async function createRequestRecord(input: {
  clientId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "done";
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("requests").insert({
    client_id: input.clientId,
    title: input.title,
    description: input.description,
    status: input.status
  });

  return { error: error?.message ?? null };
}

export async function getTasks(): Promise<TaskRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.tasks ?? [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch tasks", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      title: row.title,
      description: row.description,
      status: row.status,
      dueDate: row.due_date ?? null,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function createTaskRecord(input: {
  clientId: string | null;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  dueDate: string | null;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tasks").insert({
    client_id: input.clientId,
    title: input.title,
    description: input.description,
    status: input.status,
    due_date: input.dueDate || null
  });

  return { error: error?.message ?? null };
}

export async function updateTaskRecord(input: {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  dueDate: string | null;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
      status: input.status,
      due_date: input.dueDate || null
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function updateTaskStatus(taskId: string, status: "todo" | "in_progress" | "done") {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  return { error: error?.message ?? null };
}

export async function getAssets(): Promise<AssetRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.assets ?? [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch assets", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      name: row.name,
      assetUrl: row.asset_url,
      assetType: row.asset_type,
      notes: row.notes ?? "",
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

export async function createAssetRecord(input: {
  clientId: string | null;
  name: string;
  assetUrl: string;
  assetType: "image" | "video" | "document" | "other";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("assets").insert({
    client_id: input.clientId,
    name: input.name,
    asset_url: input.assetUrl,
    asset_type: input.assetType,
    notes: input.notes
  });

  return { error: error?.message ?? null };
}

export async function updateAssetRecord(input: {
  id: string;
  name: string;
  assetUrl: string;
  assetType: "image" | "video" | "document" | "other";
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("assets")
    .update({
      name: input.name,
      asset_url: input.assetUrl,
      asset_type: input.assetType,
      notes: input.notes
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function getDomains(): Promise<DomainRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.domains ?? [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("domains").select("*").order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch domains", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      domain: row.domain,
      registrar: row.registrar,
      hostingProvider: row.hosting_provider,
      status: row.status,
      expiryDate: row.expiry_date,
      autoRenew: Boolean(row.auto_renew),
      notes: row.notes ?? "",
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  }
}

export async function createDomainRecord(input: {
  clientId: string | null;
  domain: string;
  registrar: string;
  hostingProvider: string;
  status: "active" | "expiring_soon" | "expired" | "pending_transfer";
  expiryDate: string;
  autoRenew: boolean;
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("domains").insert({
    client_id: input.clientId,
    domain: input.domain,
    registrar: input.registrar,
    hosting_provider: input.hostingProvider,
    status: input.status,
    expiry_date: input.expiryDate,
    auto_renew: input.autoRenew,
    notes: input.notes
  });

  return { error: error?.message ?? null };
}

export async function updateDomainRecord(input: {
  id: string;
  domain: string;
  registrar: string;
  hostingProvider: string;
  status: "active" | "expiring_soon" | "expired" | "pending_transfer";
  expiryDate: string;
  autoRenew: boolean;
  notes: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("domains")
    .update({
      domain: input.domain,
      registrar: input.registrar,
      hosting_provider: input.hostingProvider,
      status: input.status,
      expiry_date: input.expiryDate,
      auto_renew: input.autoRenew,
      notes: input.notes
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function getMaintenance(): Promise<MaintenanceRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return seedData.maintenance;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .order("last_updated_at", { ascending: false });

    if (error) {
      logReadFailure("fetch maintenance", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id,
      uptimePercent: Number(row.uptime_percent),
      lastUpdatedAt: row.last_updated_at,
      pendingTasks: row.pending_tasks,
      monthlyVisits: row.monthly_visits,
      note: row.note
    }));
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    return [];
  }
}

export async function createMaintenanceRecord(input: {
  clientId: string;
  uptimePercent: number;
  pendingTasks: number;
  monthlyVisits: number;
  note: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("maintenance").insert({
    client_id: input.clientId,
    uptime_percent: input.uptimePercent,
    pending_tasks: input.pendingTasks,
    monthly_visits: input.monthlyVisits,
    note: input.note
  });

  return { error: error?.message ?? null };
}

export async function updateMaintenanceRecord(input: {
  id: string;
  uptimePercent: number;
  pendingTasks: number;
  monthlyVisits: number;
  note: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("maintenance")
    .update({
      uptime_percent: input.uptimePercent,
      pending_tasks: input.pendingTasks,
      monthly_visits: input.monthlyVisits,
      note: input.note,
      last_updated_at: new Date().toISOString()
    })
    .eq("id", input.id);

  return { error: error?.message ?? null };
}

export async function getContentOutputs(): Promise<ContentOutputRecord[]> {
  if (USE_SEED_DATA) {
    const { seedData } = await import("./seed-data");
    return (seedData as typeof seedData & { contentOutputs?: ContentOutputRecord[] }).contentOutputs ?? [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      logReadFailure("fetch content outputs", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      businessType: row.business_type,
      location: row.location,
      offer: row.offer,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      about: row.about,
      cta: row.cta,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching content outputs:", error);
    return [];
  }
}

export async function createContentOutputRecord(input: {
  clientId?: string | null;
  businessType: string;
  location: string;
  offer: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  cta: string;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("content_outputs").insert({
    client_id: input.clientId ?? null,
    business_type: input.businessType,
    location: input.location,
    offer: input.offer,
    hero_title: input.heroTitle,
    hero_subtitle: input.heroSubtitle,
    about: input.about,
    cta: input.cta
  });

  return { error: error?.message ?? null };
}

export async function getContentOutputsByClient(clientId: string): Promise<ContentOutputRecord[]> {
  if (USE_SEED_DATA) {
    const rows = await getContentOutputs();
    return rows.filter((row) => row.clientId === clientId);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_outputs")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      logReadFailure("fetch content outputs by client", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      businessType: row.business_type,
      location: row.location,
      offer: row.offer,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      about: row.about,
      cta: row.cta,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching content outputs by client:", error);
    return [];
  }
}

export async function createReportRun(input: {
  clientId: string | null;
  periodStart: string;
  periodEnd: string;
  fileUrl: string | null;
  reportType?: string;
  reportSnapshot?: Record<string, unknown> | null;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("report_runs")
    .insert({
      client_id: input.clientId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      file_url: input.fileUrl,
      report_type: input.reportType ?? "manual",
      report_snapshot: input.reportSnapshot ?? null
    })
    .select("id")
    .single();

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function getReportRuns(options?: {
  clientId?: string;
  limit?: number;
}): Promise<ReportRunRecord[]> {
  if (USE_SEED_DATA) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("report_runs")
      .select("*")
      .order("generated_at", { ascending: false });

    if (options?.clientId) {
      query = query.eq("client_id", options.clientId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      logReadFailure("fetch report runs", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      periodStart: row.period_start ?? null,
      periodEnd: row.period_end ?? null,
      generatedAt: row.generated_at,
      reportType: row.report_type,
      fileUrl: row.file_url ?? null,
      reportSnapshot: (row.report_snapshot ?? null) as Record<string, unknown> | null
    }));
  } catch (error) {
    console.error("Error fetching report runs:", error);
    return [];
  }
}

export async function getReportRunById(reportRunId: string): Promise<ReportRunRecord | null> {
  if (USE_SEED_DATA) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("report_runs").select("*").eq("id", reportRunId).single();

    if (error || !data) {
      if (error) {
        logReadFailure("fetch report run by id", error);
      }
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id ?? null,
      periodStart: data.period_start ?? null,
      periodEnd: data.period_end ?? null,
      generatedAt: data.generated_at,
      reportType: data.report_type,
      fileUrl: data.file_url ?? null,
      reportSnapshot: (data.report_snapshot ?? null) as Record<string, unknown> | null
    };
  } catch (error) {
    console.error("Error fetching report run by id:", error);
    return null;
  }
}

export async function createProvisioningRun(input: {
  clientId: string | null;
  templateType: string;
  domain: string;
  outputPath: string | null;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("provisioning_runs")
    .insert({
      client_id: input.clientId,
      template_type: input.templateType,
      domain: input.domain,
      status: "pending",
      output_path: input.outputPath
    })
    .select("id")
    .single();

  if (!error) {
    await createAuditLogRecord({
      entityType: "provisioning",
      entityId: data?.id ?? null,
      action: "create",
      summary: `Created provisioning run for ${input.domain}`,
      metadata: {
        clientId: input.clientId,
        templateType: input.templateType,
        domain: input.domain,
        outputPath: input.outputPath
      }
    });
  }

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateProvisioningRunStatus(input: {
  id: string;
  status: "pending" | "in_progress" | "success" | "failed";
  errorMessage?: string | null;
  outputPath?: string | null;
}) {
  if (USE_SEED_DATA) {
    return { error: "Cannot update records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const payload: Record<string, string | null> = {
    status: input.status,
    error_message: input.errorMessage ?? null,
    output_path: input.outputPath ?? null,
    completed_at: input.status === "pending" ? null : new Date().toISOString()
  };

  const { error } = await supabase.from("provisioning_runs").update(payload).eq("id", input.id);

  if (!error) {
    await createAuditLogRecord({
      entityType: "provisioning",
      entityId: input.id,
      action: "update-status",
      summary: `Updated provisioning run status to ${input.status}`,
      metadata: {
        status: input.status,
        errorMessage: input.errorMessage ?? null,
        outputPath: input.outputPath ?? null
      }
    });
  }

  return { error: error?.message ?? null };
}

export async function getProvisioningRuns(options?: {
  clientId?: string;
  status?: "pending" | "success" | "failed";
  limit?: number;
}): Promise<ProvisioningRunRecord[]> {
  if (USE_SEED_DATA) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("provisioning_runs")
      .select("*")
      .order("started_at", { ascending: false });

    if (options?.clientId) {
      query = query.eq("client_id", options.clientId);
    }

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      logReadFailure("fetch provisioning runs", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? null,
      templateType: row.template_type,
      domain: row.domain,
      status: row.status,
      outputPath: row.output_path ?? null,
      errorMessage: row.error_message ?? null,
      startedAt: row.started_at,
      completedAt: row.completed_at ?? null
    }));
  } catch (error) {
    console.error("Error fetching provisioning runs:", error);
    return [];
  }
}

export async function createAuditLogRecord(input: {
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  if (USE_SEED_DATA) {
    return { id: null, error: "Cannot create records while NEXT_PUBLIC_USE_SEED_DATA=true." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      action: input.action,
      summary: input.summary,
      metadata: input.metadata ?? {}
    })
    .select("id")
    .single();

  if (!error) {
    revalidatePath("/audit-logs");
  }

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function getAuditLogs(options?: {
  entityType?: string;
  action?: string;
  limit?: number;
}): Promise<AuditLogRecord[]> {
  if (USE_SEED_DATA) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false });

    if (options?.entityType) {
      query = query.eq("entity_type", options.entityType);
    }

    if (options?.action) {
      query = query.eq("action", options.action);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      logReadFailure("fetch audit logs", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id ?? null,
      action: row.action,
      summary: row.summary,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

