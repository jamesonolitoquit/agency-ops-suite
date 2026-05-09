import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'crypto';
import {
  appendProposalAuditLog,
  getAuditById as getEphemeralAuditById,
  getProposalById as getEphemeralProposalById,
  getPublicProposalByToken as getEphemeralPublicProposal,
  isMissingTableError,
  listProposalsForUser as listEphemeralProposalsForUser,
  saveProposal as saveEphemeralProposal,
} from './ephemeral-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ProposalScope = 'Basic' | 'Standard' | 'Premium' | 'Custom';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface Deliverable {
  name: string;
  hours: number;
  cost: number;
  category: string;
}

export interface ProposalData {
  id: string;
  audit_id?: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  project_name: string;
  project_scope: ProposalScope;
  proposed_timeline_weeks: number;
  estimated_cost_low: number;
  estimated_cost_high: number;
  final_quote?: number;
  deliverables: Deliverable[];
  status: ProposalStatus;
  public_token: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  expires_at: string;
  sent_at?: string;
  accepted_at?: string;
}

export interface GenerateProposalParams {
  auditId: string;
  scope: ProposalScope;
  prospectName: string;
  prospectEmail: string;
  prospectCompany: string;
  projectName?: string;
  userId: string;
}

// Scope multipliers for cost calculation
const SCOPE_MULTIPLIERS: Record<ProposalScope, number> = {
  'Basic': 1.0,    // Only critical fixes
  'Standard': 1.3, // Critical + high
  'Premium': 1.6,  // All issues
  'Custom': 1.0,   // Manual
};

// Hours to fix by severity
const HOURS_PER_ISSUE = {
  critical: 4,
  high: 2,
  medium: 1,
  low: 0.5,
};

// Calculate deliverables from audit data
function calculateDeliverables(auditData: any, scope: ProposalScope): Deliverable[] {
  const deliverables: Deliverable[] = [];
  const multiplier = SCOPE_MULTIPLIERS[scope];

  // Parse issues from audit (assuming they're in the audit response)
  const issues = Array.isArray(auditData.issues) ? auditData.issues : [];

  // Group by severity and category
  const categories = {
    performance: { hours: 0, cost: 0, name: 'Performance Optimization' },
    seo: { hours: 0, cost: 0, name: 'SEO Improvements' },
    accessibility: { hours: 0, cost: 0, name: 'Accessibility Compliance' },
    'best-practices': { hours: 0, cost: 0, name: 'Security & Best Practices' },
  };

  for (const issue of issues) {
    const category = issue.category as keyof typeof categories;
    if (!categories[category]) continue;

    // Only include based on scope
    if (scope === 'Basic' && issue.severity !== 'critical') continue;
    if (scope === 'Standard' && !['critical', 'high'].includes(issue.severity)) continue;

    const issueHours = HOURS_PER_ISSUE[issue.severity as keyof typeof HOURS_PER_ISSUE] || 1;
    const hourlyRate = 150;
    const cost = Math.round(issueHours * hourlyRate * multiplier);

    categories[category].hours += issueHours * multiplier;
    categories[category].cost += cost;
  }

  // Convert to deliverables array
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.hours > 0) {
      deliverables.push({
        name: cat.name,
        hours: Math.round(cat.hours * 10) / 10, // Round to 1 decimal
        cost: cat.cost,
        category: key,
      });
    }
  }

  return deliverables;
}

// Calculate proposal pricing
function calculateProposalCost(
  auditData: any,
  scope: ProposalScope,
  deliverables: Deliverable[]
): { low: number; high: number; total_hours: number } {
  const totalHours = deliverables.reduce((sum, d) => sum + d.hours, 0);
  const hourlyRate = 150;

  // Add QA buffer (20%)
  const baseTotal = totalHours * hourlyRate;
  const low = Math.round(baseTotal * 1.1);
  const high = Math.round(baseTotal * 1.3);

  return {
    low,
    high,
    total_hours: totalHours,
  };
}

// Generate a secure public token
function generatePublicToken(): string {
  return randomBytes(16).toString('hex');
}

// Generate proposal from audit
export async function generateProposalFromAudit(params: GenerateProposalParams) {
  try {
    // Fetch audit data
    let auditData: any = null;
    const { data: fetchedAuditData, error: auditError } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('id', params.auditId)
      .eq('created_by', params.userId)
      .single();

    auditData = fetchedAuditData;

    if (auditError || !auditData) {
      auditData = getEphemeralAuditById(params.auditId);
      if (!auditData) {
        throw new Error('Audit not found');
      }
    }

    // Calculate deliverables and pricing
    const deliverables = calculateDeliverables(auditData, params.scope);
    const { low, high, total_hours } = calculateProposalCost(auditData, params.scope, deliverables);

    // Create proposal record
    const publicToken = generatePublicToken();
    const projectName = params.projectName || `${params.prospectCompany} - Web Development`;

    const { data: proposalData, error: insertError } = await supabase
      .from('proposals')
      .insert({
        audit_id: params.auditId,
        prospect_name: params.prospectName,
        prospect_email: params.prospectEmail,
        prospect_company: params.prospectCompany,
        project_name: projectName,
        project_scope: params.scope,
        proposed_timeline_weeks: 8, // Default timeline
        deliverables: deliverables,
        estimated_cost_low: low,
        estimated_cost_high: high,
        estimated_total_hours: total_hours,
        public_token: publicToken,
        status: 'draft',
        created_by: params.userId,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .select()
      .single();

    if (insertError && !isMissingTableError(insertError)) throw insertError;

    if (insertError || !proposalData) {
      const ephemeralProposal = saveEphemeralProposal({
        id: proposalData?.id ?? randomUUID(),
        audit_id: params.auditId,
        prospect_name: params.prospectName,
        prospect_email: params.prospectEmail,
        prospect_company: params.prospectCompany,
        project_name: projectName,
        project_scope: params.scope,
        proposed_timeline_weeks: 8,
        estimated_cost_low: low,
        estimated_cost_high: high,
        estimated_total_hours: total_hours,
        public_token: proposalData?.public_token ?? publicToken,
        status: 'draft',
        is_public: false,
        created_by: params.userId,
        created_at: proposalData?.created_at ?? new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        deliverables,
      });

      if (ephemeralProposal) {
        return {
          success: true,
          proposalId: ephemeralProposal.id,
          publicToken: ephemeralProposal.public_token,
          data: ephemeralProposal,
        };
      }
    }

    return {
      success: true,
      proposalId: proposalData.id,
      publicToken: proposalData.public_token,
      data: proposalData,
    };
  } catch (error) {
    console.error('Proposal generation failed:', error);
    throw error;
  }
}

// Create custom proposal
export async function createProposal(
  data: Partial<ProposalData> & { userId: string }
) {
  try {
    const publicToken = generatePublicToken();

    const { data: proposalData, error } = await supabase
      .from('proposals')
      .insert({
        prospect_name: data.prospect_name,
        prospect_email: data.prospect_email,
        prospect_company: data.prospect_company,
        project_name: data.project_name,
        project_scope: data.project_scope || 'Standard',
        proposed_timeline_weeks: data.proposed_timeline_weeks || 8,
        deliverables: data.deliverables || [],
        estimated_cost_low: data.estimated_cost_low,
        estimated_cost_high: data.estimated_cost_high,
        public_token: publicToken,
        status: 'draft',
        created_by: data.userId,
      })
      .select()
      .single();

    if (error && !isMissingTableError(error)) throw error;

    if (error || !proposalData) {
      const ephemeralProposal = saveEphemeralProposal({
        id: proposalData?.id ?? randomUUID(),
        prospect_name: data.prospect_name,
        prospect_email: data.prospect_email,
        prospect_company: data.prospect_company,
        project_name: data.project_name,
        project_scope: data.project_scope || 'Standard',
        proposed_timeline_weeks: data.proposed_timeline_weeks || 8,
        deliverables: data.deliverables || [],
        estimated_cost_low: data.estimated_cost_low,
        estimated_cost_high: data.estimated_cost_high,
        estimated_total_hours: 0,
        public_token: publicToken,
        status: 'draft',
        created_by: data.userId,
        is_public: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (ephemeralProposal) {
        return {
          success: true,
          proposalId: ephemeralProposal.id,
          publicToken: ephemeralProposal.public_token,
        };
      }
    }

    return {
      success: true,
      proposalId: proposalData.id,
      publicToken: proposalData.public_token,
    };
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

// Get proposal by ID (auth required)
export async function getProposalById(proposalId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (error) {
    const ephemeral = getEphemeralProposalById(proposalId);
    if (ephemeral) return ephemeral;
    throw error;
  }
  return data;
}

// Get public proposal (no auth)
export async function getPublicProposal(token: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .eq('is_public', true)
    .single();

  if (error) {
    const ephemeral = getEphemeralPublicProposal(token);
    if (ephemeral) return ephemeral;
    throw error;
  }
  return data;
}

// List proposals for user
export async function listProposals(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return listEphemeralProposalsForUser(userId, limit);
  }
  return data;
}

// Update proposal status
export async function updateProposalStatus(
  proposalId: string,
  status: ProposalStatus,
  finalQuote?: number
) {
  const updates: any = { status };

  if (status === 'sent') {
    updates.sent_at = new Date();
  } else if (status === 'accepted') {
    updates.accepted_at = new Date();
  }

  if (finalQuote) {
    updates.final_quote = finalQuote;
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Publish proposal (make public)
export async function publishProposal(proposalId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .update({ is_public: true })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update proposal content
export async function updateProposal(
  proposalId: string,
  updates: Partial<ProposalData>
) {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) {
    const existing = getEphemeralProposalById(proposalId);
    if (!existing) throw error;
    return saveEphemeralProposal({ ...existing, ...updates, id: proposalId });
  }
  return data;
}

// Log proposal action
export async function logProposalAction(proposalId: string, action: string) {
  const { error } = await supabase
    .from('proposal_audit_log')
    .insert({
      proposal_id: proposalId,
      action,
      created_at: new Date(),
    });

  if (error) {
    appendProposalAuditLog({ proposal_id: proposalId, action });
    console.error('Failed to log proposal action:', error);
  }
}
