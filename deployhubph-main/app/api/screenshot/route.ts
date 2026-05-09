import { NextRequest, NextResponse } from 'next/server';

const ACCESS_KEY = process.env.SCREENSHOTONE_ACCESS_KEY;

function buildScreenshotUrl(url: string, viewport: 'desktop' | 'mobile'): string {
  const params = new URLSearchParams({
    access_key: ACCESS_KEY ?? '',
    url,
    format: 'jpg',
    image_quality: '80',
    viewport_width: viewport === 'mobile' ? '390' : '1280',
    viewport_height: viewport === 'mobile' ? '844' : '800',
    device_scale_factor: viewport === 'mobile' ? '2' : '1',
    full_page: 'false',
    block_ads: 'true',
    block_cookie_banners: 'true',
    block_trackers: 'true',
    timeout: '15',
  });

  return `https://api.screenshotone.com/take?${params.toString()}`;
}

async function fetchScreenshot(url: string, viewport: 'desktop' | 'mobile'): Promise<string | null> {
  try {
    const screenshotUrl = buildScreenshotUrl(url, viewport);
    const res = await fetch(screenshotUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ desktop: null, mobile: null });

  const [desktop, mobile] = await Promise.all([
    fetchScreenshot(url, 'desktop'),
    fetchScreenshot(url, 'mobile'),
  ]);

  return NextResponse.json({ desktop, mobile });
}
