import { NextResponse } from 'next/server';
import { fetchUserByIdWithPassword, verifyPassword, changeUserPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const user = await fetchUserByIdWithPassword(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const hash = (user as unknown as Record<string, string>).password_hash || '';
    if (!verifyPassword(currentPassword, hash)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const ok = await changeUserPassword(userId, newPassword);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, msg: 'Password changed successfully.' });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
