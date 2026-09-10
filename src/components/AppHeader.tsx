import Link from "next/link";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

export function AppHeader({ showWhatsApp = false }: { showWhatsApp?: boolean }) {
  return (
    <>
      <aside className="topbar">
        <Link className="brand" href="/">
          <img alt="HiLex" src="/hilex-logo-transparent.png" />
        </Link>
        <nav className="nav">
          <Link href="/">Acasă</Link>
          <Link href="/library">Resurse</Link>
          <Link href="/library?favorites=1">Favorite</Link>
          <Link href="/contact">Contact</Link>
          <a className="btn consultation-nav-btn" href="https://booking.fcos.co.uk" rel="noreferrer" target="_blank">
            Programează consultanță
          </a>
          <Link className="btn" href="/account">Cont</Link>
        </nav>
      </aside>
      {showWhatsApp ? <WhatsAppWidget /> : null}
    </>
  );
}
