import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export function priceIdForPlan(plan: "basic" | "premium") {
  return plan === "premium"
    ? process.env.STRIPE_PREMIUM_PRICE_ID!
    : process.env.STRIPE_BASIC_PRICE_ID!;
}
