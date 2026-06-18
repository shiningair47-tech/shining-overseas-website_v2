import { getSupabaseClient } from './supabase';
import { v4 as uuid } from 'uuid';

// ---- CIRCULARS ----
export async function listCirculars(onlyActive = false) {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    let q = c.from('circulars').select('*');
    if (onlyActive) q = q.eq('is_active', true);
    const { data } = await q.order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function upsertCircular(data: Record<string, unknown>, id = '') {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  const payload: Record<string, unknown> = {
    country: String(data.country || '').slice(0, 100),
    flag: String(data.flag || '').slice(0, 10),
    title: String(data.title || '').slice(0, 255),
    salary: String(data.salary || '').slice(0, 100),
    requirements: String(data.requirements || '').slice(0, 1000),
    is_active: data.is_active === true || data.is_active === 'on' || data.is_active === 'true',
  };
  try {
    if (id) await c.from('circulars').update(payload).eq('id', id);
    else { payload.id = uuid(); payload.created_at = new Date().toISOString(); await c.from('circulars').insert(payload); }
    return [true, 'Saved.'];
  } catch (e: unknown) { return [false, String(e)]; }
}

export async function deleteCircular(id: string) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('circulars').delete().eq('id', id); return true; } catch { return false; }
}

export async function toggleCircularActive(id: string, value: boolean) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('circulars').update({ is_active: value }).eq('id', id); return true; } catch { return false; }
}

// ---- FLIGHTS ----
export async function listFlights() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('recent_flights').select('*').order('flight_date', { ascending: false });
    return (data || []).map((r: Record<string, unknown>) => ({ ...r, flight_date: String(r.flight_date || '') }));
  } catch { return []; }
}

export async function upsertFlight(data: Record<string, unknown>, id = '') {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  const payload: Record<string, unknown> = {
    group_name: String(data.group_name || '').slice(0, 100),
    role: String(data.role || '').slice(0, 100),
    origin: String(data.origin || '').toUpperCase().slice(0, 10),
    destination: String(data.destination || '').toUpperCase().slice(0, 10),
    route: String(data.route || '').slice(0, 200),
    flight_date: data.flight_date || null,
  };
  try {
    if (id) await c.from('recent_flights').update(payload).eq('id', id);
    else { payload.id = uuid(); payload.created_at = new Date().toISOString(); await c.from('recent_flights').insert(payload); }
    return [true, 'Saved.'];
  } catch (e: unknown) { return [false, String(e)]; }
}

export async function deleteFlight(id: string) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('recent_flights').delete().eq('id', id); return true; } catch { return false; }
}

// ---- AWARDS ----
export async function listAwards() {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    const { data } = await c.from('awards').select('*').order('sort_order', { ascending: true });
    return data || [];
  } catch { return []; }
}

export async function upsertAward(data: Record<string, unknown>, id = '') {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  const payload: Record<string, unknown> = {
    title: String(data.title || '').slice(0, 255),
    issuer: String(data.issuer || '').slice(0, 255),
    year: String(data.year || '').slice(0, 10),
    description: String(data.description || '').slice(0, 1000),
    image_url: String(data.image_url || '').slice(0, 500),
    sort_order: parseInt(String(data.sort_order || '0')) || 0,
  };
  try {
    if (id) await c.from('awards').update(payload).eq('id', id);
    else { payload.id = uuid(); payload.created_at = new Date().toISOString(); await c.from('awards').insert(payload); }
    return [true, 'Saved.'];
  } catch (e: unknown) { return [false, String(e)]; }
}

export async function deleteAward(id: string) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('awards').delete().eq('id', id); return true; } catch { return false; }
}

// ---- TESTIMONIALS ----
export async function listTestimonials(onlyFeatured = false) {
  const c = getSupabaseClient(); if (!c) return [];
  try {
    let q = c.from('testimonials').select('*');
    if (onlyFeatured) q = q.eq('is_featured', true);
    const { data } = await q.order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function upsertTestimonial(data: Record<string, unknown>, id = '') {
  const c = getSupabaseClient(); if (!c) return [false, 'No DB'];
  const payload: Record<string, unknown> = {
    quote: String(data.quote || '').slice(0, 1000),
    name: String(data.name || '').slice(0, 255),
    role: String(data.role || '').slice(0, 255),
    country: String(data.country || '').slice(0, 100),
    image_url: String(data.image_url || '').slice(0, 500),
    is_featured: data.is_featured === true || data.is_featured === 'on' || data.is_featured === 'true',
  };
  try {
    if (id) await c.from('testimonials').update(payload).eq('id', id);
    else { payload.id = uuid(); payload.created_at = new Date().toISOString(); await c.from('testimonials').insert(payload); }
    return [true, 'Saved.'];
  } catch (e: unknown) { return [false, String(e)]; }
}

export async function deleteTestimonial(id: string) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('testimonials').delete().eq('id', id); return true; } catch { return false; }
}

export async function toggleTestimonialFeatured(id: string, value: boolean) {
  const c = getSupabaseClient(); if (!c) return false;
  try { await c.from('testimonials').update({ is_featured: value }).eq('id', id); return true; } catch { return false; }
}
