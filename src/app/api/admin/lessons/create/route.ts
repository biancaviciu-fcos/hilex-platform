import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMaterialThumbnail } from "@/lib/thumbnails";

export const runtime = "nodejs";

function redirectWithError(request: Request, message: string) {
  const url = new URL("/admin/lessons/new", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, { status: 303 });
}

function safeResourceFileName(fileName: string) {
  const extension = fileName.split(".").pop() || "pdf";
  const name = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${name || "resursa"}.${extension}`;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export async function POST(request: Request) {
  const authSupabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await authSupabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const { data: profile } = await authSupabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) {
    return NextResponse.redirect(new URL("/library", request.url), { status: 303 });
  }

  if (!(await hasAdminPanelAccess())) {
    return NextResponse.redirect(new URL("/admin/access?next=/admin/lessons/new", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "");

  if (!title) return redirectWithError(request, "Adaugă un titlu pentru material.");
  if (!categoryId) return redirectWithError(request, "Alege aria de drept pentru material.");

  const requestedSlug = String(formData.get("slug") || "");
  let slug = createSlug(requestedSlug || title);
  if (!slug) slug = `material-${Date.now()}`;

  const supabase = createSupabaseAdminClient();
  const adminRole = profile?.role === "owner" ? "owner" : "admin";
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email || "",
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email || "Admin HILEX",
    role: adminRole,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    return redirectWithError(request, `Profilul admin nu a putut fi pregătit: ${profileError.message}`);
  }

  const { data: existingMaterial } = await supabase
    .from("lessons")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingMaterial) {
    slug = `${slug}-${Date.now().toString().slice(-6)}`;
  }

  const subcategoryId = String(formData.get("subcategory_id") || "");
  const accessLevel = String(formData.get("access_level") || "basic");
  const status = String(formData.get("status") || "draft");
  const excerpt = String(formData.get("excerpt") || "");
  const durationMinutes = Number(formData.get("duration_minutes") || 0) || null;
  const videoProvider = String(formData.get("video_provider") || "") || null;
  const videoAssetId = String(formData.get("video_asset_id") || "") || null;
  const videoPlaybackId = String(formData.get("video_playback_id") || "") || null;
  const body = String(formData.get("body") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const keyPoints = String(formData.get("key_points") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const { data: material, error } = await supabase
    .from("lessons")
    .insert({
      title,
      slug,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      access_level: accessLevel,
      status,
      excerpt,
      duration_minutes: durationMinutes,
      video_provider: videoProvider,
      video_asset_id: videoAssetId,
      video_playback_id: videoPlaybackId,
      body,
      key_points: keyPoints,
      published_at: status === "published" ? new Date().toISOString() : null,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !material) {
    return redirectWithError(request, error?.message || "Materialul nu a putut fi creat.");
  }

  const thumbnail = formData.get("thumbnail");
  if (thumbnail instanceof File && thumbnail.size > 0) {
    try {
      const thumbnailUrl = await uploadMaterialThumbnail(thumbnail, material.id);

      if (thumbnailUrl) {
        await supabase
          .from("lessons")
          .update({ thumbnail_url: thumbnailUrl, updated_at: new Date().toISOString() })
          .eq("id", material.id);
      }
    } catch (error) {
      console.error("Thumbnail upload failed", error);
    }
  }

  const resourceFile = formData.get("resource_file");
  if (resourceFile instanceof File && resourceFile.size > 0) {
    const path = `${material.id}/${Date.now()}-${safeResourceFileName(resourceFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("lesson-resources")
      .upload(path, resourceFile, {
        contentType: resourceFile.type || "application/pdf",
        upsert: false
      });

    if (!uploadError) {
      await supabase.from("lesson_resources").insert({
        lesson_id: material.id,
        title: String(formData.get("resource_title") || resourceFile.name),
        resource_type: "pdf",
        url: path,
        access_level: String(formData.get("resource_access_level") || "basic")
      });
    }
  }

  const linkTitle = String(formData.get("link_title") || "").trim();
  const linkUrl = String(formData.get("link_url") || "").trim();
  if (linkTitle && linkUrl) {
    await supabase.from("lesson_resources").insert({
      lesson_id: material.id,
      title: linkTitle,
      resource_type: "link",
      url: linkUrl,
      access_level: String(formData.get("link_access_level") || "basic")
    });
  }

  return NextResponse.redirect(new URL(`/admin/lessons/${material.id}`, request.url), {
    status: 303
  });
}
