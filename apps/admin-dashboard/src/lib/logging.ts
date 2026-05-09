import { createServiceClient } from "./supabase/service";

export type SystemEventType =
  | "auth_failed"
  | "auth_success"
  | "duplicate_detected"
  | "client_created"
  | "client_deleted"
  | "client_updated"
  | "billing_created"
  | "request_created"
  | "api_error"
  | "validation_error"
  | "cascade_deletion"
  | "audit_logged";

export type SystemEventSeverity = "info" | "warning" | "critical";

interface SystemEventPayload {
  [key: string]: unknown;
}

interface LogEventOptions {
  userId?: string;
  userEmail?: string;
  ip?: string;
  errorStack?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a system event to the database
 * Used for monitoring, debugging, and compliance tracking
 */
export async function logSystemEvent(
  type: SystemEventType,
  severity: SystemEventSeverity,
  payload: SystemEventPayload,
  options?: LogEventOptions
) {
  try {
    const supabase = createServiceClient();
    const fullPayload: SystemEventPayload = {
      ...payload,
      ...(options?.userId && { userId: options.userId }),
      ...(options?.userEmail && { userEmail: options.userEmail }),
      ...(options?.ip && { ip: options.ip }),
      ...(options?.errorStack && { errorStack: options.errorStack }),
      ...(options?.metadata && { metadata: options.metadata }),
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from("system_events").insert({
      type,
      severity,
      payload: fullPayload,
    });

    if (error) {
      console.error(`[logSystemEvent] Failed to log ${type}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[logSystemEvent] Unexpected error logging ${type}:`, err);
    return false;
  }
}

/**
 * Log authentication success
 */
export async function logAuthSuccess(
  email: string,
  userId: string,
  ip?: string
) {
  return logSystemEvent(
    "auth_success",
    "info",
    { email, userId },
    { userEmail: email, userId, ip }
  );
}

/**
 * Log authentication failure
 */
export async function logAuthFailed(
  email: string | undefined,
  reason: string,
  ip?: string
) {
  return logSystemEvent(
    "auth_failed",
    "warning",
    { email, reason },
    { userEmail: email, ip }
  );
}

/**
 * Log duplicate detection
 */
export async function logDuplicateDetected(
  entityType: "lead" | "client",
  entityId: string,
  duplicateOf: string,
  email?: string,
  userId?: string,
  ip?: string
) {
  return logSystemEvent(
    "duplicate_detected",
    "info",
    {
      entityType,
      entityId,
      duplicateOf,
      email,
    },
    { userId, userEmail: email, ip }
  );
}

/**
 * Log client creation
 */
export async function logClientCreated(
  clientId: string,
  clientName: string,
  userId: string,
  userEmail: string,
  ip?: string
) {
  return logSystemEvent(
    "client_created",
    "info",
    { clientId, clientName },
    { userId, userEmail, ip }
  );
}

/**
 * Log client deletion (cascade trigger)
 */
export async function logClientDeleted(
  clientId: string,
  clientName: string,
  userId: string,
  userEmail: string,
  ip?: string
) {
  return logSystemEvent(
    "client_deleted",
    "warning",
    { clientId, clientName },
    { userId, userEmail, ip }
  );
}

/**
 * Log cascade deletion of related records
 */
export async function logCascadeDeletion(
  clientId: string,
  deletedTables: string[],
  totalRecordsDeleted: number,
  userId: string,
  userEmail: string,
  ip?: string
) {
  return logSystemEvent(
    "cascade_deletion",
    "warning",
    {
      clientId,
      deletedTables,
      totalRecordsDeleted,
    },
    { userId, userEmail, ip }
  );
}

/**
 * Log API error
 */
export async function logApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  errorMessage: string,
  userId?: string,
  userEmail?: string,
  ip?: string,
  stack?: string
) {
  const severity = statusCode >= 500 ? "critical" : "warning";
  return logSystemEvent(
    "api_error",
    severity,
    {
      endpoint,
      method,
      statusCode,
      errorMessage,
    },
    { userId, userEmail, ip, errorStack: stack }
  );
}

/**
 * Log validation error
 */
export async function logValidationError(
  endpoint: string,
  field: string,
  reason: string,
  userId?: string,
  userEmail?: string,
  ip?: string
) {
  return logSystemEvent(
    "validation_error",
    "info",
    {
      endpoint,
      field,
      reason,
    },
    { userId, userEmail, ip }
  );
}

/**
 * Get recent system events for health check
 */
export async function getSystemHealth(
  minLastMs: number = 60000 // Last 60 seconds by default
) {
  try {
    const supabase = createServiceClient();
    const cutoffTime = new Date(Date.now() - minLastMs).toISOString();

    // Get critical events
    const { data: criticalEvents, error: criticalError } = await supabase
      .from("system_events")
      .select("type, severity, created_at")
      .eq("severity", "critical")
      .gte("created_at", cutoffTime)
      .order("created_at", { ascending: false })
      .limit(50);

    if (criticalError) throw criticalError;

    // Get error rate
    const { data: allEvents, count } = await supabase
      .from("system_events")
      .select("*", { count: "exact" })
      .gte("created_at", cutoffTime);

    const errorCount = allEvents?.filter((e) => e.severity !== "info").length || 0;
    const errorRate =
      count && count > 0 ? Math.round((errorCount / count) * 100) : 0;

    // Get recent authentication failures
    const { data: authFailures } = await supabase
      .from("system_events")
      .select("payload, created_at")
      .eq("type", "auth_failed")
      .gte("created_at", cutoffTime)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get duplicate detections
    const { data: duplicates } = await supabase
      .from("system_events")
      .select("payload, created_at")
      .eq("type", "duplicate_detected")
      .gte("created_at", cutoffTime)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      status: errorRate > 20 ? "degraded" : errorCount > 0 ? "healthy" : "optimal",
      windowMs: minLastMs,
      totalEvents: count || 0,
      errorCount,
      errorRate: `${errorRate}%`,
      criticalEvents: criticalEvents || [],
      recentAuthFailures: authFailures || [],
      recentDuplicates: duplicates || [],
    };
  } catch (err) {
    console.error("[getSystemHealth] Error:", err);
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get event statistics for monitoring dashboard
 */
export async function getEventStatistics(
  hoursBack: number = 24
) {
  try {
    const supabase = createServiceClient();
    const cutoffTime = new Date(
      Date.now() - hoursBack * 60 * 60 * 1000
    ).toISOString();

    const { data: events } = await supabase
      .from("system_events")
      .select("type, severity")
      .gte("created_at", cutoffTime);

    // Count by type
    const typeStats: Record<string, number> = {};
    const severityStats: Record<SystemEventSeverity, number> = {
      info: 0,
      warning: 0,
      critical: 0,
    };

    events?.forEach((event) => {
      typeStats[event.type] = (typeStats[event.type] || 0) + 1;
      severityStats[event.severity as SystemEventSeverity]++;
    });

    return {
      period: `${hoursBack} hours`,
      total: events?.length || 0,
      bySeverity: severityStats,
      byType: typeStats,
    };
  } catch (err) {
    console.error("[getEventStatistics] Error:", err);
    return null;
  }
}
