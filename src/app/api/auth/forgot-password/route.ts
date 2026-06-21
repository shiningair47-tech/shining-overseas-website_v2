import { NextResponse } from 'next/server';
import { fetchUserByEmail } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

async function cleanupStaleResetRequests(client: ReturnType<typeof getSupabaseClient>) {
  if (!client) return;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await client
    .from('settings')
    .select('key,value')
    .like('key', 'password_reset_request:%');
  for (const row of data || []) {
    try {
      const parsed = JSON.parse(row.value);
      if (parsed.created_at && parsed.created_at < cutoff) {
        await client.from('settings').delete().eq('key', row.key);
      }
    } catch { /* skip malformed */ }
  }
}

export async function POST(req: Request) {
  try {
    // Rate limit: max 3 requests per IP every 15 minutes
    const ip = getIp(req);
    const { allowed } = checkRateLimit(`forgot-pw:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const user = await fetchUserByEmail(email.trim().toLowerCase());

    if (user) {
      const client = getSupabaseClient();
      if (client) {
        // Clean up any stale requests older than 24 hours
        await cleanupStaleResetRequests(client);

        // Store a pending reset request
        const requestKey = `password_reset_request:${email.trim().toLowerCase()}`;
        const requestValue = JSON.stringify({
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          status: 'pending',
        });

        await client.from('settings').upsert(
          { key: requestKey, value: requestValue },
          { onConflict: 'key' }
        );
      }
    }

    // Always return generic success — prevents email enumeration
    return NextResponse.json({
      ok: true,
      msg: 'If an account with this email exists, a password reset request has been submitted to the admin team. Please contact them for your temporary password.',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
