import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EssentialHeader } from "@/components/EssentialHeader";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getMembershipCreditSummary } from "@/lib/membership";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDate(value?: string | null) {
  if (!value) return "În verificare";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export default async function EssentialAccountPage({
  searchParams
}: {
  searchParams?: Promise<{ billing?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?plan=essential");

  async function signOut() {
    "use server";

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    cookieStore.set("hilex_remember", "", { path: "/", maxAge: 0 });
    redirect("/login?plan=essential");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("current_period_end,stripe_customer_id")
    .eq("user_id", user.id)
    .eq("access_level", "basic")
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const creditSummary = await getMembershipCreditSummary(profile?.email || user.email || "");
  const creditPercent = creditSummary.includedMinutes
    ? Math.round((creditSummary.remainingMinutes / creditSummary.includedMinutes) * 100)
    : 0;

  return (
    <main className="page essential-page">
      <EssentialHeader />
      <section className="essential-simple-hero">
        <div className="inner">
          <span className="eyebrow">Cont Essential</span>
          <h1>Membership-ul tău HiLex</h1>
          <p>Detalii despre accesul tău, creditul de consultanță și facturile membership-ului.</p>
        </div>
      </section>

      <section className="section">
        <div className="inner essential-account-grid">
          <article className="essential-account-panel main">
            <span className="eyebrow">Planul tău</span>
            <h2>HiLex Essential</h2>
            <p className="muted">
              Ai acces la materialele video Essential, organizate pe arii de drept pentru navigare rapidă.
            </p>
            <dl className="essential-account-details">
              <div>
                <dt>Nume</dt>
                <dd>{profile?.full_name || "Membru HiLex"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile?.email || user.email}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{profile?.phone || "Necompletat"}</dd>
              </div>
              <div>
                <dt>Acces până la</dt>
                <dd>{formatDate(subscription?.current_period_end)}</dd>
              </div>
            </dl>
            <form action={signOut}>
              <button className="btn" type="submit">
                Ieși din cont
              </button>
            </form>
          </article>

          <article className="essential-account-panel">
            <span className="eyebrow">Credit consultanță</span>
            <h2>{creditSummary.remainingMinutes} minute rămase</h2>
            <p className="muted">
              Ai folosit {creditSummary.usedMinutes} din {creditSummary.includedMinutes} minute incluse anual.
            </p>
            <div className="credit-meter" aria-label={`${creditPercent}% credit rămas`}>
              <span style={{ width: `${creditPercent}%` }} />
            </div>
          </article>

          <article className="essential-account-panel">
            <span className="eyebrow">Facturi</span>
            <h2>Facturile tale</h2>
            <p className="muted">Deschide pagina securizată Stripe pentru facturi și chitanțe.</p>
            {params.billing === "missing" ? (
              <p className="notice-text account-notice">Nu am găsit încă un client Stripe activ pentru acest cont.</p>
            ) : null}
            {params.billing === "error" ? (
              <p className="notice-text account-notice">Nu am putut deschide facturile acum. Reîncearcă în câteva momente.</p>
            ) : null}
            <form action="/api/stripe/billing-portal" method="POST">
              <input name="returnTo" type="hidden" value="/essential/cont" />
              <button className="btn primary" type="submit">
                Vezi facturile
              </button>
            </form>
          </article>

          <article className="essential-account-panel">
            <span className="eyebrow">Aplicația HiLex</span>
            <h2>Salvează platforma pe telefon</h2>
            <p className="muted">Accesează mai rapid materialele tale video, ca într-o aplicație.</p>
            <InstallAppButton />
          </article>
        </div>
      </section>
    </main>
  );
}
