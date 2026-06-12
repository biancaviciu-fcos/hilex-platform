import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, categories(name,slug), subcategories(name,slug), lesson_resources(title,resource_type,url,access_level,sort_order)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!lesson) notFound();

  const body = Array.isArray(lesson.body) ? lesson.body : [];
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points : [];
  const resources = Array.isArray(lesson.lesson_resources) ? lesson.lesson_resources : [];
  const resourcesWithUrls = await Promise.all(
    resources.map(async (resource: { title: string; url: string; resource_type: string }) => {
      if (resource.resource_type !== "pdf") return resource;

      const { data } = await supabase.storage
        .from("lesson-resources")
        .createSignedUrl(resource.url, 60 * 15);

      return {
        ...resource,
        url: data?.signedUrl || "#"
      };
    })
  );

  return (
    <main className="page">
      <AppHeader />
      <section className="hero compact">
        <div className="inner">
          <p className="breadcrumbs">
            <Link href="/library">Biblioteca</Link> / {lesson.categories?.name || "Lectie"}
          </p>
          <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
            {lesson.access_level}
          </span>
          <h1>{lesson.title}</h1>
          <p>{lesson.excerpt}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner lesson-layout">
          <aside className="lesson-menu card">
            <h3>In aceasta lectie</h3>
            <a href="#video">Tutorial video</a>
            <a href="#details">Explicatii</a>
            <a href="#keys">Idei cheie</a>
            <a href="#resources">Resurse</a>
          </aside>

          <article className="card article-card">
            <section id="video">
              <h2>Tutorial video</h2>
              {lesson.video_provider === "cloudflare_stream" && lesson.video_playback_id ? (
                <iframe
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  className="video-embed"
                  src={`https://iframe.videodelivery.net/${lesson.video_playback_id}`}
                  title={lesson.title}
                />
              ) : (
                <div className="video-placeholder">
                  <span>▶</span>
                  <p>Player video securizat pentru membri</p>
                </div>
              )}
            </section>
            <section id="details">
              <h2>Explicatii</h2>
              {body.map((paragraph: string) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section id="keys">
              <h2>Idei cheie</h2>
              <ul className="feature-list">
                {keyPoints.map((point: string) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
            <section id="resources">
              <h2>Resurse</h2>
              {resourcesWithUrls.length ? (
                <div className="resource-list">
                  {resourcesWithUrls.map((resource: { title: string; url: string; resource_type: string }) => (
                    <a className="resource-row" href={resource.url} key={resource.title} rel="noreferrer" target="_blank">
                      <span>{resource.title}</span>
                      <strong>{resource.resource_type}</strong>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="muted">Nu exista resurse atasate inca.</p>
              )}
            </section>
          </article>
        </div>
      </section>
    </main>
  );
}
