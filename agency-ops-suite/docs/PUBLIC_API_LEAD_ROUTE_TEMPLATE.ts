/**
 * Public Site Lead API Proxy
 * 
 * This file should be created in your public landing page repository:
 * [public-site-repo]/app/api/lead/route.ts
 * 
 * Purpose: Accept form submissions from public contact form,
 * validate, and forward to internal /api/intake/lead endpoint
 * with authentication credentials.
 */

import { NextResponse } from "next/server";

type LeadFormPayload = {
  name?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
};

/**
 * POST /api/lead
 * 
 * Public endpoint for contact form submissions.
 * 
 * Request body:
 *   - name (required): Contact name
 *   - businessType (required): Type of business
 *   - email (optional): Contact email
 *   - phone (optional): Contact phone
 *   - message (optional): Additional message
 *   - source (optional): How they found you (e.g., "google", "facebook")
 * 
 * Responses:
 *   - 201: Lead created successfully
 *   - 400: Invalid payload
 *   - 500: Internal server error
 */
export async function POST(request: Request) {
  const internalEndpoint = process.env.NEXT_PUBLIC_INTAKE_ENDPOINT;
  const intakeSecret = process.env.INTAKE_WEBHOOK_SECRET;

  // 1. Validate configuration
  if (!internalEndpoint) {
    console.error("[Lead API] NEXT_PUBLIC_INTAKE_ENDPOINT not configured");
    return NextResponse.json(
      { error: "server_misconfigured", message: "Intake endpoint not configured" },
      { status: 500 }
    );
  }

  if (!intakeSecret) {
    console.error("[Lead API] INTAKE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "server_misconfigured", message: "Intake secret not configured" },
      { status: 500 }
    );
  }

  // 2. Parse and validate form payload
  let body: LeadFormPayload;
  try {
    body = await request.json();
  } catch (error) {
    console.warn("[Lead API] Failed to parse JSON", { error });
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const name = body.name?.trim() ?? "";
  const businessType = body.businessType?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const source = body.source?.trim() ?? "website";

  // 3. Validate required fields
  if (!name || !businessType) {
    console.warn("[Lead API] Missing required fields", { name, businessType });
    return NextResponse.json(
      { error: "invalid_payload", message: "name and businessType are required" },
      { status: 400 }
    );
  }

  // 4. Forward to internal endpoint with authentication
  try {
    console.log("[Lead API] Forwarding to internal intake", { name, businessType, source });

    const internalResponse = await fetch(`${internalEndpoint}/api/intake/lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-intake-secret": intakeSecret,
        "x-idempotency-key": `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
      body: JSON.stringify({
        name,
        businessType,
        email,
        phone,
        message,
        source,
      }),
    });

    // 5. Handle response from internal endpoint
    if (!internalResponse.ok) {
      console.error("[Lead API] Internal endpoint error", {
        status: internalResponse.status,
        statusText: internalResponse.statusText,
      });

      // If internal endpoint is unreachable, return 503
      if (internalResponse.status >= 500) {
        return NextResponse.json(
          { error: "service_unavailable", message: "Lead service temporarily unavailable" },
          { status: 503 }
        );
      }

      // For 4xx errors from internal (shouldn't happen), return 400
      return NextResponse.json(
        { error: "intake_error", message: "Failed to process lead" },
        { status: 400 }
      );
    }

    const internalData = await internalResponse.json();
    console.log("[Lead API] Lead created successfully", { leadId: internalData.leadId });

    // 6. Return success response to client
    return NextResponse.json(
      {
        ok: true,
        message: "Lead received! We'll follow up soon.",
        leadId: internalData.leadId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Lead API] Request failed", { error });
    return NextResponse.json(
      { error: "service_error", message: "Failed to process lead submission" },
      { status: 500 }
    );
  }
}

/**
 * Health check for intake endpoint availability
 * (optional: useful for diagnostics)
 */
export async function HEAD(request: Request) {
  const internalEndpoint = process.env.NEXT_PUBLIC_INTAKE_ENDPOINT;
  const intakeSecret = process.env.INTAKE_WEBHOOK_SECRET;

  if (!internalEndpoint || !intakeSecret) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  try {
    const response = await fetch(`${internalEndpoint}/api/intake/lead`, {
      method: "OPTIONS",
      headers: { "x-intake-secret": intakeSecret },
    });

    if (response.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  } catch {
    // Endpoint unreachable
  }

  return NextResponse.json({ ok: false }, { status: 503 });
}
