import { NextResponse, NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getClientIP } from "@/lib/auth";

/**
 * POST /api/system/log-auth-event
 * Log authentication-related events from the dashboard
 * Does NOT require auth token (logs auth events themselves)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, metadata = {}, timestamp, source = "dashboard" } = body;

    if (!event) {
      return NextResponse.json(
        { error: "missing_event", details: "event field is required" },
        { status: 400 }
      );
    }

    const ip = await getClientIP();
    const supabase = createServiceClient();

    // Log to system_events table
    const { error } = await supabase.from("system_events").insert({
      event_type: `auth_${event}`,
      severity: getEventSeverity(event),
      summary: `Dashboard auth event: ${event}`,
      metadata: {
        event,
        source,
        ip,
        userAgent: request.headers.get("user-agent"),
        ...metadata,
      },
      timestamp: timestamp || new Date().toISOString(),
    });

    if (error) {
      console.error("[/api/system/log-auth-event] Insert error:", error);
      // Don't fail the response - auth events are non-blocking
      return NextResponse.json({ ok: true, logged: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, logged: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/system/log-auth-event] Error:", err);
    // Don't fail - auth logging is best-effort
    return NextResponse.json({ ok: true, logged: false }, { status: 200 });
  }
}

/**
 * Determine severity level based on auth event type
 */
function getEventSeverity(event: string): "info" | "warning" | "error" {
  const criticalEvents = [
    "session_expired",
    "session_error",
    "signout_error",
    "session_refresh_error",
    "auth_error",
    "unauthorized_access",
  ];

  const warningEvents = [
    "session_missing",
    "token_refreshed",
    "session_refresh_failed",
  ];

  if (criticalEvents.includes(event)) return "error";
  if (warningEvents.includes(event)) return "warning";
  return "info";
}
