import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

async function checkPageSpeed(url: string) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const [mobileRes, desktopRes] = await Promise.all([
    fetch(`${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`),
    fetch(`${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=desktop&key=${apiKey}`),
  ]);
  const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()]);

  const extractScores = (data: any) => ({
    performance: Math.round((data.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
    seo: Math.round((data.lighthouseResult?.categories?.seo?.score ?? 0) * 100),
    accessibility: Math.round((data.lighthouseResult?.categories?.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((data.lighthouseResult?.categories?.['best-practices']?.score ?? 0) * 100),
    fcp: data.lighthouseResult?.audits?.['first-contentful-paint']?.displayValue ?? 'N/A',
    lcp: data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue ?? 'N/A',
    tbt: data.lighthouseResult?.audits?.['total-blocking-time']?.displayValue ?? 'N/A',
    cls: data.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue ?? 'N/A',
  });

  const extractScreenshot = (data: any): string | null =>
    data.lighthouseResult?.audits?.['final-screenshot']?.details?.data ?? null;

  return {
    scores: { mobile: extractScores(mobile), desktop: extractScores(desktop) },
    screenshots: { mobile: extractScreenshot(mobile), desktop: extractScreenshot(desktop) },
  };
}
async function checkSecurityHeaders(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const h = Object.fromEntries(res.headers.entries());
    return {
      https: url.startsWith('https://'),
      hsts: !!h['strict-transport-security'],
      xFrameOptions: !!h['x-frame-options'],
      xContentTypeOptions: !!h['x-content-type-options'],
      csp: !!h['content-security-policy'],
      referrerPolicy: !!h['referrer-policy'],
    };
  } catch {
    return { https: url.startsWith('https://'), hsts: false, xFrameOptions: false, xContentTypeOptions: false, csp: false, referrerPolicy: false };
  }
}

async function crawlPage(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'DeployCheck-Audit-Bot/1.0' } });
  const html = await res.text();
  return parse(html);
}

function checkSEO(root: ReturnType<typeof parse>) {
  const title = root.querySelector('title')?.text?.trim() ?? '';
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
  const h1s = root.querySelectorAll('h1');
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() ?? '';
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content')?.trim() ?? '';
  const viewport = root.querySelector('meta[name="viewport"]')?.getAttribute('content')?.trim() ?? '';
  return {
    title: { value: title, present: !!title, optimal: title.length >= 30 && title.length <= 60, length: title.length },
    description: { value: description, present: !!description, optimal: description.length >= 120 && description.length <= 160, length: description.length },
    h1: { count: h1s.length, present: h1s.length > 0, optimal: h1s.length === 1, values: h1s.map((h) => h.text.trim()).slice(0, 3) },
    canonical: { value: canonical, present: !!canonical },
    openGraph: {
      title: !!root.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      description: !!root.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      image: !!root.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    },
    robots: { value: robots, present: !!robots, indexable: !robots.includes('noindex') },
    viewport: { present: !!viewport },
  };
}

function checkMixedContent(root: ReturnType<typeof parse>, pageUrl: string) {
  if (!pageUrl.startsWith('https://')) return { applicable: false, issues: [] };
  const issues: { type: string; url: string }[] = [];
  const checks = [
    { selector: 'img', attr: 'src', type: 'Image' },
    { selector: 'script', attr: 'src', type: 'Script' },
    { selector: 'link[rel="stylesheet"]', attr: 'href', type: 'Stylesheet' },
    { selector: 'iframe', attr: 'src', type: 'iFrame' },
  ];
  for (const { selector, attr, type } of checks) {
    root.querySelectorAll(selector).forEach((el) => {
      const val = el.getAttribute(attr);
      if (val?.startsWith('http://')) issues.push({ type, url: val });
    });
  }
  return { applicable: true, issues };
}

function checkImages(root: ReturnType<typeof parse>) {
  const images = root.querySelectorAll('img');
  const missingAlt: string[] = [];
  const emptyAlt: string[] = [];
  images.forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    const alt = img.getAttribute('alt');
    if (alt === null || alt === undefined) missingAlt.push(src);
    else if (alt.trim() === '') emptyAlt.push(src);
  });
  return { total: images.length, missingAlt, emptyAlt, passed: missingAlt.length === 0 && emptyAlt.length === 0 };
}

async function checkBrokenLinks(root: ReturnType<typeof parse>, baseUrl: string) {
  const base = new URL(baseUrl);
  const links = Array.from(new Set(
    root.querySelectorAll('a[href]')
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
      .map((href) => { try { return new URL(href, base.origin).href; } catch { return null; } })
      .filter(Boolean) as string[]
  )).slice(0, 10);

  const results = await Promise.allSettled(
    links.map(async (link) => {
      try {
        const res = await fetch(link, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(3000) });
        return { url: link, status: res.status, broken: res.status >= 400 };
      } catch {
        return { url: link, status: 0, broken: true };
      }
    })
  );

  const checked = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<{ url: string; status: number; broken: boolean }>).value);

  return { total: checked.length, broken: checked.filter((l) => l.broken), passed: checked.filter((l) => !l.broken).length };
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== 'string') return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    // Run all independent checks in parallel
    const [{ scores }, secHeaders, root] = await Promise.all([
      checkPageSpeed(normalizedUrl),
      checkSecurityHeaders(normalizedUrl),
      crawlPage(normalizedUrl),
    ]);

    // Run HTML-based checks in parallel (they only need root)
    const [seo, mixedContent, images, brokenLinks] = await Promise.all([
      Promise.resolve(checkSEO(root)),
      Promise.resolve(checkMixedContent(root, normalizedUrl)),
      Promise.resolve(checkImages(root)),
      checkBrokenLinks(root, normalizedUrl),
    ]);

    return NextResponse.json({
      url: normalizedUrl,
      pagespeed: scores,
      headers: secHeaders,
      seo,
      mixedContent,
      images,
      brokenLinks,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json({ error: 'Failed to audit the URL. Make sure the site is publicly accessible.' }, { status: 500 });
  }
}
