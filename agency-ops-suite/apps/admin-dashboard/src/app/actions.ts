"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildOperationalReport } from "@/lib/report";
import {
  createAuditLogRecord,
  createAssetRecord,
  createDomainRecord,
  createBillingRecord,
  createClientRecord,
  createProvisioningRun,
  createReportRun,
  createLeadRecord,
  createMaintenanceRecord,
  createRequestRecord,
  createTaskRecord,
  setClientDeployReadiness,
  updateClientRecord,
  updateClientStatus,
  markBillingPaid,
  updateAssetRecord,
  updateBillingRecord,
  updateDomainRecord,
  updateMaintenanceRecord,
  updateLeadStatus,
  updateRequestStatus,
  updateTaskRecord,
  updateTaskStatus
} from "@/lib/db";

function makeRedirectPath(pathname: string, params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `${pathname}?${query.toString()}`;
}

async function recordAuditEvent(input: Parameters<typeof createAuditLogRecord>[0]) {
  const result = await createAuditLogRecord(input);

  if (result.error) {
    console.error("Failed to write audit log:", result.error);
  }
}

export async function createClientAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const plan = String(formData.get("plan") ?? "starter") as "starter" | "growth" | "pro";
  const billingCycle = String(formData.get("billingCycle") ?? "monthly") as "monthly" | "quarterly";
  const status = String(formData.get("status") ?? "active") as "active" | "paused" | "churned";
  const notes = String(formData.get("notes") ?? "").trim();
  const monthlyFee = Number(formData.get("monthlyFee") ?? 0);

  if (!name || !businessType || !domain || Number.isNaN(monthlyFee) || monthlyFee <= 0) {
    redirect(makeRedirectPath("/clients", { err: "invalid_client_input" }));
  }

  const result = await createClientRecord({
    name,
    businessType,
    domain,
    plan,
    monthlyFee,
    billingCycle,
    status,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/clients", { err: "client_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "client",
    entityId: null,
    action: "create",
    summary: `Created client ${name}`,
    metadata: {
      clientName: name,
      businessType,
      domain,
      plan,
      monthlyFee,
      status
    }
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/billing");
  redirect(makeRedirectPath("/clients", { ok: "client_created" }));
}

export async function updateClientStatusAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as "active" | "paused" | "churned";

  if (!clientId) {
    redirect(makeRedirectPath("/clients", { err: "missing_client_id" }));
  }

  const result = await updateClientStatus(clientId, status);

  if (result.error) {
    redirect(makeRedirectPath("/clients", { err: "client_status_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "client",
    entityId: clientId,
    action: "update-status",
    summary: `Updated client status to ${status}`,
    metadata: { clientId, status }
  });

  revalidatePath("/");
  revalidatePath("/clients");
  redirect(makeRedirectPath("/clients", { ok: "client_status_updated" }));
}

export async function updateClientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const plan = String(formData.get("plan") ?? "starter") as "starter" | "growth" | "pro";
  const billingCycle = String(formData.get("billingCycle") ?? "monthly") as "monthly" | "quarterly";
  const status = String(formData.get("status") ?? "active") as "active" | "paused" | "churned";
  const notes = String(formData.get("notes") ?? "").trim();
  const monthlyFee = Number(formData.get("monthlyFee") ?? 0);

  if (!id || !name || !businessType || !domain || Number.isNaN(monthlyFee) || monthlyFee <= 0) {
    redirect(makeRedirectPath("/clients", { err: "invalid_client_update_input" }));
  }

  const result = await updateClientRecord({
    id,
    name,
    businessType,
    domain,
    plan,
    monthlyFee,
    status,
    billingCycle,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/clients", { err: "client_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "client",
    entityId: id,
    action: "update",
    summary: `Updated client ${name}`,
    metadata: {
      clientId: id,
      clientName: name,
      businessType,
      domain,
      plan,
      monthlyFee,
      status,
      billingCycle
    }
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/billing");
  redirect(makeRedirectPath("/clients", { ok: "client_updated" }));
}

export async function generateReportAction(formData: FormData) {
  const rawClientId = String(formData.get("clientId") ?? "").trim();
  const periodStart = String(formData.get("periodStart") ?? "").trim();
  const periodEnd = String(formData.get("periodEnd") ?? "").trim();

  if (!periodStart || !periodEnd) {
    redirect(makeRedirectPath("/", { err: "invalid_report_period" }));
  }

  const report = await buildOperationalReport();

  const result = await createReportRun({
    clientId: rawClientId || null,
    periodStart,
    periodEnd,
    fileUrl: "/api/report/export",
    reportType: "manual",
    reportSnapshot: report
  });

  if (result.error) {
    redirect(makeRedirectPath("/", { err: "report_run_create_failed" }));
  }

  await createAuditLogRecord({
    entityType: "report",
    entityId: result.id,
    action: "generate",
    summary: `Generated manual report for ${rawClientId || "all clients"}`,
    metadata: {
      reportRunId: result.id,
      clientId: rawClientId || null,
      periodStart,
      periodEnd,
      reportType: "manual"
    }
  });

  revalidatePath("/");
  revalidatePath("/reports");
  redirect(makeRedirectPath("/", { ok: "report_generated" }));
}

export async function updateBillingPaidAction(formData: FormData) {
  const billingId = String(formData.get("billingId") ?? "").trim();
  const paidValue = String(formData.get("paid") ?? "false").trim();

  if (!billingId) {
    redirect(makeRedirectPath("/billing", { err: "missing_billing_id" }));
  }

  const result = await markBillingPaid(billingId, paidValue === "true");

  if (result.error) {
    redirect(makeRedirectPath("/billing", { err: "billing_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "billing",
    entityId: billingId,
    action: "mark-paid",
    summary: `Marked billing record as ${paidValue === "true" ? "paid" : "unpaid"}`,
    metadata: { billingId, paid: paidValue === "true" }
  });

  revalidatePath("/");
  revalidatePath("/billing");
  redirect(makeRedirectPath("/billing", { ok: "billing_updated" }));
}

export async function createBillingAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const paid = String(formData.get("paid") ?? "false") === "true";
  const paymentMethod = String(formData.get("paymentMethod") ?? "gcash") as "gcash" | "bank";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientId || !dueDate || Number.isNaN(amount) || amount <= 0) {
    redirect(makeRedirectPath("/billing", { err: "invalid_billing_input" }));
  }

  const result = await createBillingRecord({
    clientId,
    dueDate,
    amount,
    paid,
    paymentMethod,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/billing", { err: "billing_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "billing",
    entityId: null,
    action: "create",
    summary: `Created billing record for client ${clientId}`,
    metadata: { clientId, dueDate, amount, paid, paymentMethod }
  });

  revalidatePath("/");
  revalidatePath("/billing");
  redirect(makeRedirectPath("/billing", { ok: "billing_created" }));
}

export async function updateBillingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const paid = String(formData.get("paid") ?? "false") === "true";
  const paymentMethod = String(formData.get("paymentMethod") ?? "gcash") as "gcash" | "bank";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !dueDate || Number.isNaN(amount) || amount <= 0) {
    redirect(makeRedirectPath("/billing", { err: "invalid_billing_update_input" }));
  }

  const result = await updateBillingRecord({
    id,
    dueDate,
    amount,
    paid,
    paymentMethod,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/billing", { err: "billing_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "billing",
    entityId: id,
    action: "update",
    summary: `Updated billing record ${id}`,
    metadata: { billingId: id, dueDate, amount, paid, paymentMethod }
  });

  revalidatePath("/");
  revalidatePath("/billing");
  redirect(makeRedirectPath("/billing", { ok: "billing_record_updated" }));
}

export async function updateLeadStatusAction(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "").trim();
  const status = String(formData.get("status") ?? "new") as "new" | "contacted" | "replied" | "closed";

  if (!leadId) {
    redirect(makeRedirectPath("/leads", { err: "missing_lead_id" }));
  }

  const result = await updateLeadStatus(leadId, status);

  if (result.error) {
    redirect(makeRedirectPath("/leads", { err: "lead_status_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "lead",
    entityId: leadId,
    action: "update-status",
    summary: `Updated lead status to ${status}`,
    metadata: { leadId, status }
  });

  revalidatePath("/");
  revalidatePath("/leads");
  redirect(makeRedirectPath("/leads", { ok: "lead_status_updated" }));
}

export async function createLeadAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim();
  const source = String(formData.get("source") ?? "facebook") as "facebook" | "google";
  const status = String(formData.get("status") ?? "new") as "new" | "contacted" | "replied" | "closed";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !businessType) {
    redirect(makeRedirectPath("/leads", { err: "invalid_lead_input" }));
  }

  const result = await createLeadRecord({ name, businessType, source, status, notes });

  if (result.error) {
    redirect(makeRedirectPath("/leads", { err: "lead_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "lead",
    entityId: null,
    action: "create",
    summary: `Created lead ${name}`,
    metadata: { leadName: name, businessType, source, status }
  });

  revalidatePath("/");
  revalidatePath("/leads");
  redirect(makeRedirectPath("/leads", { ok: "lead_created" }));
}

export async function updateRequestStatusAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "").trim();
  const status = String(formData.get("status") ?? "pending") as "pending" | "in_progress" | "done";

  if (!requestId) {
    redirect(makeRedirectPath("/requests", { err: "missing_request_id" }));
  }

  const result = await updateRequestStatus(requestId, status);

  if (result.error) {
    redirect(makeRedirectPath("/requests", { err: "request_status_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "request",
    entityId: requestId,
    action: "update-status",
    summary: `Updated request status to ${status}`,
    metadata: { requestId, status }
  });

  revalidatePath("/");
  revalidatePath("/requests");
  redirect(makeRedirectPath("/requests", { ok: "request_status_updated" }));
}

export async function createRequestAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "pending") as "pending" | "in_progress" | "done";

  if (!clientId || !title || !description) {
    redirect(makeRedirectPath("/requests", { err: "invalid_request_input" }));
  }

  const result = await createRequestRecord({ clientId, title, description, status });

  if (result.error) {
    redirect(makeRedirectPath("/requests", { err: "request_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "request",
    entityId: null,
    action: "create",
    summary: `Created request ${title}`,
    metadata: { clientId, title, status }
  });

  revalidatePath("/");
  revalidatePath("/requests");
  redirect(makeRedirectPath("/requests", { ok: "request_created" }));
}

export async function createTaskAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "todo") as "todo" | "in_progress" | "done";
  const dueDate = String(formData.get("dueDate") ?? "").trim();

  if (!title || !description) {
    redirect(makeRedirectPath("/tasks", { err: "invalid_task_input" }));
  }

  const result = await createTaskRecord({
    clientId: clientId || null,
    title,
    description,
    status,
    dueDate: dueDate || null
  });

  if (result.error) {
    redirect(makeRedirectPath("/tasks", { err: "task_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "task",
    entityId: null,
    action: "create",
    summary: `Created task ${title}`,
    metadata: { clientId: clientId || null, title, status, dueDate: dueDate || null }
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  redirect(makeRedirectPath("/tasks", { ok: "task_created" }));
}

export async function updateTaskAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "todo") as "todo" | "in_progress" | "done";
  const dueDate = String(formData.get("dueDate") ?? "").trim();

  if (!id || !title || !description) {
    redirect(makeRedirectPath("/tasks", { err: "invalid_task_update_input" }));
  }

  const result = await updateTaskRecord({
    id,
    title,
    description,
    status,
    dueDate: dueDate || null
  });

  if (result.error) {
    redirect(makeRedirectPath("/tasks", { err: "task_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "task",
    entityId: id,
    action: "update",
    summary: `Updated task ${title}`,
    metadata: { taskId: id, title, status, dueDate: dueDate || null }
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  redirect(makeRedirectPath("/tasks", { ok: "task_updated" }));
}

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "").trim();
  const status = String(formData.get("status") ?? "todo") as "todo" | "in_progress" | "done";

  if (!taskId) {
    redirect(makeRedirectPath("/tasks", { err: "missing_task_id" }));
  }

  const result = await updateTaskStatus(taskId, status);

  if (result.error) {
    redirect(makeRedirectPath("/tasks", { err: "task_status_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "task",
    entityId: taskId,
    action: "update-status",
    summary: `Updated task status to ${status}`,
    metadata: { taskId, status }
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  redirect(makeRedirectPath("/tasks", { ok: "task_status_updated" }));
}

export async function createAssetAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const assetUrl = String(formData.get("assetUrl") ?? "").trim();
  const assetType = String(formData.get("assetType") ?? "other") as "image" | "video" | "document" | "other";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !assetUrl) {
    redirect(makeRedirectPath("/assets", { err: "invalid_asset_input" }));
  }

  const result = await createAssetRecord({
    clientId: clientId || null,
    name,
    assetUrl,
    assetType,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/assets", { err: "asset_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "asset",
    entityId: null,
    action: "create",
    summary: `Created asset ${name}`,
    metadata: { clientId: clientId || null, name, assetType, assetUrl }
  });

  revalidatePath("/");
  revalidatePath("/assets");
  redirect(makeRedirectPath("/assets", { ok: "asset_created" }));
}

export async function updateAssetAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const assetUrl = String(formData.get("assetUrl") ?? "").trim();
  const assetType = String(formData.get("assetType") ?? "other") as "image" | "video" | "document" | "other";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !name || !assetUrl) {
    redirect(makeRedirectPath("/assets", { err: "invalid_asset_update_input" }));
  }

  const result = await updateAssetRecord({
    id,
    name,
    assetUrl,
    assetType,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/assets", { err: "asset_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "asset",
    entityId: id,
    action: "update",
    summary: `Updated asset ${name}`,
    metadata: { assetId: id, name, assetType, assetUrl }
  });

  revalidatePath("/");
  revalidatePath("/assets");
  redirect(makeRedirectPath("/assets", { ok: "asset_updated" }));
}

export async function createDomainAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const registrar = String(formData.get("registrar") ?? "").trim();
  const hostingProvider = String(formData.get("hostingProvider") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as "active" | "expiring_soon" | "expired" | "pending_transfer";
  const expiryDate = String(formData.get("expiryDate") ?? "").trim();
  const autoRenew = String(formData.get("autoRenew") ?? "false") === "true";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!domain || !registrar || !hostingProvider || !expiryDate) {
    redirect(makeRedirectPath("/domains", { err: "invalid_domain_input" }));
  }

  const result = await createDomainRecord({
    clientId: clientId || null,
    domain,
    registrar,
    hostingProvider,
    status,
    expiryDate,
    autoRenew,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/domains", { err: "domain_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "domain",
    entityId: null,
    action: "create",
    summary: `Created domain ${domain}`,
    metadata: { clientId: clientId || null, domain, registrar, hostingProvider, status, expiryDate, autoRenew }
  });

  revalidatePath("/");
  revalidatePath("/domains");
  redirect(makeRedirectPath("/domains", { ok: "domain_created" }));
}

export async function updateDomainAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const registrar = String(formData.get("registrar") ?? "").trim();
  const hostingProvider = String(formData.get("hostingProvider") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as "active" | "expiring_soon" | "expired" | "pending_transfer";
  const expiryDate = String(formData.get("expiryDate") ?? "").trim();
  const autoRenew = String(formData.get("autoRenew") ?? "false") === "true";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !domain || !registrar || !hostingProvider || !expiryDate) {
    redirect(makeRedirectPath("/domains", { err: "invalid_domain_update_input" }));
  }

  const result = await updateDomainRecord({
    id,
    domain,
    registrar,
    hostingProvider,
    status,
    expiryDate,
    autoRenew,
    notes
  });

  if (result.error) {
    redirect(makeRedirectPath("/domains", { err: "domain_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "domain",
    entityId: id,
    action: "update",
    summary: `Updated domain ${domain}`,
    metadata: { domainId: id, domain, registrar, hostingProvider, status, expiryDate, autoRenew }
  });

  revalidatePath("/");
  revalidatePath("/domains");
  redirect(makeRedirectPath("/domains", { ok: "domain_updated" }));
}

export async function updateMaintenanceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const uptimePercent = Number(formData.get("uptimePercent") ?? 0);
  const pendingTasks = Number(formData.get("pendingTasks") ?? 0);
  const monthlyVisits = Number(formData.get("monthlyVisits") ?? 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!id || Number.isNaN(uptimePercent) || Number.isNaN(pendingTasks) || Number.isNaN(monthlyVisits)) {
    redirect(makeRedirectPath("/maintenance", { err: "invalid_maintenance_input" }));
  }

  const result = await updateMaintenanceRecord({
    id,
    uptimePercent,
    pendingTasks,
    monthlyVisits,
    note
  });

  if (result.error) {
    redirect(makeRedirectPath("/maintenance", { err: "maintenance_update_failed" }));
  }

  await recordAuditEvent({
    entityType: "maintenance",
    entityId: id,
    action: "update",
    summary: `Updated maintenance snapshot ${id}`,
    metadata: { maintenanceId: id, uptimePercent, pendingTasks, monthlyVisits }
  });

  revalidatePath("/");
  revalidatePath("/maintenance");
  redirect(makeRedirectPath("/maintenance", { ok: "maintenance_updated" }));
}

export async function setClientDeployReadinessAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const readyForDeploy = String(formData.get("readyForDeploy") ?? "false") === "true";
  const liveUrl = String(formData.get("liveUrl") ?? "").trim();

  if (!clientId) {
    redirect(makeRedirectPath("/clients", { err: "missing_client_id" }));
  }

  const result = await setClientDeployReadiness(clientId, readyForDeploy, liveUrl);

  if (result.error) {
    redirect(makeRedirectPath("/clients", { err: "client_deploy_readiness_failed" }));
  }

  await recordAuditEvent({
    entityType: "client",
    entityId: clientId,
    action: "set-deploy-readiness",
    summary: `Set deploy readiness to ${readyForDeploy} for client ${clientId}`,
    metadata: { clientId, readyForDeploy, liveUrl }
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/provisioning");
  redirect(makeRedirectPath("/clients", { ok: "client_deploy_readiness_updated" }));
}

export async function triggerProvisioningAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const templateType = String(formData.get("templateType") ?? "agency-starter").trim();
  const domain = String(formData.get("domain") ?? "").trim();

  if (!clientId || !domain) {
    redirect(makeRedirectPath("/provisioning", { err: "invalid_provisioning_input" }));
  }

  const result = await createProvisioningRun({
    clientId,
    templateType,
    domain,
    outputPath: null
  });

  if (result.error) {
    redirect(makeRedirectPath("/provisioning", { err: "provisioning_trigger_failed" }));
  }

  revalidatePath("/provisioning");
  redirect(makeRedirectPath("/provisioning", { ok: "provisioning_triggered" }));
}

export async function createMaintenanceAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const uptimePercent = Number(formData.get("uptimePercent") ?? 0);
  const pendingTasks = Number(formData.get("pendingTasks") ?? 0);
  const monthlyVisits = Number(formData.get("monthlyVisits") ?? 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!clientId || Number.isNaN(uptimePercent) || Number.isNaN(pendingTasks) || Number.isNaN(monthlyVisits)) {
    redirect(makeRedirectPath("/maintenance", { err: "invalid_maintenance_create_input" }));
  }

  const result = await createMaintenanceRecord({
    clientId,
    uptimePercent,
    pendingTasks,
    monthlyVisits,
    note
  });

  if (result.error) {
    redirect(makeRedirectPath("/maintenance", { err: "maintenance_create_failed" }));
  }

  await recordAuditEvent({
    entityType: "maintenance",
    entityId: null,
    action: "create",
    summary: `Created maintenance snapshot for client ${clientId}`,
    metadata: { clientId, uptimePercent, pendingTasks, monthlyVisits }
  });

  revalidatePath("/");
  revalidatePath("/maintenance");
  redirect(makeRedirectPath("/maintenance", { ok: "maintenance_created" }));
}