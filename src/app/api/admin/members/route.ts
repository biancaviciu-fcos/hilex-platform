import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';
import { hasAdminPanelAccess } from '@/lib/adminAccess';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { memberDirectory } from '@/lib/memberDirectory';
export const dynamic = 'force-dynamic';
export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Autentifică-te din nou.' }, { status: 401, headers });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!isAdminUser(profile?.role, user.email) || !(await hasAdminPanelAccess())) return NextResponse.json({ error: 'Acces rezervat administratorilor.' }, { status: 403, headers });
  try {
    const db = createSupabaseAdminClient();
    // Read every batch: Supabase otherwise truncates results at its row limit.
    const profiles = [];
    const subscriptions = [];
    for (let start = 0; ; start += 500) {
      const { data, error } = await db.from('profiles').select('id,full_name,email').order('id').range(start, start + 499);
      if (error) throw error;
      profiles.push(...(data || []));
      if (!data || data.length < 500) break;
    }
    for (let start = 0; ; start += 500) {
      const { data, error } = await db.from('subscriptions').select('user_id,access_level,status,current_period_end,cancel_at_period_end,created_at').order('id').range(start, start + 499);
      if (error) throw error;
      subscriptions.push(...(data || []));
      if (!data || data.length < 500) break;
    }
    return NextResponse.json({ members: memberDirectory(profiles, subscriptions), updatedAt: new Date().toISOString() }, { headers });
  } catch {
    return NextResponse.json({ error: 'Lista nu a putut fi actualizată. Reîncearcă.' }, { status: 500, headers });
  }
}
