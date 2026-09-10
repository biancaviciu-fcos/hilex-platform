import Link from "next/link";
import { redirect } from "next/navigation";
import { EssentialHeader } from "@/components/EssentialHeader";
import { categoryIcon } from "@/lib/labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EssentialMaterial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  access_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  category_id: string | null;
  categories?: { name?: string | null; slug?: string | null } | { name?: string | null; slug?: string | null }[] | null;
};

function relationName(value: EssentialMaterial["categories"]) {
  if (Array.isArray(value)) return value[0]?.name || "";
  return value?.name || "";
}

function normalizeEssentialSearch(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function EssentialMaterialCard({ material }: { material: EssentialMaterial }) {
  const category = relationName(material.categories);

  return (
    <Link className="essential-material-card" href={`/essential/materiale/${material.slug}`}>
      <div className="essential-material-thumb">
        {material.thumbnail_url ? <img alt="" src={material.thumbnail_url} /> : <span>▶</span>}
      </div>
      <div className="essential-material-copy">
        <div className="tag-row">
          {material.duration_minutes ? <span className="tag">{material.duration_minutes} min</span> : null}
          {category ? <span className="tag">{category}</span> : null}
        </div>
        <h3>{material.title}</h3>
        {material.excerpt ? <p className="muted">{material.excerpt}</p> : null}
      </div>
    </Link>
  );
}

export default async function EssentialPage({
  searchParams
}: {
  searchParams?: Promise<{ category?: string; favorites?: string; q?: string; upgrade?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?plan=essential");

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,excerpt,access_level,duration_minutes,thumbnail_url,category_id,categories(name,slug)")
    .eq("status", "published")
    .eq("platform", "essential")
    .order("published_at", { ascending: false });

  const essentialLessons = (lessons || []) as EssentialMaterial[];
  const selectedCategory = (categories || []).find((category) => category.slug === params.category);
  const { data: favorites } = await adminSupabase
    .from("favorite_lessons")
    .select("lesson_id")
    .eq("user_id", user.id);

  const favoriteIds = new Set((favorites || []).map((item) => item.lesson_id));
  const query = normalizeEssentialSearch(params.q);
  const visibleLessons = essentialLessons.filter((lesson) => {
    if (selectedCategory && lesson.category_id !== selectedCategory.id) return false;
    if (params.favorites && !favoriteIds.has(lesson.id)) return false;
    if (!query) return true;

    const searchable = normalizeEssentialSearch([lesson.title, lesson.excerpt, relationName(lesson.categories)].join(" "));
    return searchable.includes(query);
  });
  const categoryCounts = new Map<string, number>();

  essentialLessons.forEach((lesson) => {
    if (lesson.category_id) categoryCounts.set(lesson.category_id, (categoryCounts.get(lesson.category_id) || 0) + 1);
  });

  return (
    <main className="page essential-page">
      <EssentialHeader />
      <section className="essential-hero">
        <div className="inner essential-hero-inner">
          <div>
            <span className="eyebrow">HILEX ESSENTIAL</span>
            <h1>Informația juridică de care ai nevoie, la îndemână.</h1>
            <p>
              Materiale video juridice utile, atent selectate și organizate pentru acces rapid și ușor.
            </p>
            <form className="essential-search-row" action="/essential#materiale">
              <input name="q" placeholder="Caută materiale video" defaultValue={params.q || ""} />
              <button className="btn primary" type="submit">
                Caută
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          {params.upgrade ? (
            <div className="notice-text essential-upgrade-notice">
              Ai intrat în zona Essential. Aici găsești materialele video incluse în membership-ul tău.
            </div>
          ) : null}

          <div className="essential-section-heading">
            <div>
              <span className="eyebrow">Arii de drept</span>
              <h2>Explorează materialele pe domenii</h2>
            </div>
          </div>

          <div className="essential-topic-grid">
            {(categories || []).map((category) => (
              <Link
                className={`essential-topic-card ${params.category === category.slug ? "active" : ""}`}
                href={`/essential?category=${category.slug}#materiale`}
                key={category.id}
              >
                <span aria-hidden="true">{categoryIcon(category.slug, category.name)}</span>
                <div>
                  <h3>
                    {category.name} ({categoryCounts.get(category.id) || 0})
                  </h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="essential-section-heading with-action">
            <div>
              <span className="eyebrow">Materiale video</span>
              <h2>
                {params.favorites
                  ? "Favoritele tale"
                  : selectedCategory
                    ? selectedCategory.name
                    : query
                      ? "Rezultatele căutării"
                      : "Disponibile acum"}
              </h2>
            </div>
            {selectedCategory || params.favorites || query ? (
              <Link className="btn" href="/essential#materiale">
                Vezi toate materialele
              </Link>
            ) : null}
          </div>

          <div className="essential-material-grid" id="materiale">
            {visibleLessons.map((material) => (
              <EssentialMaterialCard key={material.id} material={material} />
            ))}
            {!visibleLessons.length ? (
              <div className="essential-empty-state">
                <h3>Nu am găsit materiale aici încă.</h3>
                <p className="muted">Încearcă o altă arie de drept sau revino la toate materialele video.</p>
                <Link className="btn" href="/essential#materiale">
                  Vezi toate materialele
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
