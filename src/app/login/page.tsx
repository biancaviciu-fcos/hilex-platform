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
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Login HILEX</h1>
          <p>Intră în contul tău pentru a accesa resursele.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={signIn}>
            {params.error ? (
              <p className="notice-text">
                Datele de login nu sunt corecte sau parola nu a fost setată încă.
              </p>
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
        </div>
      </section>
    </main>
  );
}
