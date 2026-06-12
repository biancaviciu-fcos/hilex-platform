import { redirect } from "next/navigation";
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

export default function LoginPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Login HILEX</h1>
          <p>Intra in contul tau pentru a accesa biblioteca.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={signIn}>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" required />
            </div>
            <div className="field">
              <label>Parola</label>
              <input name="password" type="password" required />
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
