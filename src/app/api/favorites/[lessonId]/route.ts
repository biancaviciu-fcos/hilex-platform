import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const next = String(formData.get("next") || "/library");

  const { data: existing } = await supabase
    .from("favorite_lessons")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorite_lessons")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
  } else {
    await supabase
      .from("favorite_lessons")
      .insert({
        user_id: user.id,
        lesson_id: lessonId
      });
  }

  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
