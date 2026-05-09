import { NextResponse } from 'next/server';
import { getTemplates, getTemplateByKey } from '@/lib/templates';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key')?.trim();

  if (key) {
    const template = getTemplateByKey(key);
    if (!template) {
      return NextResponse.json({ error: 'template_not_found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, template }, { status: 200 });
  }

  return NextResponse.json({ ok: true, templates: getTemplates() }, { status: 200 });
}
