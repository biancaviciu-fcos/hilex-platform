import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
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

  const { data: resource } = await supabase
    .from("lesson_resources")
    .select("lesson_id,resource_type,url")
    .eq("id", id)
    .single();

  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("lesson_resources").delete().eq("id", id);

  if (resource.resource_type === "pdf") {
    await supabase.storage.from("lesson-resources").remove([resource.url]);
  }

  return NextResponse.redirect(new URL(`/admin/lessons/${resource.lesson_id}`, request.url), {
    status: 303
  });
}
