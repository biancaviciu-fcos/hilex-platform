import Link from "next/link";

export function AppHeader() {
  return (
    <header className="topbar">
      <Link className="brand" href="/library">
        Hi<span>Lex</span>
      </Link>
      <nav className="nav">
        <Link href="/library">Biblioteca</Link>
        <Link href="/admin">Admin</Link>
        <Link className="btn" href="/account">Cont</Link>
      </nav>
    </header>
  );
}
