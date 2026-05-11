import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentClientSession } from '@/lib/client-auth';
import { logClientAction } from '@/lib/client-actions';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const session = await getCurrentClientSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('client_assets')
    .select('*')
    .eq('client_id', session.clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'assets_fetch_failed', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, assets: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getCurrentClientSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing_file' }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'invalid_file_size', maxBytes: MAX_UPLOAD_BYTES }, { status: 400 });
  }

  const ext = path.extname(file.name || '').slice(0, 12);
  const safeBaseName = path.basename(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${randomUUID()}${ext || ''}-${safeBaseName}`;

  const relativeDir = path.join('uploads', 'client-assets', session.clientId);
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const publicUrl = `/${relativeDir.replace(/\\/g, '/')}/${filename}`;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('client_assets')
    .insert([
      {
        client_id: session.clientId,
        uploaded_by_email: session.userEmail,
        file_name: file.name,
        mime_type: file.type || null,
        file_size: file.size,
        storage_path: absolutePath,
        public_url: publicUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'asset_save_failed', message: error.message }, { status: 500 });
  }

  await logClientAction({
    clientId: session.clientId,
    userEmail: session.userEmail,
    action: 'client_asset_uploaded',
    entityType: 'client_asset',
    entityId: data.id,
    metadata: { fileName: file.name, fileSize: file.size },
  });

  return NextResponse.json({ ok: true, asset: data });
}
