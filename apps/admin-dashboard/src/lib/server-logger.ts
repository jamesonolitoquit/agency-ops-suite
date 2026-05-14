import fs from 'fs/promises';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'server.log');

async function ensureLogDir() {
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function info(message: string, meta?: any) {
  await ensureLogDir();
  const payload = { level: 'info', message, meta, ts: new Date().toISOString() };
  try {
    await fs.appendFile(logFile, JSON.stringify(payload) + '\n');
  } catch (e) {
    // fallback to console
    console.warn('[logger] ', JSON.stringify(payload));
  }
  // also print to console for dev visibility
  console.warn(message, meta ?? '');
}

export async function warn(message: string, meta?: any) {
  await ensureLogDir();
  const payload = { level: 'warn', message, meta, ts: new Date().toISOString() };
  try {
    await fs.appendFile(logFile, JSON.stringify(payload) + '\n');
  } catch (e) {
    console.warn('[logger] ', JSON.stringify(payload));
  }
  console.warn(message, meta ?? '');
}

export async function error(message: string, meta?: any) {
  await ensureLogDir();
  const payload = { level: 'error', message, meta, ts: new Date().toISOString() };
  try {
    await fs.appendFile(logFile, JSON.stringify(payload) + '\n');
  } catch (e) {
    console.error('[logger] ', JSON.stringify(payload));
  }
  console.error(message, meta ?? '');
}
