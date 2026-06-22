import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
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
          <p>Ai nevoie de ajutor cu platforma, abonamentul tau sau o situatie juridica?</p>
        </div>
      </section>

      <section className="section">
        <div className="inner contact-layout">
          <article className="card contact-card primary-contact">
            <span className="eyebrow">Suport membri</span>
            <h2>Trimite-ne un mesaj</h2>
            <p className="muted">
              Pentru intrebari despre cont, acces la materiale, upgrade la Premium sau o situatie juridica in care ai
              nevoie de asistenta, contacteaza echipa HILEX si revenim cat mai curand.
            </p>
            {params.sent ? (
              <p className="success-text">Mesajul tau a fost trimis. Revenim cat mai curand.</p>
            ) : null}
            {params.error ? (
              <p className="notice-text">Mesajul nu a putut fi trimis. Te rugam sa incerci din nou.</p>
            ) : null}
            <form action="/api/contact" className="contact-form" id="contact-form" method="POST">
              <div className="field">
                <label htmlFor="contact-name">Nume</label>
                <input id="contact-name" name="name" placeholder="Numele tau" required type="text" />
              </div>
              <div className="field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" placeholder="email@exemplu.com" required type="email" />
              </div>
              <div className="field">
                <label htmlFor="contact-topic">Cu ce te putem ajuta?</label>
                <select id="contact-topic" name="topic" defaultValue="Situatie juridica - Dreptul Familiei">
                  <option>Situatie juridica - Dreptul Familiei</option>
                  <option>Situatie juridica - Imigratie</option>
                  <option>Situatie juridica - Drept Civil</option>
                  <option>Situatie juridica - Drept Penal</option>
                  <option>Am nevoie de asistenta juridica</option>
                  <option>Vreau sa programez o consultanta</option>
                  <option>Upgrade la Premium</option>
                  <option>Problema cu platforma</option>
                  <option>Nu vad materialele corecte</option>
                  <option>Intrebare despre cont</option>
                  <option>Alta intrebare</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="contact-message">Mesaj</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Scrie aici exact ce problema ai..."
                  required
                  rows={7}
                />
              </div>
              <button className="btn primary" type="submit">
                Trimite mesajul
              </button>
            </form>
            <div className="contact-actions">
              <a className="btn primary consultation-btn" href="https://booking.fcos.co.uk" rel="noreferrer" target="_blank">
                Programeaza consultanta
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
              <a className="btn" href="#contact-form">
                Cere upgrade
              </a>
            </article>

            <article className="card contact-card">
              <span className="eyebrow">Consultanta</span>
              <h3>Vrei sa vorbesti cu cineva?</h3>
              <p className="muted">Poti programa o consultanta direct prin pagina de booking Forest & Co.</p>
              <a className="btn primary" href="https://booking.fcos.co.uk" rel="noreferrer" target="_blank">
                Programeaza consultanta
              </a>
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
            <span className="eyebrow">Resurse</span>
            <h3>Continua sa explorezi materialele HILEX</h3>
          </div>
          <Link className="btn" href="/library">
            Inapoi la resurse
          </Link>
        </div>
      </section>
    </main>
  );
}
