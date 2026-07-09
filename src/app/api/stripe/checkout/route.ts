import { NextResponse } from "next/server";
import { type CheckoutPlan, priceIdForPlan, stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const requestedPlan = String(formData.get("plan") || "basic");
    const checkoutPlan: CheckoutPlan =
      requestedPlan === "premium_upgrade" ? "premium_upgrade" : requestedPlan === "premium" ? "premium" : "basic";
    const accessPlan = checkoutPlan === "basic" ? "basic" : "premium";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const marketingSiteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL || siteUrl;
    const priceId = priceIdForPlan(checkoutPlan);
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!siteUrl || !priceId) {
      return NextResponse.json(
        { error: "Missing checkout configuration", plan: checkoutPlan },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: checkoutPlan === "premium_upgrade" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      ...(checkoutPlan === "premium_upgrade" ? {} : { subscription_data: { metadata: { plan: accessPlan } } }),
      customer_email: user?.email,
      metadata: { plan: accessPlan, checkout_plan: checkoutPlan, user_id: user?.id || "" },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: checkoutPlan === "premium_upgrade" ? `${siteUrl}/library` : `${marketingSiteUrl}/#pachete`
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
