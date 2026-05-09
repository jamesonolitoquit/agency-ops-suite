import { randomUUID } from 'crypto';

type AnyRecord = Record<string, any>;

type EphemeralStore = {
  audits: AnyRecord[];
  proposals: AnyRecord[];
  contracts: AnyRecord[];
  proposalAuditLog: AnyRecord[];
  contractAuditLog: AnyRecord[];
};

const globalForStore = globalThis as typeof globalThis & {
  __agencyOpsEphemeralStore?: EphemeralStore;
};

const store: EphemeralStore =
  globalForStore.__agencyOpsEphemeralStore ??
  (globalForStore.__agencyOpsEphemeralStore = {
    audits: [],
    proposals: [],
    contracts: [],
    proposalAuditLog: [],
    contractAuditLog: [],
  });

function clone<T>(value: T): T {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export function isMissingTableError(error: unknown): boolean {
  if (!error) return false;

  const value = error as { code?: string; message?: string; details?: string };
  const message = `${value.message ?? ''} ${value.details ?? ''}`.toLowerCase();

  return (
    value.code === '42P01' ||
    value.code === '42703' ||
    value.code === 'PGRST204' ||
    value.code === 'PGRST205' ||
    (message.includes('relation') && message.includes('does not exist')) ||
    (message.includes('column') && message.includes('does not exist')) ||
    message.includes('not found') ||
    message.includes('404')
  );
}

export function saveAudit(record: AnyRecord) {
  const index = store.audits.findIndex((entry) => entry.id === record.id);
  if (index >= 0) {
    store.audits[index] = { ...store.audits[index], ...clone(record) };
  } else {
    store.audits.unshift(clone(record));
  }
  return getAuditById(record.id);
}

export function listAuditsForUser(userId: string, limit = 20) {
  return clone(store.audits.filter((audit) => audit.created_by === userId).slice(0, limit));
}

export function getAuditById(id: string) {
  const audit = store.audits.find((entry) => entry.id === id);
  return audit ? clone(audit) : null;
}

export function getPublicAuditByToken(token: string) {
  const audit = store.audits.find((entry) => entry.public_token === token && entry.is_public === true);
  return audit ? clone(audit) : null;
}

export function saveProposal(record: AnyRecord) {
  const index = store.proposals.findIndex((entry) => entry.id === record.id);
  if (index >= 0) {
    store.proposals[index] = { ...store.proposals[index], ...clone(record) };
  } else {
    store.proposals.unshift(clone(record));
  }
  return getProposalById(record.id);
}

export function listProposalsForUser(userId: string, limit = 20) {
  return clone(store.proposals.filter((proposal) => proposal.created_by === userId).slice(0, limit));
}

export function getProposalById(id: string) {
  const proposal = store.proposals.find((entry) => entry.id === id);
  return proposal ? clone(proposal) : null;
}

export function getPublicProposalByToken(token: string) {
  const proposal = store.proposals.find((entry) => entry.public_token === token && entry.is_public === true);
  return proposal ? clone(proposal) : null;
}

export function nextContractNumber(year: number) {
  const prefix = `C-${year}-`;
  const current = store.contracts.filter((contract) => typeof contract.contract_number === 'string' && contract.contract_number.startsWith(prefix));
  const highest = current.reduce((max, contract) => {
    const number = Number.parseInt(String(contract.contract_number).split('-')[2] ?? '0', 10);
    return Number.isFinite(number) && number > max ? number : max;
  }, 0);
  return `C-${year}-${String(highest + 1).padStart(3, '0')}`;
}

export function saveContract(record: AnyRecord) {
  const index = store.contracts.findIndex((entry) => entry.id === record.id);
  if (index >= 0) {
    store.contracts[index] = { ...store.contracts[index], ...clone(record) };
  } else {
    store.contracts.unshift(clone(record));
  }
  return getContractById(record.id);
}

export function listContractsForUser(userId: string, limit = 50) {
  return clone(store.contracts.filter((contract) => contract.created_by === userId).slice(0, limit));
}

export function getContractById(id: string) {
  const contract = store.contracts.find((entry) => entry.id === id);
  return contract ? clone(contract) : null;
}

export function getPublicContractByToken(token: string) {
  const contract = store.contracts.find((entry) => entry.public_token === token && entry.is_public === true);
  return contract ? clone(contract) : null;
}

export function appendProposalAuditLog(record: AnyRecord) {
  store.proposalAuditLog.unshift(clone({ id: randomUUID(), created_at: new Date().toISOString(), ...record }));
}

export function appendContractAuditLog(record: AnyRecord) {
  store.contractAuditLog.unshift(clone({ id: randomUUID(), created_at: new Date().toISOString(), ...record }));
}

export function listContractAuditLog(contractId: string) {
  return clone(store.contractAuditLog.filter((log) => log.contract_id === contractId));
}