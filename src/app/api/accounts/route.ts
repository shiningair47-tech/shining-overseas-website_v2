import { NextResponse } from 'next/server';
import { listAccounts, createAccount, resetAccountPassword, deleteAccount, listTeamMemberOptions } from '@/lib/dataSync';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('teamOptions') === 'true') return NextResponse.json(await listTeamMemberOptions());
  return NextResponse.json(await listAccounts());
}
export async function POST(req: Request) {
  const { email, full_name, role, temp_password, assigned_to } = await req.json();
  const [ok, msg, pass] = await createAccount(email, full_name, role, temp_password, assigned_to);
  return NextResponse.json({ ok, msg, temp_password: pass });
}
export async function DELETE(req: Request) {
  const { id, resetPassword } = await req.json();
  if (resetPassword) {
    const [ok, msg, pass] = await resetAccountPassword(id);
    return NextResponse.json({ ok, msg, temp_password: pass });
  }
  const [ok, msg] = await deleteAccount(id);
  return NextResponse.json({ ok, msg });
}
