import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { EssentialVideoGrid } from "@/components/EssentialVideoGrid";
import { getEssentialContent } from "@/lib/essential";

export type EssentialFilters = { category?: string; favorites?: string; q?: string };
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export async function EssentialLibrary({ filters, home = false }: { filters: EssentialFilters; home?: boolean }) {
  const { materials, categories, error } = await getEssentialContent();
  const favorites = filters.favorites === "1";
  const category = categories.find(item => item.slug === filters.category);
  const query = normalize(filters.q || "");
  const filtered = materials.filter(item => {
    if (favorites && !item.isFavorite) return false;
    if (category && item.categorySlug !== category.slug) return false;
    const searchable = normalize(`${item.title} ${item.excerpt || ""} ${item.categoryName}`);
    return !query || query.split(" ").every(token => searchable.includes(token));
  });
  const visible = home ? filtered.slice(0, 6) : filtered;
  const title = favorites ? "Favoritele tale" : "Materiale video";
  const total = favorites ? materials.filter(item => item.isFavorite).length : materials.length;
  return (
    <main className="essential-content">
      <header className={`essential-page-heading ${home ? "essential-home-heading" : ""}`}>
        {home ? <span className="essential-kicker">HILEX ESSENTIAL</span> : <p className="essential-breadcrumbs">HiLex Essential <span>/</span> {title}</p>}
        <h1>{home ? "Informația juridică de care ai nevoie, la îndemână." : title}</h1>
        <p>{home ? "Materiale video juridice utile, atent selectate și organizate pentru acces rapid și ușor." : favorites ? "Materialele salvate de tine, într-un singur loc." : "Explorează materialele juridice HiLex Essential."}</p>
      </header>
      <form className="essential-library-search" action="/essential/materiale" role="search">
        <Search size={22} aria-hidden="true" />
        <input aria-label="Caută materiale video" name="q" defaultValue={filters.q || ""} placeholder={home ? "Caută materiale video" : favorites ? "Caută în favoritele tale" : "Caută un subiect sau un material video"} />
        {favorites && <input type="hidden" name="favorites" value="1" />}
        {category && <input type="hidden" name="category" value={category.slug} />}
        <button className="btn primary" type="submit">Caută</button>
      </form>
      {home ? <div className="essential-library-heading"><h2>Explorează materialele</h2><span>{total} materiale disponibile</span></div> : !favorites ? (
        <div className="essential-category-bar">
          <nav aria-label="Filtre pe arii de drept">
            <Link className={!category ? "is-active" : ""} href={`/essential/materiale${filters.q ? `?q=${encodeURIComponent(filters.q)}` : ""}`}>Toate materialele</Link>
            {categories.map(item => <Link key={item.id} className={category?.id === item.id ? "is-active" : ""} href={`/essential/materiale?category=${item.slug}${filters.q ? `&q=${encodeURIComponent(filters.q)}` : ""}`}>{item.name}</Link>)}
          </nav>
          <span>{filtered.length} din {total} materiale</span>
        </div>
      ) : <p className="essential-results-count">{filtered.length} materiale salvate</p>}
      {error ? <div className="essential-empty"><h2>Materialele nu pot fi încărcate momentan.</h2><p>Reîncarcă pagina în câteva momente.</p></div> : visible.length ? <EssentialVideoGrid materials={visible} /> : <div className="essential-empty"><h2>{favorites ? "Nu ai materiale salvate aici încă." : "Nu am găsit materiale pentru această căutare."}</h2><p>{favorites ? "Salvează materialele care te interesează apăsând pe inimă." : "Încearcă alt subiect sau explorează toate materialele."}</p><Link className="btn" href="/essential/materiale">Vezi toate materialele <ArrowRight size={18} /></Link></div>}
      {home && filtered.length > 0 && <Link className="essential-see-all btn" href="/essential/materiale">Vezi toate materialele <ArrowRight size={18} /></Link>}
    </main>
  );
}
