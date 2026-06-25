import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { emailButtonHtml, sendEmail } from "@/lib/email";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://membersaccess.hilex.co.uk";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function createPasswordLink(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${siteUrl()}/auth/update-password`
    }
  });

  if (error) {
    throw error;
  }

  const actionLink = data.properties?.action_link;

  if (!actionLink) {
    throw new Error("Supabase did not return an action link");
  }

  return actionLink;
}

function emailShell(title: string, intro: string, buttonLabel: string, actionLink: string, extra: string) {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeButtonLabel = escapeHtml(buttonLabel);
  const safeActionLink = escapeHtml(actionLink);
  const safeExtra = escapeHtml(extra);

  return `
    <div style="background:#f6f7fb;margin:0;padding:28px 0;">
      <div style="background:#ffffff;color:#080b3f;font-family:Arial,sans-serif;margin:0 auto;max-width:640px;padding:34px;">
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">${safeTitle}</h1>
        <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 12px;">${safeIntro}</p>
        ${emailButtonHtml(safeButtonLabel, safeActionLink)}
        <p style="color:#33384d;font-size:15px;line-height:1.6;margin:0 0 12px;">${safeExtra}</p>
        <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
          Daca butonul nu functioneaza, copiaza linkul acesta in browser:<br />
          <a href="${safeActionLink}" style="color:#c9287a;">${safeActionLink}</a>
        </p>
      </div>
    </div>
  `;
}

export async function sendWelcomePasswordEmail(email: string, name?: string | null) {
  const actionLink = await createPasswordLink(email);
  const greeting = name ? `Buna, ${name},` : "Buna,";
  const subject = "Bun venit la HILEX - seteaza parola contului tau";
  const text = [
    greeting,
    "",
    "Abonamentul tau HILEX este activ si contul tau de membru a fost creat.",
    "Seteaza parola pentru a intra in platforma si pentru a accesa resursele incluse in pachetul tau.",
    "",
    actionLink,
    "",
    "Daca nu ai facut aceasta achizitie, te rugam sa ne contactezi la membership@hilex.co.uk."
  ].join("\n");

  await sendEmail({
    to: email,
    subject,
    text,
    html: emailShell(
      "Bun venit la HILEX",
      `${greeting} abonamentul tau HILEX este activ si contul tau de membru a fost creat.`,
      "Seteaza parola si intra in platforma",
      actionLink,
      "Dupa setarea parolei, vei putea intra in Resurse HiLex si vei vedea materialele disponibile pentru pachetul tau."
    )
  });
}

export async function sendForgotPasswordEmail(email: string) {
  const actionLink = await createPasswordLink(email);
  const subject = "Resetare parola HILEX";
  const text = [
    "Buna,",
    "",
    "Am primit o cerere de resetare a parolei pentru contul tau HILEX.",
    "Alege o parola noua folosind linkul de mai jos:",
    "",
    actionLink,
    "",
    "Daca nu ai cerut resetarea parolei, poti ignora acest email."
  ].join("\n");

  await sendEmail({
    to: email,
    subject,
    text,
    html: emailShell(
      "Resetare parola HILEX",
      "Am primit o cerere de resetare a parolei pentru contul tau HILEX.",
      "Seteaza o parola noua",
      actionLink,
      "Daca nu ai cerut resetarea parolei, poti ignora acest email. Contul tau ramane in siguranta."
    )
  });
}
