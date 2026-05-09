import { NextResponse, NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAuth, formatAuthError } from "@/lib/auth";

/**
 * GET /api/admin/audit-logs
 * List audit logs with optional filtering
 * Query params:
 *   - entityType: Filter by entity type (e.g., "client", "billing", "request")
 *   - entityId: Filter by entity ID
 *   - action: Filter by action (e.g., "create", "update", "delete")
 *   - limit: Number of records to return (default 100, max 1000)
 *   - offset: Pagination offset (default 0)
 * REQUIRES: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const action = searchParams.get("action");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100", 10),
      1000
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabase = createServiceClient();
    let query = supabase.from("audit_logs").select("*", { count: "exact" });

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }
    if (entityId) {
      query = query.eq("entity_id", entityId);
    }
    if (action) {
      query = query.eq("action", action);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        logs: data || [],
        pagination: {
          offset,
          limit,
          total: count || 0,
          hasMore: (offset + limit) < (count || 0),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/audit-logs] GET error:", err);
    return NextResponse.json(
      {
        error: "list_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
