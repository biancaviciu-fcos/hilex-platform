'use client';
import { useEffect, useMemo, useState } from 'react';
import { membersCsv, type DirectoryMember } from '@/lib/memberDirectory';
export function MembersDirectory() {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [updated, setUpdated] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    async function update() {
      if (busy) return;
      busy = true;
      try {
        const response = await fetch('/api/admin/members', { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) { setMembers([]); setUpdated(''); }
          throw new Error(data.error || 'Actualizarea a eșuat.');
        }
        setMembers(data.members); setUpdated(data.updatedAt); setError('');
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Actualizarea a eșuat.'); }
      finally { busy = false; }
    }
    void update();
    const timer = window.setInterval(() => { if (!document.hidden) void update(); }, 30000);
    const focus = () => { void update(); };
    window.addEventListener('focus', focus);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [refresh]);
  const filtered = useMemo(() => members.filter(m => (!plan || m.plan === plan) && `${m.name} ${m.email} ${m.status}`.toLocaleLowerCase('ro').includes(query.toLocaleLowerCase('ro'))), [members, query, plan]);
  const lastPage = Math.max(0, Math.ceil(filtered.length / 50) - 1);
  const current = Math.min(page, lastPage);
  function download() {
    const url = URL.createObjectURL(new Blob([membersCsv(filtered)], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `hilex-membri-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="card">
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end' }}>
      <label>Caută nume, email sau status<input type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} /></label>
      <label>Pachet<select value={plan} onChange={e => { setPlan(e.target.value); setPage(0); }}><option value="">Toate</option><option>Essential</option><option>Premium</option><option>Fără abonament</option></select></label>
      <button className="btn" onClick={() => setRefresh(r => r + 1)}>Actualizează acum</button>
      <button className="btn primary" disabled={!updated || !!error} onClick={download}>Export CSV ({filtered.length})</button>
    </div>
    <p role="status">{updated ? `${filtered.length} conturi · Ultima actualizare: ${new Date(updated).toLocaleString('ro-RO')}` : error ? 'Date indisponibile.' : 'Se încarcă…'}</p>
    {error && <p role="alert" className="error-box">{error} {updated && 'Datele afișate sunt de la ultima actualizare reușită.'}</p>}
    <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', textAlign: 'left', borderSpacing: '12px' }}><caption style={{ textAlign: 'left' }}>Evidența conturilor HiLex</caption><thead><tr>{['Nume', 'Email', 'Pachet', 'Status', 'Acces până la (UK)', 'Reînnoire'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{filtered.slice(current * 50, current * 50 + 50).map(m => <tr key={m.id}><td>{m.name}</td><td>{m.email || '—'}</td><td>{m.plan}</td><td>{m.status}</td><td>{m.expiresAt ? new Date(m.expiresAt).toLocaleString('ro-RO', { timeZone: 'Europe/London' }) : '—'}</td><td>{m.renewal}</td></tr>)}</tbody></table></div>
    {updated && !filtered.length && <p>Niciun cont găsit.</p>}
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><button className="btn" disabled={current === 0} onClick={() => setPage(current - 1)}>Înapoi</button><span>Pagina {current + 1} din {lastPage + 1}</span><button className="btn" disabled={current === lastPage} onClick={() => setPage(current + 1)}>Înainte</button></div>
    <p className="muted">Exportul include rezultatele filtrate. Această evidență nu reprezintă acord pentru newsletter.</p>
  </section>;
}
