import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function planLabel(accessLevel?: string | null) {
  if (accessLevel === "premium") return "Pachet Premium";
  if (accessLevel === "basic") return "Pachet Basic";
  return "In verificare";
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    active: "Activ",
    trialing: "Activ",
    past_due: "Plata intarziata",
    canceled: "Anulat",
    expired: "Expirat",
    incomplete: "In curs de activare",
    incomplete_expired: "Expirat",
    unpaid: "Neachitat",
    paused: "Pauzat"
  };

  return status ? labels[status] || status : "In verificare";
}

function formatDate(value?: string | null) {
  if (!value) return "In verificare";

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  async function signOut() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,role")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status,current_period_end,cancel_at_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="page">
      <AppHeader />
      <section className="hero compact">
        <div className="inner">
          <h1>Contul meu</h1>
          <p>Detaliile contului tau HILEX, accesul activ si perioada abonamentului.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <div className="account-summary card">
            <div>
              <span className="eyebrow">Acces HILEX</span>
              <h2>{planLabel(subscription?.access_level)}</h2>
              <p className="muted">
                {subscription?.status === "active" || subscription?.status === "trialing"
                  ? "Abonamentul tau este activ si poti accesa continutul inclus in pachet."
                  : "Daca tocmai ai finalizat plata, activarea poate dura cateva momente."}
              </p>
            </div>
            <form action={signOut}>
              <button className="btn" type="submit">
                Iesi din cont
              </button>
            </form>
          </div>
          <div className="account-grid">
            <article className="card stat-card">
              <span className="eyebrow">Nume</span>
              <strong>{profile?.full_name || "Membru HILEX"}</strong>
            </article>
            <article className="card stat-card">
              <span className="eyebrow">Email</span>
              <strong>{profile?.email || user.email}</strong>
            </article>
            <article className="card stat-card">
              <span className="eyebrow">Status</span>
              <strong>{statusLabel(subscription?.status)}</strong>
            </article>
            <article className="card stat-card">
              <span className="eyebrow">Acces pana la</span>
              <strong>{formatDate(subscription?.current_period_end)}</strong>
            </article>
          </div>
          {subscription?.cancel_at_period_end ? (
            <p className="notice-text account-notice">
              Abonamentul este activ pana la data afisata, dar nu se va reinnoi automat.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
