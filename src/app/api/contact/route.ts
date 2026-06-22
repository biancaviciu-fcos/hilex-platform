import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const topic = clean(formData.get("topic"));
  const message = clean(formData.get("message"));

  if (!name || !email || !message) {
    return NextResponse.redirect(new URL("/contact?error=missing", request.url), { status: 303 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || "membership@hilex.co.uk";
  const from = process.env.EMAIL_FROM || "HILEX <no-reply@hilex.co.uk>";

  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY for contact form");
    return NextResponse.redirect(new URL("/contact?error=email", request.url), { status: 303 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  const text = [
    "Mesaj nou din formularul HILEX.",
    "",
    `Nume: ${name}`,
    `Email completat: ${email}`,
    `Email cont HILEX: ${profile?.email || user.email || "necunoscut"}`,
    `User ID: ${user.id}`,
    `Subiect: ${topic || "Nespecificat"}`,
    "",
    "Mesaj:",
    message
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `HILEX contact: ${topic || "Mesaj membru"}`,
      text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Contact email failed", errorText);
    return NextResponse.redirect(new URL("/contact?error=email", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/contact?sent=1", request.url), { status: 303 });
}
