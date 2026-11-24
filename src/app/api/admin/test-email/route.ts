import { NextResponse } from "next/server";
import { sendMembershipWelcomeEmail } from "@/lib/membershipEmail";
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
    const form = await request.formData();
    const plan = form.get("plan") === "premium" ? "premium" : "basic";
    const result = await sendMembershipWelcomeEmail({
      to,
      plan,
      test: true
    });
    console.log("HILEX admin welcome email test accepted", { emailId: result.id, plan });

    return redirectToAdmin(request, "emailTest=sent");
  } catch (error) {
    console.error("HILEX admin test email failed", error);
    return redirectToAdmin(request, "emailTest=failed");
  }
}

function redirectToAdmin(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/admin?${query}`, request.url), 303);
}
