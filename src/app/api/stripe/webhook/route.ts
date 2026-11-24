import { sendCancellationEmail } from "@/lib/cancellationEmail";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendMembershipWelcomeEmail as deliverMembershipWelcomeEmail } from "@/lib/membershipEmail";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("HILEX Stripe webhook received", {
    type: event.type,
    id: event.id
  });

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseAdminClient();
  const customerId = String(session.customer || "");
  const subscriptionId = String(session.subscription || "");
  const checkoutPlan = session.metadata?.checkout_plan;
  const metadataUserId = session.metadata?.user_id || "";
  const plan = session.metadata?.plan === "premium" ? "premium" : "basic";

  const { data: existingUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const metadataUser = metadataUserId ? existingUsers.users.find((item) => item.id === metadataUserId) : undefined;
  let email = session.customer_details?.email || session.customer_email || metadataUser?.email || "";
  let name = session.customer_details?.name || String(metadataUser?.user_metadata?.full_name || "");
  const phone = session.customer_details?.phone || getCheckoutCustomField(session, "phone");

  if (!email && metadataUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email,full_name")
      .eq("id", metadataUserId)
      .maybeSingle();

    email = profile?.email || "";
    name = name || profile?.full_name || "";
  }

  if (!email) {
    console.error("HILEX checkout completed without an email", {
      checkoutPlan,
      sessionId: session.id,
      metadataUserId
    });
    return;
  }

  let userId = metadataUserId || existingUsers.users.find((item) => item.email === email)?.id;

  if (!userId) {
    if (checkoutPlan === "premium_upgrade") {
      console.error("HILEX premium upgrade checkout did not resolve a user", {
        sessionId: session.id,
        email,
        metadataUserId
      });
      return;
    }

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

  if (!userId) {
    console.error("HILEX checkout completed but userId is missing", {
      checkoutPlan,
      sessionId: session.id,
      email
    });
    return;
  }

  await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: name,
    role: "member"
  });

  if (phone) {
    const { error: phoneError } = await supabase
      .from("profiles")
      .update({ phone, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (phoneError) {
      console.error("HILEX profile phone update failed", {
        userId,
        sessionId: session.id,
        error: phoneError
      });
    }
  }

  if (checkoutPlan === "premium_upgrade") {
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id,stripe_subscription_id")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSubscription?.id) {
      await supabase
        .from("subscriptions")
        .update({
          access_level: "premium",
          status: "active",
          stripe_customer_id: customerId,
          stripe_price_id: process.env.STRIPE_PREMIUM_UPGRADE_PRICE_ID,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSubscription.id);
    } else {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        access_level: "premium",
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: `upgrade_${session.id}`,
        stripe_price_id: process.env.STRIPE_PREMIUM_UPGRADE_PRICE_ID
      });
    }

    await sendMembershipWelcomeEmail(email, "premium", name || undefined, session.id, true);
    return;
  }

  if (!subscriptionId) return;

  const stripe = getStripe();
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

  await sendMembershipWelcomeEmail(email, plan, name || undefined, session.id);
}

async function handleSubscriptionUpdated(snapshot: Stripe.Subscription, event: Stripe.Event) {
  const stripe = getStripe();
  // Read current Stripe state so delayed events cannot restore expired access.
  const subscription = await stripe.subscriptions.retrieve(snapshot.id);
  const supabase = createSupabaseAdminClient();

  const { error: syncError } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: toIso(subscription.current_period_start),
      current_period_end: toIso(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_subscription_id", subscription.id);
  if (syncError) throw syncError;

  const previous = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
  const newlyStopped = event.type === "customer.subscription.updated" && previous?.cancel_at_period_end === false && snapshot.cancel_at_period_end;
  if (!newlyStopped || !subscription.cancel_at_period_end || !["active", "trialing", "past_due"].includes(subscription.status)) return;
  if (subscription.metadata.hilex_cancellation_email_event === event.id) return;
  // Ignore an obsolete cancellation event after a later reactivation/cancellation.
  if (snapshot.canceled_at !== subscription.canceled_at) return;
  const { data: membership, error: lookupError } = await supabase.from("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (!membership) throw new Error("Cancellation membership not yet synchronized");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("email,full_name").eq("id", membership.user_id).single();
  if (profileError || !profile?.email) throw profileError || new Error("Cancellation email recipient missing");
  await sendCancellationEmail({ to: profile.email, name: profile.full_name || undefined, accessUntil: subscription.cancel_at || subscription.current_period_end, idempotencyKey: `hilex-cancellation/${event.id}` });
  // Durable replay marker; Resend also deduplicates concurrent retries.
  await stripe.subscriptions.update(subscription.id, { metadata: { hilex_cancellation_email_event: event.id } });
}

function toIso(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function getCheckoutCustomField(session: Stripe.Checkout.Session, key: string) {
  const field = session.custom_fields?.find((item) => item.key === key);
  return field?.text?.value || field?.numeric?.value || field?.dropdown?.value || "";
}

async function sendMembershipWelcomeEmail(email: string, plan: "basic" | "premium", name?: string, sessionId?: string, upgrade = false) {
  try {
    console.log("HILEX sending membership email", {
      to: email,
      plan,
      sessionId,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      emailFrom: process.env.EMAIL_FROM || "HILEX <membership@hilex.co.uk>"
    });

    const result = await deliverMembershipWelcomeEmail({ to: email, plan, name, upgrade });

    console.log("HILEX membership email sent", {
      to: email,
      plan,
      sessionId,
      emailId: result.id
    });
  } catch (error) {
    console.error("Membership welcome email failed", {
      to: email,
      plan,
      sessionId,
      error
    });
  }
}
