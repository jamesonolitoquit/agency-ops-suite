// Shared in-memory lead storage for Day 2 E2E testing
// This will be replaced with Supabase in production

export interface TestLead {
  id: string;
  name: string;
  businessType: string;
  email: string;
  phone: string;
  message: string;
  source: 'facebook' | 'google';
  status: 'new' | 'contacted' | 'replied' | 'closed';
  createdAt: string;
}

// Single source of truth for test leads
let leadsStore: TestLead[] = [];

export function getLeadsStore() {
  return leadsStore;
}

export function addLead(lead: Omit<TestLead, 'id' | 'status' | 'createdAt'>) {
  const newLead: TestLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...lead,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  leadsStore.unshift(newLead);
  return newLead;
}

export function updateLeadStatus(leadId: string, status: TestLead['status']) {
  const lead = leadsStore.find(l => l.id === leadId);
  if (lead) {
    lead.status = status;
  }
  return lead;
}

export function deleteLead(leadId: string) {
  const index = leadsStore.findIndex(l => l.id === leadId);
  if (index >= 0) {
    leadsStore.splice(index, 1);
    return true;
  }
  return false;
}

export function clearLeads() {
  leadsStore = [];
}
