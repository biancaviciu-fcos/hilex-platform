import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeInstallAppModal } from "@/components/HomeInstallAppModal";
import { accessLabel as formatAccessLabel, categoryIcon } from "@/lib/labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type HomeMaterial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  access_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  category_id: string | null;
};

function MaterialMiniCard({ material }: { material: HomeMaterial }) {
  return (
    <Link className="home-material-card" href={`/library/${material.slug}`}>
      {material.thumbnail_url ? <img alt="" src={material.thumbnail_url} /> : <span className="material-placeholder">▶</span>}
      <div>
        <div className="tag-row">
          <span className={`tag ${material.access_level === "premium" ? "premium" : ""}`}>
            {formatAccessLabel(material.access_level)}
          </span>
          {material.duration_minutes ? <span className="tag">{material.duration_minutes} min</span> : null}
        </div>
        <h3>{material.title}</h3>
        {material.excerpt ? <p className="muted">{material.excerpt}</p> : null}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status,current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
    .order("access_level", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,excerpt,access_level,duration_minutes,thumbnail_url,category_id,published_at")
    .eq("status", "published");

  const allLessons = ((lessons || []) as (HomeMaterial & { published_at?: string | null })[]).sort((first, second) => {
    const firstDate = first.published_at ? new Date(first.published_at).getTime() : 0;
    const secondDate = second.published_at ? new Date(second.published_at).getTime() : 0;
    return secondDate - firstDate;
  });
  const categoryCounts = new Map<string, number>();

  allLessons.forEach((lesson) => {
    if (lesson.category_id) {
      categoryCounts.set(lesson.category_id, (categoryCounts.get(lesson.category_id) || 0) + 1);
    }
  });

  const { data: favorites } = await adminSupabase
    .from("favorite_lessons")
    .select("lesson_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoriteIds = new Set((favorites || []).map((item) => item.lesson_id));
  const savedMaterials = allLessons.filter((lesson) => favoriteIds.has(lesson.id));

  const { data: viewedRows } = await supabase
    .from("lesson_views")
    .select("lesson_id,viewed_at")
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false });

  const recentlyViewed = (viewedRows || [])
    .map((row) => allLessons.find((lesson) => lesson.id === row.lesson_id))
    .filter(Boolean)
    .slice(0, 3) as HomeMaterial[];
  const newThisWeek = allLessons.filter((lesson) => {
    if (!lesson.published_at) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return new Date(lesson.published_at).getTime() >= sevenDaysAgo;
  });
  const newMaterials = (newThisWeek.length ? newThisWeek : allLessons).slice(0, 3);
  const weeklyMaterial = allLessons[0];
  const accessLabel = formatAccessLabel(subscription?.access_level);

  return (
    <main className="page member-shell">
      <AppHeader />
      <HomeInstallAppModal />
      <section className="hero member-landing-hero">
        <div className="inner member-landing-grid">
          <div>
            <span className="eyebrow hero-eyebrow">HILEX pentru membri</span>
            <h1>Bine ai venit în platforma HILEX</h1>
            <p>
              Găsești soluții practice, materiale video și resurse juridice create pentru situații reale din viața de zi
              cu zi.
            </p>
            <div className="member-home-actions">
              <Link className="btn primary" href="/library">
                Intră în resurse
              </Link>
              <Link className="btn ghost-on-navy" href="/contact">
                Contactează-ne
              </Link>
            </div>
          </div>
          <aside className="member-status-card">
            <span className="eyebrow">Planul tău</span>
            <strong>{accessLabel}</strong>
            <p>{allLessons.length} materiale disponibile în resurse.</p>
            <Link className="status-link" href="/library?favorites=1">
              Ai salvat {savedMaterials.length} materiale
            </Link>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-title">
            <div>
              <span className="eyebrow">Arii de drept</span>
              <h2>Alege domeniul care te interesează</h2>
            </div>
            <Link className="btn" href="/library">
              Vezi toate materialele
            </Link>
          </div>

          <div className="topic-grid member-home-topics">
            {(categories || []).map((category) => (
              <Link className="topic-card home-topic-card" href={`/library?category=${category.slug}`} key={category.id}>
                <span className="topic-icon" aria-hidden="true">
                  {categoryIcon(category.slug, category.name)}
                </span>
                <h3>
                  {category.name} ({categoryCounts.get(category.id) || 0})
                </h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>

          {weeklyMaterial ? (
            <section className="home-feature-card">
              <div>
                <span className="eyebrow">Materialul săptămânii</span>
                <h2>{weeklyMaterial.title}</h2>
                {weeklyMaterial.excerpt ? <p className="muted">{weeklyMaterial.excerpt}</p> : null}
              </div>
              <Link className="btn primary" href={`/library/${weeklyMaterial.slug}`}>
                Vezi materialul
              </Link>
            </section>
          ) : null}

          <div className="home-resource-sections">
            <section className="card home-resource-section">
              <div className="section-title compact-title">
                <div>
                  <span className="eyebrow">Materiale salvate</span>
                  <h2>Ai salvat {savedMaterials.length} materiale</h2>
                </div>
                <Link className="btn" href="/library?favorites=1">
                  Vezi toate
                </Link>
              </div>
              <div className="home-material-list">
                {savedMaterials.slice(0, 3).map((material) => (
                  <MaterialMiniCard key={material.id} material={material} />
                ))}
                {!savedMaterials.length ? <p className="muted">Nu ai salvat materiale încă.</p> : null}
              </div>
            </section>

            <section className="card home-resource-section">
              <div className="section-title compact-title">
                <div>
                  <span className="eyebrow">Ultimele materiale accesate</span>
                  <h2>Ultimele materiale accesate</h2>
                </div>
              </div>
              <div className="home-material-list">
                {recentlyViewed.map((material) => (
                  <MaterialMiniCard key={material.id} material={material} />
                ))}
                {!recentlyViewed.length ? <p className="muted">Materialele parcurse vor apărea aici.</p> : null}
              </div>
            </section>

            <section className="card home-resource-section">
              <div className="section-title compact-title">
                <div>
                  <span className="eyebrow">Materiale noi</span>
                  <h2>Materiale noi</h2>
                </div>
              </div>
              <div className="home-material-list">
                {newMaterials.map((material) => (
                  <MaterialMiniCard key={material.id} material={material} />
                ))}
              </div>
            </section>
          </div>

          <div className="home-support-grid">
            <article className="card">
              <span className="eyebrow">Cum funcționează HiLex</span>
              <h3>Caută, salvează și revino la materiale.</h3>
              <p className="muted">
                În resurse poți căuta după temă, domeniu sau cuvânt cheie. Materialele importante pot fi salvate la
                favorite pentru a le parcurge mai târziu.
              </p>
              <Link className="btn" href="/library?favorites=1">
                Vezi favoritele
              </Link>
            </article>
            <article className="card">
              <span className="eyebrow">Ai nevoie de ajutor?</span>
              <h3>Scrie-ne direct din platformă.</h3>
              <p className="muted">
                Dacă ai o întrebare despre membership, acces sau ai nevoie de asistență juridică, folosește formularul
                de contact.
              </p>
              <Link className="btn primary" href="/contact">
                Mergi la contact
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
