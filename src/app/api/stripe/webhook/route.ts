import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseAdminClient();
  const customerId = String(session.customer || "");
  const subscriptionId = String(session.subscription || "");
  const email = session.customer_details?.email;
  const name = session.customer_details?.name;
  const plan = session.metadata?.plan === "premium" ? "premium" : "basic";

  if (!email || !subscriptionId) return;

  const { data: existingUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let userId = existingUsers.users.find((item) => item.email === email)?.id;

  if (!userId) {
    const { data: invitedUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name || "" },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
    });

    if (inviteError) {
      console.error("HILEX invite user failed", inviteError);
      return;
    }

    userId = invitedUser.user?.id;
  }

  if (!userId) return;

  await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: name,
    role: "member"
  });

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    access_level: plan,
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: subscription.items.data[0]?.price.id,
    current_period_start: toIso(subscription.current_period_start),
    current_period_end: toIso(subscription.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createSupabaseAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: toIso(subscription.current_period_start),
      current_period_end: toIso(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_subscription_id", subscription.id);
}

function toIso(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}
