import { NextResponse } from "next/server";
import { priceIdForPlan, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const plan = String(formData.get("plan") || "basic") === "premium" ? "premium" : "basic";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const priceId = priceIdForPlan(plan);

    if (!siteUrl || !priceId) {
      return NextResponse.json(
        { error: "Missing checkout configuration", plan },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { plan }
      },
      metadata: { plan },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
