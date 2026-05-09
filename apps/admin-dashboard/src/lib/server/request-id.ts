import { randomUUID } from "crypto";
import { headers } from "next/headers";

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Generate or retrieve request ID for distributed tracing
 * Allows correlation of logs across multiple services
 */
export async function getOrCreateRequestId(): Promise<string> {
  const headersList = await headers();
  const existingId = headersList.get(REQUEST_ID_HEADER);
  
  if (existingId) {
    return existingId;
  }
  
  return generateRequestId();
}

/**
 * Generate a new request ID
 */
export function generateRequestId(): string {
  return `req_${randomUUID().substring(0, 13)}`;
}

/**
 * Extract request ID from headers or generate new one
 */
export function getRequestId(headersList: Record<string, string | null>): string {
  const existingId = headersList[REQUEST_ID_HEADER.toLowerCase()] || 
                     headersList[REQUEST_ID_HEADER];
  return existingId || generateRequestId();
}

/**
 * Store request ID in response headers for client tracking
 */
export function withRequestId(
  responseHeaders: Record<string, string>,
  requestId: string
): Record<string, string> {
  return {
    ...responseHeaders,
    [REQUEST_ID_HEADER]: requestId,
  };
}
