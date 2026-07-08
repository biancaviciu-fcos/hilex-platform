import { NextResponse } from "next/server";
import { ADMIN_ACCESS_COOKIE, adminAccessToken, isAdminCodeConfigured, safeAdminRedirect } from "@/lib/adminAccess";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const code = String(formData.get("code") || "");
  const nextPath = safeAdminRedirect(String(formData.get("next") || ""));

  if (!isAdminCodeConfigured()) {
    const url = new URL("/admin/access", request.url);
    url.searchParams.set("error", "Codul admin nu este configurat în Vercel.");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  if (code !== process.env.ADMIN_PANEL_CODE) {
    const url = new URL("/admin/access", request.url);
    url.searchParams.set("error", "Codul admin nu este corect.");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303
  });

  response.cookies.set(ADMIN_ACCESS_COOKIE, adminAccessToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: true
  });

  return response;
}
