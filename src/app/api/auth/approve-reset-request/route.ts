import { NextResponse } from 'next/server';
import { fetchUserByEmail, fetchUserById } from '@/lib/auth';
import { resetAccountPassword } from '@/lib/dataSync';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Verify admin
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ ok: false, msg: 'Unauthorized', temp_password: '' }, { status: 401 });
    }
    const adminUser = await fetchUserById(userId);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, msg: 'Forbidden', temp_password: '' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'A valid email is required.', temp_password: '' }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();

    // Find the user by email
    const user = await fetchUserByEmail(emailClean);
    if (!user) {
      return NextResponse.json({ ok: false, msg: 'User not found.', temp_password: '' }, { status: 404 });
    }

    // Reset the password using the existing helper
    const [ok, msg, pass] = await resetAccountPassword(user.id);
    if (!ok) {
      return NextResponse.json({ ok: false, msg, temp_password: '' }, { status: 500 });
    }

    // Remove the pending request
    const client = getSupabaseClient();
    if (client) {
      await client
        .from('settings')
        .delete()
        .eq('key', `password_reset_request:${emailClean}`);
    }

    return NextResponse.json({
      ok: true,
      msg: `Password reset for ${emailClean}.`,
      temp_password: pass,
    });
  } catch {
    return NextResponse.json({ ok: false, msg: 'Server error.', temp_password: '' }, { status: 500 });
  }
}
