import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { EssentialHeader } from "@/components/EssentialHeader";
import { FavoriteHeartButton } from "@/components/FavoriteHeartButton";
import { VideoCoverPlayer } from "@/components/VideoCoverPlayer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EssentialLesson = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: unknown;
  key_points: unknown;
  video_provider: string | null;
  video_playback_id: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  categories?: { name?: string | null; slug?: string | null } | { name?: string | null; slug?: string | null }[] | null;
};

function relationName(value: EssentialLesson["categories"]) {
  if (Array.isArray(value)) return value[0]?.name || "";
  return value?.name || "";
}

export default async function EssentialMaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?plan=essential");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,title,slug,excerpt,body,key_points,video_provider,video_playback_id,thumbnail_url,duration_minutes,categories(name,slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("access_level", "basic")
    .single();

  if (!lesson) notFound();

  await supabase
    .from("lesson_views")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        viewed_at: new Date().toISOString()
      },
      { onConflict: "user_id,lesson_id" }
    );

  const { data: favorite } = await adminSupabase
    .from("favorite_lessons")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  const body = Array.isArray(lesson.body) ? lesson.body : [];
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points : [];
  const categoryName = relationName(lesson.categories);

  return (
    <main className="page essential-page">
      <EssentialHeader />
      <section className="essential-material-hero">
        <div className="inner essential-material-hero-inner">
          <Link className="essential-back-link" href="/essential#materiale">
            Înapoi la toate materialele
          </Link>
          <div className="tag-row">
            {lesson.duration_minutes ? <span className="tag">{lesson.duration_minutes} min</span> : null}
            {categoryName ? <span className="tag">{categoryName}</span> : null}
          </div>
          <div className="essential-material-title-row">
            <div>
              <span className="eyebrow">Material video Essential</span>
              <h1>{lesson.title}</h1>
              {lesson.excerpt ? <p>{lesson.excerpt}</p> : null}
            </div>
            <FavoriteHeartButton initialIsFavorite={Boolean(favorite)} lessonId={lesson.id} variant="hero" />
          </div>
        </div>
      </section>

      <section className="section essential-material-section">
        <div className="inner essential-material-layout">
          <section className="essential-video-panel" id="video">
            {lesson.video_provider === "cloudflare_stream" && lesson.video_playback_id ? (
              <VideoCoverPlayer
                playbackId={lesson.video_playback_id}
                thumbnailUrl={lesson.thumbnail_url}
                title={lesson.title}
              />
            ) : (
              <div className="video-placeholder">
                <span>▶</span>
                <p>Material video pentru membri Essential</p>
              </div>
            )}
          </section>

          <article className="essential-article">
            {body.length ? (
              <section>
                <h2>Explicații</h2>
                {body.map((paragraph: string) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ) : null}

            {keyPoints.length ? (
              <section>
                <h2>Idei cheie</h2>
                <ul className="essential-key-list">
                  {keyPoints.map((point: string) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
