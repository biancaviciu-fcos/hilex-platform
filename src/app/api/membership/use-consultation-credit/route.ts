import { NextResponse } from "next/server";
import { getMembershipCreditSummary } from "@/lib/membership";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const defaultAllowedOrigin = "https://booking.fcos.co.uk";

type UseCreditBody = {
  email?: string;
  minutes?: number;
  bookingId?: string;
  source?: string;
};

function corsHeaders(request: Request) {
  const allowedOrigin = process.env.BOOKING_ALLOWED_ORIGIN || defaultAllowedOrigin;
  const origin = request.headers.get("origin");
  const allowOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-HILEX-Booking-Key",
    "Vary": "Origin"
  };
}

function jsonResponse(request: Request, body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const requiredSecret = process.env.BOOKING_VERIFY_SECRET;

  if (!requiredSecret) {
    return jsonResponse(request, { error: "Booking credit endpoint is not configured" }, 500);
  }

  if (request.headers.get("x-hilex-booking-key") !== requiredSecret) {
    return jsonResponse(request, { error: "Unauthorized" }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as UseCreditBody;
  const email = String(body.email || "").trim().toLowerCase();
  const minutes = Number(body.minutes || 0);
  const bookingId = String(body.bookingId || "").trim();
  const source = String(body.source || "").trim();

  if (!email || !email.includes("@")) {
    return jsonResponse(request, { error: "Invalid email" }, 400);
  }

  if (!Number.isFinite(minutes) || minutes <= 0 || !Number.isInteger(minutes)) {
    return jsonResponse(request, { error: "Minutes must be a positive whole number" }, 400);
  }

  if (!bookingId) {
    return jsonResponse(request, { error: "bookingId is required" }, 400);
  }

  if (source !== "forest-booking") {
    return jsonResponse(request, { error: "Invalid source" }, 400);
  }

  const summary = await getMembershipCreditSummary(email);

  if (!summary.member || !summary.userId) {
    return jsonResponse(
      request,
      {
        member: false,
        status: "inactive",
        includedMinutes: 0,
        usedMinutes: 0,
        remainingMinutes: 0,
        error: "No active HILEX membership found"
      },
      404
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingUsage } = await supabase
    .from("consultation_credit_usage")
    .select("minutes")
    .eq("user_id", summary.userId)
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existingUsage) {
    return jsonResponse(request, {
      member: true,
      plan: summary.plan,
      status: summary.status,
      includedMinutes: summary.includedMinutes,
      usedMinutes: summary.usedMinutes,
      remainingMinutes: summary.remainingMinutes,
      consumed: false,
      duplicate: true
    });
  }

  if (summary.remainingMinutes < minutes) {
    return jsonResponse(
      request,
      {
        member: true,
        plan: summary.plan,
        status: summary.status,
        includedMinutes: summary.includedMinutes,
        usedMinutes: summary.usedMinutes,
        remainingMinutes: summary.remainingMinutes,
        error: "Insufficient consultation credit"
      },
      409
    );
  }

  const { error } = await supabase.from("consultation_credit_usage").insert({
    user_id: summary.userId,
    booking_id: bookingId,
    source,
    minutes
  });

  if (error) {
    console.error("HILEX consultation credit usage failed", { email, bookingId, error });
    return jsonResponse(request, { error: "Could not consume consultation credit" }, 500);
  }

  const updatedSummary = await getMembershipCreditSummary(email);

  return jsonResponse(request, {
    member: true,
    plan: updatedSummary.plan,
    status: updatedSummary.status,
    includedMinutes: updatedSummary.includedMinutes,
    usedMinutes: updatedSummary.usedMinutes,
    remainingMinutes: updatedSummary.remainingMinutes,
    consumed: true,
    duplicate: false
  });
}
