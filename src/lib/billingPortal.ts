import type Stripe from "stripe";

export async function ensureHiLexPortal(stripe: Stripe, siteUrl: string) {
  // Dedicated HiLex configuration: never changes the account-wide default portal.
  const configurations = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const existing = configurations.data.find(item => item.metadata?.hilex_portal === "renewal_v1");
  const configuration = existing || await stripe.billingPortal.configurations.create({
    metadata: { hilex_portal: "renewal_v1" },
    business_profile: { headline: "Gestionează membershipul HiLex" },
    default_return_url: `${siteUrl}/account`,
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end", proration_behavior: "none" },
      subscription_update: { enabled: false }
    }
  }, { idempotencyKey: "hilex-portal-renewal-v1" });
  if (!configuration.features.subscription_cancel.enabled || configuration.features.subscription_cancel.mode !== "at_period_end") {
    throw new Error("HiLex portal cancellation configuration must preserve paid access");
  }
  return configuration;
}
