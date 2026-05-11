import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import {
  appendContractAuditLog,
  getContractById as getEphemeralContractById,
  getPublicContractByToken as getEphemeralPublicContract,
  getProposalById as getEphemeralProposalById,
  isMissingTableError,
  listContractAuditLog,
  listContractsForUser as listEphemeralContractsForUser,
  nextContractNumber,
  saveContract as saveEphemeralContract,
} from './ephemeral-store';

export type ContractType = 'service' | 'retainer' | 'maintenance';
export type ContractStatus = 'draft' | 'sent' | 'reviewed' | 'signed' | 'completed' | 'declined';

interface Deliverable {
  name: string;
  description: string;
  hours: number;
  cost: number;
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
}

interface AcceptanceCriterion {
  criterion: string;
  description: string;
}

export interface ContractData {
  proposal_id?: string;
  contract_type: ContractType;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  project_name: string;
  project_description?: string;
  start_date: string;
  end_date: string;
  timeline_weeks: number;
  deliverables: Deliverable[];
  contract_cost_low: number;
  contract_cost_high: number;
  final_cost?: number;
  payment_terms: string;
  acceptance_criteria: AcceptanceCriterion[];
  terms_and_conditions: string;
  nda_included: boolean;
}

export interface Contract extends ContractData {
  id: string;
  contract_number: string;
  version: number;
  parent_contract_id?: string;
  status: ContractStatus;
  public_token: string;
  is_public: boolean;
  prospect_signature?: {
    signed_at: string;
    ip: string;
    user_agent: string;
  };
  sent_at?: string;
  signed_at?: string;
  completed_at?: string;
  expires_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContractAuditLog {
  id: string;
  contract_id: string;
  action: string;
  prospect_ip?: string;
  details?: Record<string, any>;
  created_at: string;
}

/**
 * Generate a unique contract number (e.g., "C-2026-001")
 */
export async function generateContractNumber(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  // Get the highest contract number for this year
  const { data: contracts } = await supabase
    .from('contracts')
    .select('contract_number')
    .like('contract_number', `C-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!contracts || contracts.length === 0) {
    return nextContractNumber(year);
  }

  const lastNumber = parseInt(contracts[0].contract_number.split('-')[2]);
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

  return `C-${year}-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate a secure 32-character hex token for public sharing
 */
export function generatePublicToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate contract from accepted proposal
 */
export async function generateContractFromProposal(params: {
  proposalId: string;
  contractType: ContractType;
  userId: string;
  includeNda?: boolean;
}): Promise<{ success: boolean; contractId: string; publicToken: string; data?: Contract }> {
  const supabase = await createClient();

  try {
    // Get the proposal
    let proposal: any = null;
    const { data: fetchedProposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', params.proposalId)
      .eq('created_by', params.userId)
      .eq('status', 'accepted')
      .single();

    proposal = fetchedProposal;

    if (proposalError || !proposal) {
      proposal = getEphemeralProposalById(params.proposalId);
      if (!proposal) {
        return { success: false, contractId: '', publicToken: '', data: undefined };
      }
    }

    // Create contract from proposal
    const contractNumber = await generateContractNumber();
    const publicToken = generatePublicToken();
    const contractData = {
      proposal_id: params.proposalId,
      contract_number: contractNumber,
      contract_type: params.contractType,
      prospect_name: proposal.prospect_name,
      prospect_email: proposal.prospect_email,
      prospect_company: proposal.prospect_company,
      project_name: proposal.project_name,
      project_description: `Based on audit review: ${proposal.project_name}`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days
      timeline_weeks: 12,
      deliverables: proposal.deliverables || [],
      contract_cost_low: proposal.estimated_cost_low,
      contract_cost_high: proposal.estimated_cost_high,
      payment_terms: '50% upfront, 50% on completion',
      acceptance_criteria: [
        { criterion: 'All deliverables completed', description: 'All items in scope must be delivered' },
        { criterion: 'Client approval', description: 'Client must approve all deliverables' },
        { criterion: 'Testing complete', description: 'Full QA testing must be passed' },
      ],
      terms_and_conditions: generateDefaultTerms(proposal.project_name),
      nda_included: params.includeNda || false,
      status: 'draft',
      public_token: publicToken,
      is_public: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_by: params.userId,
    };

    // Insert contract
    const { data: contract, error: insertError } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (insertError && !isMissingTableError(insertError)) {
      console.error('Contract creation error:', insertError);
      return { success: false, contractId: '', publicToken: '' };
    }

    if (insertError || !contract) {
      const ephemeralContract = saveEphemeralContract({
        id: contract?.id ?? crypto.randomUUID(),
        ...contractData,
        contract_number: contract?.contract_number ?? contractNumber,
        version: contract?.version ?? 1,
        parent_contract_id: contract?.parent_contract_id ?? null,
        status: 'draft',
        public_token: contract?.public_token ?? publicToken,
        is_public: false,
        prospect_signature: null,
        sent_at: null,
        signed_at: null,
        completed_at: null,
        expires_at: contract?.expires_at ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: params.userId,
        created_at: contract?.created_at ?? new Date().toISOString(),
        updated_at: contract?.updated_at ?? new Date().toISOString(),
      });

      if (ephemeralContract) {
        await logContractAction({
          contract_id: ephemeralContract.id,
          action: 'created_from_proposal',
          details: { proposal_id: params.proposalId },
        });

        return {
          success: true,
          contractId: ephemeralContract.id,
          publicToken: ephemeralContract.public_token,
          data: ephemeralContract as Contract,
        };
      }
    }

    // Log action
    await logContractAction({
      contract_id: contract.id,
      action: 'created_from_proposal',
      details: { proposal_id: params.proposalId },
    });

    return {
      success: true,
      contractId: contract.id,
      publicToken: publicToken,
      data: contract,
    };
  } catch (error) {
    console.error('Generate contract error:', error);
    return { success: false, contractId: '', publicToken: '' };
  }
}

/**
 * Create custom contract
 */
export async function createContract(data: ContractData, userId: string): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    const contractNumber = await generateContractNumber();
    const publicToken = generatePublicToken();

    const contractData = {
      ...data,
      contract_number: contractNumber,
      public_token: publicToken,
      is_public: false,
      status: 'draft' as ContractStatus,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
    };

    const { data: contract, error } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (error && !isMissingTableError(error)) {
      console.error('Contract creation error:', error);
      return null;
    }

    if (error || !contract) {
      const ephemeralContract = saveEphemeralContract({
        id: contract?.id ?? crypto.randomUUID(),
        ...contractData,
        contract_number: contract?.contract_number ?? contractNumber,
        version: contract?.version ?? 1,
        parent_contract_id: contract?.parent_contract_id ?? null,
        status: 'draft',
        public_token: contract?.public_token ?? publicToken,
        is_public: false,
        prospect_signature: null,
        sent_at: null,
        signed_at: null,
        completed_at: null,
        expires_at: contract?.expires_at ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        created_at: contract?.created_at ?? new Date().toISOString(),
        updated_at: contract?.updated_at ?? new Date().toISOString(),
      });

      if (ephemeralContract) {
        await logContractAction({
          contract_id: ephemeralContract.id,
          action: 'created',
          details: { type: 'custom' },
        });

        return ephemeralContract as Contract;
      }
      return null;
    }

    await logContractAction({
      contract_id: contract.id,
      action: 'created',
      details: { type: 'custom' },
    });

    return contract;
  } catch (error) {
    console.error('Create contract error:', error);
    return null;
  }
}

/**
 * Get contract by ID (requires ownership)
 */
export async function getContractById(id: string, userId: string): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error || !contract) {
      const ephemeral = getEphemeralContractById(id);
      if (ephemeral && ephemeral.created_by === userId) return ephemeral as Contract;
      return null;
    }

    return contract;
  } catch (error) {
    console.error('Get contract error:', error);
    return null;
  }
}

/**
 * Get public contract by token (no auth required)
 */
export async function getPublicContract(token: string): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('public_token', token)
      .eq('is_public', true)
      .single();

    if (error || !contract) {
      const ephemeral = getEphemeralPublicContract(token);
      if (ephemeral) return ephemeral as Contract;
      return null;
    }

    return contract;
  } catch (error) {
    console.error('Get public contract error:', error);
    return null;
  }
}

/**
 * List user's contracts
 */
export async function listContracts(
  userId: string,
  filters?: {
    status?: ContractStatus;
    proposal_id?: string;
    limit?: number;
  }
): Promise<Contract[]> {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('contracts')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.proposal_id) {
      query = query.eq('proposal_id', filters.proposal_id);
    }

    const limit = filters?.limit || 50;
    query = query.limit(limit);

    const { data: contracts, error } = await query;

    if (error) {
      console.error('List contracts error:', error);
      return listEphemeralContractsForUser(userId, limit) as Contract[];
    }

    return contracts || [];
  } catch (error) {
    console.error('List contracts error:', error);
    return [];
  }
}

/**
 * Update contract status
 */
export async function updateContractStatus(
  id: string,
  status: ContractStatus,
  userId: string,
  details?: Record<string, any>
): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    const updateData: Record<string, any> = { status };

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    } else if (status === 'signed') {
      updateData.signed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error || !contract) {
      const ephemeral = getEphemeralContractById(id);
      if (!ephemeral || ephemeral.created_by !== userId) {
        return null;
      }

      const updated = saveEphemeralContract({
        ...ephemeral,
        status,
        final_cost: details?.final_cost ?? ephemeral.final_cost,
        payment_terms: details?.payment_terms ?? ephemeral.payment_terms,
        sent_at: status === 'sent' ? new Date().toISOString() : ephemeral.sent_at,
        signed_at: status === 'signed' ? new Date().toISOString() : ephemeral.signed_at,
        completed_at: status === 'completed' ? new Date().toISOString() : ephemeral.completed_at,
        updated_at: new Date().toISOString(),
      });

      await logContractAction({
        contract_id: id,
        action: `status_updated_to_${status}`,
        details: details || { status },
      });

      return updated as Contract;
    }

    await logContractAction({
      contract_id: id,
      action: `status_updated_to_${status}`,
      details: details || { status },
    });

    return contract;
  } catch (error) {
    console.error('Update status error:', error);
    return null;
  }
}

/**
 * Create new contract version (amendment)
 */
export async function createContractVersion(
  contractId: string,
  updates: Partial<ContractData>,
  userId: string,
  changeReason: string
): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    // Get existing contract
    const existing = await getContractById(contractId, userId);
    if (!existing) {
      return null;
    }

    // Create new version
    const publicToken = generatePublicToken();
    const newVersionData = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      parent_contract_id: contractId,
      public_token: publicToken,
      status: 'draft',
      prospect_signature: undefined,
    };

    const { data: newVersion, error } = await supabase
      .from('contracts')
      .insert(newVersionData)
      .select()
      .single();

    if (error || !newVersion) {
      const ephemeral = getEphemeralContractById(contractId);
      if (!ephemeral) return null;

      const updated = saveEphemeralContract({
        ...ephemeral,
        ...updates,
        version: (ephemeral.version || 1) + 1,
        parent_contract_id: contractId,
        public_token: generatePublicToken(),
        status: 'draft',
        prospect_signature: undefined,
        updated_at: new Date().toISOString(),
      });

      if (updated) {
        await logContractAction({
          contract_id: contractId,
          action: 'version_created',
          details: {
            new_version_id: updated.id,
            version_number: updated.version,
            reason: changeReason,
            changes: updates,
          },
        });

        return updated as Contract;
      }
      return null;
    }

    await logContractAction({
      contract_id: contractId,
      action: 'version_created',
      details: {
        new_version_id: newVersion.id,
        version_number: newVersion.version,
        reason: changeReason,
        changes: updates,
      },
    });

    return newVersion;
  } catch (error) {
    console.error('Create version error:', error);
    return null;
  }
}

/**
 * Sign contract via public token
 */
export async function signContract(params: {
  token: string;
  signature_ip: string;
  signature_user_agent: string;
}): Promise<{ success: boolean; signedAt?: string }> {
  const supabase = await createClient();

  try {
    const contract = await getPublicContract(params.token);
    if (!contract) {
      return { success: false };
    }

    const signatureData = {
      signed_at: new Date().toISOString(),
      ip: params.signature_ip,
      user_agent: params.signature_user_agent,
    };

    const { error } = await supabase
      .from('contracts')
      .update({
        prospect_signature: signatureData,
        status: 'signed',
        signed_at: new Date().toISOString(),
      })
      .eq('id', contract.id);

    if (error) {
      if (isMissingTableError(error)) {
        const ephemeral = getEphemeralPublicContract(params.token);
        if (!ephemeral) {
          return { success: false };
        }

        saveEphemeralContract({
          ...ephemeral,
          prospect_signature: signatureData,
          status: 'signed',
          signed_at: signatureData.signed_at,
          updated_at: new Date().toISOString(),
        });

        await logContractAction({
          contract_id: ephemeral.id,
          action: 'signed',
          prospect_ip: params.signature_ip,
          details: {
            user_agent: params.signature_user_agent,
            signed_at: signatureData.signed_at,
          },
        });

        return { success: true, signedAt: signatureData.signed_at };
      }

      console.error('Sign contract error:', error);
      return { success: false };
    }

    await logContractAction({
      contract_id: contract.id,
      action: 'signed',
      prospect_ip: params.signature_ip,
      details: {
        user_agent: params.signature_user_agent,
        signed_at: signatureData.signed_at,
      },
    });

    return { success: true, signedAt: signatureData.signed_at };
  } catch (error) {
    console.error('Sign contract error:', error);
    return { success: false };
  }
}

/**
 * Publish contract (make public)
 */
export async function publishContract(id: string, userId: string): Promise<Contract | null> {
  const supabase = await createClient();

  try {
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({ is_public: true })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error || !contract) {
      const ephemeral = getEphemeralContractById(id);
      if (!ephemeral || ephemeral.created_by !== userId) {
        return null;
      }

      const updated = saveEphemeralContract({
        ...ephemeral,
        is_public: true,
        updated_at: new Date().toISOString(),
      });

      if (updated) {
        await logContractAction({
          contract_id: id,
          action: 'published',
          details: { public_token: updated.public_token },
        });

        return updated as Contract;
      }
      return null;
    }

    await logContractAction({
      contract_id: id,
      action: 'published',
      details: { public_token: contract.public_token },
    });

    return contract;
  } catch (error) {
    console.error('Publish contract error:', error);
    return null;
  }
}

/**
 * Log contract action
 */
export async function logContractAction(params: {
  contract_id: string;
  action: string;
  prospect_ip?: string;
  details?: Record<string, any>;
}): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('contract_audit_log').insert({
      contract_id: params.contract_id,
      action: params.action,
      prospect_ip: params.prospect_ip,
      details: params.details,
      created_at: new Date().toISOString(),
    });

    if (error) {
      appendContractAuditLog({
        contract_id: params.contract_id,
        action: params.action,
        prospect_ip: params.prospect_ip,
        details: params.details,
      });
      console.error('Log action error:', error);
    }
  } catch (error) {
    appendContractAuditLog({
      contract_id: params.contract_id,
      action: params.action,
      prospect_ip: params.prospect_ip,
      details: params.details,
    });
    console.error('Log action error:', error);
  }
}

/**
 * Get audit log for contract
 */
export async function getContractAuditLog(contractId: string): Promise<ContractAuditLog[]> {
  const supabase = await createClient();

  try {
    const { data: logs, error } = await supabase
      .from('contract_audit_log')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) {
      return listContractAuditLog(contractId) as ContractAuditLog[];
    }

    return logs || [];
  } catch (error) {
    console.error('Get audit log error:', error);
    return [];
  }
}

/**
 * Generate default contract terms and conditions
 */
function generateDefaultTerms(projectName: string): string {
  return `# Terms and Conditions for ${projectName}

## Scope of Work
The services covered under this contract are limited to the deliverables listed in the Deliverables section.

## Payment Terms
Payment is due according to the payment schedule outlined in the contract.

## Timeline
All deliverables will be completed within the specified timeline unless extended in writing.

## Revisions
The number of revision rounds is included in the project scope. Additional revisions may incur extra charges.

## Intellectual Property
All work product created under this contract is owned by the Client upon full payment.

## Confidentiality
Both parties agree to maintain confidentiality of proprietary information shared during the project.

## Limitation of Liability
Neither party shall be liable for indirect, incidental, or consequential damages.

## Termination
Either party may terminate this contract with 14 days written notice if services are unsatisfactory.

## Governing Law
This contract shall be governed by the laws of the jurisdiction in which the Service Provider is based.`;
}
