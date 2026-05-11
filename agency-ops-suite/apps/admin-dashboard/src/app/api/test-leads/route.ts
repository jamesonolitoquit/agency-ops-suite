import { NextResponse } from "next/server";
import { createLeadRecord, deleteLeadRecord, listLeads, updateLeadRecord } from "@/lib/agency-db";

export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({
    leads: leads,
    count: leads.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name || "";
  const businessType = body.businessType || "";
  const email = body.email || "";
  const phone = body.phone || "";

  if (!name || !businessType || (!email && !phone)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { lead, duplicate } = await createLeadRecord({
    name,
    businessType,
    email,
    phone,
    message: body.message || "",
    source: body.source || "google",
  });
  
  return NextResponse.json({
    ok: true,
    lead,
    duplicate,
  }, { status: duplicate ? 200 : 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('id');
  
  if (!leadId) {
    return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
  }
  
  await deleteLeadRecord(leadId);
  
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;
  
  if (!id || !status) {
    return NextResponse.json({ error: 'Lead ID and status required' }, { status: 400 });
  }

  const lead = await updateLeadRecord(id, {
    status,
    contactedAt: status === 'contacted' ? new Date().toISOString() : undefined,
    lastContactedAt: status === 'contacted' ? new Date().toISOString() : undefined,
    closedAt: status === 'closed' ? new Date().toISOString() : undefined,
  });
  
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  
  return NextResponse.json({ ok: true, lead });
}
