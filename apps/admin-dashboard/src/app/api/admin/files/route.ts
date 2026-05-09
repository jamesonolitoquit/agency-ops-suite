import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const adminDir = process.cwd();
const backupsDir = path.join(adminDir, 'backups');
const logsDir = path.join(adminDir, 'logs');

function isSafeName(name: string) {
  if (!name) return false;
  if (name.includes('..')) return false;
  if (name.includes('/') || name.includes('\\')) return false;
  return true;
}

export async function GET(request: Request) {
  try {
    requireAdmin(request);
  } catch (res) {
    return res as NextResponse;
  }
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'backups').toLowerCase();
  const download = searchParams.get('download');

  let dir = backupsDir;
  if (type === 'logs') dir = logsDir;

  // If download requested, stream file
  if (download) {
    if (!isSafeName(download)) {
      return NextResponse.json({ error: 'invalid_filename' }, { status: 400 });
    }

    const filePath = path.join(dir, download);
    try {
      const buf = await fs.readFile(filePath);
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${download}"`,
        },
      });
    } catch (e) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  // List files
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map(async (e) => {
          const stat = await fs.stat(path.join(dir, e.name));
          return {
            name: e.name,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
          };
        })
    );

    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ files: [] });
  }
}
