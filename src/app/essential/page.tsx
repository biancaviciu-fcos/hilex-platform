import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { UpgradePremiumModal } from "@/components/UpgradePremiumModal";
import { accessLabel, categoryIcon } from "@/lib/labels";
import { getMembershipCreditSummary } from "@/lib/membership";
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

function EssentialMaterialCard({ material }: { material: EssentialMaterial }) {
  const category = relationName(material.categories);

  return (
    <Link className="essential-material-card" href={`/library/${material.slug}`}>
      <div className="essential-material-thumb">
        {material.thumbnail_url ? <img alt="" src={material.thumbnail_url} /> : <span>▶</span>}
      </div>
      <div className="essential-material-copy">
        <div className="tag-row">
          <span className="tag">{accessLabel(material.access_level)}</span>
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
  searchParams?: Promise<{ upgrade?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?plan=essential");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

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
    .select("id,title,slug,excerpt,access_level,duration_minutes,thumbnail_url,category_id,categories(name,slug)")
    .eq("status", "published")
    .eq("access_level", "basic")
    .order("published_at", { ascending: false });

  const essentialLessons = (lessons || []) as EssentialMaterial[];
  const categoryCounts = new Map<string, number>();

  essentialLessons.forEach((lesson) => {
    if (lesson.category_id) categoryCounts.set(lesson.category_id, (categoryCounts.get(lesson.category_id) || 0) + 1);
  });

  const creditSummary = await getMembershipCreditSummary(profile?.email || user.email || "");
  const isPremium = subscription?.access_level === "premium";

  return (
    <main className="page essential-page">
      <AppHeader />
      <section className="essential-hero">
        <div className="inner essential-hero-grid">
          <div>
            <span className="eyebrow">HiLex Essential</span>
            <h1>Materiale simple, clare și ușor de parcurs.</h1>
            <p>
              Aici găsești materiale publicate și ghiduri scurte, organizate pe arii de drept, ca să ajungi rapid la
              informația de care ai nevoie.
            </p>
            <form className="essential-search-row" action="/library">
              <input name="q" placeholder="Caută după temă sau cuvânt cheie" />
              <input name="access" type="hidden" value="basic" />
              <button className="btn primary" type="submit">
                Caută
              </button>
            </form>
          </div>
          <aside className="essential-status-card">
            <span className="eyebrow">Planul tău</span>
            <strong>{isPremium ? "Premium" : "Essential"}</strong>
            <p>
              {creditSummary.remainingMinutes} din {creditSummary.includedMinutes} minute de consultanță disponibile.
            </p>
            {isPremium ? (
              <Link className="btn" href="/">
                Mergi la Premium
              </Link>
            ) : (
              <UpgradePremiumModal compact triggerContent="Upgrade la Premium" />
            )}
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          {params.upgrade ? (
            <div className="notice-text essential-upgrade-notice">
              Ai ales zona Premium, dar contul tău este Essential. Poți face upgrade oricând pentru acces complet.
            </div>
          ) : null}

          <div className="section-title">
            <div>
              <span className="eyebrow">Arii Essential</span>
              <h2>Alege domeniul care te interesează</h2>
            </div>
          </div>

          <div className="essential-topic-grid">
            {(categories || []).map((category) => (
              <Link className="essential-topic-card" href={`/library?category=${category.slug}&access=basic`} key={category.id}>
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

          <div className="section-title">
            <div>
              <span className="eyebrow">Materiale Essential</span>
              <h2>Materiale disponibile</h2>
            </div>
            <Link className="btn" href="/library?access=basic">
              Vezi toate
            </Link>
          </div>

          <div className="essential-material-grid">
            {essentialLessons.map((material) => (
              <EssentialMaterialCard key={material.id} material={material} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
