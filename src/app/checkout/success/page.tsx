import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Abonamentul este activ</h1>
          <p>
            Contul tau HILEX a fost creat. Vei primi emailul pentru setarea
            parolei si accesul la platforma.
          </p>
          <Link className="btn primary" href="/login">
            Mergi la login
          </Link>
        </div>
      </section>
    </main>
  );
}
