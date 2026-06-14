import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMaterialThumbnail } from "@/lib/thumbnails";
import { VideoUploadPanel } from "./VideoUploadPanel";

async function updateLesson(formData: FormData) {
  "use server";

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

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const categoryId = String(formData.get("category_id") || "");
  const subcategoryId = String(formData.get("subcategory_id") || "");
  const accessLevel = String(formData.get("access_level") || "basic");
  const status = String(formData.get("status") || "draft");
  const excerpt = String(formData.get("excerpt") || "");
  const thumbnail = formData.get("thumbnail");
  const videoProvider = String(formData.get("video_provider") || "") || null;
  const videoAssetId = String(formData.get("video_asset_id") || "") || null;
  const videoPlaybackId = String(formData.get("video_playback_id") || "") || null;
  const body = String(formData.get("body") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const keyPoints = String(formData.get("key_points") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  let thumbnailUrl: string | null = null;

  if (thumbnail instanceof File && thumbnail.size > 0) {
    thumbnailUrl = await uploadMaterialThumbnail(thumbnail, id);
  }

  const updatePayload: Record<string, unknown> = {
    title,
    slug,
    category_id: categoryId,
    subcategory_id: subcategoryId || null,
    access_level: accessLevel,
    status,
    excerpt,
    video_provider: videoProvider,
    video_asset_id: videoAssetId,
    video_playback_id: videoPlaybackId,
    body,
    key_points: keyPoints,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  if (thumbnailUrl) {
    updatePayload.thumbnail_url = thumbnailUrl;
  }

  await supabase
    .from("lessons")
    .update(updatePayload)
    .eq("id", id);

  redirect("/admin");
}

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, lesson_resources(id,title,resource_type,url,access_level)")
    .eq("id", id)
    .single();
  if (!lesson) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .order("sort_order");

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id,name,category_id,categories(name)")
    .order("sort_order");

  const body = Array.isArray(lesson.body) ? lesson.body.join("\n\n") : "";
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points.join("\n") : "";
  const resources = Array.isArray(lesson.lesson_resources) ? lesson.lesson_resources : [];

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Editeaza materialul</h1>
          <p>{lesson.title}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={updateLesson} encType="multipart/form-data">
            <input type="hidden" name="id" value={lesson.id} />
            <div className="field">
              <label>Titlu</label>
              <input name="title" defaultValue={lesson.title} required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" defaultValue={lesson.slug} required />
            </div>
            <div className="field">
              <label>Categorie</label>
              <select name="category_id" defaultValue={lesson.category_id} required>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subcategorie</label>
              <select name="subcategory_id" defaultValue={lesson.subcategory_id || ""}>
                <option value="">Fara subcategorie</option>
                {(subcategories || []).map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.categories?.name ? `${subcategory.categories.name} - ` : ""}
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Acces</label>
              <select name="access_level" defaultValue={lesson.access_level}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue={lesson.status}>
                <option value="draft">Draft</option>
                <option value="published">Publicat</option>
                <option value="archived">Arhivat</option>
              </select>
            </div>
            <div className="field">
              <label>Descriere scurta</label>
              <textarea name="excerpt" rows={3} defaultValue={lesson.excerpt || ""} />
            </div>
            <div className="field">
              <label>Thumbnail / imagine de coperta</label>
              {lesson.thumbnail_url ? (
                <img alt="" className="thumbnail-preview" src={lesson.thumbnail_url} />
              ) : null}
              <input accept="image/*" name="thumbnail" type="file" />
            </div>
            <div className="field">
              <label>Video provider</label>
              <select name="video_provider" defaultValue={lesson.video_provider || ""}>
                <option value="">Fara video</option>
                <option value="cloudflare_stream">Cloudflare Stream</option>
                <option value="mux">Mux</option>
                <option value="external">External</option>
              </select>
            </div>
            <div className="field">
              <label>Video asset id</label>
              <input name="video_asset_id" defaultValue={lesson.video_asset_id || ""} />
            </div>
            <div className="field">
              <label>Video playback id</label>
              <input name="video_playback_id" defaultValue={lesson.video_playback_id || ""} />
            </div>
            <div className="field">
              <label>Text articol, cate un paragraf pe rand</label>
              <textarea name="body" rows={10} defaultValue={body} />
            </div>
            <div className="field">
              <label>Idei cheie, cate una pe rand</label>
              <textarea name="key_points" rows={6} defaultValue={keyPoints} />
            </div>
            <button className="btn primary" type="submit">
              Salveaza
            </button>
          </form>

          <VideoUploadPanel lessonId={lesson.id} />

          <div className="admin-panels">
            <section className="card form">
              <h2>Adauga PDF</h2>
              <form action="/api/admin/resources/upload" encType="multipart/form-data" method="POST" className="form">
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <div className="field">
                  <label>Titlu resursa</label>
                  <input name="title" placeholder="Ex: Checklist documente" />
                </div>
                <div className="field">
                  <label>Acces</label>
                  <select name="access_level" defaultValue="basic">
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="field">
                  <label>Fisier PDF</label>
                  <input accept="application/pdf" name="file" required type="file" />
                </div>
                <button className="btn primary" type="submit">
                  Incarca PDF
                </button>
              </form>
            </section>

            <section className="card form">
              <h2>Adauga link</h2>
              <form action="/api/admin/resources/link" method="POST" className="form">
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <div className="field">
                  <label>Titlu link</label>
                  <input name="title" required />
                </div>
                <div className="field">
                  <label>URL</label>
                  <input name="url" required type="url" />
                </div>
                <div className="field">
                  <label>Acces</label>
                  <select name="access_level" defaultValue="basic">
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <button className="btn primary" type="submit">
                  Adauga link
                </button>
              </form>
            </section>
          </div>

          <section className="card form">
            <h2>Resurse atasate</h2>
            {resources.length ? (
              <div className="resource-list">
                {resources.map((resource: { id: string; title: string; resource_type: string; url: string; access_level: string }) => (
                  <div className="resource-row" key={resource.id}>
                    <span>
                      <strong>{resource.title}</strong>
                      <br />
                      <small>{resource.resource_type} · {resource.access_level}</small>
                    </span>
                    <form action={`/api/admin/resources/${resource.id}/delete`} method="POST">
                      <button className="btn" type="submit">
                        Sterge
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Nu exista resurse atasate inca.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
