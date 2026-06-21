import { NextResponse } from 'next/server';
import { fetchUserByEmail } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(req: Request) {
  try {
    // Rate limit: max 3 requests per IP every 15 minutes
    const ip = getIp(req);
    const { allowed, remaining, resetIn } = checkRateLimit(`forgot-pw:${ip}`);
    if (!allowed) {
      const retryAfter = Math.ceil(resetIn / 1000);
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const user = await fetchUserByEmail(email.trim().toLowerCase());
    if (!user) {
      // Return generic success to prevent email enumeration
      return NextResponse.json({ ok: true, msg: 'If an account with this email exists, a temporary password has been generated.', temp_password: '' });
    }

    const tempPassword = generateTempPassword();
    const hash = bcrypt.hashSync(tempPassword, 12);

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
    }

    await client.from('users').update({ password_hash: hash }).eq('id', user.id);

    return NextResponse.json({
      ok: true,
      msg: `Your temporary password is: ${tempPassword}. Please use it to sign in and change your password immediately.`,
      temp_password: tempPassword,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
