import { NextResponse } from 'next/server';
import { listLeads, listMyLeads, listMyInfluencers, createLead, transferLeadOwner, markLeadConverted, countColdLeadsByReferralCode } from '@/lib/dataSync';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const myLeads = url.searchParams.get('my');
  const myInfluencers = url.searchParams.get('influencers');
  const coldCount = url.searchParams.get('cold_count');
  if (coldCount) return NextResponse.json({ count: await countColdLeadsByReferralCode(coldCount) });
  if (myLeads) return NextResponse.json(await listMyLeads(myLeads));
  if (myInfluencers) return NextResponse.json(await listMyInfluencers(myInfluencers));
  return NextResponse.json(await listLeads());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;
  if (action === 'submit') {
    const { full_name, phone_number, country, source, owner_user, has_visit_date, visit_date, message } = body;
    const [ok, msg] = await createLead(full_name, phone_number, country, source, owner_user, has_visit_date, visit_date, message);
    return NextResponse.json({ ok, msg });
  }
  if (action === 'transfer') {
    const [ok, msg] = await transferLeadOwner(body.lead_id, body.new_owner_id, body.new_owner_name);
    return NextResponse.json({ ok, msg });
  }
  if (action === 'convert') {
    const [ok, msg] = await markLeadConverted(body.lead_id);
    return NextResponse.json({ ok, msg });
  }
  if (action === 'add_influencer') {
    const { email, full_name, temp_password, team_member_id } = body;
    const { createAccount } = await import('@/lib/dataSync');
    const [ok, msg, pass] = await createAccount(email, full_name, 'INFLUENCER', temp_password, team_member_id);
    return NextResponse.json({ ok, msg, temp_password: pass, email });
  }
  return NextResponse.json({ ok: false, msg: 'Unknown action' });
}
