import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function thumbnailPathFromPublicUrl(url?: string | null) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/lesson-thumbnails/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

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

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,thumbnail_url,lesson_resources(resource_type,url)")
    .eq("id", id)
    .single();

  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resources = Array.isArray(lesson.lesson_resources) ? lesson.lesson_resources : [];
  const pdfPaths = resources.flatMap((resource: { resource_type?: string; url?: string | null }) => {
    if (resource.resource_type !== "pdf" || !resource.url) return [];
    return [resource.url];
  });

  if (pdfPaths.length) {
    await supabase.storage.from("lesson-resources").remove(pdfPaths);
  }

  const thumbnailPath = thumbnailPathFromPublicUrl(lesson.thumbnail_url);

  if (thumbnailPath) {
    await supabase.storage.from("lesson-thumbnails").remove([thumbnailPath]);
  }

  await supabase.from("lessons").delete().eq("id", id);

  return NextResponse.redirect(new URL("/admin", request.url), {
    status: 303
  });
}
