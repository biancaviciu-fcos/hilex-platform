import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccessLevel } from "@/lib/types";

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

  const userAccess = (subscription?.access_level || null) as AccessLevel | null;

  let accessibleLessons: { id: string; access_level: string; status: string }[] | null = [];

  if (userAccess) {
    let lessonsQuery = supabase
      .from("lessons")
      .select("id,access_level,status")
      .eq("status", "published");

    if (userAccess === "basic") {
      lessonsQuery = lessonsQuery.eq("access_level", "basic");
    }

    const { data } = await lessonsQuery;
    accessibleLessons = data;
  }
  const accessibleLessonIds = new Set((accessibleLessons || []).map((lesson) => lesson.id));

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedCount = (progressRows || []).filter((row) => accessibleLessonIds.has(row.lesson_id)).length;
  const totalCount = accessibleLessons?.length || 0;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const progressBlocks = Math.round(progressPercent / 10);
  const progressBar = `${"█".repeat(progressBlocks)}${"░".repeat(10 - progressBlocks)}`;

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
          <div className="card progress-card">
            <div>
              <span className="eyebrow">Progresul tau</span>
              <h2>Ai parcurs</h2>
              <p className="progress-bar" aria-label={`${progressPercent}% parcurs`}>
                {progressBar}
              </p>
              <strong>{progressPercent}%</strong>
              <p className="muted">
                {completedCount} din {totalCount} materiale disponibile pentru pachetul tau.
              </p>
            </div>
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
