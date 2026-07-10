import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/login?error=1");
  redirect("/library");
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="page login-page">
      <section className="login-shell">
        <div className="login-panel">
          <img className="login-logo" alt="HiLex" src="/hilex-logo-transparent.png" />
          <div className="login-heading">
            <h1>Autentificare HiLex</h1>
            <p>Intră în contul tău pentru a accesa resursele.</p>
          </div>

          <form className="card form login-card" action={signIn}>
            {params.error ? (
              <p className="notice-text">Datele de login nu sunt corecte sau parola nu a fost setată încă.</p>
            ) : null}
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" required />
            </div>
            <div className="field">
              <label>Parola</label>
              <input name="password" type="password" required />
            </div>
            <div className="login-help-row">
              <Link href="/forgot-password">Am uitat parola</Link>
            </div>
            <button className="btn primary" type="submit">
              Login
            </button>
          </form>

          <section className="login-support-card">
            <h2>Ai nevoie de ajutor?</h2>
            <p>
              Dacă întâmpini dificultăți la autentificare sau ai nevoie de asistență privind contul tău HiLex, ne poți
              contacta la <a href="mailto:membership@hilex.co.uk">membership@hilex.co.uk</a> sau la{" "}
              <a href="tel:+447944914381">+44 7944 914381</a>. Echipa noastră va reveni către tine în cel mai scurt timp
              posibil.
            </p>
          </section>
        </div>

        <footer className="login-footer">
          <p>
            © 2026 Forest &amp; Co Solicitors. Toate drepturile rezervate. HiLex este o platformă operată de Forest &amp;
            Co Solicitors. Orice reproducere sau utilizare neautorizată a conținutului este strict interzisă.
          </p>
        </footer>
      </section>
    </main>
  );
}
