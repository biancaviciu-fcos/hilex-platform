import Link from "next/link";

export function EssentialHeader() {
  return (
    <header className="essential-header">
      <Link className="essential-brand" href="/essential">
        <img alt="HiLex" src="/hilex-logo-transparent.png" />
        <small>Essential</small>
      </Link>
      <nav className="essential-nav">
        <Link href="/essential">Acasă</Link>
        <Link href="/essential#materiale">Materiale video</Link>
        <Link href="/essential?favorites=1#materiale">Favorite</Link>
        <Link href="/essential/contact">Contact</Link>
        <Link className="btn essential-account-btn" href="/essential/cont">
          Cont
        </Link>
      </nav>
    </header>
  );
}
