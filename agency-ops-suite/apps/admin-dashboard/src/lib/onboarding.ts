import { createServiceClient } from '@/lib/supabase/service';
import { createClientRecord, createRequestRecord } from '@/lib/agency-db';

export type OnboardingStartInput = {
  name: string;
  businessType: string;
  domain: string;
  plan?: string;
  packageName?: string;
  monthlyFee?: number;
  liveUrl?: string;
  templateType?: string;
  notes?: string;
  email?: string;
  phone?: string;
  pages?: string[];
};

function normalizePlan(rawPlan?: string, rawPackageName?: string): 'starter' | 'growth' | 'pro' {
  const value = `${rawPlan ?? rawPackageName ?? ''}`.trim().toLowerCase();
  if (value.includes('premium') || value === 'pro') return 'pro';
  if (value.includes('business') || value.includes('growth') || value.includes('maintenance') || value.includes('hosting')) return 'growth';
  return 'starter';
}

export async function startOnboarding(input: OnboardingStartInput) {
  const supabase = createServiceClient();
  const plan = normalizePlan(input.plan, input.packageName);
  const { client, duplicate } = await createClientRecord({
    name: input.name,
    businessType: input.businessType,
    domain: input.domain,
    plan,
    monthlyFee: input.monthlyFee,
    liveUrl: input.liveUrl,
    notes: input.notes,
    readyForDeploy: false,
  });

  const onboardingRequest = await createRequestRecord({
    clientId: client.id,
    type: 'onboarding',
    priority: 'high',
    description: [
      `Onboarding started for ${client.name}`,
      `Business type: ${input.businessType}`,
      `Domain: ${input.domain}`,
      input.templateType ? `Template: ${input.templateType}` : null,
      'Collect branding assets, content, and approval before deployment.',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  const { data: provisioningRun, error: provisioningError } = await supabase
    .from('provisioning_runs')
    .insert({
      client_id: client.id,
      template_type: input.templateType ?? plan,
      domain: input.domain,
      status: 'pending',
      output_path: `/provisioned/${client.name.toLowerCase().replace(/\s+/g, '-')}/`,
    })
    .select('*')
    .single();

  if (provisioningError) {
    throw provisioningError;
  }

  try {
    await supabase.from('audit_logs').insert({
      entity_type: 'client',
      entity_id: client.id,
      action: duplicate ? 'onboarding_duplicate_client' : 'onboarding_started',
      summary: `Onboarding ${duplicate ? 'reused' : 'created'} client ${client.name}`,
      metadata: {
        clientId: client.id,
        onboardingRequestId: onboardingRequest.id,
        provisioningRunId: provisioningRun.id,
        templateType: input.templateType ?? plan,
        duplicate,
      },
    });
  } catch {
    // Audit logging should not block onboarding.
  }

  return { client, duplicate, onboardingRequest, provisioningRun };
}
