import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order");

  let lessonsQuery = supabase
    .from("lessons")
    .select("id,title,slug,excerpt,access_level,duration_minutes,status,thumbnail_url,categories(name,slug)")
    .eq("status", "published");

  if (query) {
    lessonsQuery = lessonsQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  if (category) {
    const selectedCategory = categories?.find((item) => item.slug === category);
    if (selectedCategory) lessonsQuery = lessonsQuery.eq("category_id", selectedCategory.id);
  }

  const { data: lessons } = await lessonsQuery.order("published_at", { ascending: false });

  return (
    <main className="page">
      <AppHeader />
      <section className="hero library-hero">
        <div className="inner">
          <h1>Biblioteca HILEX</h1>
          <p>Clipuri, articole si resurse juridice pentru membri.</p>
          <form className="search-row" action="/library">
            <input
              aria-label="Cauta"
              defaultValue={query}
              name="q"
              placeholder="Cauta dupa tema, categorie sau cuvant cheie"
            />
            <button className="btn primary" type="submit">
              Cauta
            </button>
          </form>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <div className="topic-grid">
            {(categories || []).map((item) => (
              <Link
                className={`topic-card ${category === item.slug ? "active" : ""}`}
                href={`/library?category=${item.slug}`}
                key={item.id}
              >
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="section-title">
            <div>
              <h2>Materiale disponibile</h2>
              <p className="muted">{lessons?.length || 0} rezultate</p>
            </div>
            {(query || category) ? (
              <Link className="btn" href="/library">
                Reseteaza filtre
              </Link>
            ) : null}
          </div>

          <div className="lesson-grid">
            {(lessons || []).map((lesson) => (
              <Link className="lesson-card" href={`/library/${lesson.slug}`} key={lesson.id}>
                <div className="lesson-thumb">
                  {lesson.thumbnail_url ? (
                    <img alt="" src={lesson.thumbnail_url} />
                  ) : (
                    <span>▶</span>
                  )}
                </div>
                <div className="lesson-content">
                  <div className="tag-row">
                    <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
                      {lesson.access_level}
                    </span>
                    {lesson.duration_minutes ? <span className="tag">{lesson.duration_minutes} min</span> : null}
                  </div>
                  <h3>{lesson.title}</h3>
                  <p className="muted">{lesson.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
