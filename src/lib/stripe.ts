import Stripe from "stripe";

export type CheckoutPlan = "basic" | "premium" | "premium_upgrade";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

export function priceIdForPlan(plan: CheckoutPlan) {
  if (plan === "premium_upgrade") return process.env.STRIPE_PREMIUM_UPGRADE_PRICE_ID!;

  return plan === "premium" ? process.env.STRIPE_PREMIUM_PRICE_ID! : process.env.STRIPE_BASIC_PRICE_ID!;
}
