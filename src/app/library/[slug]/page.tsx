import { notFound, redirect } from "next/navigation";
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
    .select("*, lesson_resources(title,resource_type,url,access_level,sort_order)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!lesson) notFound();

  const body = Array.isArray(lesson.body) ? lesson.body : [];
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points : [];

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
            {lesson.access_level}
          </span>
          <h1>{lesson.title}</h1>
          <p>{lesson.excerpt}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <article className="card">
            <h3>Tutorial video</h3>
            <p className="muted">Playerul securizat va fi conectat la providerul video ales.</p>
            <h3>Explicatii</h3>
            {body.map((paragraph: string) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <h3>Idei cheie</h3>
            <ul>
              {keyPoints.map((point: string) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
