import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://membersaccess.hilex.co.uk";

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.redirect(`${siteUrl}/login`, { status: 303 });

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.redirect(`${siteUrl}/account?billing=missing`, { status: 303 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/account`
    });

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (error) {
    console.error("HILEX billing portal failed", error);
    return NextResponse.redirect(`${siteUrl}/account?billing=error`, { status: 303 });
  }
}
