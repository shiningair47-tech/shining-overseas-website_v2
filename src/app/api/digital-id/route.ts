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
    const data = { ...body.data };
    const c = getSupabaseClient();

    // Upload base64 photo to Supabase Storage (avoids column size limits)
    if (c && data.uploaded_photo && data.uploaded_photo.startsWith('data:image/')) {
      try {
        const bucket = 'digital-profiles';
        // Ensure bucket exists (ignore error if already exists)
        await c.storage.createBucket(bucket, { public: true }).catch(() => {});

        const match = data.uploaded_photo.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          const buffer = Buffer.from(match[2], 'base64');
          const filePath = `${body.user_id}/profile.${ext}`;

          await c.storage.from(bucket).upload(filePath, buffer, {
            contentType: `image/${match[1]}`,
            upsert: true,
          });

          const { data: { publicUrl } } = c.storage.from(bucket).getPublicUrl(filePath);
          data.photo_url = publicUrl;
          data.uploaded_photo = ''; // Clear raw base64, store URL instead
        }
      } catch {
        // Storage failed – fall through, saveProfileMetadata will handle via chunking
      }
    }

    const ok = await saveProfileMetadata(body.user_id, data);
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
