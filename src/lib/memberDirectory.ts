export type DirectorySubscription = { user_id: string; access_level: string; status: string; current_period_end: string | null; cancel_at_period_end: boolean | null; created_at: string };
export type DirectoryProfile = { id: string; full_name: string | null; email: string | null };
export type DirectoryMember = { id: string; name: string; email: string; plan: string; status: string; expiresAt: string | null; renewal: string };
export function memberDirectory(profiles: DirectoryProfile[], subscriptions: DirectorySubscription[], now = Date.now()): DirectoryMember[] {
  const grouped = new Map<string, DirectorySubscription[]>();
  for (const sub of subscriptions) grouped.set(sub.user_id, [...(grouped.get(sub.user_id) || []), sub]);
  const active = (s: DirectorySubscription) => ['active', 'trialing'].includes(s.status) && (!s.current_period_end || Date.parse(s.current_period_end) > now);
  const labels: Record<string, string> = { active: 'Activ', trialing: 'În probă', past_due: 'Plată întârziată', canceled: 'Anulat', unpaid: 'Neachitat', incomplete: 'Activare incompletă', incomplete_expired: 'Activare expirată', paused: 'Pauzat' };
  return profiles.map(p => {
    const subs = (grouped.get(p.id) || []).sort((a, b) => Number(active(b)) - Number(active(a)) || (active(a) && active(b) ? Number(b.access_level === 'premium') - Number(a.access_level === 'premium') : 0) || Date.parse(b.created_at) - Date.parse(a.created_at));
    const s = subs[0];
    const expired = s && ['active', 'trialing'].includes(s.status) && !active(s);
    return { id: p.id, name: p.full_name || '—', email: p.email || '', plan: s ? s.access_level === 'premium' ? 'Premium' : 'Essential' : 'Fără abonament', status: s ? expired ? 'Expirat' : labels[s.status] || s.status : 'Fără abonament', expiresAt: s?.current_period_end || null, renewal: !s || !active(s) ? '—' : s.cancel_at_period_end ? 'Oprită' : 'Activă' };
  });
}
export function membersCsv(rows: DirectoryMember[]) {
  const cell = (value: string) => '"' + (/^[\s]*[=+@-]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
  return '\uFEFF' + [['Nume', 'Email', 'Pachet', 'Status', 'Acces până la (UTC)', 'Reînnoire'], ...rows.map(r => [r.name, r.email, r.plan, r.status, r.expiresAt || '', r.renewal])].map(row => row.map(cell).join(',')).join('\r\n');
}
