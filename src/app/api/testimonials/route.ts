import { NextResponse } from 'next/server';
import { listTestimonials, upsertTestimonial, deleteTestimonial, toggleTestimonialFeatured } from '@/lib/contentSync';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const featured = url.searchParams.get('featured') === 'true';
  return NextResponse.json(await listTestimonials(featured));
}
export async function POST(req: Request) {
  const body = await req.json();
  const { id, ...fields } = body;
  const [ok, msg] = await upsertTestimonial(fields, id || '') as [boolean, string];
  return NextResponse.json({ ok, msg });
}
export async function DELETE(req: Request) {
  const { id, toggleFeatured, value } = await req.json();
  if (toggleFeatured) return NextResponse.json({ ok: await toggleTestimonialFeatured(id, value) });
  return NextResponse.json({ ok: await deleteTestimonial(id) });
}
