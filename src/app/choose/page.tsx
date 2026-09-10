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
            <small>HILEX ESSENTIAL</small>
            <h2>Informația juridică de care ai nevoie, la îndemână.</h2>
            <p>Materiale video juridice utile, atent selectate și organizate pentru acces rapid și ușor.</p>
            <strong>Accesează Essential</strong>
          </Link>

          <Link className="choose-plan-card premium" href="/login?plan=premium">
            <span className="choose-plan-icon">P</span>
            <small>HILEX PREMIUM</small>
            <h2>Resurse juridice exclusive pentru membrii HiLex Premium.</h2>
            <p>
              Acces la materiale create special pentru membrii Premium, inclusiv conținut video, întrebări frecvente și
              ghiduri PDF.
            </p>
            <strong>Accesează Premium</strong>
          </Link>
        </div>
      </section>
    </main>
  );
}
