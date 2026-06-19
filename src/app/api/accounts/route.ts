import { NextRequest, NextResponse } from 'next/server';
import { createAccount, listAccounts, listTeamMemberOptions, resetAccountPassword, deleteAccount, toggleAccountStatus } from '@/lib/dataSync';
import { fetchUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isTeamOptions = request.nextUrl.searchParams.get('teamOptions') === 'true';
  if (isTeamOptions) {
    const members = await listTeamMemberOptions();
    return NextResponse.json(members);
  }
  const accounts = await listAccounts();
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { ok: false, msg: 'Unauthorized - no user context', temp_password: '' },
        { status: 401 }
      );
    }
    const adminUser = await fetchUserById(userId);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, msg: 'Forbidden - only admins can create accounts', temp_password: '' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { full_name, email, role, temp_password, assigned_to } = body;
    if (!full_name || !email || !role) {
      return NextResponse.json(
        { ok: false, msg: 'Missing required fields: full_name, email, role', temp_password: '' },
        { status: 400 }
      );
    }
    const [ok, msg, tempPassword] = await createAccount(email, full_name, role, temp_password || '', assigned_to || '');
    return NextResponse.json(
      { ok, msg, temp_password: tempPassword },
      { status: ok ? 201 : 400 }
    );
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { ok: false, msg: error instanceof Error ? error.message : 'Failed to create account', temp_password: '' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { id, resetPassword, toggleActive, value } = await req.json();
  if (resetPassword) {
    const [ok, msg, pass] = await resetAccountPassword(id);
    return NextResponse.json({ ok, msg, temp_password: pass });
  }
  if (toggleActive) {
    const newStatus = value ? 'ACTIVE' : 'INACTIVE';
    const ok = await toggleAccountStatus(id, newStatus);
    return NextResponse.json({ ok, status: newStatus });
  }
  const [ok, msg] = await deleteAccount(id);
  return NextResponse.json({ ok, msg });
}
