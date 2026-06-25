type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "HILEX <membership@hilex.co.uk>";

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  if (!response.ok) {
    throw new Error(`Resend email failed (${response.status}): ${await response.text()}`);
  }
}

export function emailButtonHtml(label: string, href: string) {
  return `
    <p style="margin: 28px 0;">
      <a href="${href}" style="background:#c9287a;color:#ffffff;display:inline-block;font-family:Arial,sans-serif;font-size:16px;font-weight:700;padding:14px 22px;text-decoration:none;">
        ${label}
      </a>
    </p>
  `;
}
