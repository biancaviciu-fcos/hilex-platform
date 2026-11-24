import { readFile } from "node:fs/promises";
import path from "node:path";
import { sendEmail } from "./email";

type MembershipEmailInput = {
  to: string;
  plan: "basic" | "premium";
  name?: string;
  upgrade?: boolean;
  test?: boolean;
};

export async function sendMembershipWelcomeEmail({ to, plan, name, upgrade = false, test = false }: MembershipEmailInput) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://membersaccess.hilex.co.uk";
  const platformUrl = `${siteUrl.replace(/\/$/, "")}${plan === "premium" ? "/" : "/essential"}`;
  const planLabel = plan === "premium" ? "Premium" : "Essential";
  const greeting = name?.trim() ? `Bună, ${name.trim().split(/\s+/)[0]}!` : "Bună!";
  const headline = upgrade ? "Felicitări, planul tău HiLex este acum Premium" : `Bun venit în HiLex ${planLabel}`;
  const intro = upgrade ? "Upgrade-ul tău a fost activat cu succes." : "Abonamentul tău a fost activat cu succes.";
  const details = plan === "premium"
    ? "Ai acces la materialele Premium, explicații, întrebări și resurse exclusive, inclusiv ghidurile PDF disponibile în platformă."
    : "Ai acces la materialele video HiLex Essential, atent selectate și organizate pe arii de drept.";
  const buttonLabel = plan === "premium" ? "Intră în HiLex Premium" : "Intră în HiLex Essential";
  const guide = await readFile(path.join(process.cwd(), "assets", "email", "Ghid-HiLex.pdf"));

  if (guide.subarray(0, 5).toString() !== "%PDF-" || guide.length > 5 * 1024 * 1024) {
    throw new Error("The HiLex member guide must be a valid PDF under 5 MB");
  }

  const testNotice = "Acesta este un email de test. Contul, parola și abonamentul tău nu au fost modificate.";
  const guideNotice = "Am atașat Ghidul membrului HiLex la acest email. Îți arată, pas cu pas, cum intri în cont, găsești materialele, salvezi favoritele și accesezi creditul de consultanță și facturile.";
  const accessNotice = "Dacă este prima dată când intri în HiLex, vei primi separat emailul pentru setarea parolei. Dacă ai deja cont, folosește parola existentă.";
  const subject = upgrade ? "Planul tău HiLex a fost upgradat la Premium" : `Bun venit în HiLex ${planLabel}`;
  const html = `
    <div style="background:#f5f6fa;padding:28px 12px;">
      <div style="font-family:Arial,sans-serif;color:#101f42;line-height:1.6;max-width:620px;margin:0 auto;background:#ffffff;border-top:4px solid #df0077;padding:32px 28px;">
        <p style="font-size:30px;font-weight:700;margin:0 0 24px;">Hi<span style="color:#df0077;">Lex</span></p>
        ${test ? `<p style="background:#fdf0f7;padding:12px;font-size:14px;">${testNotice}</p>` : ""}
        <h1 style="font-size:27px;line-height:1.25;margin:0 0 22px;">${escapeHtml(headline)}</h1>
        <p>${escapeHtml(greeting)}</p>
        <p>${intro} ${details}</p>
        <p>Planul tău: <strong>${planLabel}</strong></p>
        <div style="border-left:3px solid #df0077;padding:4px 0 4px 16px;margin:24px 0;">
          <p style="margin:0 0 6px;font-weight:700;">Ghidul tău de utilizare este atașat</p>
          <p style="margin:0;">${guideNotice}</p>
        </div>
        <p>${accessNotice}</p>
        <p style="margin:28px 0;"><a href="${escapeHtml(platformUrl)}" style="background:#101f42;color:#ffffff;display:inline-block;padding:13px 22px;text-decoration:none;border-radius:4px;font-weight:700;">${buttonLabel}</a></p>
        <p>Ai nevoie de ajutor? Scrie-ne la <a style="color:#df0077;" href="mailto:membership@hilex.co.uk">membership@hilex.co.uk</a> sau sună la <a style="color:#101f42;" href="tel:+447944914381">+44 7944 914381</a>.</p>
        <p>Mulțumim,<br/>Echipa HiLex</p>
        <p style="font-size:12px;color:#647084;border-top:1px solid #dce3ee;padding-top:18px;margin-top:28px;">HiLex este o platformă operată de Forest &amp; Co Solicitors.</p>
      </div>
    </div>`;

  return sendEmail({
    to,
    subject: `${test ? "[TEST] " : ""}${subject}`,
    text: [test ? testNotice : "", headline, greeting, intro, details, `Planul tău: ${planLabel}`, guideNotice, accessNotice, `${buttonLabel}: ${platformUrl}`, "Ai nevoie de ajutor? membership@hilex.co.uk | +44 7944 914381", "Echipa HiLex | Forest & Co Solicitors"].filter(Boolean).join("\n\n"),
    html,
    replyTo: "membership@hilex.co.uk",
    attachments: [{ filename: "Ghid HiLex.pdf", content: guide.toString("base64") }]
  });
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
