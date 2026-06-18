import { NextResponse } from 'next/server';
import { listFlights, upsertFlight, deleteFlight } from '@/lib/contentSync';

export async function GET() {
  return NextResponse.json(await listFlights());
}
export async function POST(req: Request) {
  const body = await req.json();
  const { id, ...fields } = body;
  const [ok, msg] = await upsertFlight(fields, id || '') as [boolean, string];
  return NextResponse.json({ ok, msg });
}
export async function DELETE(req: Request) {
  const { id } = await req.json();
  return NextResponse.json({ ok: await deleteFlight(id) });
}
