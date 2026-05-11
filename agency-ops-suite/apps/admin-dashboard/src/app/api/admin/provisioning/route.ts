import { NextResponse, NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAuth, formatAuthError, getClientIP } from "@/lib/auth";

/**
 * GET /api/admin/provisioning
 * List provisioning runs or get runs for a specific client (via ?clientId=<uuid>)
 * REQUIRES: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");

    const supabase = createServiceClient();

    if (clientId) {
      const { data, error } = await supabase
        .from("provisioning_runs")
        .select("*")
        .eq("client_id", clientId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(
        { ok: true, provisioning_runs: data || [] },
        { status: 200 }
      );
    }

    // List all provisioning runs
    const { data, error } = await supabase
      .from("provisioning_runs")
      .select("*")
      .order("started_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(
      { ok: true, provisioning_runs: data || [] },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/provisioning] GET error:", err);
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
 * POST /api/admin/provisioning
 * Create a new provisioning run
 * REQUIRES: Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ip = await getClientIP();

    const body = await request.json();
    const {
      clientId,
      templateType,
      domain,
      status = "pending",
    } = body;

    if (!clientId || !templateType || !domain) {
      return NextResponse.json(
        {
          error: "missing_required_fields",
          details: "clientId, templateType, and domain are required",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create provisioning run
    const { data, error } = await supabase
      .from("provisioning_runs")
      .insert({
        client_id: clientId,
        template_type: templateType,
        domain,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    try {
      await supabase.from("audit_logs").insert({
        entity_type: "provisioning_run",
        entity_id: data.id,
        action: "create",
        summary: `Created provisioning run for domain: ${domain}`,
        metadata: {
          provisioning_run_id: data.id,
          clientId,
          templateType,
          userId: user.sub,
          userEmail: user.email,
          ip,
        },
      });
    } catch {
      // Non-blocking audit write.
    }

    return NextResponse.json(
      { ok: true, provisioning_run: data, created: true },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/provisioning] POST error:", err);
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
 * PATCH /api/admin/provisioning
 * Update a provisioning run status
 * REQUIRES: Authorization: Bearer <token>
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ip = await getClientIP();

    const body = await request.json();
    const { id, status, error_message, output_path } = body;

    if (!id) {
      return NextResponse.json(
        { error: "missing_id", details: "id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (error_message !== undefined) updates.error_message = error_message;
    if (output_path !== undefined) updates.output_path = output_path;
    if (status === "success" || status === "failed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("provisioning_runs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    try {
      await supabase.from("audit_logs").insert({
        entity_type: "provisioning_run",
        entity_id: id,
        action: "update",
        summary: `Updated provisioning run status to: ${status}`,
        metadata: {
          provisioning_run_id: id,
          previous_status: (body as any).previous_status,
          new_status: status,
          userId: user.sub,
          userEmail: user.email,
          ip,
        },
      });
    } catch {
      // Non-blocking audit write.
    }

    return NextResponse.json(
      { ok: true, provisioning_run: data, updated: true },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/provisioning] PATCH error:", err);
    return NextResponse.json(
      {
        error: "update_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
