import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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
  const lessonId = String(formData.get("lesson_id") || "");
  const title = String(formData.get("title") || "");
  const url = String(formData.get("url") || "");
  const accessLevel = String(formData.get("access_level") || "basic");

  if (!lessonId || !title || !url) {
    return NextResponse.json({ error: "Missing title, URL or material" }, { status: 400 });
  }

  await adminSupabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    title,
    resource_type: "link",
    url,
    access_level: accessLevel
  });

  return NextResponse.redirect(new URL(`/admin/lessons/${lessonId}`, request.url), {
    status: 303
  });
}
