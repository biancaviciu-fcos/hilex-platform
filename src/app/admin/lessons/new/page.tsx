import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewLessonPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) redirect("/library");
  if (!(await hasAdminPanelAccess())) redirect("/admin/access?next=/admin/lessons/new");

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .order("sort_order");

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id,name,category_id")
    .order("sort_order");

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Material nou</h1>
          <p>Adaugă un clip, articol sau ghid în resursele HILEX.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          {params?.error ? <p className="notice-text error-text">{params.error}</p> : null}
          <form className="card form" action="/api/admin/lessons/create" encType="multipart/form-data" method="POST">
            <div className="field">
              <label>Titlu</label>
              <input name="title" required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" placeholder="Opțional: se generează automat din titlu" />
              <p className="field-hint">
                Poți lăsa câmpul gol. Dacă există deja un material cu același slug, platforma îl face unic automat.
              </p>
            </div>
            <div className="field">
              <label>Aria de drept / filtru principal</label>
              <select name="category_id" required>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="field-hint">Asta este categoria principală după care membrii pot filtra materialele.</p>
            </div>
            <div className="field">
              <label>Subcategorie internă (opțional)</label>
              <select name="subcategory_id">
                <option value="">Fără subcategorie</option>
                {(subcategories || []).map((subcategory) => {
                  const categoryName = categories?.find((category) => category.id === subcategory.category_id)?.name;

                  return (
                    <option key={subcategory.id} value={subcategory.id}>
                      {categoryName ? `${categoryName} - ` : ""}
                      {subcategory.name}
                    </option>
                  );
                })}
              </select>
              <p className="field-hint">Momentan nu afișăm subcategoriile ca filtru public în resurse.</p>
            </div>
            <div className="field">
              <label>Pachet material</label>
              <select name="access_level">
                <option value="basic">Basic - inclus pentru toți membrii</option>
                <option value="premium">Premium - blocat pentru membrii Basic</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Publicat</option>
                <option value="archived">Arhivat</option>
              </select>
              <p className="field-hint">Alege Publicat dacă vrei ca materialul să apară imediat în Resurse.</p>
            </div>
            <div className="field">
              <label>Descriere scurtă</label>
              <textarea name="excerpt" rows={3} />
            </div>
            <div className="field">
              <label>Durată video, în minute</label>
              <input min="0" name="duration_minutes" placeholder="Ex: 12" type="number" />
            </div>
            <div className="field">
              <label>Thumbnail / imagine de copertă</label>
              <input accept="image/*" name="thumbnail" type="file" />
            </div>
            <div className="field">
              <label>Video provider</label>
              <select name="video_provider" defaultValue="">
                <option value="">Fără video încă</option>
                <option value="cloudflare_stream">Cloudflare Stream</option>
                <option value="mux">Mux</option>
                <option value="external">External</option>
              </select>
              <p className="field-hint">
                Dacă vrei upload direct în Cloudflare, salvează materialul mai întâi. Vei ajunge imediat pe pagina de
                editare, unde apare secțiunea completă de upload video.
              </p>
            </div>
            <div className="field">
              <label>Video asset id</label>
              <input name="video_asset_id" placeholder="Opțional, dacă ai deja ID-ul din Cloudflare" />
            </div>
            <div className="field">
              <label>Video playback id</label>
              <input name="video_playback_id" placeholder="Opțional; pentru Cloudflare poate fi același ID" />
            </div>
            <div className="field">
              <label>Text articol, câte un paragraf pe rând</label>
              <textarea name="body" rows={8} />
            </div>
            <div className="field">
              <label>Idei cheie, câte una pe rând</label>
              <textarea name="key_points" rows={5} />
            </div>
            <section className="nested-form-panel">
              <h2>PDF inițial</h2>
              <p className="field-hint">Opțional: poți atașa primul PDF direct când creezi materialul.</p>
              <div className="field">
                <label>Titlu resursă PDF</label>
                <input name="resource_title" placeholder="Ex: Checklist documente" />
              </div>
              <div className="field">
                <label>Acces PDF</label>
                <select name="resource_access_level" defaultValue="basic">
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="field">
                <label>Fișier PDF</label>
                <input accept="application/pdf" name="resource_file" type="file" />
              </div>
            </section>
            <section className="nested-form-panel">
              <h2>Link util inițial</h2>
              <p className="field-hint">Opțional: poți adăuga primul link util direct la creare.</p>
              <div className="field">
                <label>Titlu link</label>
                <input name="link_title" placeholder="Ex: GOV.UK guidance" />
              </div>
              <div className="field">
                <label>URL</label>
                <input name="link_url" placeholder="https://..." type="url" />
              </div>
              <div className="field">
                <label>Acces link</label>
                <select name="link_access_level" defaultValue="basic">
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </section>
            <button className="btn primary" type="submit">
              Salvează materialul
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
