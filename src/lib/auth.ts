import { getSupabaseClient } from './supabase';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone_number: string;
  referral_code: string;
  status: string;
  tier: string;
  assigned_to: string;
  facebook_page: string;
  password_hash?: string;
}

export async function fetchUserByEmail(email: string): Promise<UserRecord | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.from('users')
      .select('id,email,password_hash,role,full_name,phone_number,referral_code,status,tier,assigned_to,facebook_page')
      .eq('email', email.trim().toLowerCase()).limit(1);
    return data?.[0] || null;
  } catch { return null; }
}

export async function fetchUserById(id: string): Promise<UserRecord | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.from('users')
      .select('id,email,role,full_name,phone_number,referral_code,status,tier,assigned_to,facebook_page')
      .eq('id', id).limit(1);
    return data?.[0] || null;
  } catch { return null; }
}

export async function fetchUserByReferralCode(code: string): Promise<UserRecord | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.from('users')
      .select('id,email,role,full_name,phone_number,referral_code,status,tier,assigned_to,facebook_page')
      .eq('referral_code', code).limit(1);
    return data?.[0] || null;
  } catch { return null; }
}

export async function fetchAdminId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.from('users').select('id').eq('role', 'ADMIN').limit(1);
    return data?.[0]?.id || null;
  } catch { return null; }
}

function verifyPbkdf2(plain: string, hash: string): boolean {
  try {
    const crypto = require('crypto');
    const h = hash.trim();
    if (h.toLowerCase().startsWith('pbkdf2_sha256$')) {
      const parts = h.split('$');
      if (parts.length !== 4) return false;
      const iterations = parseInt(parts[1]);
      // This deployment's salts are base64-encoded raw bytes (not Django's usual
      // plain alphanumeric string) — confirmed against a real stored hash.
      // Decode the salt to bytes before passing to PBKDF2.
      const salt = Buffer.from(parts[2], 'base64');
      let b64 = parts[3];
      while (b64.length % 4 !== 0) b64 += '=';
      const expected = Buffer.from(b64, 'base64');
      const derived = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256');
      if (derived.length !== expected.length) return false;
      return crypto.timingSafeEqual(derived, expected);
    }
    if (h.toLowerCase().startsWith('pbkdf2')) {
      const parts = h.split('$');
      if (parts.length !== 3) return false;
      const [method, salt, hashHex] = parts;
      const methodParts = method.split(':');
      const algo = methodParts[1]?.toLowerCase() || 'sha256';
      const iterations = methodParts[2] ? parseInt(methodParts[2]) : 260000;
      const expected = Buffer.from(hashHex, 'hex');
      const derived = crypto.pbkdf2Sync(plain, salt, iterations, expected.length, algo);
      return crypto.timingSafeEqual(derived, expected);
    }
  } catch {}
  return false;
}

export function verifyPassword(plain: string, hash: string): boolean {
  if (!plain || !hash) return false;
  if (hash.startsWith('$2')) {
    try { return bcrypt.compareSync(plain, hash); } catch {}
  }
  if (hash.toLowerCase().startsWith('pbkdf2')) return verifyPbkdf2(plain, hash);
  return plain === hash;
}

export async function updateUserProfile(userId: string, fullName: string, phone: string, facebook: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    await client.from('users').update({ full_name: fullName, phone_number: phone, facebook_page: facebook }).eq('id', userId);
    return true;
  } catch { return false; }
}

export async function ensureReferralCode(userId: string, fullName: string): Promise<string> {
  const client = getSupabaseClient();
  if (!client) return '';
  try {
    const { data } = await client.from('users').select('referral_code,role').eq('id', userId).limit(1);
    const row = data?.[0];
    if (!row) return '';
    if (row.referral_code) return row.referral_code;
    const code = await generateUniqueCode(fullName);
    await client.from('users').update({ referral_code: code }).eq('id', userId);
    return code;
  } catch { return ''; }
}

async function generateUniqueCode(name: string): Promise<string> {
  const client = getSupabaseClient();
  const base = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'REF';
  for (let i = 0; i < 8; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    const code = `${base}${suffix}`;
    if (client) {
      const { data } = await client.from('users').select('id').eq('referral_code', code).limit(1);
      if (!data?.length) return code;
    } else return code;
  }
  const { randomBytes } = require('crypto');
  return `REF${randomBytes(4).toString('hex').toUpperCase()}`;
}
