import { NextResponse, NextRequest } from "next/server";
import {
  listClients,
  getClientById,
  createClientRecord,
  updateClientRecord,
  deleteClientRecord,
} from "@/lib/agency-db";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAuth, formatAuthError, getClientIP } from "@/lib/auth";

/**
 * GET /api/admin/clients
 * List all clients or get a specific client by ID (via ?id=<uuid>)
 * REQUIRES: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("id");

    if (clientId) {
      try {
        const client = await getClientById(clientId);
        return NextResponse.json({ ok: true, client }, { status: 200 });
      } catch (err) {
        // Client not found (Supabase .single() returns PGRST116 when no rows)
        return NextResponse.json(
          { error: "not_found", message: "Client not found" },
          { status: 404 }
        );
      }
    }

    const clients = await listClients();
    return NextResponse.json({ ok: true, clients }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/clients] GET error:", err);
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
 * POST /api/admin/clients
 * Create a new client
 * REQUIRES: Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const user = await requireAuth();

    const body = await request.json();
    const {
      name,
      businessType,
      domain,
      plan = "starter",
      monthlyFee = 0,
      billingCycle = "monthly",
      status = "active",
      readyForDeploy = false,
      liveUrl = "",
      notes = "",
    } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "missing_required_fields", details: "name and domain are required" },
        { status: 400 }
      );
    }

    const { client, duplicate } = await createClientRecord({
      name,
      businessType,
      domain,
      plan,
      monthlyFee,
      billingCycle,
      status,
      readyForDeploy,
      liveUrl,
      notes,
    });

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "client",
      entity_id: client.id,
      action: duplicate ? "duplicate_detected" : "create",
      summary: `${duplicate ? "Duplicate client detected" : "Created new client"}: ${name}`,
      metadata: {
        clientId: client.id,
        domain,
        duplicate,
        userId: user.sub,
        userEmail: user.email,
        ip: await getClientIP(request.headers),
      },
    });

    return NextResponse.json(
      { ok: true, client, duplicate, status: duplicate ? 200 : 201 },
      { status: duplicate ? 200 : 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[/api/admin/clients] POST error:", errorMsg);
    return NextResponse.json(
      {
        error: "create_failed",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/clients
 * Update an existing client
 * REQUIRES: Authorization: Bearer <token>
 * Body: { id, updates: { status?, plan?, monthlyFee?, readyForDeploy?, liveUrl?, ... } }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Validate authentication
    const user = await requireAuth();

    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "missing_id", details: "Client ID is required" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "no_updates", details: "At least one field must be updated" },
        { status: 400 }
      );
    }

    const client = await updateClientRecord(id, updates);

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "client",
      entity_id: id,
      action: "update",
      summary: `Updated client ${client.name}`,
      metadata: {
        clientId: id,
        updates,
        userId: user.sub,
        userEmail: user.email,
        ip: await getClientIP(request.headers),
      },
    });

    return NextResponse.json({ ok: true, client }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/clients] PATCH error:", err);
    return NextResponse.json(
      {
        error: "update_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/clients
 * Delete a client by ID
 * REQUIRES: Authorization: Bearer <token>
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validate authentication
    const user = await requireAuth();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "missing_id", details: "Client ID is required" },
        { status: 400 }
      );
    }

    // Get client name for audit log before deletion
    const client = await getClientById(id);

    await deleteClientRecord(id);

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "client",
      entity_id: id,
      action: "delete",
      summary: `Deleted client ${client.name}`,
      metadata: {
        clientId: id,
        clientName: client.name,
        userId: user.sub,
        userEmail: user.email,
        ip: await getClientIP(request.headers),
      },
    });

    return NextResponse.json({ ok: true, message: "Client deleted" }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/clients] DELETE error:", err);
    return NextResponse.json(
      {
        error: "delete_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
