import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!(await hasAdminPanelAccess())) {
    return NextResponse.redirect(new URL("/admin/access", request.url), { status: 303 });
  }

  const adminSupabase = createSupabaseAdminClient();

  const formData = await request.formData();
  const videoAssetId = String(formData.get("video_asset_id") || "");

  if (!videoAssetId) {
    return NextResponse.json({ error: "Missing video asset id" }, { status: 400 });
  }

  await adminSupabase
    .from("lessons")
    .update({
      video_provider: "cloudflare_stream",
      video_asset_id: videoAssetId,
      video_playback_id: videoAssetId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  return NextResponse.redirect(new URL(`/admin/lessons/${id}`, request.url), {
    status: 303
  });
}
