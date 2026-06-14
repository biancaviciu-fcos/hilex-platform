import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  const formData = await request.formData();
  const lessonId = String(formData.get("lesson_id") || "");
  const file = formData.get("file");

  if (!lessonId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file or material" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "pdf";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `${lessonId}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("lesson-resources")
    .upload(path, file, {
      contentType: file.type || "application/pdf",
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    title: String(formData.get("title") || file.name),
    resource_type: "pdf",
    url: path,
    access_level: String(formData.get("access_level") || "basic")
  });

  return NextResponse.redirect(new URL(`/admin/lessons/${lessonId}`, request.url), {
    status: 303
  });
}
