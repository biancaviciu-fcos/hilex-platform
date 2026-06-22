import Link from "next/link";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function AppHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let showAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    showAdmin = isAdminUser(profile?.role, user.email);
  }

  return (
    <header className="topbar">
      <Link className="brand" href="/library">
        Hi<span>Lex</span>
      </Link>
      <nav className="nav">
        <Link href="/library">Biblioteca</Link>
        <Link href="/contact">Contact</Link>
        {showAdmin ? <Link href="/admin">Admin</Link> : null}
        <Link className="btn" href="/account">Cont</Link>
      </nav>
    </header>
  );
}
