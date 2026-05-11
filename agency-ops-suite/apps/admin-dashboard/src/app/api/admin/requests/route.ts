import { NextResponse, NextRequest } from "next/server";
import {
  listRequests,
  createRequestRecord,
  updateRequestRecord,
} from "@/lib/agency-db";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAuth, formatAuthError, getClientIP } from "@/lib/auth";

/**
 * GET /api/admin/requests
 * List all requests or get requests for a specific client (via ?clientId=<uuid>)
 * REQUIRES: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");

    if (clientId) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(
        { ok: true, requests: data || [] },
        { status: 200 }
      );
    }

    const requests = await listRequests();
    return NextResponse.json({ ok: true, requests }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/requests] GET error:", err);
    return NextResponse.json(
      {
        error: "list_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/requests
 * Create a new request
 * REQUIRES: Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ip = await getClientIP();

    const body = await request.json();
    const {
      clientId,
      title,
      description = "",
      status = "pending",
      priority = "medium",
    } = body;

    if (!clientId || !title) {
      return NextResponse.json(
        {
          error: "missing_required_fields",
          details: "clientId and title are required",
        },
        { status: 400 }
      );
    }

    const req = await createRequestRecord({
      clientId,
      type: title,
      description,
      priority,
    });

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "request",
      entity_id: req.id,
      action: "create",
      summary: `Created request: ${title}`,
      metadata: {
        requestId: req.id,
        clientId,
        userId: user.sub,
        userEmail: user.email,
        ip,
      },
    });

    return NextResponse.json(
      { ok: true, request: req, created: true },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/requests] POST error:", err);
    return NextResponse.json(
      {
        error: "create_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/requests
 * Update a request
 * REQUIRES: Authorization: Bearer <token>
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ip = await getClientIP();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "missing_id", details: "id is required" },
        { status: 400 }
      );
    }

    const req = await updateRequestRecord(id, updates);

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "request",
      entity_id: id,
      action: "update",
      summary: `Updated request`,
      metadata: {
        requestId: id,
        userId: user.sub,
        userEmail: user.email,
        ip,
        updates,
      },
    });

    return NextResponse.json(
      { ok: true, request: req, updated: true },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/requests] PATCH error:", err);
    return NextResponse.json(
      {
        error: "update_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
