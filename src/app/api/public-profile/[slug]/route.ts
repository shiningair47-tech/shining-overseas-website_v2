import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { loadProfileMetadata } from '@/lib/dataSync';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const c = getSupabaseClient();
  if (!c) return NextResponse.json({ error: 'No DB' }, { status: 500 });
  try {
    const { data } = await c.from('users')
      .select('id,full_name,role,referral_code,status,phone_number,facebook_page,tier,assigned_to')
      .eq('referral_code', slug).limit(1);
    const user = data?.[0];
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const meta = await loadProfileMetadata(user.id);
    return NextResponse.json({ user, meta });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
