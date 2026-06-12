import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
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

  if (!profile || !["admin", "owner"].includes(profile.role)) redirect("/library");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,status,access_level")
    .order("created_at", { ascending: false });

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Admin HILEX</h1>
          <p>Gestioneaza continutul bibliotecii.</p>
          <Link className="btn primary" href="/admin/lessons/new">
            Lectie noua
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="inner grid">
          {(lessons || []).map((lesson) => (
            <Link className="card" href={`/admin/lessons/${lesson.id}`} key={lesson.id}>
              <span className="tag">{lesson.status}</span>
              <h3>{lesson.title}</h3>
              <p className="muted">{lesson.access_level}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
