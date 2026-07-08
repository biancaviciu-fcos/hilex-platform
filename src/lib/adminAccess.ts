import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_ACCESS_COOKIE = "hilex_admin_access";

function adminCode() {
  return process.env.ADMIN_PANEL_CODE || "";
}

function adminSecret() {
  return process.env.ADMIN_PANEL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || adminCode();
}

export function isAdminCodeConfigured() {
  return Boolean(adminCode());
}

export function adminAccessToken() {
  return createHash("sha256")
    .update(`${adminCode()}:${adminSecret()}`)
    .digest("hex");
}

export async function hasAdminPanelAccess() {
  if (!isAdminCodeConfigured()) return true;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_COOKIE)?.value === adminAccessToken();
}

export function safeAdminRedirect(value?: string | null) {
  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/access")) {
    return "/admin";
  }

  return value;
}
