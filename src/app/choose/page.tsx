import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChoosePlatformPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <main className="page choose-platform-page">
      <section className="choose-platform-shell">
        <div className="choose-platform-brand">
          <img alt="HiLex" src="/hilex-logo-transparent.png" />
          <span>Platforma membrilor</span>
        </div>

        <div className="choose-platform-heading">
          <span className="eyebrow">Alege zona HiLex</span>
          <h1>Intră în platforma potrivită membership-ului tău.</h1>
          <p>
            Alegerea te duce la pagina de autentificare. După login, accesul este verificat automat în contul tău.
          </p>
        </div>

        <div className="choose-platform-grid">
          <Link className="choose-plan-card essential" href="/login?plan=essential">
            <span className="choose-plan-icon">E</span>
            <small>HiLex Essential</small>
            <h2>Materiale clare, rapide și ușor de parcurs.</h2>
            <p>Zona simplă pentru materiale publicate, ghiduri scurte și orientare juridică de bază.</p>
            <strong>Intră în Essential</strong>
          </Link>

          <Link className="choose-plan-card premium" href="/login?plan=premium">
            <span className="choose-plan-icon">P</span>
            <small>HiLex Premium</small>
            <h2>Acces complet la resursele exclusive HiLex.</h2>
            <p>Zona completă pentru materiale premium, extra content, resurse, WhatsApp și suport prioritar.</p>
            <strong>Intră în Premium</strong>
          </Link>
        </div>
      </section>
    </main>
  );
}
