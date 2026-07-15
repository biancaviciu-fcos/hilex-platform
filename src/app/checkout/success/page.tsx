export default function CheckoutSuccessPage() {
  return (
    <main className="page login-page">
      <section className="login-shell">
        <div className="login-panel">
          <img className="login-logo" alt="HiLex" src="/hilex-logo-transparent.png" />
          <div className="login-heading">
            <h1>Abonamentul este activ</h1>
          </div>
          <div className="card form login-card success-login-card">
          <p>
            Contul tău HILEX a fost creat. Vei primi emailul pentru setarea
            parolei și accesul la platformă.
          </p>
          <a className="btn primary" href="/login">
            Mergi la login
          </a>
          </div>
        </div>
      </section>
    </main>
  );
}
