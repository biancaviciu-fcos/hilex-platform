import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function relationName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name;
  }

  return (value as { name?: string } | null)?.name;
}

function accessLabel(accessLevel: string) {
  return accessLevel === "premium" ? "Premium" : "Basic";
}

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
  const categoryName = relationName(lesson.categories);
  const subcategoryName = relationName(lesson.subcategories);
  const resourcesWithUrls = await Promise.all(
    resources.map(async (resource: { title: string; url: string; resource_type: string; access_level: string }) => {
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
        <div className="inner material-hero-inner">
          <p className="breadcrumbs">
            <Link href="/library">Biblioteca</Link> / {categoryName || "Material"}
            {subcategoryName ? ` / ${subcategoryName}` : ""}
          </p>
          <div className="material-meta">
            <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
              {accessLabel(lesson.access_level)}
            </span>
            {categoryName ? <span className="tag light">{categoryName}</span> : null}
            {subcategoryName ? <span className="tag light">{subcategoryName}</span> : null}
            {lesson.duration_minutes ? <span className="tag light">{lesson.duration_minutes} min</span> : null}
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.excerpt}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner material-page">
          <section className="material-video-shell" id="video">
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

          <div className="material-content-layout">
            <article className="card article-card material-article">
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
            </article>

            <aside className="material-sidebar">
              <section className="card material-side-card">
                <h3>In acest material</h3>
                <a href="#video">Clip video</a>
                <a href="#details">Explicatii</a>
                <a href="#keys">Idei cheie</a>
                <a href="#resources">Resurse</a>
              </section>

              <section className="card material-side-card" id="resources">
                <h3>Resurse</h3>
                {resourcesWithUrls.length ? (
                <div className="resource-list">
                    {resourcesWithUrls.map((resource: { title: string; url: string; resource_type: string; access_level: string }) => (
                    <a className="resource-row" href={resource.url} key={resource.title} rel="noreferrer" target="_blank">
                      <span>
                        <strong>{resource.title}</strong>
                        <small>{accessLabel(resource.access_level)}</small>
                      </span>
                      <strong>{resource.resource_type.toUpperCase()}</strong>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="muted">Nu exista resurse atasate inca.</p>
              )}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
