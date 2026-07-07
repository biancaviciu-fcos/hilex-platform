import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
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

  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const accessLabel = subscription?.access_level === "premium" ? "Premium" : "Basic";

  return (
    <main className="page member-shell">
      <AppHeader />
      <section className="hero member-landing-hero">
        <div className="inner member-landing-grid">
          <div>
            <span className="eyebrow hero-eyebrow">HILEX pentru membri</span>
            <h1>Bine ai venit in platforma HILEX</h1>
            <p>
              Aici gasesti materiale juridice practice, organizate pe arii de drept, cu explicatii clare, clipuri si
              resurse utile pentru viata in UK.
            </p>
            <div className="member-home-actions">
              <Link className="btn primary" href="/library">
                Intra in biblioteca
              </Link>
              <Link className="btn ghost-on-navy" href="/contact">
                Contacteaza-ne
              </Link>
            </div>
          </div>
          <aside className="member-status-card">
            <span className="eyebrow">Pachet activ</span>
            <strong>{accessLabel}</strong>
            <p>{count || 0} materiale disponibile in biblioteca.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-title">
            <div>
              <span className="eyebrow">Arii de drept</span>
              <h2>Alege domeniul care te intereseaza</h2>
            </div>
            <Link className="btn" href="/library">
              Vezi toate materialele
            </Link>
          </div>

          <div className="topic-grid member-home-topics">
            {(categories || []).map((category) => (
              <Link className="topic-card home-topic-card" href={`/library?category=${category.slug}`} key={category.id}>
                <span className="topic-icon">{category.name.slice(0, 1)}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>

          <div className="home-support-grid">
            <article className="card">
              <span className="eyebrow">Cum folosesti platforma</span>
              <h3>Cauta, salveaza si revino la materiale.</h3>
              <p className="muted">
                In biblioteca poti cauta dupa tema, domeniu sau cuvant cheie. Materialele importante pot fi salvate la
                favorite pentru a le parcurge mai tarziu.
              </p>
              <Link className="btn" href="/library?favorites=1">
                Vezi favoritele
              </Link>
            </article>
            <article className="card">
              <span className="eyebrow">Ai nevoie de ajutor?</span>
              <h3>Scrie-ne direct din platforma.</h3>
              <p className="muted">
                Daca ai o intrebare despre membership, acces sau ai nevoie de asistenta juridica, foloseste formularul
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
