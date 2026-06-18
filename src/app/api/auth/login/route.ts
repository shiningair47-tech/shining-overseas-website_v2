import { NextResponse } from 'next/server';
import { fetchUserByEmail, fetchUserByReferralCode, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();
    if (!password) return NextResponse.json({ error: 'Password required.' }, { status: 400 });

    let user = null;

    if (role === 'influencer') {
      // Influencers log in via referral code
      const code = (email || '').trim().toUpperCase();
      user = await fetchUserByReferralCode(code);
      if (!user) return NextResponse.json({ error: 'Invalid referral code or password.' }, { status: 401 });
      if (user.role !== 'INFLUENCER') return NextResponse.json({ error: 'This code is not an influencer account.' }, { status: 401 });
    } else {
      // Admin / Team login via email
      user = await fetchUserByEmail(email || '');
      if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      if (role === 'admin' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Not an admin account.' }, { status: 401 });
      if (role === 'team' && user.role !== 'TEAM_MEMBER') return NextResponse.json({ error: 'Not a team member account.' }, { status: 401 });
    }

    const hash = (user as unknown as Record<string, string>).password_hash || '';
    if (!verifyPassword(password, hash)) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone_number: user.phone_number || '',
      referral_code: user.referral_code || '',
      status: user.status || 'ACTIVE',
      tier: user.tier || '',
      assigned_to: user.assigned_to || '',
      facebook_page: user.facebook_page || '',
    };

    return NextResponse.json({ user: userData });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
