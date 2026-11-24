import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminUser } from '@/lib/admin';
import { hasAdminPanelAccess } from '@/lib/adminAccess';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MembersDirectory } from '@/components/MembersDirectory';
export const dynamic = 'force-dynamic';
export default async function MembersPage() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
  if (!isAdminUser(profile?.role, user.email)) redirect('/library');
  if (!(await hasAdminPanelAccess())) redirect('/admin/access?next=/admin/members');
  return <main className="page"><section className="section"><div className="inner"><Link href="/admin">← Administrare</Link><h1>Membri</h1><p>Toate conturile înregistrate, inclusiv cele fără abonament activ. Lista se actualizează la fiecare 30 de secunde cât timp pagina este deschisă.</p><MembersDirectory /></div></section></main>;
}
