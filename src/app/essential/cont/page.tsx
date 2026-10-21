import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, LogOut, Smartphone } from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getMembershipCreditSummary } from "@/lib/membership";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEssentialContent } from "@/lib/essential";

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
  const { user } = await getEssentialContent();

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
    <main className="essential-content">
      <header className="essential-page-heading essential-underlined-heading">
          <p className="essential-breadcrumbs">HiLex Essential <span>/</span> Cont</p>
          <h1>Contul tău</h1>
          <p>Membership, credit de consultanță și facturi, într-un singur loc.</p>
      </header>
      <section className="essential-account-columns">
          <article className="essential-account-identity">
            <span className="essential-label">Membership</span>
            <h2>HiLex Essential</h2>
            <p>Acces la materialele video, organizate pe arii de drept.</p>
            <h3>Datele tale</h3>
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
              <button className="essential-sign-out" type="submit">
                <LogOut size={22} /> Ieși din cont
              </button>
            </form>
          </article>

          <div className="essential-account-benefits">
          <article className="essential-credit-section">
            <span className="essential-label">Credit de consultanță</span>
            <h2><strong>{creditSummary.remainingMinutes}</strong>minute disponibile</h2>
            <p>Din cele {creditSummary.includedMinutes} de minute incluse anual.</p>
            <div className="credit-meter" role="progressbar" aria-valuemin={0} aria-valuemax={creditSummary.includedMinutes || 1} aria-valuenow={creditSummary.remainingMinutes} aria-label="Credit de consultanță rămas">
              <span style={{ width: `${creditPercent}%` }} />
            </div>
            <div className="essential-credit-caption"><span>{creditSummary.usedMinutes} minute folosite</span><span>{creditSummary.remainingMinutes} minute rămase</span></div>
          </article>
          <article className="essential-invoices-section">
            <div className="essential-invoices-title"><FileText size={34} strokeWidth={1.5} /><div><h2>Facturi și chitanțe</h2>
            <p>Accesează facturile în portalul securizat Stripe.</p></div></div>
            {params.billing === "missing" ? (
              <p className="notice-text account-notice">Nu am găsit încă un client Stripe activ pentru acest cont.</p>
            ) : null}
            {params.billing === "error" ? (
              <p className="notice-text account-notice">Nu am putut deschide facturile acum. Reîncearcă în câteva momente.</p>
            ) : null}
            <form action="/api/stripe/billing-portal" method="POST">
              <input name="returnTo" type="hidden" value="/essential/cont" />
              <button className="btn primary" type="submit">
                Vezi facturile <ArrowRight size={22} />
              </button>
            </form>
          </article>
          </div>
      </section>
      <section className="essential-install-section">
        <Smartphone size={38} strokeWidth={1.5} />
        <div><h2>HiLex, la îndemână</h2><p>Adaugă platforma pe telefon sau desktop pentru acces rapid.</p></div>
        <InstallAppButton compact />
      </section>
    </main>
  );
}
