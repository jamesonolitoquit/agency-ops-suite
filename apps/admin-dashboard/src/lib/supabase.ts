import { createClient } from '@supabase/supabase-js';
import { resolveBrowserSupabaseKey, resolveBrowserSupabaseUrl } from '@/lib/supabase/env';

const supabaseUrl = resolveBrowserSupabaseUrl();
const supabaseAnonKey = resolveBrowserSupabaseKey();

// Lazy-load the client to handle missing env vars during build
let clientInstance: any = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return clientInstance;
}

// For backward compatibility, export as a callable getter
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  },
});

// Or just use getSupabaseClient directly in new code
export { getSupabaseClient };

// Helper functions for common operations

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  businessType?: string;
  source: string;
  notes?: string;
}) {
  const { data: lead, error } = await supabase
    .from('leads')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return lead;
}

export async function getLeads(filters?: { status?: string }) {
  let query = supabase.from('leads').select('*');
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function convertLeadToClient(leadId: string, clientData: {
  name: string;
  businessType?: string;
  domain: string;
  plan: string;
  monthlyFee: number;
}) {
  // Create client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();

  if (clientError) throw clientError;

  // Update lead
  const { error: leadError } = await supabase
    .from('leads')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      converted_to_client_id: client.id,
    })
    .eq('id', leadId);

  if (leadError) throw leadError;

  // Create deployment checklist for client
  await supabase
    .from('deployment_checklists')
    .insert([{ client_id: client.id }])
    .select()
    .single();

  return client;
}

export async function getClients(filters?: { status?: string; readyForDeploy?: boolean }) {
  let query = supabase.from('clients').select('*');
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.readyForDeploy !== undefined) {
    query = query.eq('ready_for_deploy', filters.readyForDeploy);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, data: Partial<any>) {
  const { data: updated, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function createProvisioningRun(data: {
  clientId: string;
  template: string;
  domain: string;
}) {
  // SAFEGUARD: Check if client is ready
  const client = await getClient(data.clientId);
  if (!client.ready_for_deploy) {
    throw new Error('Client is not ready for deployment');
  }

  const { data: run, error } = await supabase
    .from('provisioning_runs')
    .insert([
      {
        client_id: data.clientId,
        template: data.template,
        domain: data.domain,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return run;
}

export async function getProvisioningRuns(clientId: string) {
  const { data, error } = await supabase
    .from('provisioning_runs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateProvisioningRun(
  id: string,
  data: Partial<any>
) {
  const { data: updated, error } = await supabase
    .from('provisioning_runs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function getDeploymentChecklist(clientId: string) {
  const { data, error } = await supabase
    .from('deployment_checklists')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeploymentChecklistItem(
  clientId: string,
  item: string, // e.g., "domain_connected"
  completed: boolean
) {
  const updates: any = {
    [item]: completed,
  };

  if (completed) {
    updates[`${item}_at`] = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('deployment_checklists')
    .update(updates)
    .eq('client_id', clientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBilling(data: {
  clientId: string;
  amount: number;
  dueDate: string;
}) {
  const { data: billing, error } = await supabase
    .from('billing')
    .insert([
      {
        client_id: data.clientId,
        amount: data.amount,
        due_date: data.dueDate,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return billing;
}

export async function getBilling(clientId: string) {
  const { data, error } = await supabase
    .from('billing')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markBillingAsPaid(id: string) {
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const { data, error } = await supabase
    .from('billing')
    .update({
      paid: true,
      last_paid_at: new Date().toISOString(),
      next_due_date: nextDueDate.toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOverdueBilling() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('billing')
    .select('*, clients(*)')
    .eq('paid', false)
    .lt('due_date', now);

  if (error) throw error;
  return data;
}

export async function createClientRequest(data: {
  clientId: string;
  title: string;
  description?: string;
  priority?: string;
}) {
  const { data: request, error } = await supabase
    .from('client_requests')
    .insert([
      {
        client_id: data.clientId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function getClientRequests(clientId: string) {
  const { data, error } = await supabase
    .from('client_requests')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRequestsCount(clientId: string, monthsBack: number = 1) {
  const dateThreshold = new Date();
  dateThreshold.setMonth(dateThreshold.getMonth() - monthsBack);

  const { data, error } = await supabase
    .from('client_requests')
    .select('id')
    .eq('client_id', clientId)
    .gte('created_at', dateThreshold.toISOString());

  if (error) throw error;
  return data?.length || 0;
}

export async function updateClientRequest(
  id: string,
  data: Partial<any>
) {
  const { data: updated, error } = await supabase
    .from('client_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function createBackupLog(data: {
  status: string;
  filePath?: string;
  fileExists?: boolean;
  errorMessage?: string;
}) {
  const { data: log, error } = await supabase
    .from('backup_logs')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return log;
}

export async function getBackupLogs(limit: number = 10) {
  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createReport(data: {
  clientId: string;
  periodStart: string;
  periodEnd: string;
  updatesCount?: number;
  requestsCompleted?: number;
  billingStatus?: string;
}) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function getReports(clientId?: string) {
  let query = supabase.from('reports').select('*');
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
