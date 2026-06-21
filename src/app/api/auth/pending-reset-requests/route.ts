import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchUserById } from '@/lib/auth';

async function cleanupStaleResetRequests(client: ReturnType<typeof getSupabaseClient>) {
  if (!client) return;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await client
    .from('settings')
    .select('key,value')
    .like('key', 'password_reset_request:%');
  for (const row of data || []) {
    try {
      const parsed = JSON.parse(row.value);
      if (parsed.created_at && parsed.created_at < cutoff) {
        await client.from('settings').delete().eq('key', row.key);
      }
    } catch { /* skip malformed */ }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminUser = await fetchUserById(userId);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = getSupabaseClient();
    if (!client) return NextResponse.json([]);

    // Clean up stale requests older than 24 hours
    await cleanupStaleResetRequests(client);

    const { data } = await client
      .from('settings')
      .select('key,value')
      .like('key', 'password_reset_request:%');

    const requests: { email: string; created_at: string }[] = [];

    for (const row of data || []) {
      try {
        const parsed = JSON.parse(row.value);
        if (parsed.status === 'pending') {
          requests.push({
            email: parsed.email,
            created_at: parsed.created_at,
          });
        }
      } catch {
        // Skip malformed entries
      }
    }

    // Sort newest first
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
