import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEssentialContent } from "@/lib/essential";
import { EssentialVideoGrid } from "@/components/EssentialVideoGrid";
import { FavoriteHeartButton } from "@/components/FavoriteHeartButton";
import { VideoCoverPlayer } from "@/components/VideoCoverPlayer";
import { LessonViewTracker } from "@/components/LessonViewTracker";

export default async function EssentialVideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { materials } = await getEssentialContent();
  const material = materials.find(item => item.slug === slug);
  if (!material) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: content, error } = await supabase.from("lessons")
    .select("body,key_points")
    .eq("id", material.id).eq("platform", "essential").eq("status", "published").single();
  if (error) throw new Error("Nu am putut încărca textul materialului.");
  const paragraphs = Array.isArray(content?.body)
    ? content.body.filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const keyPoints = Array.isArray(content?.key_points)
    ? content.key_points.filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const related = materials.filter(item => item.id !== material.id && item.categorySlug === material.categorySlug).slice(0, 2);
  const playbackId = material.video_playback_id || material.video_asset_id;
  return (
    <main className="essential-content essential-watch-page">
      <LessonViewTracker lessonId={material.id} />
      <Link className="essential-back" href="/essential/materiale"><ArrowLeft size={20} />Înapoi la materiale</Link>
      <header className="essential-page-heading">
        <p className="essential-breadcrumbs">Materiale video <span>/</span> {material.categoryName}</p>
        <span className="essential-kicker">{material.categoryName}</span>
        <h1>{material.title}</h1>
      </header>
      <div className={`essential-watch-layout ${related.length ? "" : "no-related"}`}>
        <div>
          <div className="essential-watch-player">{playbackId ? <VideoCoverPlayer key={material.id} playbackId={playbackId} title={material.title} thumbnailUrl={material.thumbnail_url} /> : <div className="essential-empty"><h2>Clipul video va fi disponibil în curând.</h2><p>Poți explora între timp celelalte materiale.</p></div>}</div>
          <section className="essential-watch-description">
            <div><h2>Despre acest material</h2><FavoriteHeartButton initialIsFavorite={material.isFavorite} lessonId={material.id} variant="essential" /></div>
            {material.excerpt && <p>{material.excerpt}</p>}
            {paragraphs.filter(paragraph => paragraph.trim() !== material.excerpt?.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
          {keyPoints.length > 0 && <section className="essential-watch-key-points">
            <h2>Idei cheie</h2>
            <ul>{keyPoints.map((point, index) => <li key={index}><CheckCircle2 size={20} aria-hidden="true" /><span>{point}</span></li>)}</ul>
          </section>}
          <Link className="essential-category-link" href={`/essential/materiale?category=${material.categorySlug}`}>Vezi toate materialele din {material.categoryName}<ArrowRight size={20} /></Link>
        </div>
        {related.length > 0 && <aside className="essential-related"><h2>Din același domeniu</h2><EssentialVideoGrid materials={related} /></aside>}
      </div>
    </main>
  );
}
