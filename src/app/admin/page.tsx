import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) redirect("/library");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,status,access_level,excerpt,thumbnail_url")
    .order("created_at", { ascending: false });

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Admin HILEX</h1>
          <p>Gestioneaza continutul bibliotecii, drafturile si publicarea.</p>
          <Link className="btn primary" href="/admin/lessons/new">
            Material nou
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="inner lesson-grid">
          {(lessons || []).map((lesson) => (
            <Link className="lesson-card admin-lesson" href={`/admin/lessons/${lesson.id}`} key={lesson.id}>
              <div className="lesson-thumb">
                {lesson.thumbnail_url ? (
                  <img alt="" src={lesson.thumbnail_url} />
                ) : (
                  <span>▶</span>
                )}
              </div>
              <div className="lesson-content">
                <div className="tag-row">
                  <span className="tag">{lesson.status}</span>
                  <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
                    {lesson.access_level}
                  </span>
                </div>
                <h3>{lesson.title}</h3>
                <p className="muted">{lesson.excerpt || "Fara descriere inca."}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
