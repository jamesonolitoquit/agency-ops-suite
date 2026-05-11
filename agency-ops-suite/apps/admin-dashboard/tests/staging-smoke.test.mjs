import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.STAGING_BASE_URL ?? process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const intakeSecret =
  process.env.STAGING_INTAKE_SECRET ??
  process.env.SMOKE_INTAKE_SECRET ??
  process.env.INTAKE_WEBHOOK_SECRET ??
  "local-test-secret-abc123xyz";
const supabaseUrl = process.env.STAGING_SUPABASE_URL ?? process.env.SMOKE_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SMOKE_SUPABASE_SERVICE_ROLE_KEY ?? "";
const liveEnabled =
  process.env.STAGING_ENABLE_LIVE_INTAKE === "true" &&
  Boolean(intakeSecret) &&
  Boolean(supabaseUrl) &&
  Boolean(serviceRoleKey);

async function fetchWithRetry(pathname, options = {}, maxAttempts = 6, delayMs = 1000) {
  let lastStatus;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(new URL(pathname, baseUrl), {
        redirect: "manual",
        ...options,
      });
      lastStatus = response.status;
      if (![502, 503, 504].includes(response.status)) {
        return response;
      }
    } catch {
      // The app may still be starting up.
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Server not ready after ${maxAttempts} attempts (last status: ${lastStatus})`);
}

test("staging login page is reachable", async () => {
  const response = await fetchWithRetry("/login");
  assert.ok([200, 307, 308].includes(response.status));

  if (response.status === 200) {
    const html = await response.text();
    assert.match(html, /<h1[^>]*>Sign in<\/h1>/);
  }
});

test("staging root is protected", async () => {
  const response = await fetchWithRetry("/");
  assert.ok([200, 307, 308].includes(response.status));

  if (response.status === 307 || response.status === 308) {
    assert.match(response.headers.get("location") ?? "", /\/login$/);
  }
});

test("staging report export endpoint responds safely", async () => {
  const response = await fetchWithRetry("/api/report/export");
  assert.ok([200, 307, 308, 400, 401, 404].includes(response.status));
});

test("staging lead intake rejects missing shared secret", async () => {
  const response = await fetch(new URL("/api/intake/lead", baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: "Staging Smoke Lead",
      businessType: "Clinic",
      source: "website",
    }),
  });

  assert.equal(response.status, 401);
});

test("staging lead intake rejects invalid shared secret", async () => {
  const response = await fetch(new URL("/api/intake/lead", baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-intake-secret": "wrong-secret",
    },
    body: JSON.stringify({
      name: "Staging Smoke Lead",
      businessType: "Clinic",
      source: "website",
    }),
  });

  assert.equal(response.status, 401);
});

test("staging lead intake rejects malformed JSON payload", async () => {
  const response = await fetch(new URL("/api/intake/lead", baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-intake-secret": intakeSecret,
    },
    body: "{\"name\":\"Staging Smoke Lead\"",
  });

  assert.equal(response.status, 400);
});

test(
  "staging live intake creates lead and audit row",
  { skip: !liveEnabled },
  async () => {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const name = `Staging Live ${uniqueSuffix}`;

    const response = await fetch(new URL("/api/intake/lead", baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-intake-secret": intakeSecret,
        "x-idempotency-key": `staging-live-${uniqueSuffix}`,
      },
      body: JSON.stringify({
        name,
        businessType: "Clinic",
        email: `staging-live-${uniqueSuffix}@example.com`,
        source: "facebook",
        message: "Staging live intake smoke test",
      }),
    });

    assert.equal(response.status, 201);

    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(typeof payload.leadId, "string");
    assert.ok(payload.leadId.length > 0);

    const leadId = payload.leadId;

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, name, business_type, source, status, notes")
      .eq("id", leadId)
      .single();

    assert.equal(leadError, null);
    assert.equal(lead?.id, leadId);
    assert.equal(lead?.name, name);
    assert.equal(lead?.business_type, "Clinic");
    assert.equal(lead?.source, "facebook");
    assert.equal(lead?.status, "new");

    const { data: auditRows, error: auditError } = await supabase
      .from("audit_logs")
      .select("id, entity_type, entity_id, action, metadata")
      .eq("entity_type", "lead")
      .eq("entity_id", leadId)
      .eq("action", "create")
      .order("created_at", { ascending: false })
      .limit(1);

    assert.equal(auditError, null);
    assert.ok(Array.isArray(auditRows));
    assert.ok(auditRows.length > 0);
    assert.equal(auditRows[0].entity_type, "lead");
    assert.equal(auditRows[0].entity_id, leadId);
    assert.equal(auditRows[0].action, "create");
    assert.equal(auditRows[0].metadata?.leadId, leadId);
  }
);
