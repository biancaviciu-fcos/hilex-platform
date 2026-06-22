import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ContactPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="page">
      <AppHeader />
      <section className="hero compact">
        <div className="inner">
          <h1>Contact HILEX</h1>
          <p>Ai nevoie de ajutor cu platforma, accesul tau sau un posibil upgrade la Premium?</p>
        </div>
      </section>

      <section className="section">
        <div className="inner contact-layout">
          <article className="card contact-card primary-contact">
            <span className="eyebrow">Suport membri</span>
            <h2>Trimite-ne un mesaj</h2>
            <p className="muted">
              Pentru intrebari despre cont, acces la materiale, resurse sau upgrade la Premium, contacteaza echipa
              HILEX si revenim cat mai curand.
            </p>
            <div className="contact-actions">
              <a className="btn primary" href="mailto:members@hilex.co.uk">
                members@hilex.co.uk
              </a>
              <a className="btn" href="https://hilex.co.uk" rel="noreferrer" target="_blank">
                Website HILEX
              </a>
            </div>
          </article>

          <aside className="contact-side">
            <article className="card contact-card">
              <span className="eyebrow">Upgrade</span>
              <h3>Vrei acces Premium?</h3>
              <p className="muted">
                Scrie-ne si te ajutam cu trecerea de la Basic la Premium, inclusiv diferenta de acces si pasii de
                activare.
              </p>
            </article>

            <article className="card contact-card">
              <span className="eyebrow">Acces</span>
              <h3>Probleme cu login-ul?</h3>
              <p className="muted">
                Daca nu poti intra in cont sau nu vezi materialele corecte, trimite-ne emailul folosit la plata.
              </p>
            </article>

            <article className="card contact-card notice-contact">
              <span className="eyebrow">Important</span>
              <p>
                Pentru situatii urgente sau termene foarte scurte, contacteaza direct Forest & Co Solicitors prin
                canalele oficiale.
              </p>
            </article>
          </aside>
        </div>

        <div className="inner contact-footer-card card">
          <div>
            <span className="eyebrow">Biblioteca</span>
            <h3>Continua sa explorezi materialele HILEX</h3>
          </div>
          <Link className="btn" href="/library">
            Inapoi la biblioteca
          </Link>
        </div>
      </section>
    </main>
  );
}
