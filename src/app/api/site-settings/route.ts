import { NextResponse } from 'next/server';
import { loadSiteSettings, saveSiteSettings } from '@/lib/siteSettings';

export async function GET() {
  return NextResponse.json(await loadSiteSettings());
}
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const ok = await saveSiteSettings(data);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error('site-settings POST error:', e);
    return NextResponse.json({ ok: false });
  }
}
