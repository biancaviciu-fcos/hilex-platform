import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,excerpt,access_level,duration_minutes,status,categories(name,slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Biblioteca HILEX</h1>
          <p>Clipuri, articole si resurse juridice pentru membri.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner grid">
          {(lessons || []).map((lesson) => (
            <Link className="card" href={`/library/${lesson.slug}`} key={lesson.id}>
              <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
                {lesson.access_level}
              </span>
              <h3>{lesson.title}</h3>
              <p className="muted">{lesson.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
