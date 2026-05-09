type SuiteLeadPayload = {
  name: string;
  businessType: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
};

type SuiteIntakeResponse = {
  leadId?: string;
  ok?: boolean;
  error?: string;
  message?: string;
};

function getSuiteIntakeConfig() {
  const endpoint = process.env.INTERNAL_INTAKE_ENDPOINT?.trim() || process.env.NEXT_PUBLIC_INTAKE_ENDPOINT?.trim();
  const secret = process.env.INTAKE_WEBHOOK_SECRET?.trim() || '';

  return {
    endpoint,
    secret,
  };
}

export async function forwardLeadToSuite(payload: SuiteLeadPayload): Promise<SuiteIntakeResponse> {
  const { endpoint, secret } = getSuiteIntakeConfig();

  if (!endpoint) {
    return { error: 'suite_endpoint_missing', message: 'Suite intake endpoint is not configured.' };
  }

  if (!secret) {
    return { error: 'suite_secret_missing', message: 'Suite intake secret is not configured.' };
  }

  const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/intake/lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-intake-secret': secret,
      'x-idempotency-key': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as SuiteIntakeResponse;

  if (!response.ok) {
    return {
      error: data.error || 'suite_intake_failed',
      message: data.message || 'Failed to forward lead to the suite.',
    };
  }

  return data;
}
