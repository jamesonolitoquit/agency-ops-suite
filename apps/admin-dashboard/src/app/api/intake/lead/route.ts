import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createLeadRecord } from "@/lib/agency-db";

type LeadIntakePayload = {
  name?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
};

type IdempotentResult = {
  leadId: string | null;
  status: number;
};

const RATE_LIMIT_WINDOW_MS = Number(process.env.INTAKE_RATE_LIMIT_WINDOW_MS ?? 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.INTAKE_RATE_LIMIT_MAX_REQUESTS ?? 30);
const IDEMPOTENCY_TTL_MS = Number(process.env.INTAKE_IDEMPOTENCY_TTL_MS ?? 10 * 60_000);
const requestCounters = new Map<string, { count: number; resetAt: number }>();
const idempotencyCache = new Map<string, { expiresAt: number; result: IdempotentResult }>();

function normalizeSource(rawSource?: string): "facebook" | "google" {
  const normalized = rawSource?.trim().toLowerCase() ?? "";
  if (normalized.includes("face") || normalized === "fb") return "facebook";
  return "google";
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function isRateLimited(request: Request) {
  const now = Date.now();
  const ip = getRequestIp(request);
  const current = requestCounters.get(ip);
  if (!current || current.resetAt <= now) {
    requestCounters.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  current.count += 1;
  return false;
}

function readCachedIdempotentResult(request: Request) {
  const key = request.headers.get("x-idempotency-key")?.trim();
  if (!key) return null;
  const now = Date.now();
  const cached = idempotencyCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now) { idempotencyCache.delete(key); return null; }
  return cached.result;
}

function writeIdempotentResult(request: Request, result: IdempotentResult) {
  const key = request.headers.get("x-idempotency-key")?.trim();
  if (!key) return;
  idempotencyCache.set(key, { expiresAt: Date.now() + IDEMPOTENCY_TTL_MS, result });
}

function validateSecret(request: Request) {
  const configuredSecret = process.env.INTAKE_WEBHOOK_SECRET?.trim() ?? "";
  const providedSecret = request.headers.get("x-intake-secret")?.trim() ?? "";
  if (!configuredSecret) return { ok: false, status: 401 as const, error: "unauthorized" };
  if (providedSecret !== configuredSecret) return { ok: false, status: 401 as const, error: "unauthorized" };
  return { ok: true as const };
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const cachedResult = readCachedIdempotentResult(request);
    if (cachedResult) {
      return NextResponse.json({ ok: true, leadId: cachedResult.leadId, idempotentReplay: true }, { status: 200 });
    }

    let body: LeadIntakePayload;
    try {
      body = (await request.json()) as LeadIntakePayload;
    } catch {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const secretValidation = validateSecret(request);
    if (!secretValidation.ok) {
      return NextResponse.json({ error: secretValidation.error }, { status: secretValidation.status });
    }

    const name = body.name?.trim() ?? "";
    const businessType = body.businessType?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const source = normalizeSource(body.source);

    if (!name || !businessType) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Use createLeadRecord to handle duplicate detection
    try {
      const { lead, duplicate } = await createLeadRecord({
        name,
        businessType,
        email: email || undefined,
        phone: phone || undefined,
        message: message || undefined,
        source,
      });

      // Cache the result for idempotency
      writeIdempotentResult(request, { leadId: lead.id, status: duplicate ? 200 : 201 });

      // Log audit entry
      const { error: auditError } = await supabase.from("audit_logs").insert({
        entity_type: "lead",
        entity_id: lead.id,
        action: duplicate ? "duplicate_detected" : "create",
        summary: duplicate ? `Intake found duplicate lead ${name}` : `Intake created lead ${name}`,
        metadata: {
          leadId: lead.id,
          source,
          duplicate,
          hasEmail: Boolean(email),
          hasPhone: Boolean(phone),
          hasMessage: Boolean(message),
        },
      });

      if (auditError) {
        console.error("[intake/lead] audit insert failed:", auditError.message);
      }

      return NextResponse.json(
        { ok: true, leadId: lead.id, duplicate },
        { status: duplicate ? 200 : 201 }
      );
    } catch (dbErr) {
      console.error("[intake/lead] createLeadRecord failed:", dbErr);
      return NextResponse.json(
        { error: "lead_create_failed", details: dbErr instanceof Error ? dbErr.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[intake/lead] unhandled exception:", err);
    return NextResponse.json({ error: "internal_error", message: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
