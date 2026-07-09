import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export type CheckoutPlan = "basic" | "premium" | "premium_upgrade";

export function priceIdForPlan(plan: CheckoutPlan) {
  if (plan === "premium_upgrade") return process.env.STRIPE_PREMIUM_UPGRADE_PRICE_ID!;

  return plan === "premium" ? process.env.STRIPE_PREMIUM_PRICE_ID! : process.env.STRIPE_BASIC_PRICE_ID!;
}
