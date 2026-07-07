import { NextResponse } from "next/server";
import { canAccessLesson } from "@/lib/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccessLevel } from "@/lib/types";

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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status,current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
    .order("access_level", { ascending: false })
    .limit(1)
    .maybeSingle();

  const userAccess = (subscription?.access_level || null) as AccessLevel | null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,access_level,status")
    .eq("id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  if (!lesson || !canAccessLesson(userAccess, lesson.access_level as AccessLevel)) {
    return NextResponse.redirect(new URL(next, request.url), { status: 303 });
  }

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
  } else {
    await supabase
      .from("lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  }

  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
