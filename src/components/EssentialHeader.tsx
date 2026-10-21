"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, SquarePlay, Heart, Mail, UserRound, UsersRound, Scale, Globe2, Shield, Menu, X, CalendarDays } from "lucide-react";

export type EssentialCategory = { id: string; name: string; slug: string; count: number };

export function EssentialHeader({ categories = [], platform = "essential" }: { categories?: EssentialCategory[]; platform?: "essential" | "premium" }) {
  const premium = platform === "premium";
  const homeHref = premium ? "/" : "/essential";
  const libraryHref = premium ? "/library" : "/essential/materiale";
  const sidebarId = `${platform}-sidebar`;
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const search = params.toString();
  useEffect(() => { setOpen(false); }, [pathname, search]);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia("(max-width: 1099px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
      if (mobile && event.key === "Tab") {
        const elements = sidebarRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
        const first = elements?.[0];
        const last = elements?.[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = previousOverflow; };
  }, [open]);
  const favorites = params.get("favorites") === "1";
  const navigation = premium ? [
    { title: "Acasă", href: "/", icon: Home, active: pathname === "/" },
    { title: "Resurse", href: "/library", icon: SquarePlay, active: pathname.startsWith("/library") && !favorites },
    { title: "Favorite", href: "/library?favorites=1", icon: Heart, active: pathname === "/library" && favorites },
    { title: "Contact", href: "/contact", icon: Mail, active: pathname === "/contact" },
    { title: "Cont", href: "/account", icon: UserRound, active: pathname === "/account" }
  ] : [
    { title: "Acasă", href: "/essential", icon: Home, active: pathname === "/essential" && !favorites && !params.get("category") && !params.get("q") },
    { title: "Materiale video", href: "/essential/materiale", icon: SquarePlay, active: pathname.startsWith("/essential/materiale") && !favorites || pathname === "/essential" && Boolean(params.get("category") || params.get("q")) },
    { title: "Favorite", href: "/essential/materiale?favorites=1", icon: Heart, active: favorites },
    { title: "Contact", href: "/essential/contact", icon: Mail, active: pathname === "/essential/contact" },
    { title: "Cont", href: "/essential/cont", icon: UserRound, active: pathname === "/essential/cont" }
  ];
  function categoryIcon(slug: string) {
    if (slug.includes("famili")) return UsersRound;
    if (slug.includes("imigra")) return Globe2;
    if (slug.includes("penal")) return Shield;
    return Scale;
  }
  return (
    <>
      <header className="essential-mobile-header">
        <Link href={homeHref}><img src="/hilex-logo-transparent.png" alt={`HiLex ${premium ? "Premium" : "Essential"}`} /></Link>
        {premium && <span className="platform-header-label">PREMIUM</span>}
        <button ref={toggleRef} type="button" title={open ? "Închide meniul" : "Deschide meniul"} aria-label={open ? "Închide meniul" : "Deschide meniul"} aria-expanded={open} aria-controls={sidebarId} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </header>
      {open && <button className="essential-sidebar-scrim" aria-label="Închide meniul" onClick={() => setOpen(false)} />}
      <aside ref={sidebarRef} className={`essential-sidebar ${open ? "is-open" : ""}`} id={sidebarId}>
        <button className="essential-menu-close" type="button" aria-label="Închide meniul" onClick={() => setOpen(false)}><X size={22} /></button>
        <Link className="essential-sidebar-brand" href={homeHref} onClick={() => setOpen(false)}>
          <img alt="HiLex" src="/hilex-logo-transparent.png" /><span>{premium ? "PREMIUM" : "ESSENTIAL"}</span>
        </Link>
        <nav aria-label={`Meniu ${premium ? "Premium" : "Essential"}`} className="essential-sidebar-nav">
          {navigation.map(item => <Link key={item.title} href={item.href} className={item.active ? "is-active" : ""} aria-current={item.active ? "page" : undefined} onClick={() => setOpen(false)}><item.icon size={23} strokeWidth={1.6} /><span>{item.title}</span></Link>)}
        </nav>
        {categories.length > 0 && <nav className="essential-sidebar-topics" aria-label="Arii de drept">
          <p>ARII DE DREPT</p>
          {categories.map(category => {
            const Icon = categoryIcon(category.slug);
            return <Link key={category.id} href={`${libraryHref}?category=${category.slug}`} className={params.get("category") === category.slug ? "is-active" : ""} onClick={() => setOpen(false)}><Icon size={23} strokeWidth={1.6} /><span>{category.name}</span><small>{category.count}</small></Link>;
          })}
        </nav>}
        {premium && <nav className="essential-sidebar-topics" aria-label="Consultanță"><a href="https://booking.fcos.co.uk" target="_blank" rel="noreferrer"><CalendarDays size={23} strokeWidth={1.6} /><span>Programează consultanță</span></a></nav>}
      </aside>
    </>
  );
}
