import { NextResponse } from 'next/server';
import { getDeploymentChecklist, updateDeploymentChecklistItem } from '@/lib/agency-db';

const checklistItems = [
  { key: 'domainConnected', field: 'domain_connected', label: 'Domain connected' },
  { key: 'sslActive', field: 'ssl_active', label: 'SSL active' },
  { key: 'ctaWorks', field: 'cta_works', label: 'CTA works' },
  { key: 'mobileResponsive', field: 'mobile_responsive', label: 'Mobile responsive' },
  { key: 'seoMetaTags', field: 'seo_meta_tags', label: 'SEO meta tags' },
] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
  }

  const checklist = await getDeploymentChecklist(clientId);
  if (!checklist) {
    return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
  }

  return NextResponse.json({
    checklist,
    items: checklistItems,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const clientId = body.clientId as string | undefined;
  const item = body.item as typeof checklistItems[number]['field'] | undefined;
  const completed = Boolean(body.completed);

  if (!clientId || !item) {
    return NextResponse.json({ error: 'Client ID and item required' }, { status: 400 });
  }

  const validFields = checklistItems.map((entry) => entry.field);
  if (!validFields.includes(item)) {
    return NextResponse.json({ error: 'Invalid checklist item' }, { status: 400 });
  }

  const checklist = await updateDeploymentChecklistItem(clientId, item, completed);

  return NextResponse.json({ ok: true, checklist });
}