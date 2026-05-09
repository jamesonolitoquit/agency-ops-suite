import { NextResponse, NextRequest } from "next/server";
import {
  listBilling,
  createBillingRecord,
  updateBillingRecord,
} from "@/lib/agency-db";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAuth, formatAuthError, getClientIP } from "@/lib/auth";

/**
 * GET /api/admin/billing
 * List all billing records or get billing for a specific client (via ?clientId=<uuid>)
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
        .from("billing")
        .select("*")
        .eq("client_id", clientId)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return NextResponse.json(
        { ok: true, billing: data || [] },
        { status: 200 }
      );
    }

    const billing = await listBilling();
    return NextResponse.json({ ok: true, billing }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/billing] GET error:", err);
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
 * POST /api/admin/billing
 * Create a new billing record
 * REQUIRES: Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  let debugInput: Record<string, unknown> | null = null;

  try {
    const user = await requireAuth();
    const ip = await getClientIP();

    const body = await request.json();
    const {
      clientId,
      amount = 0,
      dueDate,
      paid = false,
      paymentMethod = "bank",
      notes = "",
    } = body;

    debugInput = { clientId, amount, dueDate, paid, paymentMethod, notes };

    if (!clientId || !dueDate) {
      return NextResponse.json(
        {
          error: "missing_required_fields",
          details: "clientId and dueDate are required",
        },
        { status: 400 }
      );
    }

    const billing = await createBillingRecord({
      clientId,
      amount,
      dueDate,
      paymentMethod,
      notes,
    });

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "billing",
      entity_id: billing.id,
      action: "create",
      summary: `Created billing record for client: $${amount}`,
      metadata: {
        billingId: billing.id,
        clientId,
        userId: user.sub,
        userEmail: user.email,
        ip,
      },
    });

    return NextResponse.json(
      { ok: true, billing, created: true },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    // Log the actual error for debugging
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/billing] POST error details:", {
      errorMsg,
      stack: err instanceof Error ? err.stack : undefined,
      input: debugInput,
    });

    return NextResponse.json(
      {
        error: "create_failed",
        message: errorMsg,
        details: "Check server logs for details",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/billing
 * Update a billing record
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

    const billing = await updateBillingRecord(id, updates);

    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      entity_type: "billing",
      entity_id: id,
      action: "update",
      summary: `Updated billing record`,
      metadata: {
        billingId: id,
        userId: user.sub,
        userEmail: user.email,
        ip,
        updates,
      },
    });

    return NextResponse.json(
      { ok: true, billing, updated: true },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/billing] PATCH error:", err);
    return NextResponse.json(
      {
        error: "update_failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
