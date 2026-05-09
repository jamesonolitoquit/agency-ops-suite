import fs from 'fs/promises';
import path from 'path';

const outDir = path.join(process.cwd(), 'backups');
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS ?? 7);

async function ensureOut() {
  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch (e) {}
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { error: `Failed ${res.status}` };
  return res.json();
}

async function run() {
  await ensureOut();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(outDir, `backup-${timestamp}.json`);

  const base = 'http://localhost:3000';
  const endpoints = [
    '/api/test-leads',
    '/api/test-clients',
    '/api/test-provisioning',
    '/api/test-monitoring',
    '/api/test-billing',
    '/api/test-requests',
    '/api/test-reports',
  ];

  const results = {};
  for (const ep of endpoints) {
    try {
      results[ep] = await fetchJson(base + ep);
    } catch (e) {
      results[ep] = { error: String(e) };
    }
  }

  await fs.writeFile(file, JSON.stringify({ ts: new Date().toISOString(), results }, null, 2));
  console.log('Backup saved to', file);
}

run().catch((err) => {
  console.error('Backup failed', err);
  process.exit(1);
});

async function cleanup() {
  if (!retentionDays || retentionDays <= 0) return;
  try {
    const entries = await fs.readdir(outDir, { withFileTypes: true });
    const now = Date.now();
    for (const e of entries) {
      if (!e.isFile()) continue;
      const stat = await fs.stat(path.join(outDir, e.name));
      const ageDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays > retentionDays) {
        await fs.unlink(path.join(outDir, e.name));
      }
    }
  } catch (e) {
    // ignore
  }
}

cleanup().catch(()=>{});
