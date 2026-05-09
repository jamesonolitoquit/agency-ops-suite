import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/admin-auth';

const adminDir = process.cwd();
const backupsDir = path.join(adminDir, 'backups');
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS ?? 7);

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
}

async function cleanupOldBackups() {
  if (!retentionDays || retentionDays <= 0) return;
  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const now = Date.now();
    for (const e of entries) {
      if (!e.isFile()) continue;
      const stat = await fs.stat(path.join(backupsDir, e.name));
      const ageDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays > retentionDays) {
        await fs.unlink(path.join(backupsDir, e.name));
      }
    }
  } catch (e) {
    // ignore
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
  } catch (res) {
    return res as NextResponse;
  }

  await ensureDir(backupsDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(backupsDir, safeName(fileName));

  const base = new URL(request.url).origin;
  const endpoints = [
    '/api/test-leads',
    '/api/test-clients',
    '/api/test-provisioning',
    '/api/test-monitoring',
    '/api/test-billing',
    '/api/test-requests',
    '/api/test-reports',
  ];

  const results: Record<string, any> = {};

  for (const ep of endpoints) {
    try {
      const res = await fetch(base + ep);
      if (!res.ok) {
        results[ep] = { error: `status_${res.status}` };
      } else {
        results[ep] = await res.json();
      }
    } catch (e) {
      results[ep] = { error: String(e) };
    }
  }

  await fs.writeFile(filePath, JSON.stringify({ ts: new Date().toISOString(), results }, null, 2));

  // cleanup
  await cleanupOldBackups();

  return NextResponse.json({ ok: true, file: fileName }, { status: 201 });
}
