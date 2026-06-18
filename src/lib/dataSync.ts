import { getSupabaseClient } from './supabase';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import secrets from 'crypto';

// ---- ACCOUNT HELPERS ----
function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function generateReferralCode(fullName: string): string {
  const base = fullName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'REF';
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${base}${suffix}`;
}

async function referralCodeTaken(code: string): Promise<boolean> {
  const c = getSupabaseClient(); if (!c) return false;
  const { data } = await c.from('users').select('id').eq('referral_code', code).limit(1);
  return Boolean(data?.length);
}

async function emailTaken(email: string): Promise<boolean> {
  const c = getSupabaseClient(); if (!c) return false;
  const { data } = await c.from('users').select('id').eq('email', email).limit(1);
  return Boolean(data?.length);
}

export async function uniqueReferralCode(fullName: string): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode(fullName);
    if (!await referralCodeTaken(code)) return code;
  }
  return `REF${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function listAccounts() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('users')
      .select('id,email,role,full_name,phone_number,referral_code,status,tier,assigned_to,facebook_page,created_at,join_date')
      .in('role', ['TEAM_MEMBER', 'INFLUENCER'])
      .order('created_at', { ascending: false });
    return (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      phone_number: r.phone_number || '',
      referral_code: r.referral_code || '',
      facebook_page: r.facebook_page || '',
      assigned_to: r.assigned_to || '',
      tier: r.tier || '',
      status: r.status || '',
    }));
  } catch { return []; }
}

export async function listTeamMemberOptions() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('users').select('id,full_name,email')
      .eq('role', 'TEAM_MEMBER').eq('status', 'ACTIVE').order('full_name', { ascending: true });
    return data || [];
  } catch { return []; }
}

export async function createAccount(email: string, fullName: string, role: string, tempPassword = '', assignedTo = '')
  : Promise<[boolean, string, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'Database not configured.', ''];
  const roleUp = role.toUpperCase();
  if (!['TEAM_MEMBER', 'INFLUENCER'].includes(roleUp)) return [false, 'Invalid role.', ''];
  const emailClean = email.trim().toLowerCase();
  const nameClean = fullName.trim();
  if (!emailClean || !emailClean.includes('@')) return [false, 'Invalid email.', ''];
  if (!nameClean) return [false, 'Full name is required.', ''];
  if (await emailTaken(emailClean)) return [false, 'Email already exists.', ''];
  const pass = (!tempPassword || tempPassword.length < 8) ? generateTempPassword() : tempPassword;
  const passwordHash = bcrypt.hashSync(pass, 12);
  const referralCode = await uniqueReferralCode(nameClean);
  const payload: Record<string, unknown> = {
    id: uuid(), email: emailClean, password_hash: passwordHash, role: roleUp,
    full_name: nameClean, status: 'ACTIVE',
    created_at: new Date().toISOString(), join_date: new Date().toISOString(),
    referral_code: referralCode,
  };
  if (roleUp === 'INFLUENCER') payload.tier = 'STANDARD';
  if (assignedTo) payload.assigned_to = assignedTo;
  try {
    await c.from('users').insert(payload);
    return [true, 'Account created.', pass];
  } catch (e: unknown) { return [false, String(e), '']; }
}

export async function resetAccountPassword(userId: string): Promise<[boolean, string, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB', ''];
  const pass = generateTempPassword();
  const hash = bcrypt.hashSync(pass, 12);
  try {
    await c.from('users').update({ password_hash: hash }).eq('id', userId);
    return [true, 'Password reset.', pass];
  } catch { return [false, 'Could not reset.', '']; }
}

export async function deleteAccount(userId: string): Promise<[boolean, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  try { await c.from('users').delete().eq('id', userId); return [true, 'Deleted.']; }
  catch { return [false, 'Could not delete.']; }
}

// ---- PROFILE METADATA ----
export async function loadProfileMetadata(userId: string) {
  const fields = ['photo_url', 'uploaded_photo', 'whatsapp_1', 'whatsapp_2', 'whatsapp_3'];
  const out: Record<string, string> = { photo_url: '', uploaded_photo: '', whatsapp_1: '', whatsapp_2: '', whatsapp_3: '' };
  const c = getSupabaseClient(); if (!c) return out;
  const keys = fields.map(f => `digital_profile:${userId}:${f}`);
  try {
    const { data } = await c.from('settings').select('key,value').in('key', keys);
    for (const row of data || []) {
      for (const f of fields) {
        if (row.key === `digital_profile:${userId}:${f}`) { out[f] = row.value || ''; break; }
      }
    }
  } catch {}
  return out;
}

export async function saveProfileMetadata(userId: string, data: Record<string, string>): Promise<boolean> {
  const fields = ['photo_url', 'uploaded_photo', 'whatsapp_1', 'whatsapp_2', 'whatsapp_3'];
  const c = getSupabaseClient(); if (!c) return false;
  try {
    const keys = fields.map(f => `digital_profile:${userId}:${f}`);
    // Delete existing rows first, then insert fresh ones
    await c.from('settings').delete().in('key', keys);
    const rows = fields.map(f => ({ key: `digital_profile:${userId}:${f}`, value: (data[f] || '') }));
    await c.from('settings').insert(rows);
    return true;
  } catch { return false; }
}

export function whatsappDigits(v: string): string {
  return v.replace(/\D/g, '');
}

// ---- LEAD FUNCTIONS ----
function parseNotes(notes: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!notes) return out;
  for (const part of notes.split('|')) {
    const kv = part.trim();
    if (kv.includes('=')) {
      const [k, ...rest] = kv.split('=');
      out[k.trim().toLowerCase()] = rest.join('=').trim();
    }
  }
  return out;
}

export async function createLead(
  fullName: string, phoneNumber: string, countryOfInterest: string,
  source: string, ownerUser: Record<string, string> | null,
  hasVisitDate = false, visitDate = '', extraMessage = ''
): Promise<[boolean, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'Database not configured.'];
  const visitDateStr = (visitDate || '').trim();
  const isHotIntent = hasVisitDate && Boolean(visitDateStr);
  let ownerRole = '', ownerIdVal = '', ownerAssignedTo = '', ownerFullName = '', ownerRefCode = '';
  if (ownerUser) {
    ownerRole = (ownerUser.role || '').toUpperCase();
    ownerIdVal = ownerUser.id || '';
    ownerAssignedTo = ownerUser.assigned_to || '';
    ownerFullName = ownerUser.full_name || '';
    ownerRefCode = ownerUser.referral_code || '';
  }
  // Authoritative re-fetch by referral_code — guarantees role/id/assigned_to are
  // correct regardless of what the client passed in. Prevents a stale or spoofed
  // client payload from manipulating lead routing (e.g. faking TEAM_MEMBER role).
  if (ownerRefCode) {
    try {
      const { data: freshRows } = await c.from('users')
        .select('id,role,full_name,assigned_to').eq('referral_code', ownerRefCode).limit(1);
      const fresh = freshRows?.[0];
      if (fresh) {
        ownerRole = (fresh.role || '').toUpperCase();
        ownerIdVal = fresh.id || '';
        ownerAssignedTo = fresh.assigned_to || '';
        ownerFullName = fresh.full_name || ownerFullName;
      }
    } catch { /* fall through with client-supplied values if re-fetch fails */ }
  }
  let influencerId = '', referralCode = 'HOMEPAGE', routingLabel = '', ownerLabel = '';
  const getAdminId = async () => {
    const { data } = await c.from('users').select('id').eq('role', 'ADMIN').limit(1);
    return data?.[0]?.id || null;
  };
  if (source === 'homepage' || !ownerUser || !ownerIdVal) {
    const adminId = await getAdminId();
    if (!adminId) return [false, 'No admin.'];
    influencerId = adminId; routingLabel = 'COLD'; ownerLabel = 'Admin (Homepage)'; referralCode = 'HOMEPAGE';
  } else if (ownerRole === 'INFLUENCER' && isHotIntent) {
    influencerId = ownerIdVal; routingLabel = 'HOT'; ownerLabel = `Influencer: ${ownerFullName}`; referralCode = ownerRefCode || 'REF';
  } else if (ownerRole === 'TEAM_MEMBER') {
    influencerId = ownerIdVal; routingLabel = isHotIntent ? 'HOT' : 'COLD'; ownerLabel = `Team: ${ownerFullName}`; referralCode = ownerRefCode || 'TEAM';
  } else if (ownerRole === 'INFLUENCER') {
    if (ownerAssignedTo) {
      influencerId = ownerAssignedTo; ownerLabel = `Routed from Influencer: ${ownerFullName}`;
    } else {
      const adminId = await getAdminId(); if (!adminId) return [false, 'No fallback owner.'];
      influencerId = adminId; ownerLabel = `Routed from Influencer: ${ownerFullName} (no team)`;
    }
    routingLabel = 'COLD'; referralCode = ownerRefCode || 'REF';
  } else {
    const adminId = await getAdminId(); if (!adminId) return [false, 'No admin.'];
    influencerId = adminId; routingLabel = 'COLD'; ownerLabel = 'Admin (default)'; referralCode = 'HOMEPAGE';
  }
  const leadType = routingLabel === 'HOT' ? 'hot' : 'cold';
  const notesParts = [`Source: ${source}`, `Routing: ${routingLabel}`, `lead_type=${leadType}`, `Owner: ${ownerLabel}`];
  if (isHotIntent) notesParts.push(`Visit date: ${visitDateStr}`);
  if (extraMessage) notesParts.push(`Message: ${extraMessage}`);
  const notes = notesParts.join(' | ').slice(0, 1000);
  try {
    await c.from('candidates').insert({
      id: uuid(), full_name: fullName.slice(0, 255), phone_number: phoneNumber.slice(0, 50),
      country_of_interest: (countryOfInterest || '').slice(0, 100), notes,
      deployment_status: 'LEAD', influencer_id: influencerId,
      referral_code: referralCode.slice(0, 50), created_date: new Date().toISOString(),
    });
    return [true, 'Lead submitted.'];
  } catch (e: unknown) { return [false, String(e)]; }
}

export async function listLeads() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('candidates')
      .select('id,full_name,phone_number,country_of_interest,notes,deployment_status,influencer_id,referral_code,created_date')
      .order('created_date', { ascending: false }).limit(500);
    const rows = data || [];
    const ownerIds = [...new Set(rows.filter((r: Record<string,unknown>) => r.influencer_id).map((r: Record<string,unknown>) => r.influencer_id as string))];
    const ownersMap: Record<string, Record<string,unknown>> = {};
    if (ownerIds.length) {
      const { data: ud } = await c.from('users').select('id,full_name,role,email').in('id', ownerIds);
      for (const u of ud || []) ownersMap[u.id] = u;
    }
    return rows.map((r: Record<string, unknown>) => {
      const notes = (r.notes as string) || '';
      const meta = parseNotes(notes);
      const leadType = (meta.lead_type || '').toLowerCase();
      let source = (meta.source || '').toLowerCase();
      const ref = ((r.referral_code as string) || '').toUpperCase();
      if (!source) { source = ['HOMEPAGE','WEBSITE'].includes(ref) ? 'website' : ref === 'TEAM' ? 'staff' : 'influencer'; }
      const isHot = leadType === 'hot';
      const ownerId = (r.influencer_id as string) || '';
      const ownerUser = ownersMap[ownerId] || {};
      const ownerName = (ownerUser.full_name as string) || ((ownerUser.role as string) === 'ADMIN' || source === 'website' ? 'Admin (Homepage)' : '—');
      const status = ((r.deployment_status as string) || 'LEAD').toUpperCase();
      const created = (r.created_date as string) || '';
      let path = '';
      if (source === 'website') path = '/';
      else if (ref && !['HOMEPAGE','WEBSITE','TEAM'].includes(ref)) path = `/p/${ref}`;
      return { id: r.id, phone: r.phone_number, name: r.full_name || '', is_hot: isHot,
        owner: ownerName, owner_id: ownerId, status, source, path, created,
        country: r.country_of_interest || '', influencer_id: ownerId, referral_code: r.referral_code || '', notes };
    });
  } catch { return []; }
}

export async function transferLeadOwner(leadId: string, newOwnerId: string, newOwnerName: string): Promise<[boolean, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  try {
    const { data } = await c.from('candidates').select('notes').eq('id', leadId).limit(1);
    const curNotes = data?.[0]?.notes || '';
    const suffix = `admin_transfer=${new Date().toISOString()} | new_owner=${newOwnerName}`;
    const newNotes = (curNotes ? curNotes + ' | ' + suffix : suffix).slice(0, 1000);
    await c.from('candidates').update({ influencer_id: newOwnerId, notes: newNotes }).eq('id', leadId);
    return [true, `Transferred to ${newOwnerName}.`];
  } catch { return [false, 'Could not transfer.']; }
}

export async function markLeadConverted(leadId: string): Promise<[boolean, string]> {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  try { await c.from('candidates').update({ deployment_status: 'DEPLOYED' }).eq('id', leadId); return [true, 'Converted.']; }
  catch { return [false, 'Could not convert.']; }
}

export async function listMyLeads(userId: string) {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('candidates')
      .select('id,full_name,phone_number,country_of_interest,notes,deployment_status,influencer_id,referral_code,created_date')
      .eq('influencer_id', userId).order('created_date', { ascending: false });
    return (data || []).map((r: Record<string, unknown>) => {
      const notes = (r.notes as string) || '';
      const meta = parseNotes(notes);
      const leadType = (meta.lead_type || '').toLowerCase();
      let source = (meta.source || '').toLowerCase();
      const ref = ((r.referral_code as string) || '').toUpperCase();
      if (!source) source = ['HOMEPAGE','WEBSITE'].includes(ref) ? 'website' : 'influencer';
      const isHot = leadType === 'hot';
      const status = ((r.deployment_status as string) || 'LEAD').toUpperCase();
      return { id: r.id, phone: r.phone_number, name: r.full_name || '', is_hot: isHot, status, source,
        created: (r.created_date as string) || '', country: r.country_of_interest || '' };
    });
  } catch { return []; }
}

export async function listMyInfluencers(teamMemberId: string) {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data: inf } = await c.from('users')
      .select('id,full_name,email,phone_number,referral_code,status,tier')
      .eq('role', 'INFLUENCER').eq('assigned_to', teamMemberId);
    if (!inf?.length) return [];
    const ids = inf.map((u: Record<string,unknown>) => u.id);
    const { data: leads } = await c.from('candidates').select('influencer_id,deployment_status,notes').in('influencer_id', ids);
    const leadsMap: Record<string, { total: number; hot: number; cold: number; converted: number }> = {};
    for (const l of leads || []) {
      const oid = l.influencer_id;
      if (!leadsMap[oid]) leadsMap[oid] = { total: 0, hot: 0, cold: 0, converted: 0 };
      leadsMap[oid].total++;
      const meta = parseNotes(l.notes || '');
      const isHot = (meta.lead_type || '') === 'hot';
      if (isHot) leadsMap[oid].hot++; else leadsMap[oid].cold++;
      if ((l.deployment_status || '').toUpperCase() === 'DEPLOYED') leadsMap[oid].converted++;
    }
    const host = process.env.NEXT_PUBLIC_APP_URL || '';
    return inf.map((u: Record<string,unknown>) => {
      const stats = leadsMap[u.id as string] || { total: 0, hot: 0, cold: 0, converted: 0 };
      const code = (u.referral_code as string) || '';
      return { ...u, phone: u.phone_number || '', public_link: code ? `${host}/p/${code}` : '',
        total_leads: stats.total, hot_leads: stats.hot, cold_leads: stats.cold, converted: stats.converted };
    });
  } catch { return []; }
}

export async function listDigitalIdPages() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('users')
      .select('id,full_name,role,referral_code,status,tier,facebook_page,created_at,join_date')
      .in('role', ['TEAM_MEMBER', 'INFLUENCER']).order('created_at', { ascending: false });
    const host = process.env.NEXT_PUBLIC_APP_URL || '';
    return (data || []).filter((r: Record<string,unknown>) => r.referral_code).map((r: Record<string,unknown>) => {
      const role = (r.role as string || '').toUpperCase();
      const tier = (r.tier as string || '').toUpperCase();
      let theme = 'emerald';
      if (role === 'TEAM_MEMBER') theme = 'navy';
      else if (tier === 'GOLD') theme = 'gold';
      else if (tier === 'SILVER') theme = 'slate';
      return { id: r.id, slug: r.referral_code, name: r.full_name || '',
        specialty: role === 'TEAM_MEMBER' ? 'Staff Representative' : 'Brand Ambassador',
        theme, is_active: (r.status as string || 'ACTIVE').toUpperCase() === 'ACTIVE',
        views: 0, updated: (r.join_date || r.created_at || '') as string, role };
    });
  } catch { return []; }
}
