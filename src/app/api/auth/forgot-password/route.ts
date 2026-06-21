import { NextResponse } from 'next/server';
import { fetchUserByEmail } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
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
      // Store a pending reset request in the settings table
      const client = getSupabaseClient();
      if (client) {
        const requestKey = `password_reset_request:${email.trim().toLowerCase()}`;
        const requestValue = JSON.stringify({
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
          status: 'pending',
        });

        // Upsert — if a request already exists, update its timestamp
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
