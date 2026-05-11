import { createServiceClient } from '@/lib/supabase/service';
import { randomBytes } from 'crypto';

function getClient() {
  return createServiceClient();
}

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'closed' | 'lost';
export type ClientStatus = 'active' | 'paused' | 'churned';

export type LeadRecord = {
  id: string;
  name: string;
  businessType: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: LeadStatus;
  contactedAt: string | null;
  lastContactedAt: string | null;
  closedAt: string | null;
  createdAt: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  businessType: string;
  domain: string;
  status: ClientStatus;
  monthlyFee: number;
  plan: string;
  billingCycle: string;
  readyForDeploy: boolean;
  liveUrl: string;
  notes: string;
  createdAt: string;
};

function normalizeSource(rawSource?: string) {
  const normalized = rawSource?.trim().toLowerCase() ?? '';

  if (normalized.includes('face') || normalized === 'fb') {
    return 'facebook';
  }

  return 'google';
}

function toLeadRecord(row: any): LeadRecord {
  return {
    id: row.id,
    name: row.name ?? '',
    businessType: row.business_type ?? row.businessType ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    message: row.notes ?? row.message ?? '',
    source: row.source ?? 'google',
    status: row.status ?? 'new',
    contactedAt: row.contacted_at ?? null,
    lastContactedAt: row.last_contacted_at ?? null,
    closedAt: row.closed_at ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

function toClientRecord(row: any): ClientRecord {
  return {
    id: row.id,
    name: row.name ?? '',
    businessType: row.business_type ?? row.businessType ?? '',
    domain: row.domain ?? '',
    status: row.status ?? 'active',
    monthlyFee: Number(row.monthly_fee ?? row.monthlyFee ?? 0),
    plan: row.plan ?? 'starter',
    billingCycle: row.billing_cycle ?? 'monthly',
    readyForDeploy: Boolean(row.ready_for_deploy ?? row.readyForDeploy ?? false),
    liveUrl: row.live_url ?? row.liveUrl ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

export async function listLeads() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toLeadRecord);
}

export async function createLeadRecord(input: {
  name: string;
  businessType: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}) {
  const supabase = getClient();

  // Normalize email for duplicate check (use lowercase to match database index)
  const normalizedEmail = input.email?.trim().toLowerCase();
  const normalizedPhone = input.phone?.trim();

  // Check for duplicate lead by email (case-insensitive)
  if (normalizedEmail) {
    try {
      const { data: existing } = await supabase
        .from('leads')
        .select('*')
        .ilike('email', normalizedEmail) // ilike for case-insensitive comparison
        .limit(1);

      if (existing && existing.length > 0) {
        // Log duplicate detection event
        try {
          await supabase.from('system_events').insert({
            type: 'duplicate_lead_detected',
            severity: 'info',
            payload: {
              leadId: existing[0].id,
              email: normalizedEmail,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (eventErr) {
          console.error('[createLeadRecord] event logging failed:', eventErr);
        }

        return { lead: toLeadRecord(existing[0]), duplicate: true };
      }
    } catch (queryErr) {
      console.error('[createLeadRecord] email duplicate check error:', queryErr);
    }
  }

  // Check for duplicate lead by phone if no email
  if (!normalizedEmail && normalizedPhone) {
    try {
      const { data: existing } = await supabase
        .from('leads')
        .select('*')
        .eq('phone', normalizedPhone)
        .limit(1);

      if (existing && existing.length > 0) {
        try {
          await supabase.from('system_events').insert({
            type: 'duplicate_lead_detected',
            severity: 'info',
            payload: {
              leadId: existing[0].id,
              phone: normalizedPhone,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (eventErr) {
          console.error('[createLeadRecord] event logging failed:', eventErr);
        }

        return { lead: toLeadRecord(existing[0]), duplicate: true };
      }
    } catch (queryErr) {
      console.error('[createLeadRecord] phone duplicate check error:', queryErr);
    }
  }

  // Insert new lead
  const payload = {
    name: input.name.trim(),
    business_type: input.businessType.trim(),
    email: normalizedEmail || '',
    phone: normalizedPhone || '',
    notes: input.message?.trim() || '',
    source: normalizeSource(input.source),
    status: 'new',
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return { lead: toLeadRecord(data), duplicate: false };
}

export async function updateLeadRecord(id: string, updates: Partial<{
  status: LeadStatus;
  contactedAt: string | null;
  lastContactedAt: string | null;
  closedAt: string | null;
  notes: string;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};

  if (updates.status) payload.status = updates.status;
  if (updates.contactedAt !== undefined) payload.contacted_at = updates.contactedAt;
  if (updates.lastContactedAt !== undefined) payload.last_contacted_at = updates.lastContactedAt;
  if (updates.closedAt !== undefined) payload.closed_at = updates.closedAt;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toLeadRecord(data);
}

export async function deleteLeadRecord(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

export async function listClients() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toClientRecord);
}

export async function getClientById(id: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return toClientRecord(data);
}

export async function createClientRecord(input: {
  name: string;
  businessType?: string;
  domain: string;
  plan?: string;
  monthlyFee?: number;
  status?: ClientStatus;
  billingCycle?: string;
  readyForDeploy?: boolean;
  liveUrl?: string;
  notes?: string;
}) {
  const supabase = getClient();
  const duplicate = await supabase
    .from('clients')
    .select('*')
    .eq('domain', input.domain.trim())
    .limit(1);

  if (duplicate.data && duplicate.data.length > 0) {
    return { client: toClientRecord(duplicate.data[0]), duplicate: true };
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name: input.name.trim(),
        business_type: input.businessType?.trim() ?? '',
        domain: input.domain.trim(),
        plan: input.plan ?? 'starter',
        monthly_fee: input.monthlyFee ?? 0,
        billing_cycle: input.billingCycle ?? 'monthly',
        status: input.status ?? 'active',
        ready_for_deploy: input.readyForDeploy ?? false,
        live_url: input.liveUrl ?? '',
        notes: input.notes ?? '',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  const { error: checklistError } = await supabase
    .from('deployment_checklists')
    .upsert({ 
      client_id: data.id,
      domain_connected: false,
      ssl_active: false,
      cta_works: false,
      mobile_responsive: false,
      seo_meta_tags: false
    }, { onConflict: 'client_id' });

  if (checklistError) {
    console.error('Deployment checklist creation failed:', checklistError);
    // Don't throw - it's okay if checklist creation fails, client was created
  }

  return { client: toClientRecord(data), duplicate: false };
}

export async function updateClientRecord(id: string, updates: Partial<{
  status: ClientStatus;
  plan: string;
  monthlyFee: number;
  domain: string;
  readyForDeploy: boolean;
  liveUrl: string;
  businessType: string;
  email: string;
  phone: string;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};

  if (updates.status) payload.status = updates.status;
  if (updates.plan !== undefined) payload.plan = updates.plan;
  if (updates.monthlyFee !== undefined) payload.monthly_fee = updates.monthlyFee;
  if (updates.domain !== undefined) payload.domain = updates.domain;
  if (updates.readyForDeploy !== undefined) payload.ready_for_deploy = updates.readyForDeploy;
  if (updates.liveUrl !== undefined) payload.live_url = updates.liveUrl;
  if (updates.businessType !== undefined) payload.business_type = updates.businessType;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;

  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toClientRecord(data);
}

export async function deleteClientRecord(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export async function listBilling() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('billing')
    .select('*, clients(name)')
    .order('due_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listInvoices() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getInvoiceById(id: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

function generateInvoiceNumber() {
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function createInvoiceRecord(input: {
  clientId: string;
  project?: string;
  lineItems?: Array<{ description: string; qty: number; unitPrice: number }>;
  tax?: number;
  discount?: number;
  dueDate?: string;
  notes?: string;
}) {
  const supabase = getClient();

  const items = input.lineItems ?? [];
  const subtotal = items.reduce((s, it) => s + (it.qty * it.unitPrice), 0);
  const tax = input.tax ?? 0;
  const discount = input.discount ?? 0;
  const total = subtotal + tax - discount;

  const payload = {
    invoice_number: generateInvoiceNumber(),
    client_id: input.clientId,
    project: input.project ?? '',
    status: 'draft',
    subtotal,
    tax,
    discount,
    total,
    due_date: input.dueDate ?? null,
    notes: input.notes ?? '',
    metadata: { lineItems: items },
  } as any;

  const { data, error } = await supabase
    .from('invoices')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInvoiceRecord(id: string, updates: Partial<{
  status: string;
  paidAt: string | null;
  notes: string;
  paymentStatus: string;
  stripePaymentIntentId: string;
  paymentUrl: string;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.paidAt !== undefined) payload.paid_at = updates.paidAt;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
  if (updates.stripePaymentIntentId !== undefined) payload.stripe_payment_intent_id = updates.stripePaymentIntentId;
  if (updates.paymentUrl !== undefined) payload.payment_url = updates.paymentUrl;

  const { data, error } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ----------------------------
// Contracts
// ----------------------------

export async function listContracts() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getContractById(id: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*, clients(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getContractByToken(token: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*, clients(*)')
    .eq('signing_token', token)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

function generateSigningToken() {
  return randomBytes(24).toString('base64url');
}

export async function sendContractForSigning(contractId: string, expiresInDays = 7) {
  const supabase = getClient();
  const token = generateSigningToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('contracts')
    .update({ signing_token: token, signing_expires_at: expiresAt, sent_at: new Date().toISOString(), status: 'sent' })
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert([{ entity_type: 'contract', entity_id: contractId, action: 'contract_sent', summary: `Contract sent for signing`, metadata: { token, expiresAt } }]);
  } catch (e) {
    console.error('audit log failed', e);
  }

  return { contract: data, token };
}

export async function markContractViewed(contractId: string) {
  const supabase = getClient();
  const { data, error } = await supabase.from('contracts').update({ viewed_at: new Date().toISOString() }).eq('id', contractId).select().single();
  if (error) throw error;
  try { await supabase.from('audit_logs').insert([{ entity_type: 'contract', entity_id: contractId, action: 'contract_viewed', summary: 'Contract viewed' }]); } catch(e){console.error('audit log failed', e);} 
  return data;
}

export async function signContractRecord(token: string, signedName: string, signedEmail: string, signatureData: string, ip: string, userAgent: string) {
  const supabase = getClient();
  const now = new Date().toISOString();

  // find contract by token
  const { data: contract } = await supabase.from('contracts').select('*').eq('signing_token', token).maybeSingle();
  if (!contract) throw new Error('invalid_token');

  const nowDate = new Date();
  if (contract.signing_expires_at && new Date(contract.signing_expires_at) < nowDate) {
    await supabase
      .from('contracts')
      .update({ status: 'expired', signing_token: null })
      .eq('id', contract.id);

    try {
      await supabase.from('audit_logs').insert([
        {
          entity_type: 'contract',
          entity_id: contract.id,
          action: 'contract_expired',
          summary: `Contract signing expired`,
          metadata: { ip, userAgent },
        },
      ]);
    } catch (e) {
      console.error('audit log failed', e);
    }

    throw new Error('expired');
  }

  // prevent double-sign
  if (contract.status === 'signed' || contract.signed_at) throw new Error('already_signed');

  const payload: any = {
    status: 'signed',
    signed_name: signedName,
    signed_email: signedEmail,
    signature_data: signatureData,
    signed_ip: ip,
    signed_at: now,
    signing_token: null,
    signing_expires_at: null,
  };

  const { data, error } = await supabase.from('contracts').update(payload).eq('id', contract.id).select().single();
  if (error) throw error;

  // Auto-create invoice if contract has no linked invoice yet.
  let linkedInvoiceId: string | null = contract.invoice_id ?? null;
  if (!linkedInvoiceId) {
    const md = contract.metadata ?? {};
    const price = Number(md.price ?? 0);
    const packageName = String(md.packageName ?? md.package ?? 'service package');
    const lineItems = [{ description: packageName, qty: 1, unitPrice: price }];

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const invoice = await createInvoiceRecord({
      clientId: contract.client_id,
      project: packageName,
      lineItems,
      dueDate,
      notes: `Auto-generated from signed contract ${contract.contract_number}`,
    });

    linkedInvoiceId = invoice.id;

    await supabase
      .from('contracts')
      .update({ invoice_id: linkedInvoiceId })
      .eq('id', contract.id);

    try {
      await supabase.from('audit_logs').insert([
        {
          entity_type: 'invoice',
          entity_id: linkedInvoiceId,
          action: 'created_from_contract',
          summary: `Invoice auto-created from contract ${contract.contract_number}`,
          metadata: { contractId: contract.id },
        },
      ]);
    } catch (e) {
      console.error('audit log failed', e);
    }
  }

  try {
    await supabase.from('audit_logs').insert([{ entity_type: 'contract', entity_id: contract.id, action: 'contract_signed', summary: `Contract signed by ${signedName}`, metadata: { signedEmail, ip, userAgent } }]);
  } catch (e) { console.error('audit log failed', e); }

  return { ...data, invoice_id: linkedInvoiceId };
}

export async function getContractSigningStatus(contractId: string) {
  const supabase = getClient();
  const { data, error } = await supabase.from('contracts').select('status, signing_expires_at, signed_at').eq('id', contractId).maybeSingle();
  if (error) throw error;
  if (!data) return { status: 'not_found' };
  const now = new Date();
  if (data.status === 'signed') return { status: 'signed', signedAt: data.signed_at };
  if (data.signing_expires_at && new Date(data.signing_expires_at) < now) return { status: 'expired' };
  return { status: 'pending', expiresAt: data.signing_expires_at };
}

function generateContractNumber() {
  const now = new Date();
  const prefix = `CTR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function createContractRecord(input: {
  clientId: string;
  proposalId?: string | null;
  invoiceId?: string | null;
  contractType?: string;
  metadata?: any;
  fileUrl?: string;
}) {
  const supabase = getClient();
  const payload = {
    contract_number: generateContractNumber(),
    client_id: input.clientId,
    proposal_id: input.proposalId ?? null,
    invoice_id: input.invoiceId ?? null,
    contract_type: input.contractType ?? 'service',
    status: 'draft',
    file_url: input.fileUrl ?? '',
    metadata: input.metadata ?? {},
  } as any;

  const { data, error } = await supabase.from('contracts').insert([payload]).select().single();
  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert([{ entity_type: 'contract', entity_id: data.id, action: 'created', summary: `Contract created ${data.contract_number}`, metadata: payload }]);
  } catch (e) {
    console.error('audit log failed', e);
  }

  return data;
}

export async function updateContractRecord(id: string, updates: Partial<{
  status: string;
  signedName?: string | null;
  signedIp?: string | null;
  signedAt?: string | null;
  fileUrl?: string;
  metadata?: any;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.signedName !== undefined) payload.signed_name = updates.signedName;
  if (updates.signedIp !== undefined) payload.signed_ip = updates.signedIp;
  if (updates.signedAt !== undefined) payload.signed_at = updates.signedAt;
  if (updates.fileUrl !== undefined) payload.file_url = updates.fileUrl;
  if (updates.metadata !== undefined) payload.metadata = updates.metadata;

  const { data, error } = await supabase.from('contracts').update(payload).eq('id', id).select().single();
  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert([{ entity_type: 'contract', entity_id: id, action: 'updated', summary: `Contract ${id} updated`, metadata: payload }]);
  } catch (e) {
    console.error('audit log failed', e);
  }

  return data;
}

export async function getOverdueBilling() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('billing')
    .select('*, clients(name)')
    .eq('paid', false)
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createBillingRecord(input: {
  clientId: string;
  amount: number;
  dueDate: string;
  paymentMethod?: string;
  notes?: string;
  paid?: boolean;
}) {
  const supabase = getClient();
  const dueDate = input.dueDate;

  const { data, error } = await supabase
    .from('billing')
    .insert([
      {
        client_id: input.clientId,
        amount: input.amount,
        due_date: dueDate,
        paid: input.paid ?? false,
        payment_method: input.paymentMethod ?? 'bank',
        notes: input.notes ?? '',
        last_paid_at: null,
        next_due_date: dueDate,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBillingRecord(id: string, updates: Partial<{
  status: string;
  paid: boolean;
  lastPaidAt: string | null;
  nextDueDate: string | null;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.paid !== undefined) payload.paid = updates.paid;
  if (updates.lastPaidAt !== undefined) payload.last_paid_at = updates.lastPaidAt;
  if (updates.nextDueDate !== undefined) payload.next_due_date = updates.nextDueDate;

  const { data, error } = await supabase
    .from('billing')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listRequests() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('client_requests')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRequestCountByClient(clientId: string, monthsBack = 1) {
  const supabase = getClient();
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - monthsBack);

  const { data, error } = await supabase
    .from('client_requests')
    .select('id')
    .eq('client_id', clientId)
    .gte('created_at', threshold.toISOString());

  if (error) throw error;
  return data?.length ?? 0;
}

export async function createRequestRecord(input: {
  clientId: string;
  clientName?: string;
  type?: string;
  description: string;
  priority?: string;
}) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('client_requests')
    .insert([
      {
        client_id: input.clientId,
        title: input.type ?? 'general',
        description: input.description,
        status: 'new',
        priority: input.priority ?? 'medium',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRequestRecord(id: string, updates: Partial<{
  status: string;
  notes: string;
}>) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.status === 'completed') payload.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('client_requests')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listReports(clientId?: string) {
  const supabase = getClient();
  let query = supabase.from('report_runs').select('*');
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('generated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReportRecord(input: {
  clientId: string;
  period: string;
  reportType?: string;
  exportFormat?: string;
}) {
  const supabase = getClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('report_runs')
    .insert([
      {
        client_id: input.clientId,
        period_start: startOfMonth,
        period_end: endOfMonth,
        report_type: input.reportType ?? 'monthly_summary',
        generated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export type DeploymentChecklistRecord = {
  id: string;
  clientId: string;
  domainConnected: boolean;
  sslActive: boolean;
  ctaWorks: boolean;
  mobileResponsive: boolean;
  seoMetaTags: boolean;
  domainConnectedAt: string | null;
  sslActiveAt: string | null;
  ctaWorksAt: string | null;
  mobileResponsiveAt: string | null;
  seoMetaTagsAt: string | null;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
};

export type ProvisioningRunRecord = {
  id: string;
  clientId: string;
  template: string;
  domain: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  errorMessage: string | null;
  outputPath: string | null;
  httpCheckPassed: boolean | null;
  createdAt: string;
  completedAt: string | null;
  clientName?: string;
  readyForDeploy?: boolean;
  liveUrl?: string;
};

function checklistCompletionPercent(row: any) {
  const values = [
    row.domain_connected,
    row.ssl_active,
    row.cta_works,
    row.mobile_responsive,
    row.seo_meta_tags,
  ];

  const completeCount = values.filter(Boolean).length;
  return Math.round((completeCount / values.length) * 100);
}

function toChecklistRecord(row: any): DeploymentChecklistRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    domainConnected: Boolean(row.domain_connected),
    sslActive: Boolean(row.ssl_active),
    ctaWorks: Boolean(row.cta_works),
    mobileResponsive: Boolean(row.mobile_responsive),
    seoMetaTags: Boolean(row.seo_meta_tags),
    domainConnectedAt: row.domain_connected_at ?? null,
    sslActiveAt: row.ssl_active_at ?? null,
    ctaWorksAt: row.cta_works_at ?? null,
    mobileResponsiveAt: row.mobile_responsive_at ?? null,
    seoMetaTagsAt: row.seo_meta_tags_at ?? null,
    completionPercent: checklistCompletionPercent(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProvisioningRunRecord(row: any): ProvisioningRunRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    template: row.template ?? 'default',
    domain: row.domain ?? '',
    status: row.status ?? 'pending',
    errorMessage: row.error_message ?? null,
    outputPath: row.output_path ?? null,
    httpCheckPassed: row.http_check_passed ?? null,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? null,
    clientName: row.clients?.name,
    readyForDeploy: row.clients?.ready_for_deploy,
    liveUrl: row.clients?.live_url,
  };
}

export async function getDeploymentChecklist(clientId: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('deployment_checklists')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) throw error;
  return data ? toChecklistRecord(data) : null;
}

export async function updateDeploymentChecklistItem(
  clientId: string,
  item: 'domain_connected' | 'ssl_active' | 'cta_works' | 'mobile_responsive' | 'seo_meta_tags',
  completed: boolean
) {
  const supabase = getClient();
  const timestampField = `${item}_at`;
  const payload: Record<string, unknown> = {
    [item]: completed,
    [timestampField]: completed ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('deployment_checklists')
    .update(payload)
    .eq('client_id', clientId)
    .select()
    .single();

  if (error) throw error;
  return toChecklistRecord(data);
}

export async function listProvisioningRuns(clientId?: string) {
  const supabase = getClient();
  let query = supabase
    .from('provisioning_runs')
    .select('*, clients(name, ready_for_deploy, live_url)');

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('started_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toProvisioningRunRecord);
}

export async function createProvisioningRunRecord(input: {
  clientId: string;
  template?: string;
  domain?: string;
  liveUrl?: string;
  pages?: string[];
}) {
  const supabase = getClient();
  const client = await getClientById(input.clientId);

  if (!client.readyForDeploy) {
    throw new Error('Client is not ready for deployment');
  }

  if (!client.domain && !input.domain) {
    throw new Error('Client domain is required');
  }

  const outputPath = `/provisioned/${(client.name || input.clientId).toLowerCase().replace(/\s+/g, '-')}/`;

  const { data, error } = await supabase
    .from('provisioning_runs')
    .insert([
      {
        client_id: input.clientId,
        template_type: input.template ?? 'default',
        domain: input.domain ?? client.domain,
        status: 'pending',
        output_path: outputPath,
      },
    ])
    .select('*, clients(name, ready_for_deploy, live_url)')
    .single();

  if (error) throw error;

  const healthUrl = input.liveUrl ?? client.liveUrl ?? `https://${input.domain ?? client.domain}`;
  let httpCheckPassed: boolean | null = null;
  let status: ProvisioningRunRecord['status'] = 'success';
  let errorMessage: string | null = null;

  if (healthUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      httpCheckPassed = response.ok;
      if (!response.ok) {
        status = 'failed';
        errorMessage = `Health check returned ${response.status}`;
      }
    } catch (error) {
      status = 'failed';
      httpCheckPassed = false;
      errorMessage = error instanceof Error ? error.message : 'Health check failed';
    }
  }

  const { data: completed, error: updateError } = await supabase
    .from('provisioning_runs')
    .update({
      status,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select('*, clients(name, ready_for_deploy, live_url)')
    .single();

  if (updateError) throw updateError;
  return toProvisioningRunRecord(completed);
}

export async function updateProvisioningRunRecord(
  id: string,
  updates: Partial<{
    status: ProvisioningRunRecord['status'];
    errorMessage: string | null;
    httpCheckPassed: boolean | null;
    outputPath: string | null;
  }>
) {
  const supabase = getClient();
  const payload: Record<string, unknown> = {};

  if (updates.status) payload.status = updates.status;
  if (updates.errorMessage !== undefined) payload.error_message = updates.errorMessage;
  if (updates.httpCheckPassed !== undefined) payload.http_check_passed = updates.httpCheckPassed;
  if (updates.outputPath !== undefined) payload.output_path = updates.outputPath;
  if (updates.status && updates.status !== 'in_progress') payload.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('provisioning_runs')
    .update(payload)
    .eq('id', id)
    .select('*, clients(name, ready_for_deploy, live_url)')
    .single();

  if (error) throw error;
  return toProvisioningRunRecord(data);
}

export async function convertLeadToClientRecord(leadId: string, input: {
  name: string;
  businessType?: string;
  email?: string;
  phone?: string;
  domain: string;
  plan?: string;
  monthlyFee?: number;
  readyForDeploy?: boolean;
  liveUrl?: string;
}) {
  const { client, duplicate } = await createClientRecord(input);
  const lead = await updateLeadRecord(leadId, {
    status: 'closed',
    closedAt: new Date().toISOString(),
  });

  return { client, duplicate, lead };
}


