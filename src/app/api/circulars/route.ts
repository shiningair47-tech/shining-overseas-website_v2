import { NextResponse } from 'next/server';
import { listCirculars, upsertCircular, deleteCircular, toggleCircularActive } from '@/lib/contentSync';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const onlyActive = url.searchParams.get('active') === 'true';
  const data = await listCirculars(onlyActive);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id, ...fields } = body;
  const [ok, msg] = await upsertCircular(fields, id || '') as [boolean, string];
  return NextResponse.json({ ok, msg });
}

export async function DELETE(req: Request) {
  const { id, toggleActive, value } = await req.json();
  if (toggleActive) {
    const ok = await toggleCircularActive(id, value);
    return NextResponse.json({ ok });
  }
  const ok = await deleteCircular(id);
  return NextResponse.json({ ok });
}
