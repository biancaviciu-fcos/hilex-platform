import { createHash } from 'node:crypto';

// Best-effort per-instance abuse control; requests are also subject to Vercel's firewall.
const attempts = new Map();
const windowMs = 15 * 60 * 1000;
const topics = new Set(['Despre membership', 'Alegerea pachetului', 'Acces la cont', 'Programarea unei consultații', 'Altă întrebare']);
const origins = new Set(['https://www.hilex.co.uk', 'https://hilex.co.uk']);
const errorMessage = 'Nu am putut trimite mesajul. Încearcă din nou sau scrie-ne la membership@hilex.co.uk.';
function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
    if (!origins.has(request.headers.get('origin'))) return json({ error: 'Cerere nepermisă.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Format nevalid.' }, 415);
    if (Number(request.headers.get('content-length')) > 16000) return json({ error: 'Mesajul este prea lung.' }, 413);
    let raw;
    try {
      // Bound streamed bodies too, rather than trusting the Content-Length header.
      const reader = request.body?.getReader();
      if (!reader) return json({ error: 'Completează formularul.' }, 400);
      const chunks = [];
      let length = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 16000) { await reader.cancel(); return json({ error: 'Mesajul este prea lung.' }, 413); }
        chunks.push(value);
      }
      raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return json({ error: 'Completează formularul și încearcă din nou.' }, 400); }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return json({ error: 'Format nevalid.' }, 400);
    if (raw.website) return json({ ok: true });
    const clean = (key) => typeof raw[key] === 'string' ? raw[key].trim() : '';
    const name = clean('name'), email = clean('email'), topic = clean('topic'), message = clean('message'), id = clean('submissionId');
    if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name) || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !topics.has(topic) || message.length < 10 || message.length > 4000 || !/^[a-f0-9-]{36}$/i.test(id)) {
      return json({ error: 'Verifică numele, adresa de e-mail, subiectul și mesajul (10–4.000 de caractere).' }, 400);
    }
    const key = process.env.RESEND_API_KEY;
    if (!key) return json({ error: errorMessage }, 503);
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.until < now) attempts.delete(ip);
    const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
    const bucket = createHash('sha256').update(ip).digest('hex');
    const entry = attempts.get(bucket) || { count: 0, until: now + windowMs };
    if (entry.count >= 5) return json({ error: 'Ai trimis mai multe solicitări. Încearcă din nou peste 15 minute sau contactează-ne prin e-mail.' }, 429, { 'Retry-After': '900' });
    if (attempts.size >= 5000 && !attempts.has(bucket)) return json({ error: errorMessage }, 503);
    entry.count++; attempts.set(bucket, entry);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `hilex-contact-${id}` },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'HiLex <membership@hilex.co.uk>',
          to: ['membership@hilex.co.uk'],
          reply_to: email,
          subject: `HiLex Contact — ${topic}`,
          text: `Mesaj nou de pe www.hilex.co.uk/contact.html\n\nNume: ${name}\nE-mail: ${email}\nSubiect: ${topic}\n\n${message}`
        }),
        signal: AbortSignal.timeout(12000)
      });
      const result = await response.json();
      if (!response.ok || !result.id) return json({ error: errorMessage }, 502);
      return json({ ok: true });
    } catch { return json({ error: errorMessage }, 502); }
  }
};
