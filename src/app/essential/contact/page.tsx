import { ArrowRight } from "lucide-react";
import { getEssentialContent } from "@/lib/essential";

export default async function EssentialContactPage({
  searchParams
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const { user } = await getEssentialContent();

  return (
    <main className="essential-content">
      <header className="essential-page-heading essential-underlined-heading">
          <p className="essential-breadcrumbs">HiLex Essential <span>/</span> Contact</p>
          <h1>Ai nevoie de ajutor?</h1>
          <p>Scrie-ne despre contul tău sau despre materialele video HiLex Essential.</p>
      </header>
      <section className="essential-contact-columns">
        <aside className="essential-contact-help"><h2>Hai să clarificăm.</h2><p>Alege subiectul și spune-ne cu ce te putem ajuta.</p>
          <div><h3>Cont și acces</h3><p>Întrebări despre cont sau accesul la materiale.</p></div>
          <div><h3>Materiale video</h3><p>Probleme tehnice sau întrebări despre conținut.</p></div>
          <div><h3>Situații juridice</h3><p>Selectează domeniul potrivit în formular.</p></div>
        </aside>
          <div className="essential-contact-form">
            {params.sent ? <p className="success-text">Mesajul tău a fost trimis. Revenim cât mai curând.</p> : null}
            {params.error ? <p className="notice-text">Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.</p> : null}
            <form action="/api/contact" method="POST">
              <input name="redirectTo" type="hidden" value="/essential/contact" />
              <div className="essential-form-pair"><div className="field">
                <label htmlFor="essential-contact-name">Nume</label>
                <input id="essential-contact-name" name="name" placeholder="Numele tău" required type="text" />
              </div>
              <div className="field">
                <label htmlFor="essential-contact-email">Email</label>
                <input id="essential-contact-email" name="email" placeholder="email@exemplu.com" defaultValue={user.email} required type="email" />
              </div>
              </div>
              <div className="field">
                <label htmlFor="essential-contact-topic">Cu ce te putem ajuta?</label>
                <select id="essential-contact-topic" name="topic" defaultValue="Întrebare despre cont">
                  <option>Întrebare despre cont</option>
                  <option>Problemă cu accesul la materiale</option>
                  <option>Problemă tehnică</option>
                  <option>Situație juridică - Dreptul Familiei</option>
                  <option>Situație juridică - Imigrație</option>
                  <option>Situație juridică - Drept Civil</option>
                  <option>Situație juridică - Drept Penal</option>
                  <option>Altă întrebare</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="essential-contact-message">Mesaj</label>
                <textarea
                  id="essential-contact-message"
                  name="message"
                  placeholder="Spune-ne pe scurt cu ce ai nevoie de ajutor..."
                  required
                  rows={6}
                />
              </div>
              <button className="btn primary" type="submit">
                Trimite mesajul <ArrowRight size={22} />
              </button>
            </form>
          </div>
      </section>
    </main>
  );
}
