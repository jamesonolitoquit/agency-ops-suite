import { createServiceClient } from "@/lib/supabase/service";
import { getClientIP } from "@/lib/auth";
import type { NextRequest } from "next/server";

export type EventSeverity = "info" | "warning" | "error";
export type EventCategory = 
  | "auth"
  | "client_mgmt"
  | "billing"
  | "request"
  | "provisioning"
  | "report"
  | "audit"
  | "system"
  | "api_error";

interface SystemEventOptions {
  eventType: EventCategory;
  severity: EventSeverity;
  summary: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userEmail?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

/**
 * Log a structured system event to system_events table
 * Non-blocking (fire and forget)
 * 
 * Usage:
 * logSystemEvent({
 *   eventType: 'auth',
 *   severity: 'error',
 *   summary: 'Failed login attempt',
 *   metadata: { email: 'user@example.com', reason: 'invalid password' },
 *   requestId: 'req_abc123',
 * });
 */
export async function logSystemEvent(options: SystemEventOptions): Promise<void> {
  try {
    const {
      eventType,
      severity,
      summary,
      metadata = {},
      requestId,
      userEmail,
      userId,
      endpoint,
      method,
      statusCode,
    } = options;

    const supabase = createServiceClient();

    const eventRecord = {
      event_type: `${eventType}_${getEventSubtype(eventType, severity)}`,
      severity,
      summary,
      metadata: {
        ...metadata,
        requestId,
        userEmail,
        userId,
        endpoint,
        method,
        statusCode,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Fire and forget - don't block the response
    supabase
      .from("system_events")
      .insert(eventRecord)
      .then(
        () => {
          // Success - event logged
        },
        (err) => {
          // Log to console but don't throw
          console.error("[System Event Logger] Insert failed:", err);
        }
      );
  } catch (err) {
    // Silently fail - logging errors shouldn't break the API
    console.error("[System Event Logger] Error:", err);
  }
}

/**
 * Log an API error with full context
 * 
 * Usage:
 * logApiError({
 *   endpoint: '/api/admin/clients',
 *   method: 'POST',
 *   error: err,
 *   userId: user.sub,
 *   userEmail: user.email,
 *   statusCode: 500,
 *   requestId: requestId,
 * });
 */
export async function logApiError(options: {
  endpoint: string;
  method: string;
  error: Error | unknown;
  userId?: string;
  userEmail?: string;
  statusCode?: number;
  requestId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const {
    endpoint,
    method,
    error,
    userId,
    userEmail,
    statusCode = 500,
    requestId,
    metadata = {},
  } = options;

  const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Determine severity based on status code
  const severity = statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";

  await logSystemEvent({
    eventType: "api_error",
    severity,
    summary: `${method} ${endpoint} failed (${statusCode})`,
    metadata: {
      ...metadata,
      error: errorMessage,
      stack: errorStack,
      ip: metadata.ip,
    },
    requestId,
    userEmail,
    userId,
    endpoint,
    method,
    statusCode,
  });
}

/**
 * Log an auth failure
 */
export async function logAuthFailure(options: {
  reason: string;
  email?: string;
  ip?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { reason, email, ip, requestId, metadata = {} } = options;

  await logSystemEvent({
    eventType: "auth",
    severity: "warning",
    summary: `Auth failure: ${reason}`,
    metadata: {
      ...metadata,
      reason,
      email,
      ip,
    },
    requestId,
  });
}

/**
 * Log a data mutation (create, update, delete)
 */
export async function logDataMutation(options: {
  action: "create" | "update" | "delete";
  entity: string;
  entityId: string;
  userId: string;
  userEmail: string;
  ip: string;
  requestId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const {
    action,
    entity,
    entityId,
    userId,
    userEmail,
    ip,
    requestId,
    metadata = {},
  } = options;

  await logSystemEvent({
    eventType: "client_mgmt", // or appropriate category
    severity: "info",
    summary: `${action.toUpperCase()} ${entity} (${entityId.substring(0, 8)})`,
    metadata: {
      ...metadata,
      action,
      entity,
      entityId,
      userId,
      userEmail,
      ip,
    },
    requestId,
    userId,
    userEmail,
  });
}

/**
 * Log an unauthorized access attempt
 */
export async function logUnauthorizedAccess(options: {
  endpoint: string;
  reason: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  const { endpoint, reason, ip, userAgent, requestId } = options;

  await logSystemEvent({
    eventType: "auth",
    severity: "warning",
    summary: `Unauthorized access attempt: ${endpoint}`,
    metadata: {
      reason,
      ip,
      userAgent,
    },
    endpoint,
    requestId,
  });
}

/**
 * Get event subtype based on category and severity
 */
function getEventSubtype(category: EventCategory, severity: EventSeverity): string {
  const subtypes: Record<EventSeverity, string> = {
    info: "success",
    warning: "warning",
    error: "error",
  };
  return subtypes[severity];
}

/**
 * Context helper for API route handlers
 */
export class ApiEventLogger {
  private requestId: string;
  private endpoint: string;
  private method: string;
  private userId?: string;
  private userEmail?: string;
  private ip?: string;

  constructor(
    requestId: string,
    endpoint: string,
    method: string,
    options?: {
      userId?: string;
      userEmail?: string;
      ip?: string;
    }
  ) {
    this.requestId = requestId;
    this.endpoint = endpoint;
    this.method = method;
    this.userId = options?.userId;
    this.userEmail = options?.userEmail;
    this.ip = options?.ip;
  }

  async logError(error: Error | unknown, statusCode: number = 500): Promise<void> {
    await logApiError({
      endpoint: this.endpoint,
      method: this.method,
      error,
      userId: this.userId,
      userEmail: this.userEmail,
      statusCode,
      requestId: this.requestId,
      metadata: { ip: this.ip },
    });
  }

  async logAuthFailure(reason: string): Promise<void> {
    await logAuthFailure({
      reason,
      email: this.userEmail,
      ip: this.ip,
      requestId: this.requestId,
    });
  }

  async logUnauthorized(reason: string = "No valid auth token"): Promise<void> {
    await logUnauthorizedAccess({
      endpoint: this.endpoint,
      reason,
      ip: this.ip,
      requestId: this.requestId,
    });
  }

  async logSuccess(summary: string, metadata?: Record<string, any>): Promise<void> {
    await logSystemEvent({
      eventType: "system",
      severity: "info",
      summary,
      metadata,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      endpoint: this.endpoint,
      method: this.method,
      statusCode: 200,
    });
  }
}
