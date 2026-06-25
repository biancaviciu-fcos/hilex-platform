import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Ai uitat parola?</h1>
          <p>
            Introdu emailul folosit pentru contul tau HILEX. Iti trimitem un
            link securizat pentru setarea unei parole noi.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
