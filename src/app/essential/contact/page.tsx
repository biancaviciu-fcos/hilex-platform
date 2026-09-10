import { redirect } from "next/navigation";
import { EssentialHeader } from "@/components/EssentialHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EssentialContactPage({
  searchParams
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?plan=essential");

  return (
    <main className="page essential-page">
      <EssentialHeader />
      <section className="essential-simple-hero">
        <div className="inner">
          <span className="eyebrow">Contact Essential</span>
          <h1>Ai nevoie de ajutor?</h1>
          <p>Scrie-ne despre contul tău sau despre materialele video HiLex Essential.</p>
        </div>
      </section>

      <section className="section">
        <div className="inner essential-form-layout">
          <article className="essential-form-card">
            {params.sent ? <p className="success-text">Mesajul tău a fost trimis. Revenim cât mai curând.</p> : null}
            {params.error ? <p className="notice-text">Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.</p> : null}
            <form action="/api/contact" className="contact-form" method="POST">
              <input name="redirectTo" type="hidden" value="/essential/contact" />
              <div className="field">
                <label htmlFor="essential-contact-name">Nume</label>
                <input id="essential-contact-name" name="name" placeholder="Numele tău" required type="text" />
              </div>
              <div className="field">
                <label htmlFor="essential-contact-email">Email</label>
                <input id="essential-contact-email" name="email" placeholder="email@exemplu.com" required type="email" />
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
                  placeholder="Scrie aici exact cu ce ai nevoie de ajutor..."
                  required
                  rows={6}
                />
              </div>
              <button className="btn primary" type="submit">
                Trimite mesajul
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
