import { sendEmail } from './email';

export type CancellationEmailInput = { to: string; name?: string; accessUntil: number; test?: boolean; idempotencyKey?: string };
export function cancellationEmailContent({ name, accessUntil, test = false }: Omit<CancellationEmailInput, 'to' | 'idempotencyKey'>) {
  if (!Number.isFinite(accessUntil) || accessUntil <= 0) throw new Error('Missing cancellation access end');
  const date = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(accessUntil * 1000));
  const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const title = 'Reînnoirea automată a membershipului tău HiLex a fost oprită';
  const greeting = name?.trim() ? `Bună, ${name.trim().split(/\s+/)[0]}!` : 'Bună!';
  const notice = 'Acesta este un email de test, cu o dată demonstrativă. Niciun abonament nu a fost anulat sau modificat.';
  const access = `Accesul tău rămâne activ până la ${date} (ora UK), la încheierea perioadei curente.`;
  const renewal = 'Membershipul nu se va reînnoi automat la finalul acestei perioade. Eventualele sume deja datorate nu sunt anulate prin oprirea reînnoirii.';
  const url = `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://membersaccess.hilex.co.uk').replace(/\/$/,'')}/account`;
  return {
    subject: `${test ? '[TEST] ' : ''}Confirmare: reînnoirea membershipului HiLex a fost oprită`,
    text: [test ? notice : '', greeting, title, access, renewal, `Poți verifica detaliile în contul tău: ${url}`, 'Îți mulțumim că ai ales HiLex. Dacă ai întrebări, scrie-ne la membership@hilex.co.uk.', 'Echipa HiLex | Forest & Co Solicitors'].filter(Boolean).join('\n\n'),
    html: `<div style="background:#f5f6fa;padding:28px 12px"><div style="font-family:Arial,sans-serif;color:#101f42;line-height:1.6;max-width:620px;margin:auto;background:white;border-top:4px solid #bd287f;padding:32px 28px"><p style="font-size:30px;font-weight:700;margin:0 0 24px">Hi<span style="color:#bd287f">Lex</span></p>${test ? `<p style="background:#fdf0f7;padding:12px">${notice}</p>` : ''}<h1 style="font-size:26px;line-height:1.3">${title}</h1><p>${escape(greeting)}</p><p>${escape(access)}</p><p>${renewal}</p><p style="margin:28px 0"><a href="${escape(url)}" style="background:#bd287f;color:white;display:inline-block;padding:13px 22px;text-decoration:none;border-radius:6px">Vezi detaliile membershipului</a></p><p>Îți mulțumim că ai ales HiLex. Dacă ai întrebări, scrie-ne la <a href="mailto:membership@hilex.co.uk">membership@hilex.co.uk</a>.</p><p>Echipa HiLex</p><p style="font-size:12px;color:#647084;border-top:1px solid #dce3ee;padding-top:18px">HiLex este o platformă operată de Forest &amp; Co Solicitors.</p></div></div>`
  };
}
export async function sendCancellationEmail(input: CancellationEmailInput) {
  return sendEmail({ to: input.to, ...cancellationEmailContent(input), replyTo: 'membership@hilex.co.uk', idempotencyKey: input.idempotencyKey });
}
