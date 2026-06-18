import { NextResponse } from 'next/server';
import { listDigitalIdPages, loadProfileMetadata, saveProfileMetadata } from '@/lib/dataSync';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (userId) {
    const meta = await loadProfileMetadata(userId);
    return NextResponse.json(meta);
  }
  return NextResponse.json(await listDigitalIdPages());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;
  if (action === 'save_profile') {
    const ok = await saveProfileMetadata(body.user_id, body.data);
    return NextResponse.json({ ok });
  }
  if (action === 'update_user') {
    const c = getSupabaseClient();
    if (!c) return NextResponse.json({ ok: false });
    try {
      await c.from('users').update({
        full_name: body.full_name, phone_number: body.phone_number, facebook_page: body.facebook_page,
      }).eq('id', body.user_id);
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
  }
  if (action === 'toggle_active') {
    const c = getSupabaseClient(); if (!c) return NextResponse.json({ ok: false });
    try {
      await c.from('users').update({ status: body.value ? 'ACTIVE' : 'INACTIVE' }).eq('id', body.id);
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
  }
  if (action === 'delete_page') {
    const c = getSupabaseClient(); if (!c) return NextResponse.json({ ok: false });
    try {
      await c.from('users').update({ referral_code: null }).eq('id', body.id);
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
  }
  return NextResponse.json({ ok: false });
}
