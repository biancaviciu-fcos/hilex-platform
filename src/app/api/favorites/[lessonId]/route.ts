import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const wantsJson = request.headers.get("accept")?.includes("application/json") || false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const respondWithError = (code: string, status = 400, next = "/library") => {
    if (wantsJson) {
      return NextResponse.json({ error: code, ok: false }, { status });
    }

    const url = new URL(next, request.url);
    url.searchParams.set("favoriteError", code);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!user) {
    if (wantsJson) {
      return NextResponse.json({ error: "not-authenticated", ok: false }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  let desiredFavoriteState: boolean | null = null;
  let next = "/library";
  if (!wantsJson) {
    const formData = await request.formData();
    next = String(formData.get("next") || "/library");
  } else {
    try {
      const body = (await request.json()) as { favorite?: boolean };
      if (typeof body.favorite === "boolean") {
        desiredFavoriteState = body.favorite;
      }
    } catch {
      desiredFavoriteState = null;
    }
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: existingProfile } = await adminSupabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error: profileError } = await adminSupabase.from("profiles").upsert({
    id: user.id,
    email: user.email || "",
    full_name: existingProfile?.full_name || user.user_metadata?.full_name || user.email || "Membru HILEX",
    role: existingProfile?.role || "member",
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    return respondWithError("profile-save-failed", 500, next);
  }

  const { data: lesson } = await adminSupabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) {
    return respondWithError("material-not-found", 404, next);
  }

  const { data: existing } = await adminSupabase
    .from("favorite_lessons")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const shouldBeFavorite = desiredFavoriteState ?? !existing;

  if (!shouldBeFavorite && existing) {
    const { error } = await adminSupabase
      .from("favorite_lessons")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);

    if (error) {
      return respondWithError("remove-failed", 500, next);
    }

    if (wantsJson) {
      return NextResponse.json({ isFavorite: false, ok: true });
    }
  } else if (shouldBeFavorite && !existing) {
    const { error } = await adminSupabase
      .from("favorite_lessons")
      .insert({
        user_id: user.id,
        lesson_id: lessonId
      });

    if (error) {
      return respondWithError("save-failed", 500, next);
    }

    if (wantsJson) {
      return NextResponse.json({ isFavorite: true, ok: true });
    }
  } else if (wantsJson) {
    return NextResponse.json({ isFavorite: shouldBeFavorite, ok: true });
  }

  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
