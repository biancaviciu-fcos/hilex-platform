import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requestPasswordReset(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();

  if (!email) redirect("/forgot-password?error=1");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
  });

  if (error) {
    console.error("Forgot password reset failed", error);
    redirect("/forgot-password?error=send");
  }

  redirect("/forgot-password?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Am uitat parola</h1>
          <p>Introdu emailul contului tau HILEX si iti trimitem un link pentru setarea unei parole noi.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={requestPasswordReset}>
            {params.sent ? (
              <p className="success-text">
                Daca emailul exista in sistem, vei primi in cateva minute linkul pentru resetarea parolei.
              </p>
            ) : null}
            {params.error === "send" ? (
              <p className="notice-text">
                Nu am putut trimite emailul acum. Te rugam sa verifici ca emailul este cel folosit pentru contul HILEX
                sau sa ne contactezi la membership@hilex.co.uk.
              </p>
            ) : null}
            {params.error === "1" ? (
              <p className="notice-text">Te rugam sa introduci adresa de email folosita pentru contul HILEX.</p>
            ) : null}
            <div className="field">
              <label>Email</label>
              <input name="email" placeholder="email@exemplu.com" required type="email" />
            </div>
            <button className="btn primary" type="submit">
              Trimite link de resetare
            </button>
            <Link className="btn" href="/login">
              Inapoi la login
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
