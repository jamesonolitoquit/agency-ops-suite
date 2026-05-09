import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const intakeSecret = process.env.SMOKE_INTAKE_SECRET ?? "";
const supabaseUrl = process.env.SMOKE_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SMOKE_SUPABASE_SERVICE_ROLE_KEY ?? "";

const liveEnabled =
  process.env.SMOKE_ENABLE_LIVE_INTAKE === "true" &&
  Boolean(intakeSecret) &&
  Boolean(supabaseUrl) &&
  Boolean(serviceRoleKey);

test(
  "lead intake live integration creates lead and audit row",
  { skip: !liveEnabled },
  async () => {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const name = `Smoke Live ${uniqueSuffix}`;

    const response = await fetch(new URL("/api/intake/lead", baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-intake-secret": intakeSecret,
        "x-idempotency-key": `smoke-live-${uniqueSuffix}`
      },
      body: JSON.stringify({
        name,
        businessType: "Clinic",
        email: `smoke-live-${uniqueSuffix}@example.com`,
        source: "facebook",
        message: "Live intake smoke test"
      })
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