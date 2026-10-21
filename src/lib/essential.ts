import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EssentialVideoMaterial } from "@/components/EssentialVideoGrid";

export const getEssentialContent = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?plan=essential");
  const [categoriesResult, lessonsResult, favoritesResult] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("sort_order"),
    supabase.from("lessons")
      .select("id,title,slug,excerpt,duration_minutes,thumbnail_url,video_provider,video_asset_id,video_playback_id,category_id")
      .eq("status", "published").eq("platform", "essential").order("published_at", { ascending: false }),
    supabase.from("favorite_lessons").select("lesson_id").eq("user_id", user.id)
  ]);
  const lessons = lessonsResult.data || [];
  const favoriteIds = new Set((favoritesResult.data || []).map(row => row.lesson_id));
  const categories = (categoriesResult.data || []).map(category => ({
    ...category, count: lessons.filter(lesson => lesson.category_id === category.id).length
  }));
  const materials: EssentialVideoMaterial[] = lessons.map(lesson => {
    const category = categories.find(item => item.id === lesson.category_id);
    return { ...lesson, categoryName: category?.name || "", categorySlug: category?.slug || "", isFavorite: favoriteIds.has(lesson.id) };
  });
  return { user, categories, materials, error: lessonsResult.error?.message || categoriesResult.error?.message || null };
});
