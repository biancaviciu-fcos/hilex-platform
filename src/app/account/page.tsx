import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
          <p>Status abonament si detalii de acces.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner account-grid">
          <article className="card stat-card">
            <span className="eyebrow">Nume</span>
            <strong>{profile?.full_name || "Membru HILEX"}</strong>
          </article>
          <article className="card stat-card">
            <span className="eyebrow">Email</span>
            <strong>{profile?.email || user.email}</strong>
          </article>
          <article className="card stat-card">
            <span className="eyebrow">Abonament</span>
            <strong>{subscription?.access_level || "In verificare"}</strong>
          </article>
          <article className="card stat-card">
            <span className="eyebrow">Status</span>
            <strong>{subscription?.status || "In verificare"}</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
