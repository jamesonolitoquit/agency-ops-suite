import { createServiceClient } from '@/lib/supabase/service';

interface LogClientActionInput {
  clientId: string;
  userEmail: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logClientAction(input: LogClientActionInput) {
  const supabase = createServiceClient();

  const { error } = await supabase.from('client_action_logs').insert([
    {
      client_id: input.clientId,
      user_email: input.userEmail,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    // Logging should not break primary flows.
    console.error('Failed to log client action:', error);
  }
}
