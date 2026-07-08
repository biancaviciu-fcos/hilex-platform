import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess, isAdminCodeConfigured, safeAdminRedirect } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAccessPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeAdminRedirect(params?.next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent("/admin/access")}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) redirect("/library");
  if (await hasAdminPanelAccess()) redirect(nextPath);

  return (
    <main className="page">
      <AppHeader />
      <section className="hero compact-hero">
        <div className="inner">
          <h1>Acces admin</h1>
          <p>Introdu codul privat pentru zona de administrare HILEX.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action="/api/admin/access" method="POST">
            <input name="next" type="hidden" value={nextPath} />
            {!isAdminCodeConfigured() ? (
              <p className="notice-text error-text">
                Codul admin nu este configurat încă. Adaugă ADMIN_PANEL_CODE în Vercel.
              </p>
            ) : null}
            {params?.error ? <p className="notice-text error-text">{params.error}</p> : null}
            <div className="field">
              <label>Cod admin</label>
              <input autoComplete="off" name="code" required type="password" />
            </div>
            <button className="btn primary" disabled={!isAdminCodeConfigured()} type="submit">
              Intră în admin
            </button>
            <Link className="btn" href="/">
              Înapoi la platformă
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
