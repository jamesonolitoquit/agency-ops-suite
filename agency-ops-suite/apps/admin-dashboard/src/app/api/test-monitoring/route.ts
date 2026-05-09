import { NextResponse } from "next/server";
import { info } from '@/lib/server-logger';

interface UptimeCheck {
  id: string;
  clientId: string;
  clientName: string;
  url: string;
  status: 'UP' | 'DOWN' | 'TIMEOUT';
  responseTime: number;
  lastChecked: string;
  uptime: number; // percentage
}

interface MonitoringConfig {
  clientId: string;
  clientName: string;
  url: string;
  interval: number; // seconds
}

// In-memory monitoring storage
let checksStore: UptimeCheck[] = [];
let configsStore: MonitoringConfig[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'checks') {
    return NextResponse.json({ checks: checksStore, count: checksStore.length });
  }

  if (action === 'configs') {
    return NextResponse.json({ configs: configsStore, count: configsStore.length });
  }

  return NextResponse.json({
    checks: checksStore,
    configs: configsStore,
    totalChecks: checksStore.length,
    totalConfigs: configsStore.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, clientId, clientName, url, interval = 300 } = body;

  if (action === 'add-monitoring') {
    if (!clientId || !clientName || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const config: MonitoringConfig = {
      clientId,
      clientName,
      url,
      interval,
    };

    configsStore.unshift(config);
    await info(`Monitoring added: ${clientName}`, { url, interval });
    return NextResponse.json({ ok: true, config }, { status: 201 });
  }

  if (action === 'check') {
    if (!clientId || !url) {
      return NextResponse.json({ error: 'Client ID and URL required' }, { status: 400 });
    }

    // Simulate health check
    const startTime = Date.now();
    const isDown = Math.random() < 0.05; // 5% chance of being down
    const responseTime = isDown ? 0 : Math.floor(Math.random() * 500) + 50;
    const status = isDown ? 'DOWN' : 'UP';

    const check: UptimeCheck = {
      id: `check_${Date.now()}`,
      clientId,
      clientName: body.clientName || 'Unknown',
      url,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
      uptime: isDown ? 0 : 99.9,
    };

    checksStore.unshift(check);
    await info(`Health check: ${check.clientName} → ${status}`, { responseTime });
    return NextResponse.json({ ok: true, check }, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  configsStore = configsStore.filter(c => c.clientId !== clientId);
  checksStore = checksStore.filter(c => c.clientId !== clientId);

  return NextResponse.json({ ok: true });
}
