import { NextResponse } from "next/server";
import { getMembershipCreditSummary } from "@/lib/membership";

export const runtime = "nodejs";

const defaultAllowedOrigin = "https://booking.fcos.co.uk";

function corsHeaders(request: Request) {
  const allowedOrigin = process.env.BOOKING_ALLOWED_ORIGIN || defaultAllowedOrigin;
  const origin = request.headers.get("origin");
  const allowOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") || "";
  return verifyMembership(request, email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  return verifyMembership(request, body.email || "");
}

async function verifyMembership(request: Request, rawEmail: string) {
  const requiredSecret = process.env.BOOKING_VERIFY_SECRET;

  if (requiredSecret && request.headers.get("x-hilex-booking-key") !== requiredSecret) {
    return jsonResponse(request, { member: false, error: "Unauthorized" }, 401);
  }

  const email = rawEmail.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return jsonResponse(
      request,
      {
        member: false,
        plan: null,
        status: "inactive",
        includedMinutes: 0,
        usedMinutes: 0,
        remainingMinutes: 0,
        error: "Invalid email"
      },
      400
    );
  }

  const summary = await getMembershipCreditSummary(email);

  return jsonResponse(request, {
    member: summary.member,
    plan: summary.plan,
    status: summary.status,
    includedMinutes: summary.includedMinutes,
    usedMinutes: summary.usedMinutes,
    remainingMinutes: summary.remainingMinutes
  });
}
