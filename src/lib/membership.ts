import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AccessLevel } from "@/lib/types";

export type MembershipCreditSummary = {
  member: boolean;
  plan: "essential" | "premium" | null;
  status: "active" | "inactive";
  includedMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  userId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
};

export function includedMinutesForAccess(accessLevel?: string | null) {
  return accessLevel === "premium" ? 90 : accessLevel === "basic" ? 45 : 0;
}

export async function getMembershipCreditSummary(rawEmail: string): Promise<MembershipCreditSummary> {
  const email = rawEmail.trim().toLowerCase();
  const inactiveSummary: MembershipCreditSummary = {
    member: false,
    plan: null,
    status: "inactive",
    includedMinutes: 0,
    usedMinutes: 0,
    remainingMinutes: 0,
    userId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null
  };

  if (!email || !email.includes("@")) return inactiveSummary;

  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile?.id) return inactiveSummary;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status,current_period_start,current_period_end")
    .eq("user_id", profile.id)
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
    .order("access_level", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return inactiveSummary;

  const includedMinutes = includedMinutesForAccess(subscription.access_level);
  let usageQuery = supabase
    .from("consultation_credit_usage")
    .select("minutes")
    .eq("user_id", profile.id);

  if (subscription.current_period_start) {
    usageQuery = usageQuery.gte("created_at", subscription.current_period_start);
  }

  if (subscription.current_period_end) {
    usageQuery = usageQuery.lte("created_at", subscription.current_period_end);
  }

  const { data: usageRows } = await usageQuery;
  const usedMinutes = (usageRows || []).reduce((total, row) => total + Number(row.minutes || 0), 0);
  const remainingMinutes = Math.max(0, includedMinutes - usedMinutes);
  const accessLevel = subscription.access_level as AccessLevel;

  return {
    member: true,
    plan: accessLevel === "premium" ? "premium" : "essential",
    status: "active",
    includedMinutes,
    usedMinutes,
    remainingMinutes,
    userId: profile.id,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end
  };
}
