import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>HILEX</h1>
          <p>
            Biblioteca digitala cu informatii legale in romana, disponibila
            pentru membri Basic si Premium.
          </p>
          <div className="nav">
            <Link className="btn primary" href="/pricing">
              Alege abonamentul
            </Link>
            <Link className="btn" href="/login">
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
