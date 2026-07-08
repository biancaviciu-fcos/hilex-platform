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
          <p>Ai nevoie de ajutor cu platforma, abonamentul tău sau o situație juridică?</p>
        </div>
      </section>

      <section className="section">
        <div className="inner contact-layout">
          <article className="card contact-card primary-contact">
            <span className="eyebrow">Suport membri</span>
            <h2>Trimite-ne un mesaj</h2>
            <p className="muted">
              Pentru întrebări despre cont, acces la materiale, upgrade la Premium sau o situație juridică în care ai
              nevoie de asistență, contactează echipa HILEX și revenim cât mai curând.
            </p>
            {params.sent ? (
              <p className="success-text">Mesajul tău a fost trimis. Revenim cât mai curând.</p>
            ) : null}
            {params.error ? (
              <p className="notice-text">Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.</p>
            ) : null}
            <form action="/api/contact" className="contact-form" id="contact-form" method="POST">
              <div className="field">
                <label htmlFor="contact-name">Nume</label>
                <input id="contact-name" name="name" placeholder="Numele tău" required type="text" />
              </div>
              <div className="field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" placeholder="email@exemplu.com" required type="email" />
              </div>
              <div className="field">
                <label htmlFor="contact-topic">Cu ce te putem ajuta?</label>
                <select id="contact-topic" name="topic" defaultValue="Situație juridică - Dreptul Familiei">
                  <option>Situație juridică - Dreptul Familiei</option>
                  <option>Situație juridică - Imigrație</option>
                  <option>Situație juridică - Drept Civil</option>
                  <option>Situație juridică - Drept Penal</option>
                  <option>Am nevoie de asistență juridică</option>
                  <option>Vreau să programez o consultanță</option>
                  <option>Upgrade la Premium</option>
                  <option>Problemă cu platforma</option>
                  <option>Nu văd materialele corecte</option>
                  <option>Întrebare despre cont</option>
                  <option>Altă întrebare</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="contact-message">Mesaj</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Scrie aici exact ce problemă ai..."
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
                Programează consultanță
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
                Scrie-ne și te ajutăm cu trecerea de la Basic la Premium, inclusiv diferența de acces și pașii de
                activare.
              </p>
              <a className="btn" href="#contact-form">
                Cere upgrade
              </a>
            </article>

            <article className="card contact-card">
              <span className="eyebrow">Consultanță</span>
              <h3>Vrei să vorbești cu cineva?</h3>
              <p className="muted">Poți programa o consultanță direct prin pagina de booking Forest & Co.</p>
              <a className="btn primary" href="https://booking.fcos.co.uk" rel="noreferrer" target="_blank">
                Programează consultanță
              </a>
            </article>

            <article className="card contact-card notice-contact">
              <span className="eyebrow">Important</span>
              <p>
                Pentru situații urgente sau termene foarte scurte, contactează direct Forest & Co Solicitors prin
                canalele oficiale.
              </p>
            </article>
          </aside>
        </div>

        <div className="inner contact-footer-card card">
          <div>
            <span className="eyebrow">Resurse</span>
            <h3>Continuă să explorezi materialele HILEX</h3>
          </div>
          <Link className="btn" href="/library">
            Înapoi la resurse
          </Link>
        </div>
      </section>
    </main>
  );
}
