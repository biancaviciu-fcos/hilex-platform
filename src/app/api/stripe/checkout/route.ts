import { NextResponse } from "next/server";
import { priceIdForPlan, stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = String(formData.get("plan") || "basic") === "premium" ? "premium" : "basic";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
    allow_promotion_codes: true,
    customer_creation: "always",
    subscription_data: {
      metadata: { plan }
    },
    metadata: { plan },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pricing`
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
