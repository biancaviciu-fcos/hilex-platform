import Link from "next/link";
import { redirect } from "next/navigation";
import { sendForgotPasswordEmail } from "@/lib/auth-email";

async function requestPasswordReset(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();

  if (!email) redirect("/forgot-password?error=1");

  try {
    await sendForgotPasswordEmail(email);
  } catch (error) {
    console.error("Forgot password email failed", error);
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("user not found") || message.includes("not found")) {
      redirect("/forgot-password?sent=1");
    }

    if (message.includes("missing resend_api_key")) {
      redirect("/forgot-password?error=config");
    }

    if (message.includes("domain") || message.includes("sender") || message.includes("from")) {
      redirect("/forgot-password?error=sender");
    }

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
            {params.error === "config" ? (
              <p className="notice-text">
                Emailul nu poate fi trimis deoarece lipseste cheia Resend in Vercel. Verifica variabila
                RESEND_API_KEY.
              </p>
            ) : null}
            {params.error === "sender" ? (
              <p className="notice-text">
                Emailul nu poate fi trimis deoarece adresa de expeditor nu este acceptata in Resend. Verifica
                EMAIL_FROM si domeniul/adresa membership@hilex.co.uk.
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
