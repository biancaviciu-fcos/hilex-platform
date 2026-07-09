import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToAdmin(request, "emailTest=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAdminUser(profile?.role, user.email) || !(await hasAdminPanelAccess())) {
    return redirectToAdmin(request, "emailTest=forbidden");
  }

  const to = profile?.email || user.email;

  if (!to) {
    return redirectToAdmin(request, "emailTest=missing-email");
  }

  try {
    await sendEmail({
      to,
      subject: "Test email HILEX",
      text: "Dacă ai primit acest email, Resend este configurat corect pentru HILEX.",
      html: `
        <div style="font-family:Arial,sans-serif;color:#05083f;line-height:1.55;max-width:620px;margin:0 auto;padding:28px;">
          <h1>Test email HILEX</h1>
          <p>Dacă ai primit acest email, Resend este configurat corect pentru HILEX.</p>
        </div>
      `
    });

    return redirectToAdmin(request, "emailTest=sent");
  } catch (error) {
    console.error("HILEX admin test email failed", error);
    return redirectToAdmin(request, "emailTest=failed");
  }
}

function redirectToAdmin(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/admin?${query}`, request.url));
}
