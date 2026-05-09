import { NextResponse } from 'next/server';
import { listClients } from '@/lib/agency-db';

export async function GET() {
  const clients = await listClients();
  // Sum monthly_fee for active clients
  const activeClients = clients.filter(c => c.status === 'active');
  const mrr = activeClients.reduce((sum, c) => sum + Number(c.monthlyFee || 0), 0);

  return NextResponse.json({ mrr, activeClients: activeClients.length });
}
